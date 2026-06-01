import 'server-only'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { Appointment } from './appointments'

export async function listAppointmentsForPatientServer(
  patientId: string
): Promise<Appointment[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('patient_id', patientId)
    .order('scheduled_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Appointment[]
}
