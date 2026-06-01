import 'server-only'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { PublicInvitePayload } from './invites'

export type { PublicInvitePayload } from './invites'

export async function getInviteByToken(token: string): Promise<PublicInvitePayload | null> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('screening_invites')
    .select(
      'token, expires_at, completed_session_id, instrument_id, patient_id, patient:patients(first_name)'
    )
    .eq('token', token)
    .maybeSingle()
  if (error) throw error
  if (!data) return null

  const row = data as Record<string, unknown>
  const pat = Array.isArray(row.patient) ? row.patient[0] : row.patient

  // instrument_id IS the scale id (text slug)
  const scaleId = row.instrument_id as string

  const { data: scaleRow, error: scaleErr } = await supabase
    .from('assessment_scales')
    .select('id, name')
    .eq('id', scaleId)
    .maybeSingle()
  if (scaleErr) throw scaleErr

  const scale = scaleRow as Record<string, unknown> | null
  const scaleName = (scale?.name ?? '') as string

  return {
    token:                 row.token as string,
    patient_first_name:    ((pat as Record<string, unknown>)?.first_name ?? '') as string,
    instrument_id:         scaleId,
    instrument_slug:       scaleId,       // id = slug
    instrument_name:       scaleName,
    instrument_short_name: scaleName,     // no short_name column
    expired:               new Date(row.expires_at as string) < new Date(),
    used:                  row.completed_session_id !== null,
  }
}
