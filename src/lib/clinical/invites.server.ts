import 'server-only'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { PublicInvitePayload } from './invites'

export type { PublicInvitePayload } from './invites'

export async function getInviteByToken(token: string): Promise<PublicInvitePayload | null> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('screening_invites')
    .select(
      'token, expires_at, completed_session_id, instrument_id, patient_id, instrument:instruments(id, slug, name, short_name), patient:patients(first_name)'
    )
    .eq('token', token)
    .maybeSingle()
  if (error) throw error
  if (!data) return null

  const row = data as any
  const inst = Array.isArray(row.instrument) ? row.instrument[0] : row.instrument
  const pat = Array.isArray(row.patient) ? row.patient[0] : row.patient

  return {
    token: row.token,
    patient_first_name: pat?.first_name ?? '',
    instrument_id: inst?.id ?? row.instrument_id,
    instrument_slug: inst?.slug ?? '',
    instrument_name: inst?.name ?? '',
    instrument_short_name: inst?.short_name ?? '',
    expired: new Date(row.expires_at) < new Date(),
    used: row.completed_session_id !== null,
  }
}
