import { createClient } from '@/lib/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ScreeningInvite {
  id: string
  therapist_id: string
  patient_id: string
  instrument_id: string
  token: string
  expires_at: string
  completed_session_id: string | null
  created_at: string
}

export interface InviteWithDetails extends ScreeningInvite {
  instrument: { id: string; slug: string; short_name: string; name: string }
  patient: { id: string; first_name: string; last_name: string }
}

// ─── Client-side helpers ──────────────────────────────────────────────────────

function client() {
  return createClient()
}

export async function createInvite(
  patientId: string,
  instrumentSlug: string
): Promise<{ invite: ScreeningInvite; url: string }> {
  const supabase = client()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Not authenticated')

  // Resolve instrument id from slug
  const { data: inst, error: instErr } = await supabase
    .from('instruments')
    .select('id, slug')
    .eq('slug', instrumentSlug)
    .maybeSingle()
  if (instErr) throw instErr
  if (!inst) throw new Error(`Unknown instrument: ${instrumentSlug}`)

  // Call API route to create invite (token generation server-side)
  const res = await fetch('/api/screening/invite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patientId,
      instrumentId: inst.id,
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
  const { data, error } = await client()
    .from('screening_invites')
    .select(
      'id, therapist_id, patient_id, instrument_id, token, expires_at, completed_session_id, created_at, instrument:instruments(id, slug, short_name, name), patient:patients(id, first_name, last_name)'
    )
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((row: any) => ({
    ...row,
    instrument: Array.isArray(row.instrument) ? row.instrument[0] : row.instrument,
    patient: Array.isArray(row.patient) ? row.patient[0] : row.patient,
  })) as InviteWithDetails[]
}

// NOTE: server-only helpers (getInviteByToken, etc.) live in
// `./invites.server.ts` so that this client-safe file does not pull in
// `next/headers`. Import from there in server components / route handlers.

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
