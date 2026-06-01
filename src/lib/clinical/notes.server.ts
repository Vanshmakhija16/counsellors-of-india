import 'server-only'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { SessionNote } from './notes'

export async function listNotesForPatientServer(patientId: string): Promise<SessionNote[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('session_notes')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as SessionNote[]
}
