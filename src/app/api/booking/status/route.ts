/**
 * GET /api/booking/status?therapist_id=xxx
 *
 * Returns whether a therapist can accept new bookings this month.
 * Used by the public booking page to hide slots when limit is reached.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase-server'

const PLAN_LIMITS: Record<string, number> = { starter: 10, pro: Infinity }

export async function GET(req: NextRequest) {
  const therapist_id = req.nextUrl.searchParams.get('therapist_id')
  if (!therapist_id) {
    return NextResponse.json({ error: 'Missing therapist_id' }, { status: 400 })
  }

  const supabase = createServiceSupabaseClient()

  const { data: therapist } = await supabase
    .from('therapists')
    .select('plan')
    .eq('id', therapist_id)
    .single()

  const planKey = (therapist?.plan ?? 'starter').toLowerCase()
  const limit   = PLAN_LIMITS[planKey] ?? 10

  if (limit === Infinity) {
    return NextResponse.json({ canBook: true, used: 0, limit: null })
  }

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

  const used    = count ?? 0
  const canBook = used < limit

  return NextResponse.json({ canBook, used, limit }, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
