/**
 * screening.ts — client-side helpers for the assessment/screening module.
 *
 * Actual DB schema
 * ─────────────────
 * assessment_scales (
 *   id                text PK,          ← this IS the slug, e.g. 'phq-9'
 *   name              text,
 *   description       text,
 *   timeframe         text,             ← equivalent of recall_window
 *   max_score         integer,
 *   scoring_interpretation jsonb        ← severity bands, shape: [{min,max,label}]
 * )
 *
 * assessment_questions (
 *   id                uuid PK,
 *   scale_id          text → assessment_scales(id),
 *   question_number   integer,          ← ordering / position
 *   question_text     text,
 *   is_reverse_scored boolean,
 *   category          text              ← use for critical-item flagging if needed
 * )
 *
 * assessment_options (
 *   id                uuid PK,
 *   scale_id          text → assessment_scales(id),
 *   option_text       text,
 *   score_value       integer,
 *   display_order     integer
 * )
 *
 * screening_sessions  — unchanged (instrument_id stores assessment_scales.id text value)
 * screening_responses — unchanged (item_id stores assessment_questions.id uuid)
 */

import { createClient } from '@/lib/supabase'

// ─── Public types ─────────────────────────────────────────────────────────────

export interface InstrumentOption {
  value: number
  label: string
}

export interface SeverityBand {
  min: number
  max: number
  label: string
}

export interface Instrument {
  id: string           // = assessment_scales.id (the text slug, e.g. 'phq-9')
  slug: string         // same as id for compatibility
  name: string
  short_name: string   // derived from name for compatibility
  description: string | null
  domain: string       // not in DB — always 'general'
  recall_window: string | null  // mapped from timeframe
  min_score: number    // always 0 (not stored in DB)
  max_score: number    // from max_score column
  severity_bands: SeverityBand[]  // parsed from scoring_interpretation jsonb
  options: InstrumentOption[]
  is_active: boolean   // not in DB — always true
}

export interface InstrumentItem {
  id: string
  instrument_id: string  // = scale_id (text)
  position: number       // from question_number
  prompt: string         // from question_text
  is_critical: boolean   // not in DB — always false (category could be used if needed)
}

export interface InstrumentWithItems extends Instrument {
  items: InstrumentItem[]
}

export interface ScreeningSession {
  id: string
  therapist_id: string
  patient_id: string
  instrument_id: string  // stores assessment_scales.id (text)
  total_score: number
  severity_label: string
  flagged: boolean
  notes: string | null
  administered_at: string
}

export interface ScreeningSessionWithInstrument extends ScreeningSession {
  instrument: Pick<
    Instrument,
    'id' | 'slug' | 'short_name' | 'name' | 'min_score' | 'max_score' | 'domain'
  >
}

