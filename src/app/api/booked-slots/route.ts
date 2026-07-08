import { createServiceSupabaseClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/booked-slots?therapist_id=xxx
 *
 * Returns currently blocked scheduled_at times for a therapist.
 * Used by booking components to refresh slot availability after a race condition.
 */
export async function GET(req: NextRequest) {
  const therapistId = req.nextUrl.searchParams.get('therapist_id')
  if (!therapistId) {
    return NextResponse.json({ error: 'Missing therapist_id' }, { status: 400 })
  }

  // Demo/preview pages pass placeholder ids like "demo-classic1" which aren't
  // real UUIDs and can't exist in the appointments table — skip the DB call
  // and just report no booked slots instead of erroring.
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(therapistId)
  if (!isUuid) {
    return NextResponse.json({ bookedTimes: [] })
  }

  const supabase = createServiceSupabaseClient()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('appointments')
    .select('scheduled_at, status, hold_until, slots_blocked, duration_mins')
    .eq('therapist_id', therapistId)
    .not('status', 'in', '("cancelled","payment_failed","expired")')
    .gte('scheduled_at', now)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Therapist's fixed grid slot size — used to space out consecutive
  // blocked times for multi-slot services. Falls back to 50 if missing.
  const { data: therapistRow } = await supabase
    .from('therapists')
    .select('session_duration_mins')
    .eq('id', therapistId)
    .maybeSingle()
  const sessionDurationMins = Number(therapistRow?.session_duration_mins) > 0
    ? Number(therapistRow?.session_duration_mins)
    : 50

  const bookedTimes = (data ?? [])
    .filter(b => {
      if (b.status !== 'pending_payment') return true
      if (!b.hold_until) return true
      return new Date(b.hold_until).getTime() > Date.now()
    })
    // Expand each appointment into every consecutive grid slot it occupies.
    // A 60-min service on a 50-min grid (slots_blocked=2) starting at 11:00
    // returns both 11:00 and 11:50, so both disappear from the picker.
    .flatMap(b => {
      const slots = b.slots_blocked ?? 1
      const start = new Date(b.scheduled_at).getTime()
      const times: string[] = []
      for (let i = 0; i < slots; i++) {
        times.push(new Date(start + i * sessionDurationMins * 60 * 1000).toISOString())
      }
      return times
    })

  return NextResponse.json({ bookedTimes })
}
