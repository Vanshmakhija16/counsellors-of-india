/**
 * POST /api/payu/booking-callback
 *
 * PayU posts here after a BOOKING payment (surl + furl).
 * Distinct from /api/payu/callback which handles subscription payments.
 *
 * Flow:
 *   1. Verify SHA-512 hash (tamper guard)
 *   2. On success → update appointment status to 'upcoming'
 *   3. Send confirmation emails + WhatsApp to both parties
 *   4. Redirect browser to /booking/success or /booking/failure
 *
 * udf1 = appointment_id
 * udf2 = therapist_id
 *
 * Idempotent: if the appointment is already 'upcoming', skip DB write and
 * redirect to success (handles duplicate PayU callbacks).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase-server'
import { verifyResponseHash } from '@/lib/payu'
import nodemailer from 'nodemailer'
import { sendBookingConfirmation } from '@/lib/whatsapp'

const FROM_EMAIL = process.env.SMTP_FROM || 'Counsellors of India <support@counsellorsofindia.com>'

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
})

function redirect(req: NextRequest, path: string) {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin).replace(/\/+$/, '')
  return NextResponse.redirect(`${base}${path}`, { status: 303 })
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

export async function POST(req: NextRequest) {
  let appointmentId = ''
  try {
    const form = await req.formData()
    const get  = (k: string) => form.get(k)?.toString() ?? ''

    const status            = get('status')
    const txnid             = get('txnid')
    const amount            = get('amount')
    const productinfo       = get('productinfo')
    const firstname         = get('firstname')
    const email             = get('email')
    const udf1              = get('udf1') // appointment_id
    const udf2              = get('udf2') // therapist_id
    const hash              = get('hash')
    const mihpayid          = get('mihpayid')
    const additionalCharges = get('additionalCharges') || undefined

    appointmentId = udf1

    // ── 1. Verify hash ────────────────────────────────────────────────────
    const valid = verifyResponseHash({
      status, txnid, amount, productinfo, firstname,
      email, udf1, udf2, hash, additionalCharges,
    })

    if (!valid) {
      console.error('[payu/booking-callback] hash mismatch', { txnid, hash })
      return redirect(req, `/booking/failure?reason=invalid_signature&txnid=${encodeURIComponent(txnid)}`)
    }

    // ── 2. Payment failed / cancelled ─────────────────────────────────────
    if (status !== 'success') {
      if (appointmentId) {
        const db = createServiceSupabaseClient()
        await db
          .from('appointments')
          .update({ status: 'payment_failed', txnid: null, hold_until: null })
          .eq('id', appointmentId)
          .eq('status', 'pending_payment') // only touch if still held
      }
      return redirect(
        req,
        `/booking/failure?reason=${encodeURIComponent(status || 'failed')}&txnid=${encodeURIComponent(txnid)}`
      )
    }

    if (!appointmentId) {
      return redirect(req, `/booking/failure?reason=missing_appointment_id`)
    }

    const db = createServiceSupabaseClient()

    // ── 3. Idempotency — already confirmed? ───────────────────────────────
    const { data: appt } = await db
      .from('appointments')
      .select('id, status, client_name, client_email, client_phone, scheduled_at, duration_mins, service_name, service_price, therapist_id')
      .eq('id', appointmentId)
      .single()

    if (!appt) {
      return redirect(req, `/booking/failure?reason=appointment_not_found`)
    }

    if (appt.status === 'upcoming') {
      // Already processed (duplicate callback) — just redirect to success
      return redirect(req, `/booking/success?id=${appointmentId}`)
    }

    // ── 4. Confirm the appointment ────────────────────────────────────────
    const { error: updErr } = await db
      .from('appointments')
      .update({
        status:        'upcoming',
        payu_id:       mihpayid,
        txnid:         null,
        hold_until:    null,
      })
      .eq('id', appointmentId)

    if (updErr) {
      console.error('[payu/booking-callback] update failed:', updErr)
      return redirect(req, `/booking/failure?reason=db_error&txnid=${encodeURIComponent(txnid)}`)
    }

    // ── 5. Format date/time ───────────────────────────────────────────────
    const sessionDate   = new Date(appt.scheduled_at)
    const formattedDate = sessionDate.toLocaleDateString('en-IN', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
    const formattedTime = sessionDate.toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit',
    })

    // ── 6. Fetch therapist details for comms ─────────────────────────────
    const { data: therapist } = await db
      .from('therapists')
      .select('full_name, email, phone')
      .eq('id', appt.therapist_id)
      .single()

    const therapistName  = therapist?.full_name ?? 'Your Therapist'
    const clientName     = appt.client_name
    const clientEmail    = appt.client_email
    const clientPhone    = appt.client_phone
    const durationMins   = appt.duration_mins ?? 50
    const serviceName    = appt.service_name  ?? null
    const servicePrice   = appt.service_price ?? null

    // ── 7. Send emails (non-blocking — failures don't abort the booking) ──
    const emailHtml = (html: string) => html

    // Client email
    try {
      await transporter.sendMail({
        from:    FROM_EMAIL,
        to:      clientEmail,
        subject: `Session confirmed with ${therapistName}`,
        html: `
<html><body style="font-family:sans-serif;color:#333;max-width:600px;margin:0 auto;padding:24px">
  <h2 style="color:#1a1a18">Session Confirmed ✓</h2>
  <p>Hi ${escapeHtml(clientName)},</p>
  <p>Your session with <strong>${escapeHtml(therapistName)}</strong> has been booked and payment confirmed.</p>
  ${serviceName ? `<p><strong>Service:</strong> ${escapeHtml(serviceName)}</p>` : ''}
  <p><strong>Date:</strong> ${escapeHtml(formattedDate)}</p>
  <p><strong>Time:</strong> ${escapeHtml(formattedTime)}</p>
  <p><strong>Duration:</strong> ${durationMins} minutes</p>
  ${servicePrice != null ? `<p><strong>Amount paid:</strong> ₹${Number(servicePrice).toLocaleString('en-IN')}</p>` : ''}
  <p style="margin-top:24px;color:#666">The meeting link will be shared the day before your session.</p>
  <p style="margin-top:24px">— Counsellors of India</p>
</body></html>`,
      })
    } catch (e) { console.error('[booking-callback] client email failed:', e) }

    // Therapist email
    if (therapist?.email) {
      try {
        await transporter.sendMail({
          from:    FROM_EMAIL,
          to:      therapist.email,
          subject: `New booking from ${clientName}`,
          html: `
<html><body style="font-family:sans-serif;color:#333;max-width:600px;margin:0 auto;padding:24px">
  <h2 style="color:#1a1a18">New Booking</h2>
  <p>Hi ${escapeHtml(therapistName)},</p>
  <p>A session has been booked and payment confirmed.</p>
  <p><strong>Client:</strong> ${escapeHtml(clientName)}</p>
  <p><strong>Email:</strong> ${escapeHtml(clientEmail)}</p>
  <p><strong>Phone:</strong> ${escapeHtml(clientPhone || 'Not provided')}</p>
  ${serviceName ? `<p><strong>Service:</strong> ${escapeHtml(serviceName)}</p>` : ''}
  <p><strong>Date:</strong> ${escapeHtml(formattedDate)}</p>
  <p><strong>Time:</strong> ${escapeHtml(formattedTime)}</p>
  <p><strong>Duration:</strong> ${durationMins} minutes</p>
  ${servicePrice != null ? `<p><strong>Amount:</strong> ₹${Number(servicePrice).toLocaleString('en-IN')} (via PayU · ${escapeHtml(mihpayid)})</p>` : ''}
</body></html>`,
        })
      } catch (e) { console.error('[booking-callback] therapist email failed:', e) }
    }

    // ── 8. WhatsApp to client ─────────────────────────────────────────────
    if (clientPhone) {
      try {
        await sendBookingConfirmation(clientPhone, {
          employeeName: clientName,
          doctorName:   therapistName,
          date:         formattedDate,
          time:         formattedTime,
          meetLink:     'Meeting link will be shared shortly',
        })
      } catch (e) { console.error('[booking-callback] WhatsApp failed:', e) }
    }

    return redirect(req, `/booking/success?id=${appointmentId}`)
  } catch (err: unknown) {
    console.error('[payu/booking-callback]', err)
    return redirect(req, `/booking/failure?reason=server_error`)
  }
}

export async function GET(req: NextRequest) {
  return redirect(req, '/booking/failure?reason=direct_access')
}
