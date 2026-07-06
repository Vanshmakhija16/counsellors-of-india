/**
 * POST /api/booking/hold
 *
 * Step 1 of the PayU booking flow.
 * Validates the slot, creates an appointment with status='pending_payment',
 * and returns the PayU form fields for the browser to auto-POST.
 *
 * The slot is held for HOLD_MINUTES. If payment never completes,
 * the next /hold call (or a cron job) expires stale holds first.
 *
 * Body:
 *   therapist_id, client_name, client_email, client_phone,
 *   scheduled_at, duration_mins, service_name?
 *
 * Returns (paid):   { action, fields, appointment_id }
 * Returns (free):   { free: true, appointment_id }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase-server'
import {
  PAYU_KEY,
  PAYU_BASE_URL,
  assertPayuConfigured,
  buildRequestHash,
  generateTxnId,
  formatAmount,
} from '@/lib/payu'
import { resolveBookingPrice } from '@/lib/pricing'
import { rateLimit } from '@/lib/rate-limit'

const HOLD_MINUTES = 15

export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(req, { keyPrefix: 'booking-hold', limit: 20, windowMs: 10 * 60 * 1000 })
    if (limited) return limited

    const body = await req.json()
    const {
      therapist_id, client_name, client_email, client_phone,
      scheduled_at, duration_mins, service_name,
    } = body

    // ── Validate ─────────────────────────────────────────────────────────
    if (!therapist_id || !client_name || !client_email || !client_phone || !scheduled_at) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client_email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }

    const normalizedAt = new Date(scheduled_at).toISOString()
    if (new Date(normalizedAt).getTime() < Date.now() + 4 * 60 * 60 * 1000) {
      return NextResponse.json({ error: 'Slot must be at least 4 hours from now.' }, { status: 400 })
    }

    const supabase = createServiceSupabaseClient()

    const { data: therapist, error: therapistErr } = await supabase
      .from('therapists')
      .select('id, full_name, fee_per_session, session_duration_mins, profile_content, template_id, plan')
      .eq('id', therapist_id)
      .single()

    if (therapistErr || !therapist) {
      return NextResponse.json({ error: 'Therapist not found.' }, { status: 404 })
    }

    // ── Monthly booking limit enforcement ──────────────────────────────
    // Starter plan: max 10 confirmed bookings per calendar month.
    // Pro plan: unlimited.
    const PLAN_LIMITS: Record<string, number> = { starter: 10, pro: Infinity }
    const planKey = (therapist.plan ?? 'starter').toLowerCase()
    const limit   = PLAN_LIMITS[planKey] ?? 10

    if (limit !== Infinity) {
      const now        = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()

      const { count } = await supabase
        .from('appointments')
        .select('id', { count: 'exact', head: true })
        .eq('therapist_id', therapist_id)
        .gte('created_at', monthStart)
        .lt('created_at', monthEnd)
        .not('status', 'in', '("cancelled","payment_failed","expired")')

      if ((count ?? 0) >= limit) {
        return NextResponse.json(
          {
            error: `This therapist has reached their ${limit}-booking monthly limit on the Starter plan. They need to upgrade to Pro for unlimited bookings.`,
            code:  'BOOKING_LIMIT_REACHED',
            limit,
            used:  count ?? 0,
          },
          { status: 429 }
        )
      }
    }

    const resolved = resolveBookingPrice(therapist, service_name, duration_mins)
    if (resolved.priceInr == null) {
      return NextResponse.json(
        { error: 'This therapist has not configured a payable or free session price.' },
        { status: 422 },
      )
    }

    // ── Expire stale holds before checking availability ───────────────────
    await supabase
      .from('appointments')
      .update({ status: 'expired' })
      .eq('status', 'pending_payment')
      .lt('hold_until', new Date().toISOString())

    // ── Double-booking check ──────────────────────────────────────────────
    const { data: existing } = await supabase
      .from('appointments')
      .select('id')
      .eq('therapist_id', therapist_id)
      .eq('scheduled_at', normalizedAt)
      .not('status', 'in', '("cancelled","payment_failed","expired")')
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: 'This slot was just taken. Please choose another time.' },
        { status: 409 }
      )
    }

    // ── Resolve / auto-create patient ─────────────────────────────────────
    let patientId: string | null = null
    if (client_email) {
      const { data } = await supabase.from('patients').select('id')
        .eq('therapist_id', therapist_id).ilike('email', client_email).maybeSingle()
      patientId = (data as { id: string } | null)?.id ?? null
    }
    if (!patientId && client_phone) {
      const { data } = await supabase.from('patients').select('id')
        .eq('therapist_id', therapist_id).eq('phone', client_phone).maybeSingle()
      patientId = (data as { id: string } | null)?.id ?? null
    }
    if (!patientId) {
      const parts = (client_name as string).trim().split(/\s+/)
      const { data: created } = await supabase.from('patients').insert({
        therapist_id, first_name: parts[0], last_name: parts.slice(1).join(' ') || '—',
        dob: null, email: client_email || null, phone: client_phone || null, status: 'active',
      }).select('id').single()
      patientId = (created as { id: string } | null)?.id ?? null
    }

    // ── Hold the slot ─────────────────────────────────────────────────────
    const txnid     = generateTxnId('book')
    const holdUntil = new Date(Date.now() + HOLD_MINUTES * 60 * 1000).toISOString()

    const { data: appointment, error: insertErr } = await supabase
      .from('appointments')
      .insert({
        therapist_id, patient_id: patientId,
        client_name, client_email, client_phone,
        scheduled_at: normalizedAt,
        duration_mins: resolved.durationMins,
        status: 'pending_payment',
        txnid, hold_until: holdUntil,
        ...(resolved.serviceName       ? { service_name: resolved.serviceName } : {}),
        ...(resolved.priceInr != null  ? { service_price: resolved.priceInr } : {}),
      })
      .select('id')
      .single()

    if (insertErr) {
      if (insertErr.code === '23505') {
        return NextResponse.json(
          { error: 'This slot was just taken. Please choose another time.' },
          { status: 409 }
        )
      }
      throw insertErr
    }

    const appointmentId = (appointment as { id: string }).id
    const effectivePrice = resolved.priceInr

    // ── Free booking — confirm immediately + send emails ─────────────────
    if (!effectivePrice || effectivePrice <= 0) {
      await supabase
        .from('appointments')
        .update({ status: 'upcoming', txnid: null, hold_until: null })
        .eq('id', appointmentId)

      // Fetch therapist email for notifications
      const { data: th } = await supabase
        .from('therapists')
        .select('full_name, email')
        .eq('id', therapist_id)
        .single()

      const sessionDate   = new Date(normalizedAt)
      const formattedDate = sessionDate.toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
      const formattedTime = sessionDate.toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit',
      })
      const therapistName = th?.full_name ?? 'Your Therapist'
      const durationMins  = resolved.durationMins

      function escapeHtml(s: string) {
        return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
          .replace(/"/g,'&quot;').replace(/'/g,'&#39;')
      }

      // Send emails non-blocking so they never break the booking response
      ;(async () => {
        try {
          const nodemailer = await import('nodemailer')
          const transporter = nodemailer.default.createTransport({
            host:   process.env.SMTP_HOST,
            port:   Number(process.env.SMTP_PORT),
            secure: process.env.SMTP_SECURE === 'true',
            auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
          })
          const FROM = process.env.SMTP_FROM || 'Counsellors of India <support@counsellorsofindia.com>'

          // Client email
          await transporter.sendMail({
            from:    FROM,
            to:      client_email,
            subject: `Session confirmed with ${therapistName}`,
            html: `
<html><body style="font-family:sans-serif;color:#333;max-width:600px;margin:0 auto;padding:24px">
  <h2 style="color:#1a1a18">Session Confirmed ✓</h2>
  <p>Hi ${escapeHtml(client_name)},</p>
  <p>Your session with <strong>${escapeHtml(therapistName)}</strong> has been booked.</p>
  ${resolved.serviceName ? `<p><strong>Service:</strong> ${escapeHtml(resolved.serviceName)}</p>` : ''}
  <p><strong>Date:</strong> ${escapeHtml(formattedDate)}</p>
  <p><strong>Time:</strong> ${escapeHtml(formattedTime)}</p>
  <p><strong>Duration:</strong> ${durationMins} minutes</p>
  <p style="color:#FF9933"><strong>This session is complimentary — no payment required.</strong></p>
  <p style="margin-top:24px;color:#666">The meeting link will be shared the day before your session.</p>
  <p style="margin-top:24px">— Counsellors of India</p>
</body></html>`,
          })

          // Therapist email
          if (th?.email) {
            await transporter.sendMail({
              from:    FROM,
              to:      th.email,
              subject: `New booking from ${client_name}`,
              html: `
<html><body style="font-family:sans-serif;color:#333;max-width:600px;margin:0 auto;padding:24px">
  <h2 style="color:#1a1a18">New Booking</h2>
  <p>Hi ${escapeHtml(therapistName)},</p>
  <p>A session has been booked (no payment required).</p>
  <p><strong>Client:</strong> ${escapeHtml(client_name)}</p>
  <p><strong>Email:</strong> ${escapeHtml(client_email)}</p>
  <p><strong>Phone:</strong> ${escapeHtml(client_phone || 'Not provided')}</p>
  ${resolved.serviceName ? `<p><strong>Service:</strong> ${escapeHtml(resolved.serviceName)}</p>` : ''}
  <p><strong>Date:</strong> ${escapeHtml(formattedDate)}</p>
  <p><strong>Time:</strong> ${escapeHtml(formattedTime)}</p>
  <p><strong>Duration:</strong> ${durationMins} minutes</p>
</body></html>`,
            })
          }
        } catch (e) {
          console.error('[booking/hold] email failed:', e)
        }
      })()

      return NextResponse.json({ free: true, appointment_id: appointmentId })
    }

    // ── Build PayU form ───────────────────────────────────────────────────
    assertPayuConfigured()

    const amount      = formatAmount(effectivePrice)
    const productinfo = service_name
      ? `${service_name} with ${therapist?.full_name ?? 'Therapist'}`
      : `Therapy session with ${therapist?.full_name ?? 'Therapist'}`
    const firstname   = (client_name as string).trim().split(/\s+/)[0]

    let baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin).replace(/\/+$/, '')
    baseUrl = baseUrl.replace(/^https?:\/\/counsellorsofindia\.com/i, 'https://www.counsellorsofindia.com')
    const callbackUrl = `${baseUrl}/api/payu/booking-callback`

    const hash = buildRequestHash({
      txnid, amount, productinfo, firstname,
      email: client_email, udf1: appointmentId, udf2: therapist_id,
    })

    const fields: Record<string, string> = {
      key: PAYU_KEY, txnid, amount, productinfo,
      firstname, email: client_email, phone: client_phone,
      udf1: appointmentId, udf2: therapist_id,
      surl: callbackUrl, furl: callbackUrl, hash,
    }

    return NextResponse.json({ action: PAYU_BASE_URL, fields, appointment_id: appointmentId })
  } catch (err: unknown) {
    console.error('[booking/hold]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    )
  }
}
