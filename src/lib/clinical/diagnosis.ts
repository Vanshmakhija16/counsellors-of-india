import { z } from 'zod'
import { createClient } from '@/lib/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

export type DiagnosisStatus = 'provisional' | 'working' | 'confirmed' | 'ruled_out'

export interface DsmDisorder {
  id: string
  code: string
  name: string
  category: string
  criteria_summary: string | null
}

export interface DsmCriterion {
  id: string
  disorder_id: string
  label: string
  group: string
  required_count: number
}

export interface PatientDiagnosis {
  id: string
  therapist_id: string
  patient_id: string
  disorder_id: string
  status: DiagnosisStatus
  met_criteria_ids: string[]
  onset_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface PatientDiagnosisWithDisorder extends PatientDiagnosis {
  disorder: DsmDisorder
}

// ─── Zod schemas ──────────────────────────────────────────────────────────────

export const diagnosisCreateSchema = z.object({
  disorder_id: z.string().uuid('Select a disorder'),
  status: z.enum(['provisional', 'working', 'confirmed', 'ruled_out']),
  met_criteria_ids: z.array(z.string().uuid()).default([]),
  onset_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
    .nullish()
    .transform((v) => (v && v.length > 0 ? v : null)),
  notes: z
    .string()
    .trim()
    .max(3000)
    .nullish()
    .transform((v) => (v && v.length > 0 ? v : null)),
})

export const diagnosisUpdateSchema = diagnosisCreateSchema.partial()

export type DiagnosisCreateInput = z.input<typeof diagnosisCreateSchema>
export type DiagnosisUpdateInput = z.input<typeof diagnosisUpdateSchema>

// ─── Criteria helpers ─────────────────────────────────────────────────────────

export interface GroupResult {
  group: string
  required: number
  met: number
  pass: boolean
}

export function meetsCriteria(
  metIds: string[],
  criteria: DsmCriterion[]
): { groups: GroupResult[]; allPass: boolean } {
  const metSet = new Set(metIds)
  const byGroup = new Map<string, { required: number; ids: string[] }>()
  for (const c of criteria) {
    const g = byGroup.get(c.group) ?? { required: c.required_count, ids: [] }
    g.ids.push(c.id)
    byGroup.set(c.group, g)
  }
  const groups: GroupResult[] = []
  for (const [group, { required, ids }] of byGroup.entries()) {
    const met = ids.filter((id) => metSet.has(id)).length
    groups.push({ group, required, met, pass: met >= required })
  }
  const allPass = groups.length > 0 && groups.every((g) => g.pass)
  return { groups, allPass }
}

// ─── Data access (client-side) ────────────────────────────────────────────────

function client() {
  return createClient()
}

export async function listDsmDisorders(): Promise<DsmDisorder[]> {
  const { data, error } = await client()
    .from('dsm_disorders')
    .select('*')
    .order('category')
    .order('name')
  if (error) throw error
  return (data ?? []) as DsmDisorder[]
}

export async function getDsmDisorder(id: string): Promise<DsmDisorder | null> {
  const { data, error } = await client()
    .from('dsm_disorders')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return (data as DsmDisorder) ?? null
}

export async function listDsmCriteria(disorderId: string): Promise<DsmCriterion[]> {
  const { data, error } = await client()
    .from('dsm_criteria')
    .select('*')
    .eq('disorder_id', disorderId)
    .order('group')
    .order('label')
  if (error) throw error
  return (data ?? []) as DsmCriterion[]
}

export async function listPatientDiagnoses(
  patientId: string
): Promise<PatientDiagnosisWithDisorder[]> {
  const { data, error } = await client()
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

export async function createDiagnosis(
  patientId: string,
  input: DiagnosisCreateInput
): Promise<PatientDiagnosis> {
  const parsed = diagnosisCreateSchema.parse(input)
  const supabase = client()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('patient_diagnoses')
    .insert({ ...parsed, patient_id: patientId, therapist_id: session.user.id })
    .select('*')
    .single()
  if (error) throw error
  return data as PatientDiagnosis
}

export async function updateDiagnosis(
  diagnosisId: string,
  input: DiagnosisUpdateInput
): Promise<PatientDiagnosis> {
  const parsed = diagnosisUpdateSchema.parse(input)
  const { data, error } = await client()
    .from('patient_diagnoses')
    .update(parsed)
    .eq('id', diagnosisId)
    .select('*')
    .single()
  if (error) throw error
  return data as PatientDiagnosis
}

export async function deleteDiagnosis(diagnosisId: string): Promise<void> {
  const { error } = await client().from('patient_diagnoses').delete().eq('id', diagnosisId)
  if (error) throw error
}

// Server-only reads (`listPatientDiagnosesServer`) live in `./diagnosis.server.ts`.
