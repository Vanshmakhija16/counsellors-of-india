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
 *   scheduled_at, duration_mins, service_name?, service_price?
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

const HOLD_MINUTES = 15

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      therapist_id, client_name, client_email, client_phone,
      scheduled_at, duration_mins, service_name, service_price,
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
        duration_mins: duration_mins ?? 50,
        status: 'pending_payment',
        txnid, hold_until: holdUntil,
        ...(service_name          ? { service_name }  : {}),
        ...(service_price != null ? { service_price } : {}),
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
    const effectivePrice = typeof service_price === 'number' ? service_price : null

    // ── Free booking — confirm immediately ───────────────────────────────
    if (!effectivePrice || effectivePrice <= 0) {
      await supabase
        .from('appointments')
        .update({ status: 'upcoming', txnid: null, hold_until: null })
        .eq('id', appointmentId)
      return NextResponse.json({ free: true, appointment_id: appointmentId })
    }

    // ── Build PayU form ───────────────────────────────────────────────────
    assertPayuConfigured()

    const { data: therapist } = await supabase
      .from('therapists').select('full_name').eq('id', therapist_id).single()

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
