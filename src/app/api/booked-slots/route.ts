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
    .select('scheduled_at, status, hold_until')
    .eq('therapist_id', therapistId)
    .not('status', 'in', '("cancelled","payment_failed","expired")')
    .gte('scheduled_at', now)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const bookedTimes = (data ?? [])
    .filter(b => {
      if (b.status !== 'pending_payment') return true
      if (!b.hold_until) return true
      return new Date(b.hold_until).getTime() > Date.now()
    })
    .map(b => b.scheduled_at)

  return NextResponse.json({ bookedTimes })
}
