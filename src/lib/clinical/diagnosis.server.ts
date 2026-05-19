import 'server-only'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { PatientDiagnosisWithDisorder } from './diagnosis'

export async function listPatientDiagnosesServer(
  patientId: string
): Promise<PatientDiagnosisWithDisorder[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('patient_diagnoses')
    .select('*, disorder:dsm_disorders(id, code, name, category, criteria_summary)')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return ((data ?? []) as any[]).map((row) => ({
    ...row,
    disorder: Array.isArray(row.disorder) ? row.disorder[0] : row.disorder,
  })) as PatientDiagnosisWithDisorder[]
}
