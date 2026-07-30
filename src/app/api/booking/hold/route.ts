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
import { notifyBookingConfirmed } from '@/lib/booking-notifications'

const HOLD_MINUTES = 15

// 💳 Payments are LIVE platform-wide. Per-therapist payment collection
// (Razorpay OAuth-connect or manually entered keys, money settling
// directly to the therapist's own account) is fully built -- see
// /api/razorpay/therapist-order, /api/razorpay/therapist-verify, and
// useRazorpayCheckout. When a therapist has NOT connected any Razorpay
// credentials yet, /api/razorpay/therapist-order returns a 422
// ('Therapist has not connected Razorpay yet.') and the booking UI shows
// that as an error instead of silently confirming an unpaid booking.
const PAYMENTS_ENABLED = true

// 💳 Which gateway builds the paid-booking response below.
// 'razorpay' uses the existing per-therapist Razorpay integration (money
// goes straight to the therapist's own connected account — see
// /api/razorpay/therapist-order and useRazorpayCheckout). 'payu' keeps the
// original platform-settled flow untouched, further down this file, for
// quick rollback. Nothing is deleted — this just picks which branch runs.
const PAYMENT_PROVIDER: 'razorpay' | 'payu' = 'razorpay'

export async function POST(req: NextRequest) {
  try {
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
      .select('id, full_name, fee_per_session, session_duration_mins, profile_content, template_id, plan, payments_enabled')
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

    // ── Razorpay-connection gate (paid sessions only) ───────────────
    // A therapist with no Razorpay connected (neither OAuth nor manual
    // keys -- payments_enabled covers both, see lib/razorpay-oauth.ts and
    // save-credentials/route.ts) can't actually take payment, so refuse
    // the booking here instead of letting the client hold a slot that can
    // never be paid for. Free sessions (price 0) are unaffected -- they
    // don't touch Razorpay at all.
    if (
      PAYMENT_PROVIDER === 'razorpay' &&
      PAYMENTS_ENABLED &&
      resolved.priceInr > 0 &&
      !therapist.payments_enabled
    ) {
      return NextResponse.json(
        {
          error: 'This therapist has not connected a payment method yet. Bookings are unavailable until they do.',
          code:  'THERAPIST_PAYMENTS_NOT_CONNECTED',
        },
        { status: 422 },
      )
    }

    // ── Expire stale holds before checking availability ───────────────────
    await supabase
      .from('appointments')
      .update({ status: 'expired' })
      .eq('status', 'pending_payment')
      .lt('hold_until', new Date().toISOString())

    // ── Multi-slot double-booking check ────────────────────────────────────
    // A service can occupy more than one of the therapist's fixed grid
    // slots (e.g. a 60-min service on a 50-min grid blocks 2 consecutive
    // slots). We compute the full ISO time range this new booking would
    // occupy, then check it against every existing appointment's own
    // occupied range (which may also span multiple slots) for overlap —
    // not just an exact scheduled_at match.
    const sessionDurationMs = resolved.sessionDurationMins * 60 * 1000
    const newStart = new Date(normalizedAt).getTime()
    const newEnd   = newStart + resolved.slotsBlocked * sessionDurationMs

    // Widen the lookup window generously (+/- 6 hours) so we catch any
    // existing multi-slot appointment whose range might overlap ours.
    const windowStart = new Date(newStart - 6 * 60 * 60 * 1000).toISOString()
    const windowEnd   = new Date(newEnd   + 6 * 60 * 60 * 1000).toISOString()

    const { data: nearbyAppointments } = await supabase
      .from('appointments')
      .select('scheduled_at, slots_blocked')
      .eq('therapist_id', therapist_id)
      .not('status', 'in', '("cancelled","payment_failed","expired")')
      .gte('scheduled_at', windowStart)
      .lte('scheduled_at', windowEnd)

    const overlaps = (nearbyAppointments ?? []).some(a => {
      const existingStart = new Date(a.scheduled_at).getTime()
      const existingSlots = a.slots_blocked ?? 1
      const existingEnd   = existingStart + existingSlots * sessionDurationMs
      return newStart < existingEnd && existingStart < newEnd
    })

    if (overlaps) {
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
        slots_blocked: resolved.slotsBlocked,
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
    if (!PAYMENTS_ENABLED || !effectivePrice || effectivePrice <= 0) {
      await supabase
        .from('appointments')
        .update({ status: 'upcoming', txnid: null, hold_until: null })
        .eq('id', appointmentId)

      // Fetch therapist email + phone + meeting link for notifications
      const { data: th } = await supabase
        .from('therapists')
        .select('full_name, email, meet_link, phone, whatsapp')
        .eq('id', therapist_id)
        .single()

      const therapistName = th?.full_name ?? 'Your Therapist'

      // Fire-and-forget so a notification failure never breaks the booking
      // response. Channel (email vs WhatsApp) is decided inside by the
      // therapist's plan -- see lib/booking-notifications.ts.
      notifyBookingConfirmed({
        plan:            therapist.plan,
        clientName:      client_name,
        clientEmail:     client_email,
        clientPhone:     client_phone,
        therapistName,
        therapistEmail:  th?.email ?? null,
        therapistPhone:  th?.whatsapp || th?.phone || null,
        meetLink:        th?.meet_link ?? null,
        serviceName:     resolved.serviceName ?? null,
        scheduledAt:     normalizedAt,
        durationMins:    resolved.durationMins,
      }).catch(e => console.error('[booking/hold] notifyBookingConfirmed failed:', e))

      return NextResponse.json({ free: true, appointment_id: appointmentId })
    }

    // ── Razorpay flow — stays on-page; the client opens Razorpay checkout
    // directly against the therapist's own connected account via
    // useRazorpayCheckout → /api/razorpay/therapist-order + therapist-verify.
    // None of the PayU code below runs when this branch is taken.
    if (PAYMENT_PROVIDER === 'razorpay') {
      return NextResponse.json({
        provider:       'razorpay',
        appointment_id: appointmentId,
        therapist_id,
        amount:         effectivePrice,
        client_name,
        client_email,
        client_phone,
        description:    resolved.serviceName
          ? `${resolved.serviceName} with ${therapist?.full_name ?? 'Therapist'}`
          : `Therapy session with ${therapist?.full_name ?? 'Therapist'}`,
      })
    }

    // ── Build PayU form (only reached when PAYMENT_PROVIDER === 'payu') ─────
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
