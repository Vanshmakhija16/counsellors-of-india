
import { createServiceSupabaseClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { sendBookingConfirmation } from "@/lib/whatsapp";

const FROM_EMAIL =
  process.env.SMTP_FROM ||
  "Counsellors of India <support@counsellorsofindia.com>";

// ─────────────────────────────────────────────────────────────
// SMTP Transport
// ─────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      therapist_id,
      client_name,
      client_email,
      client_phone,
      scheduled_at,
      duration_mins,
      // ── Service fields sent by ClassicTemplate4 Booking.tsx ──
      service_name,   // e.g. "Couples Therapy"
      service_price,  // e.g. 2000  (number | null)
    } = body;

    // ─────────────────────────────────────────────────────────
    // Validation
    // ─────────────────────────────────────────────────────────
    if (
      !therapist_id ||
      !client_name ||
      !client_email ||
      !scheduled_at
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Public booking route — no user session exists.
    // Use service-role client to bypass RLS for inserts.
    const supabase = createServiceSupabaseClient();

    // ─────────────────────────────────────────────────────────
    // Normalize Date
    // ─────────────────────────────────────────────────────────
    const normalizedScheduledAt = new Date(
      scheduled_at
    ).toISOString();

    // ─────────────────────────────────────────────────────────
    // Prevent Double Booking
    // Check ALL non-cancelled statuses so the unique constraint
    // is never hit. Previously only checked 'pending'/'confirmed'
    // but inserts use 'upcoming' — so the check always missed.
    // ─────────────────────────────────────────────────────────
    const { data: existing } = await supabase
      .from("appointments")
      .select("id")
      .eq("therapist_id", therapist_id)
      .eq("scheduled_at", normalizedScheduledAt)
      .not("status", "eq", "cancelled")
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        {
          error:
            "This slot is already booked. Please choose another time.",
        },
        { status: 409 }
      );
    }

    // ─────────────────────────────────────────────────────────
    // Resolve patient_id for this booking.
    // 1) If a patient with the same therapist + email already exists, reuse it.
    // 2) Otherwise auto-create a lightweight patient row from booking details.
    //    DOB is left null — the therapist fills it later from the Edit page.
    // 3) Phone-only fallback: same therapist + same phone reuses too.
    // ─────────────────────────────────────────────────────────
    let resolvedPatientId: string | null = null;

    if (client_email) {
      const { data: byEmail } = await supabase
        .from("patients")
        .select("id")
        .eq("therapist_id", therapist_id)
        .ilike("email", client_email)
        .maybeSingle();
      resolvedPatientId = (byEmail as { id: string } | null)?.id ?? null;
    }

    if (!resolvedPatientId && client_phone) {
      const { data: byPhone } = await supabase
        .from("patients")
        .select("id")
        .eq("therapist_id", therapist_id)
        .eq("phone", client_phone)
        .maybeSingle();
      resolvedPatientId = (byPhone as { id: string } | null)?.id ?? null;
    }

    if (!resolvedPatientId) {
      const parts = (client_name as string).trim().split(/\s+/);
      const first_name = parts[0];
      const last_name = parts.slice(1).join(" ") || "—";

      const { data: created, error: patientErr } = await supabase
        .from("patients")
        .insert({
          therapist_id,
          first_name,
          last_name,
          dob: null,
          email: client_email || null,
          phone: client_phone || null,
          status: "active",
        })
        .select("id")
        .single();

      if (patientErr) {
        console.error("[/api/book] auto-create patient failed:", patientErr);
      } else {
        resolvedPatientId = (created as { id: string }).id;
      }
    }

    // ─────────────────────────────────────────────────────────
    // Create Appointment
    // Includes service_name + service_price when provided so the
    // therapist can see which service was booked and at what rate.
    // ─────────────────────────────────────────────────────────
    const { data: appointment, error: insertError } =
      await supabase
        .from("appointments")
        .insert({
          therapist_id,
          patient_id: resolvedPatientId,
          client_name,
          client_email,
          client_phone,
          scheduled_at: normalizedScheduledAt,
          duration_mins: duration_mins ?? 50,
          status: "upcoming",
          // store service info if provided (columns may be nullable in your schema)
          ...(service_name  ? { service_name }  : {}),
          ...(service_price != null ? { service_price } : {}),
        })
        .select()
        .single();

    if (insertError) {
      // Unique constraint violation = race condition double-submit.
      // Return a clean 409 instead of a 500.
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'This slot was just booked. Please choose another time.' },
          { status: 409 }
        )
      }
      throw insertError;
    }

    // ─────────────────────────────────────────────────────────
    // Therapist Info
    // ─────────────────────────────────────────────────────────
    const { data: therapist, error: therapistError } =
      await supabase
        .from("therapists")
        .select("full_name, email, phone")
        .eq("id", therapist_id)
        .single();

    if (therapistError) {
      throw therapistError;
    }

    const therapistName =
      therapist?.full_name ?? "Your Therapist";

    // ─────────────────────────────────────────────────────────
    // Format Date & Time
    // ─────────────────────────────────────────────────────────
    const sessionDate = new Date(normalizedScheduledAt);

    const formattedDate = sessionDate.toLocaleDateString(
      "en-IN",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );

    const formattedTime = sessionDate.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );

    // ─────────────────────────────────────────────────────────
    // Send Emails
    // ─────────────────────────────────────────────────────────
    const emailResults = {
      client: false,
      therapist: false,
    };

    // Client Email
    try {
      await transporter.sendMail({
        from: FROM_EMAIL,
        to: client_email,
        subject: `Session confirmed with ${therapistName}`,
        html: clientEmailHtml({
          clientName: client_name,
          therapistName,
          formattedDate,
          formattedTime,
          durationMins: duration_mins ?? 50,
          serviceName: service_name ?? null,
          servicePrice: service_price ?? null,
        }),
      });

      emailResults.client = true;

      console.log("[book] Client email sent");
    } catch (error) {
      console.error("[book] Client email failed:", error);
    }

    // Therapist Email
    if (therapist?.email) {
      try {
        await transporter.sendMail({
          from: FROM_EMAIL,
          to: therapist.email,
          subject: `New booking from ${client_name}`,
          html: therapistEmailHtml({
            therapistName,
            clientName: client_name,
            clientEmail: client_email,
            clientPhone: client_phone,
            formattedDate,
            formattedTime,
            durationMins: duration_mins ?? 50,
            serviceName: service_name ?? null,
            servicePrice: service_price ?? null,
          }),
        });

        emailResults.therapist = true;

        console.log("[book] Therapist email sent");
      } catch (error) {
        console.error("[book] Therapist email failed:", error);
      }
    }

    // ─────────────────────────────────────────────────────────
    // Send WhatsApp Confirmation
    // ─────────────────────────────────────────────────────────
    if (client_phone) {
      try {
        await sendBookingConfirmation(client_phone, {
          employeeName: client_name,
          doctorName: therapistName,
          date: formattedDate,
          time: formattedTime,
          meetLink:
            "Meeting link will be shared shortly",
        });

        console.log(
          "[book] WhatsApp confirmation sent"
        );
      } catch (error) {
        console.error(
          "[book] WhatsApp failed:",
          error
        );
      }
    }

    // ─────────────────────────────────────────────────────────
    // WhatsApp Deep Links
    // ─────────────────────────────────────────────────────────
    const therapistPhone = therapist?.phone;

    const therapistWhatsApp = therapistPhone
      ? `https://wa.me/91${therapistPhone.replace(
          /\D/g,
          ""
        )}?text=${encodeURIComponent(
          `New booking from ${client_name} on ${formattedDate} at ${formattedTime}`
        )}`
      : null;

    const clientWhatsApp = client_phone
      ? `https://wa.me/91${client_phone.replace(
          /\D/g,
          ""
        )}?text=${encodeURIComponent(
          `Session with ${therapistName} confirmed on ${formattedDate} at ${formattedTime}.`
        )}`
      : null;

    // ─────────────────────────────────────────────────────────
    // Success Response
    // ─────────────────────────────────────────────────────────
    return NextResponse.json({
      success: true,
      appointment,
      emails: emailResults,
      whatsapp: {
        therapist: therapistWhatsApp,
        client: clientWhatsApp,
      },
      sessionDetails: {
        date: formattedDate,
        time: formattedTime,
        duration: duration_mins ?? 50,
        service: service_name ?? null,
        price: service_price ?? null,
      },
    });
  } catch (err: any) {
    console.error("[book] error:", err);

    return NextResponse.json(
      {
        error: err?.message ?? "Booking failed",
      },
      {
        status: 500,
      }
    );
  }
}

