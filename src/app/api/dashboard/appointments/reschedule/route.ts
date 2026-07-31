/**
 * API Route: /api/dashboard/appointments/reschedule
 *
 * Powers the therapist-side "Reschedule" flow on dashboard/appointments.
 * Auth is verified via cookie session (same pattern as
 * razorpay/save-credentials) -- a therapist can only see/move their OWN
 * appointments, never anyone else's.
 *
 * GET  ?appointment_id=xxx
 *   Returns the therapist's availability rules + already-booked times
 *   (excluding the appointment being rescheduled itself, so its own
 *   current slot doesn't falsely block it in the picker) -- everything
 *   the reschedule modal needs to render a calendar via the existing
 *   getAvailabilityForMonth() helper already used on public booking pages.
 *
 * POST { appointment_id, new_scheduled_at, inform_client }
 *   Moves the appointment to the new time (status -> 'rescheduled'), after
 *   re-checking the slot isn't taken by another appointment (a client could
 *   theoretically book the exact moment the therapist is picking a slot).
 *   The OLD slot needs no explicit "freeing" step -- availability is always
 *   computed live from current appointment rows, so once scheduled_at
 *   changes, the old time is simply no longer in anyone's booked set.
 *   If inform_client is true, notifies both client AND therapist via
 *   notifyBookingRescheduled() (email on Starter, WhatsApp on Pro) --
 *   fire-and-forget, same as every other notification call site.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServiceSupabaseClient } from '@/lib/supabase-server'
import { notifyBookingRescheduled } from '@/lib/booking-notifications'

async function getUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll:  () => cookieStore.getAll(),
        setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  )
  const { data: { user }, error } = await supabase.auth.getUser()
  return error ? null : user
}

// ── GET — availability + booked times for the reschedule picker ─────────
export async function GET(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const appointmentId = req.nextUrl.searchParams.get('appointment_id')
    if (!appointmentId) {
      return NextResponse.json({ error: 'Missing appointment_id' }, { status: 400 })
    }

    const db = createServiceSupabaseClient()

    // Confirm this appointment actually belongs to the logged-in therapist
    // before revealing anything -- never trust the id alone.
    const { data: appointment, error: apptErr } = await db
      .from('appointments')
      .select('id, therapist_id, duration_mins, scheduled_at')
      .eq('id', appointmentId)
      .eq('therapist_id', user.id)
      .maybeSingle()

    if (apptErr) throw apptErr
    if (!appointment) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })

    const { data: therapist, error: therapistErr } = await db
      .from('therapists')
      .select('availability, session_duration_mins')
      .eq('id', user.id)
      .single()

    if (therapistErr) throw therapistErr

    // Same "which times are already blocked" query booked-slots/route.ts
    // uses for the public booking page, EXCLUDING this appointment's own
    // row -- otherwise its current slot would look falsely unavailable.
    const now = new Date().toISOString()
    const { data: existing, error: bookedErr } = await db
      .from('appointments')
      .select('scheduled_at, status, hold_until, slots_blocked, duration_mins')
      .eq('therapist_id', user.id)
      .neq('id', appointmentId)
      .not('status', 'in', '("cancelled","payment_failed","expired")')
      .gte('scheduled_at', now)

    if (bookedErr) throw bookedErr

    const sessionDurationMins = Number(therapist.session_duration_mins) > 0
      ? Number(therapist.session_duration_mins)
      : 50

    const bookedTimes = (existing ?? [])
      .filter(b => {
        if (b.status !== 'pending_payment') return true
        if (!b.hold_until) return true
        return new Date(b.hold_until).getTime() > Date.now()
      })
      .flatMap(b => {
        const slots = b.slots_blocked ?? 1
        const start = new Date(b.scheduled_at).getTime()
        const times: string[] = []
        for (let i = 0; i < slots; i++) {
          times.push(new Date(start + i * sessionDurationMins * 60 * 1000).toISOString())
        }
        return times
      })

    return NextResponse.json({
      availability: therapist.availability ?? null,
      duration_mins: appointment.duration_mins ?? sessionDurationMins,
      booked_times: bookedTimes,
      current_scheduled_at: appointment.scheduled_at,
    })
  } catch (err: unknown) {
    console.error('[dashboard/appointments/reschedule GET]', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 })
  }
}

// ── POST — actually move the appointment ─────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { appointment_id, new_scheduled_at, inform_client } = body as {
      appointment_id?: string
      new_scheduled_at?: string
      inform_client?: boolean
    }

    if (!appointment_id || !new_scheduled_at) {
      return NextResponse.json({ error: 'Missing appointment_id or new_scheduled_at' }, { status: 400 })
    }

    const normalizedAt = new Date(new_scheduled_at).toISOString()
    if (new Date(normalizedAt).getTime() < Date.now()) {
      return NextResponse.json({ error: 'New time must be in the future.' }, { status: 400 })
    }

    const db = createServiceSupabaseClient()

    // Ownership check -- can only reschedule your own appointment.
    const { data: appointment, error: apptErr } = await db
      .from('appointments')
      .select('id, therapist_id, client_name, client_email, client_phone, duration_mins, slots_blocked, service_name')
      .eq('id', appointment_id)
      .eq('therapist_id', user.id)
      .maybeSingle()

    if (apptErr) throw apptErr
    if (!appointment) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })

    // ── Re-check the target slot is still free ─────────────────────────
    // (Same overlap logic as booking/hold/route.ts -- a client could book
    // this exact moment while the therapist is mid-reschedule.)
    const { data: therapistRow } = await db
      .from('therapists')
      .select('session_duration_mins')
      .eq('id', user.id)
      .maybeSingle()
    const sessionDurationMins = Number(therapistRow?.session_duration_mins) > 0
      ? Number(therapistRow?.session_duration_mins)
      : 50

    const slotsBlocked = appointment.slots_blocked ?? 1
    const sessionDurationMs = sessionDurationMins * 60 * 1000
    const newStart = new Date(normalizedAt).getTime()
    const newEnd = newStart + slotsBlocked * sessionDurationMs

    const windowStart = new Date(newStart - 6 * 60 * 60 * 1000).toISOString()
    const windowEnd = new Date(newEnd + 6 * 60 * 60 * 1000).toISOString()

    const { data: nearby } = await db
      .from('appointments')
      .select('scheduled_at, slots_blocked')
      .eq('therapist_id', user.id)
      .neq('id', appointment_id)
      .not('status', 'in', '("cancelled","payment_failed","expired")')
      .gte('scheduled_at', windowStart)
      .lte('scheduled_at', windowEnd)

    const overlaps = (nearby ?? []).some(a => {
      const existingStart = new Date(a.scheduled_at).getTime()
      const existingSlots = a.slots_blocked ?? 1
      const existingEnd = existingStart + existingSlots * sessionDurationMs
      return newStart < existingEnd && existingStart < newEnd
    })

    if (overlaps) {
      return NextResponse.json({ error: 'That slot was just taken. Please choose another time.' }, { status: 409 })
    }

    // ── Move it ──────────────────────────────────────────────────────────
    const { data: updated, error: updateErr } = await db
      .from('appointments')
      .update({ scheduled_at: normalizedAt, status: 'rescheduled' })
      .eq('id', appointment_id)
      .select('*')
      .single()

    if (updateErr) {
      if (updateErr.code === '23505') {
        return NextResponse.json({ error: 'That slot was just taken. Please choose another time.' }, { status: 409 })
      }
      throw updateErr
    }

    // ── Notify (fire-and-forget) ─────────────────────────────────────────
    if (inform_client) {
      const { data: therapist } = await db
        .from('therapists')
        .select('full_name, email, meet_link, phone, whatsapp, plan')
        .eq('id', user.id)
        .single()

      const therapistName = therapist?.full_name ?? 'Your Therapist'

      notifyBookingRescheduled({
        plan:            therapist?.plan,
        clientName:      appointment.client_name,
        clientEmail:     appointment.client_email ?? '',
        clientPhone:     appointment.client_phone,
        therapistName,
        therapistEmail:  therapist?.email ?? null,
        therapistPhone:  therapist?.whatsapp || therapist?.phone || null,
        meetLink:        therapist?.meet_link ?? null,
        serviceName:     appointment.service_name ?? null,
        newScheduledAt:  normalizedAt,
        durationMins:    appointment.duration_mins,
      }).catch(e => console.error('[dashboard/appointments/reschedule] notify failed:', e))
    }

    return NextResponse.json({ appointment: updated })
  } catch (err: unknown) {
    console.error('[dashboard/appointments/reschedule POST]', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 })
  }
}
