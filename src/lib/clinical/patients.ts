import { z } from 'zod'
import { createClient } from '@/lib/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'

export type PatientStatus = 'active' | 'archived' | 'discharged'

export interface Patient {
  id: string
  therapist_id: string
  first_name: string
  last_name: string
  dob: string
  gender: string | null
  pronouns: string | null
  marital_status: string | null
  email: string | null
  phone: string | null
  address: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  status: PatientStatus
  created_at: string
  updated_at: string
}

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
  .refine((v) => !Number.isNaN(Date.parse(v)), 'Invalid date')
  .refine((v) => new Date(v) <= new Date(), 'DOB cannot be in the future')

const optionalText = z
  .string()
  .trim()
  .max(200)
  .nullish()
  .transform((v) => (v && v.length ? v : null))

const optionalLong = z
  .string()
  .trim()
  .max(500)
  .nullish()
  .transform((v) => (v && v.length ? v : null))

const optionalEmail = z
  .string()
  .trim()
  .nullish()
  .transform((v) => (v && v.length ? v : null))
  .refine(
    (v) => v === null || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    'Invalid email'
  )

const optionalPhone = z
  .string()
  .trim()
  .nullish()
  .transform((v) => (v && v.length ? v : null))
  .refine(
    (v) => v === null || /^[+\d][\d\s\-()]{6,20}$/.test(v),
    'Invalid phone'
  )

export const patientCreateSchema = z.object({
  first_name: z.string().trim().min(1, 'Required').max(80),
  last_name: z.string().trim().min(1, 'Required').max(80),
  dob: isoDate,
  gender: optionalText,
  pronouns: optionalText,
  marital_status: optionalText,
  email: optionalEmail,
  phone: optionalPhone,
  address: optionalLong,
  emergency_contact_name: optionalText,
  emergency_contact_phone: optionalPhone,
  status: z.enum(['active', 'archived', 'discharged']).default('active'),
})

export const patientUpdateSchema = patientCreateSchema.partial()

export type PatientCreateInput = z.input<typeof patientCreateSchema>
export type PatientCreateData = z.output<typeof patientCreateSchema>
export type PatientUpdateInput = z.input<typeof patientUpdateSchema>
export type PatientUpdateData = z.output<typeof patientUpdateSchema>

export function calculateAge(dob: string): number {
  const birth = new Date(dob)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--
  return age
}

export function formatPatientName(p: Pick<Patient, 'first_name' | 'last_name'>): string {
  return `${p.first_name} ${p.last_name}`.trim()
}

export interface ListPatientsParams {
  search?: string
  status?: PatientStatus | 'all'
  limit?: number
  offset?: number
}

function client(): SupabaseClient {
  return createClient()
}

export async function listPatients(params: ListPatientsParams = {}): Promise<Patient[]> {
  const { search, status = 'active', limit = 50, offset = 0 } = params
  let q = client()
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status !== 'all') q = q.eq('status', status)

  if (search && search.trim()) {
    const s = search.trim().replace(/[,()]/g, ' ')
    q = q.or(
      `first_name.ilike.%${s}%,last_name.ilike.%${s}%,email.ilike.%${s}%,phone.ilike.%${s}%`
    )
  }

  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as Patient[]
}

export async function getPatient(id: string): Promise<Patient | null> {
  const { data, error } = await client()
    .from('patients')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return (data as Patient) ?? null
}

export async function createPatient(
  input: PatientCreateInput | PatientCreateData
): Promise<Patient> {
  const parsed = patientCreateSchema.parse(input)
  const supabase = client()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('patients')
    .insert({ ...parsed, therapist_id: session.user.id })
    .select('*')
    .single()
  if (error) throw error
  return data as Patient
}

export async function updatePatient(
  id: string,
  input: PatientUpdateInput | PatientUpdateData
): Promise<Patient> {
  const parsed = patientUpdateSchema.parse(input)
  const { data, error } = await client()
    .from('patients')
    .update(parsed)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return data as Patient
}

export async function setPatientStatus(
  id: string,
  status: PatientStatus
): Promise<void> {
  const { error } = await client()
    .from('patients')
    .update({ status })
    .eq('id', id)
  if (error) throw error
}

export async function deletePatient(id: string): Promise<void> {
  const { error } = await client().from('patients').delete().eq('id', id)
  if (error) throw error
}
