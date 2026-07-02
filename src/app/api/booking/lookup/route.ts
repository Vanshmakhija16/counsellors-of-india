/**
 * GET /api/booking/lookup?txnid=xxx
 * Returns the therapist username for a given txnid so the failure page
 * can redirect the user back to the correct booking page (#book section).
 */
import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const txnid = req.nextUrl.searchParams.get('txnid')
  if (!txnid) return NextResponse.json({ error: 'Missing txnid' }, { status: 400 })

  const db = createServiceSupabaseClient()

  // Find appointment by txnid (set during hold, cleared on success)
  const { data: appt } = await db
    .from('appointments')
    .select('therapist_id')
    .eq('txnid', txnid)
    .maybeSingle()

  if (!appt?.therapist_id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { data: therapist } = await db
    .from('therapists')
    .select('username')
    .eq('id', appt.therapist_id)
    .single()

  if (!therapist?.username) {
    return NextResponse.json({ error: 'Therapist not found' }, { status: 404 })
  }

  return NextResponse.json({ username: therapist.username })
}
