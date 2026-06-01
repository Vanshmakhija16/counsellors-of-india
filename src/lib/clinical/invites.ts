import { createClient } from '@/lib/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ScreeningInvite {
  id: string
  therapist_id: string
  patient_id: string
  instrument_id: string  // stores assessment_scales.id (= text slug, e.g. 'phq-9')
  token: string
  expires_at: string
  completed_session_id: string | null
  created_at: string
}

export interface InviteWithDetails extends ScreeningInvite {
  instrument: { id: string; slug: string; short_name: string; name: string }
  patient: { id: string; first_name: string; last_name: string }
}

export interface PublicInvitePayload {
  token: string
  patient_first_name: string
  instrument_id: string
  instrument_slug: string
  instrument_name: string
  instrument_short_name: string
  expired: boolean
  used: boolean
}

// ─── Client-side helpers ──────────────────────────────────────────────────────

function client() {
  return createClient()
}

/**
 * Create a screening invite for a patient.
 * instrumentSlug is the assessment_scales.id text value (e.g. 'phq-9').
 * Since assessment_scales.id IS the slug, no lookup is needed — pass it directly.
 */
export async function createInvite(
  patientId: string,
  instrumentSlug: string
): Promise<{ invite: ScreeningInvite; url: string }> {
  // Verify the scale exists before calling the API
  const supabase = client()
  const { data: scale, error: scaleErr } = await supabase
    .from('assessment_scales')
    .select('id, name')
    .eq('id', instrumentSlug)
    .maybeSingle()
  if (scaleErr) throw scaleErr
  if (!scale) throw new Error(`Unknown assessment: ${instrumentSlug}`)

  const res = await fetch('/api/screening/invite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patientId,
      instrumentId: scale.id,  // text id = slug
    }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `Failed to create invite (${res.status})`)
  }
  const { invite, url } = await res.json()
  return { invite, url }
}

export async function listInvitesForPatient(patientId: string): Promise<InviteWithDetails[]> {
  const supabase = client()
  const { data, error } = await supabase
    .from('screening_invites')
    .select(
      'id, therapist_id, patient_id, instrument_id, token, expires_at, completed_session_id, created_at, patient:patients(id, first_name, last_name)'
    )
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })
  if (error) throw error
  if (!data || data.length === 0) return []

  const rows = data as Record<string, unknown>[]

  // instrument_id is the text scale id — batch-fetch names
  const ids = [...new Set(rows.map((r) => r.instrument_id as string))]
  const { data: scales, error: scaleErr } = await supabase
    .from('assessment_scales')
    .select('id, name')
    .in('id', ids)
  if (scaleErr) throw scaleErr

  const scaleById = new Map<string, Record<string, unknown>>()
  for (const s of (scales ?? []) as Record<string, unknown>[]) {
    scaleById.set(s.id as string, s)
  }

  return rows.map((row) => {
    const patient = Array.isArray(row.patient) ? row.patient[0] : row.patient
    const scale = scaleById.get(row.instrument_id as string)
    const scaleName = (scale?.name ?? 'Unknown') as string
    return {
      ...(row as unknown as ScreeningInvite),
      patient: patient ?? { id: '', first_name: '', last_name: '' },
      instrument: {
        id:         (scale?.id ?? row.instrument_id) as string,
        slug:       (scale?.id ?? row.instrument_id) as string,  // id = slug
        short_name: scaleName,
        name:       scaleName,
      },
    } as InviteWithDetails
  })
}
