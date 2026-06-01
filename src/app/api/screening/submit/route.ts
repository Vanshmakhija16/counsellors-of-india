import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Public route — called by unauthenticated patients completing a screening invite.
 *
 * DB schema used:
 *   assessment_scales    (id text PK, max_score, scoring_interpretation jsonb)
 *   assessment_questions (id uuid, scale_id text, question_number int)
 *   screening_sessions   (instrument_id stores assessment_scales.id text)
 *   screening_responses  (item_id stores assessment_questions.id uuid)
 */
export async function POST(req: NextRequest) {
  try {
    const { token, responses, notes } = await req.json()
    if (!token || !Array.isArray(responses)) {
      return NextResponse.json({ error: 'token and responses required' }, { status: 400 })
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    )

    // ── 1. Validate invite ────────────────────────────────────────────────────
    const { data: inviteRow, error: invErr } = await supabase
      .from('screening_invites')
      .select('id, therapist_id, patient_id, instrument_id, expires_at, completed_session_id')
      .eq('token', token)
      .maybeSingle()

    if (invErr || !inviteRow) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
    }
    if (inviteRow.completed_session_id) {
      return NextResponse.json({ error: 'This link has already been used' }, { status: 400 })
    }
    if (new Date(inviteRow.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This link has expired' }, { status: 400 })
    }

    // ── 2. Fetch scale — instrument_id IS the text scale id ──────────────────
    const scaleId = inviteRow.instrument_id as string

    const { data: scaleRow, error: scaleErr } = await supabase
      .from('assessment_scales')
      .select('id, max_score, scoring_interpretation')
      .eq('id', scaleId)
      .maybeSingle()

    if (scaleErr || !scaleRow) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 400 })
    }

    // ── 3. Fetch questions via scale_id text (= scale id) ─────────────────────
    const { data: questions, error: qErr } = await supabase
      .from('assessment_questions')
      .select('id, question_number')
      .eq('scale_id', scaleId)

    if (qErr || !questions || questions.length === 0) {
      return NextResponse.json({ error: 'No questions found for this assessment' }, { status: 400 })
    }

    const questionIds = new Set(questions.map((q: Record<string, unknown>) => q.id as string))
    const responseMap = new Map<string, number>(
      (responses as { item_id: string; value: number }[]).map((r) => [r.item_id, r.value])
    )

    // Verify every question has a response
    const missing = [...questionIds].filter((id) => !responseMap.has(id))
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing answers for ${missing.length} question(s)` },
        { status: 400 }
      )
    }

    // ── 4. Compute total score ────────────────────────────────────────────────
    let total = 0
    for (const q of questions as Record<string, unknown>[]) {
      total += responseMap.get(q.id as string) ?? 0
    }

    const bands = (scaleRow.scoring_interpretation ?? []) as {
      min: number
      max: number
      label: string
    }[]
    const severityBand  = bands.find((b) => total >= b.min && total <= b.max)
    const severity_label = severityBand?.label ?? 'Unknown'
    const flagged        = false  // no is_critical column; extend here if needed

    // ── 5. Insert screening_session ───────────────────────────────────────────
    const { data: sessionRow, error: sessErr } = await supabase
      .from('screening_sessions')
      .insert({
        therapist_id:  inviteRow.therapist_id,
        patient_id:    inviteRow.patient_id,
        instrument_id: scaleId,   // text id stored directly
        total_score:   total,
        severity_label,
        flagged,
        notes: notes ?? null,
      })
      .select('id')
      .single()

    if (sessErr || !sessionRow) {
      console.error('[submit screening] session insert error:', sessErr)
      return NextResponse.json({ error: 'Failed to save session' }, { status: 500 })
    }

    // ── 6. Insert responses ───────────────────────────────────────────────────
    const responseRows = responses.map((r: { item_id: string; value: number }) => ({
      session_id: sessionRow.id,
      item_id:    r.item_id,
      value:      r.value,
    }))
    const { error: respErr } = await supabase.from('screening_responses').insert(responseRows)
    if (respErr) {
      await supabase.from('screening_sessions').delete().eq('id', sessionRow.id)
      console.error('[submit screening] responses insert error:', respErr)
      return NextResponse.json({ error: 'Failed to save responses' }, { status: 500 })
    }

    // ── 7. Mark invite used ───────────────────────────────────────────────────
    await supabase
      .from('screening_invites')
      .update({ completed_session_id: sessionRow.id })
      .eq('token', token)

    return NextResponse.json({ success: true, session_id: sessionRow.id })
  } catch (e: unknown) {
    console.error('[POST /api/screening/submit]', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Internal error' },
      { status: 500 }
    )
  }
}
