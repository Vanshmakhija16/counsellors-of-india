
import { createServerSupabaseClient } from "@/lib/supabase-server";
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

    const supabase = await createServerSupabaseClient();

    // ─────────────────────────────────────────────────────────
    // Normalize Date
    // ─────────────────────────────────────────────────────────
    const normalizedScheduledAt = new Date(
      scheduled_at
    ).toISOString();

    // ─────────────────────────────────────────────────────────
    // Prevent Double Booking
    // ─────────────────────────────────────────────────────────
    const { data: existing } = await supabase
      .from("appointments")
      .select("id")
      .eq("therapist_id", therapist_id)
      .eq("scheduled_at", normalizedScheduledAt)
      .in("status", ["pending", "confirmed"])
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
    // Create Appointment
    // ─────────────────────────────────────────────────────────
    const { data: appointment, error: insertError } =
      await supabase
        .from("appointments")
        .insert({
          therapist_id,
          client_name,
          client_email,
          client_phone,
          scheduled_at: normalizedScheduledAt,
          duration_mins: duration_mins ?? 50,
          status: "pending",
        })
        .select()
        .single();

    if (insertError) {
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
}) {
  return `
  <html>
    <body>
      <h2>Session Confirmed</h2>

      <p>
        Hi ${escapeHtml(args.clientName)},
      </p>

      <p>
        Your session with
        <strong>
          ${escapeHtml(args.therapistName)}
        </strong>
        has been booked.
      </p>

      <p>
        <strong>Date:</strong>
        ${escapeHtml(args.formattedDate)}
      </p>

      <p>
        <strong>Time:</strong>
        ${escapeHtml(args.formattedTime)}
      </p>

      <p>
        <strong>Duration:</strong>
        ${args.durationMins} minutes
      </p>

      <p>
        Thank you,
        <br/>
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
}) {
  return `
  <html>
    <body>
      <h2>New Booking</h2>

      <p>
        Hi ${escapeHtml(args.therapistName)},
      </p>

      <p>
        You received a new booking request.
      </p>

      <p>
        <strong>Client:</strong>
        ${escapeHtml(args.clientName)}
      </p>

      <p>
        <strong>Email:</strong>
        ${escapeHtml(args.clientEmail)}
      </p>

      <p>
        <strong>Phone:</strong>
        ${escapeHtml(args.clientPhone || "Not provided")}
      </p>

      <p>
        <strong>Date:</strong>
        ${escapeHtml(args.formattedDate)}
      </p>

      <p>
        <strong>Time:</strong>
        ${escapeHtml(args.formattedTime)}
      </p>

      <p>
        <strong>Duration:</strong>
        ${args.durationMins} minutes
      </p>
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
