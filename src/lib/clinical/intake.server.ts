import 'server-only'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { PatientIntake } from './intake'

export async function getIntakeServer(patientId: string): Promise<PatientIntake | null> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('patient_intakes')
    .select('*')
    .eq('patient_id', patientId)
    .maybeSingle()
  if (error) throw error
  return (data as PatientIntake) ?? null
}