// ─────────────────────────────────────────────────────────────
// Client Email Template
// ─────────────────────────────────────────────────────────────
function clientEmailHtml(args: {
  clientName: string;
  therapistName: string;
  formattedDate: string;
  formattedTime: string;
  durationMins: number;
  serviceName: string | null;
  servicePrice: number | null;
}) {
  const serviceRow = args.serviceName
    ? `<p><strong>Service:</strong> ${escapeHtml(args.serviceName)}</p>`
    : "";
  const priceRow = args.servicePrice != null
    ? `<p><strong>Fee:</strong> ₹ ${args.servicePrice.toLocaleString("en-IN")}</p>`
    : "";

  return `
  <html>
    <body>
      <h2>Session Confirmed</h2>

      <p>Hi ${escapeHtml(args.clientName)},</p>

      <p>
        Your session with
        <strong>${escapeHtml(args.therapistName)}</strong>
        has been booked.
      </p>

      ${serviceRow}
      <p><strong>Date:</strong> ${escapeHtml(args.formattedDate)}</p>
      <p><strong>Time:</strong> ${escapeHtml(args.formattedTime)}</p>
      <p><strong>Duration:</strong> ${args.durationMins} minutes</p>
      ${priceRow}

      <p>
        Thank you,<br/>
        Counsellors of India
      </p>
    </body>
  </html>
  `;
}

// ─────────────────────────────────────────────────────────────
// Therapist Email Template
// ─────────────────────────────────────────────────────────────
function therapistEmailHtml(args: {
  therapistName: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  formattedDate: string;
  formattedTime: string;
  durationMins: number;
  serviceName: string | null;
  servicePrice: number | null;
}) {
  const serviceRow = args.serviceName
    ? `<p><strong>Service:</strong> ${escapeHtml(args.serviceName)}</p>`
    : "";
  const priceRow = args.servicePrice != null
    ? `<p><strong>Fee charged:</strong> ₹ ${args.servicePrice.toLocaleString("en-IN")}</p>`
    : "";

  return `
  <html>
    <body>
      <h2>New Booking</h2>

      <p>Hi ${escapeHtml(args.therapistName)},</p>

      <p>You received a new booking request.</p>

      <p><strong>Client:</strong> ${escapeHtml(args.clientName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(args.clientEmail)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(args.clientPhone || "Not provided")}</p>
      ${serviceRow}
      <p><strong>Date:</strong> ${escapeHtml(args.formattedDate)}</p>
      <p><strong>Time:</strong> ${escapeHtml(args.formattedTime)}</p>
      <p><strong>Duration:</strong> ${args.durationMins} minutes</p>
      ${priceRow}
    </body>
  </html>
  `;
}

// ─────────────────────────────────────────────────────────────
// Escape HTML
// ─────────────────────────────────────────────────────────────
function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
