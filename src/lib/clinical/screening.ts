import { createClient } from '@/lib/supabase'

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
  id: string
  slug: string
  name: string
  short_name: string
  description: string | null
  domain: 'depression' | 'anxiety' | 'trauma' | 'substance' | string
  recall_window: string | null
  min_score: number
  max_score: number
  severity_bands: SeverityBand[]
  options: InstrumentOption[]
  is_active: boolean
}

export interface InstrumentItem {
  id: string
  instrument_id: string
  position: number
  prompt: string
  is_critical: boolean
}

export interface InstrumentWithItems extends Instrument {
  items: InstrumentItem[]
}

export interface ScreeningSession {
  id: string
  therapist_id: string
  patient_id: string
  instrument_id: string
  total_score: number
  severity_label: string
  flagged: boolean
  notes: string | null
  administered_at: string
}

export interface ScreeningSessionWithInstrument extends ScreeningSession {
  instrument: Pick<Instrument, 'id' | 'slug' | 'short_name' | 'name' | 'min_score' | 'max_score' | 'domain'>
}

export interface ScreeningResponse {
  id: string
  session_id: string
  item_id: string
  value: number
}

export function severityFor(score: number, bands: SeverityBand[]): string {
  const hit = bands.find((b) => score >= b.min && score <= b.max)
  return hit?.label ?? 'Unknown'
}

function client() {
  return createClient()
}

export async function listInstruments(): Promise<Instrument[]> {
  const { data, error } = await client()
    .from('instruments')
    .select('*')
    .eq('is_active', true)
    .order('domain', { ascending: true })
    .order('short_name', { ascending: true })
  if (error) throw error
  return (data ?? []) as Instrument[]
}

export async function getInstrumentBySlug(slug: string): Promise<InstrumentWithItems | null> {
  const supabase = client()
  const { data: inst, error } = await supabase
    .from('instruments')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()
  if (error) throw error
  if (!inst) return null

  const { data: items, error: itemsErr } = await supabase
    .from('instrument_items')
    .select('*')
    .eq('instrument_id', (inst as Instrument).id)
    .order('position', { ascending: true })
  if (itemsErr) throw itemsErr

  return { ...(inst as Instrument), items: (items ?? []) as InstrumentItem[] }
}

export async function listPatientSessions(
  patientId: string
): Promise<ScreeningSessionWithInstrument[]> {
  const { data, error } = await client()
    .from('screening_sessions')
    .select(
      'id, therapist_id, patient_id, instrument_id, total_score, severity_label, flagged, notes, administered_at, instrument:instruments(id, slug, short_name, name, min_score, max_score, domain)'
    )
    .eq('patient_id', patientId)
    .order('administered_at', { ascending: false })
  if (error) throw error
  // supabase nested select returns instrument as object (not array) for fk one-to-one
  return (data ?? []).map((row: any) => ({
    ...row,
    instrument: Array.isArray(row.instrument) ? row.instrument[0] : row.instrument,
  })) as ScreeningSessionWithInstrument[]
}

export interface CreateSessionInput {
  patient_id: string
  instrument_slug: string
  responses: { item_id: string; value: number }[]
  notes?: string | null
}

export async function createSession(input: CreateSessionInput): Promise<ScreeningSession> {
  const supabase = client()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Not authenticated')

  const instrument = await getInstrumentBySlug(input.instrument_slug)
  if (!instrument) throw new Error(`Unknown instrument: ${input.instrument_slug}`)

  const responsesByItem = new Map(input.responses.map((r) => [r.item_id, r.value]))
  const missing = instrument.items.filter((i) => !responsesByItem.has(i.id))
  if (missing.length > 0) {
    throw new Error(`Missing answers for ${missing.length} item(s)`)
  }

  let total = 0
  let flagged = false
  for (const item of instrument.items) {
    const v = responsesByItem.get(item.id) ?? 0
    total += v
    if (item.is_critical && v > 0) flagged = true
  }
  const severity_label = severityFor(total, instrument.severity_bands)

  const { data: sessionRow, error: insertErr } = await supabase
    .from('screening_sessions')
    .insert({
      therapist_id: session.user.id,
      patient_id: input.patient_id,
      instrument_id: instrument.id,
      total_score: total,
      severity_label,
      flagged,
      notes: input.notes ?? null,
    })
    .select('*')
    .single()
  if (insertErr) throw insertErr

  const sess = sessionRow as ScreeningSession
  const responseRows = input.responses.map((r) => ({
    session_id: sess.id,
    item_id: r.item_id,
    value: r.value,
  }))
  const { error: respErr } = await supabase.from('screening_responses').insert(responseRows)
  if (respErr) {
    await supabase.from('screening_sessions').delete().eq('id', sess.id)
    throw respErr
  }

  return sess
}

export async function getSession(
  sessionId: string
): Promise<{
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

  const { data: instRow, error: instErr } = await supabase
    .from('instruments')
    .select('*')
    .eq('id', sess.instrument_id)
    .maybeSingle()
  if (instErr) throw instErr
  if (!instRow) return null

  const { data: items, error: itemsErr } = await supabase
    .from('instrument_items')
    .select('*')
    .eq('instrument_id', sess.instrument_id)
    .order('position', { ascending: true })
  if (itemsErr) throw itemsErr

  const { data: responses, error: respErr } = await supabase
    .from('screening_responses')
    .select('*')
    .eq('session_id', sessionId)
  if (respErr) throw respErr

  return {
    session: sess,
    instrument: {
      ...(instRow as Instrument),
      items: (items ?? []) as InstrumentItem[],
    },
    responses: (responses ?? []) as ScreeningResponse[],
  }
}

export async function deleteSession(sessionId: string): Promise<void> {
  const { error } = await client().from('screening_sessions').delete().eq('id', sessionId)
  if (error) throw error
}
