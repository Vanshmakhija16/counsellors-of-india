import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { randomBytes } from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { patientId, instrumentId } = await req.json()
    if (!patientId || !instrumentId) {
      return NextResponse.json({ error: 'patientId and instrumentId required' }, { status: 400 })
    }

    // Verify patient belongs to this therapist
    const { data: patient, error: patErr } = await supabase
      .from('patients')
      .select('id')
      .eq('id', patientId)
      .eq('therapist_id', session.user.id)
      .maybeSingle()
    if (patErr || !patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    // Verify the scale exists in assessment_scales
    const { data: scale, error: scaleErr } = await supabase
      .from('assessment_scales')
      .select('id')
      .eq('id', instrumentId)
      .maybeSingle()
    if (scaleErr || !scale) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()

    const { data: invite, error: invErr } = await supabase
      .from('screening_invites')
      .insert({
        therapist_id:  session.user.id,
        patient_id:    patientId,
        instrument_id: instrumentId,
        token,
        expires_at:    expiresAt,
      })
      .select('*')
      .single()
    if (invErr) throw invErr

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin
    const url = `${baseUrl}/screen/${token}`

    return NextResponse.json({ invite, url })
  } catch (e: unknown) {
    console.error('[POST /api/screening/invite]', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Internal error' },
      { status: 500 }
    )
  }
}