export interface ScreeningResponse {
  id: string
  session_id: string
  item_id: string
  value: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function severityFor(score: number, bands: SeverityBand[]): string {
  const hit = bands.find((b) => score >= b.min && score <= b.max)
  return hit?.label ?? 'Unknown'
}

function client() {
  return createClient()
}

/**
 * Parse scoring_interpretation jsonb into SeverityBand[].
 * The column may be null or in various shapes — handle gracefully.
 */
function parseSeverityBands(raw: unknown): SeverityBand[] {
  if (!raw || !Array.isArray(raw)) return []
  return (raw as Record<string, unknown>[]).map((b) => ({
    min:   (b.min   ?? b.low   ?? 0)  as number,
    max:   (b.max   ?? b.high  ?? 0)  as number,
    label: (b.label ?? b.level ?? '') as string,
  }))
}

/**
 * Map a raw assessment_scales row → Instrument.
 * assessment_scales.id IS the slug — no separate slug column exists.
 */
function rowToInstrument(
  row: Record<string, unknown>,
  options: InstrumentOption[]
): Instrument {
  const id = row.id as string
  const bands = parseSeverityBands(row.scoring_interpretation)
  return {
    id,
    slug:           id,                                      // id = slug
    name:           (row.name ?? '') as string,
    short_name:     (row.name ?? '') as string,              // no short_name column
    description:    (row.description ?? null) as string | null,
    domain:         'general',                               // no domain column
    recall_window:  (row.timeframe ?? null) as string | null,
    min_score:      0,                                       // no min_score column
    max_score:      (row.max_score ?? 0) as number,
    severity_bands: bands,
    options,
    is_active:      true,
  }
}

/**
 * Map a raw assessment_questions row → InstrumentItem.
 */
function rowToItem(q: Record<string, unknown>): InstrumentItem {
  return {
    id:            q.id as string,
    instrument_id: (q.scale_id ?? '') as string,
    position:      (q.question_number ?? 0) as number,
    prompt:        (q.question_text ?? '') as string,
    is_critical:   false,  // no is_critical column; category could map here if needed
  }
}

/**
 * Fetch options from assessment_options for a given scale id (= slug).
 */
async function fetchOptionsForScale(
  supabase: ReturnType<typeof createClient>,
  scaleId: string
): Promise<InstrumentOption[]> {
  const { data, error } = await supabase
    .from('assessment_options')
    .select('option_text, score_value, display_order')
    .eq('scale_id', scaleId)
    .order('display_order', { ascending: true })
  if (error) throw error
  return (data ?? []).map((o: Record<string, unknown>) => ({
    value: o.score_value as number,
    label: o.option_text as string,
  }))
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * List all assessment scales with options pre-loaded.
 * Orders by name (no domain column exists).
 */
export async function listInstruments(): Promise<Instrument[]> {
  const supabase = client()

  const { data: scales, error } = await supabase
    .from('assessment_scales')
    .select('id, name, description, timeframe, max_score, scoring_interpretation')
    .order('name', { ascending: true })
  if (error) throw error
  if (!scales || scales.length === 0) return []

  // Batch-fetch all options for all scales in one query
  const ids = (scales as Record<string, unknown>[]).map((s) => s.id as string)
  const { data: allOptions, error: optErr } = await supabase
    .from('assessment_options')
    .select('scale_id, option_text, score_value, display_order')
    .in('scale_id', ids)
    .order('display_order', { ascending: true })
  if (optErr) throw optErr

  const optsByScaleId = new Map<string, InstrumentOption[]>()
  for (const o of (allOptions ?? []) as Record<string, unknown>[]) {
    const sid = o.scale_id as string
    const arr = optsByScaleId.get(sid) ?? []
    arr.push({ value: o.score_value as number, label: o.option_text as string })
    optsByScaleId.set(sid, arr)
  }

  return (scales as Record<string, unknown>[]).map((s) =>
    rowToInstrument(s, optsByScaleId.get(s.id as string) ?? [])
  )
}

/**
 * Fetch a single scale with all its questions and options by id/slug.
 * assessment_scales.id IS the slug (e.g. 'phq-9').
 */
export async function getInstrumentBySlug(slug: string): Promise<InstrumentWithItems | null> {
  const supabase = client()

  const { data: scaleRow, error } = await supabase
    .from('assessment_scales')
    .select('id, name, description, timeframe, max_score, scoring_interpretation')
    .eq('id', slug)
    .maybeSingle()
  if (error) throw error
  if (!scaleRow) return null
  const scale = scaleRow as Record<string, unknown>

  const [{ data: questions, error: qErr }, options] = await Promise.all([
    supabase
      .from('assessment_questions')
      .select('id, scale_id, question_number, question_text, is_reverse_scored, category')
      .eq('scale_id', slug)
      .order('question_number', { ascending: true }),
    fetchOptionsForScale(supabase, slug),
  ])
  if (qErr) throw qErr

  return {
    ...rowToInstrument(scale, options),
    items: (questions ?? []).map((q) => rowToItem(q as Record<string, unknown>)),
  }
}

/**
 * List all sessions for a patient, each enriched with scale metadata.
 */
export async function listPatientSessions(
  patientId: string
): Promise<ScreeningSessionWithInstrument[]> {
  const supabase = client()

  const { data, error } = await supabase
    .from('screening_sessions')
    .select(
      'id, therapist_id, patient_id, instrument_id, total_score, severity_label, flagged, notes, administered_at'
    )
    .eq('patient_id', patientId)
    .order('administered_at', { ascending: false })
  if (error) throw error
  if (!data || data.length === 0) return []

  // instrument_id stores the text id of the scale (= slug)
  const instrumentIds = [
    ...new Set((data as Record<string, unknown>[]).map((r) => r.instrument_id as string)),
  ]
  const { data: scales, error: scaleErr } = await supabase
    .from('assessment_scales')
    .select('id, name, max_score')
    .in('id', instrumentIds)
  if (scaleErr) throw scaleErr

  const scaleById = new Map<string, Record<string, unknown>>()
  for (const s of (scales ?? []) as Record<string, unknown>[]) {
    scaleById.set(s.id as string, s)
  }

  return (data as Record<string, unknown>[]).map((row) => {
    const s = scaleById.get(row.instrument_id as string)
    return {
      ...(row as unknown as ScreeningSession),
      instrument: s
        ? {
            id:         s.id as string,
            slug:       s.id as string,
            short_name: (s.name ?? '') as string,
            name:       (s.name ?? '') as string,
            min_score:  0,
            max_score:  (s.max_score ?? 0) as number,
            domain:     'general',
          }
        : {
            id:         row.instrument_id as string,
            slug:       row.instrument_id as string,
            short_name: 'Unknown',
            name:       'Unknown',
            min_score:  0,
            max_score:  0,
            domain:     'general',
          },
    } as ScreeningSessionWithInstrument
  })
}

// ─── Create session ───────────────────────────────────────────────────────────

export interface CreateSessionInput {
  patient_id: string
  instrument_slug: string
  responses: { item_id: string; value: number }[]
  notes?: string | null
}

export async function createSession(input: CreateSessionInput): Promise<ScreeningSession> {
  const supabase = client()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Not authenticated')

  const instrument = await getInstrumentBySlug(input.instrument_slug)
  if (!instrument) throw new Error(`Unknown assessment: ${input.instrument_slug}`)

  const responsesByItem = new Map(input.responses.map((r) => [r.item_id, r.value]))
  const missing = instrument.items.filter((i) => !responsesByItem.has(i.id))
  if (missing.length > 0)
    throw new Error(`Missing answers for ${missing.length} question(s)`)

  let total   = 0
  let flagged = false
  for (const item of instrument.items) {
    const v = responsesByItem.get(item.id) ?? 0
    total  += v
    if (item.is_critical && v > 0) flagged = true
  }
  const severity_label = severityFor(total, instrument.severity_bands)

  const { data: sessionRow, error: insertErr } = await supabase
    .from('screening_sessions')
    .insert({
      therapist_id:  session.user.id,
      patient_id:    input.patient_id,
      instrument_id: instrument.id,   // text id, e.g. 'phq-9'
      total_score:   total,
      severity_label,
      flagged,
      notes: input.notes ?? null,
    })
    .select('*')
    .single()
  if (insertErr) throw insertErr

  const sess = sessionRow as ScreeningSession

  const { error: respErr } = await supabase
    .from('screening_responses')
    .insert(
      input.responses.map((r) => ({
        session_id: sess.id,
        item_id:    r.item_id,
        value:      r.value,
      }))
    )
  if (respErr) {
    await supabase.from('screening_sessions').delete().eq('id', sess.id)
    throw respErr
  }

  return sess
}

// ─── Get single session with full detail ─────────────────────────────────────

export async function getSession(sessionId: string): Promise<{
  session: ScreeningSession
  instrument: InstrumentWithItems
  responses: ScreeningResponse[]
} | null> {
  const supabase = client()

  const { data: sessRow, error } = await supabase
    .from('screening_sessions')
    .select('*')
    .eq('id', sessionId)
    .maybeSingle()
  if (error) throw error
  if (!sessRow) return null

  const sess = sessRow as ScreeningSession

  // instrument_id is the text scale id (= slug)
  const scaleId = sess.instrument_id

  const { data: scaleRow, error: scaleErr } = await supabase
    .from('assessment_scales')
    .select('id, name, description, timeframe, max_score, scoring_interpretation')
    .eq('id', scaleId)
    .maybeSingle()
  if (scaleErr) throw scaleErr
  if (!scaleRow) return null

  const scale = scaleRow as Record<string, unknown>

  const [
    { data: questions, error: qErr },
    options,
    { data: responses, error: respErr },
  ] = await Promise.all([
    supabase
      .from('assessment_questions')
      .select('id, scale_id, question_number, question_text, is_reverse_scored, category')
      .eq('scale_id', scaleId)
      .order('question_number', { ascending: true }),
    fetchOptionsForScale(supabase, scaleId),
    supabase.from('screening_responses').select('*').eq('session_id', sessionId),
  ])
  if (qErr)    throw qErr
  if (respErr) throw respErr

  return {
    session: sess,
    instrument: {
      ...rowToInstrument(scale, options),
      items: (questions ?? []).map((q) => rowToItem(q as Record<string, unknown>)),
    },
    responses: (responses ?? []) as ScreeningResponse[],
  }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteSession(sessionId: string): Promise<void> {
  const { error } = await client()
    .from('screening_sessions')
    .delete()
    .eq('id', sessionId)
  if (error) throw error
}
