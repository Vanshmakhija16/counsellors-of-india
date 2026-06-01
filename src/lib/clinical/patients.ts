import { z } from 'zod'
import { createClient } from '@/lib/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'

export type PatientStatus = 'active' | 'archived' | 'discharged'

export interface Patient {
  id: string
  therapist_id: string
  first_name: string
  last_name: string
  dob: string | null
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

export function calculateAge(dob: string | null | undefined): number | null {
  if (!dob) return null
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

/**
 * A "booker" is someone who has booked a session but has no `patients` row.
 * Surfaced in My Clients so every person who ever booked is visible.
 */
export interface BookerRow {
  /** synthetic id — not a real patient id; use email/phone to act on it */
  synthetic_id: string
  client_name: string
  client_email: string | null
  client_phone: string | null
  total_appointments: number
  last_seen_at: string | null
}

export interface PatientStats {
  total_appointments: number
  last_seen_at: string | null
  /** 'none' = no intake row, 'draft' = open draft, 'final' = at least one finalised */
  intake_state: 'none' | 'draft' | 'final'
  latest_intake_version: number | null
  diagnosis_count: number
}

export interface PatientWithStats extends Patient {
  stats: PatientStats
}

const EMPTY_STATS: PatientStats = {
  total_appointments: 0,
  last_seen_at: null,
  intake_state: 'none',
  latest_intake_version: null,
  diagnosis_count: 0,
}

/**
 * List patients with aggregated stats (appointments, intake, diagnoses).
 * Runs the patient list and the per-side aggregations in parallel.
 */
export async function listPatientsWithStats(
  params: ListPatientsParams = {}
): Promise<PatientWithStats[]> {
  const patients = await listPatients(params)
  if (patients.length === 0) return []

  const ids = patients.map((p) => p.id)
  const supabase = client()

  const [apptRes, intakeRes, dxRes] = await Promise.all([
    supabase
      .from('appointments')
      .select('patient_id, scheduled_at')
      .in('patient_id', ids),
    supabase
      .from('patient_intakes')
      .select('patient_id, status, version')
      .in('patient_id', ids),
    supabase
      .from('patient_diagnoses')
      .select('patient_id')
      .in('patient_id', ids),
  ])

  const apptByPatient = new Map<string, { count: number; lastSeen: string | null }>()
  for (const row of (apptRes.data ?? []) as { patient_id: string | null; scheduled_at: string }[]) {
    if (!row.patient_id) continue
    const cur = apptByPatient.get(row.patient_id) ?? { count: 0, lastSeen: null as string | null }
    cur.count += 1
    if (!cur.lastSeen || row.scheduled_at > cur.lastSeen) cur.lastSeen = row.scheduled_at
    apptByPatient.set(row.patient_id, cur)
  }

  const intakeByPatient = new Map<
    string,
    { state: 'none' | 'draft' | 'final'; latestFinal: number | null }
  >()
  for (const row of (intakeRes.data ?? []) as { patient_id: string; status: string; version: number }[]) {
    const cur = intakeByPatient.get(row.patient_id) ?? {
      state: 'none' as 'none' | 'draft' | 'final',
      latestFinal: null as number | null,
    }
    if (row.status === 'final') {
      cur.state = 'final'
      if (cur.latestFinal === null || row.version > cur.latestFinal) cur.latestFinal = row.version
    } else if (row.status === 'draft' && cur.state !== 'final') {
      cur.state = 'draft'
    }
    intakeByPatient.set(row.patient_id, cur)
  }

  const dxByPatient = new Map<string, number>()
  for (const row of (dxRes.data ?? []) as { patient_id: string }[]) {
    dxByPatient.set(row.patient_id, (dxByPatient.get(row.patient_id) ?? 0) + 1)
  }

  return patients.map<PatientWithStats>((p) => {
    const appt = apptByPatient.get(p.id)
    const intake = intakeByPatient.get(p.id)
    return {
      ...p,
      stats: {
        total_appointments: appt?.count ?? 0,
        last_seen_at: appt?.lastSeen ?? null,
        intake_state: intake?.state ?? EMPTY_STATS.intake_state,
        latest_intake_version: intake?.latestFinal ?? null,
        diagnosis_count: dxByPatient.get(p.id) ?? 0,
      },
    }
  })
}

/**
 * Returns every distinct person who booked but does NOT yet have a `patients` row.
 * Grouped by lower(email) when present, else by phone, else by name+null fallback.
 * Use this alongside `listPatientsWithStats` to render a complete My Clients list.
 */
export async function listUnlinkedBookers(): Promise<BookerRow[]> {
  const supabase = client()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('appointments')
    .select('id, client_name, client_email, client_phone, scheduled_at, patient_id')
    .eq('therapist_id', session.user.id)
    .is('patient_id', null)
    .order('scheduled_at', { ascending: false })
  if (error) throw error

  type AptRow = {
    id: string
    client_name: string
    client_email: string | null
    client_phone: string | null
    scheduled_at: string
  }

  const buckets = new Map<string, BookerRow>()
  for (const row of (data ?? []) as AptRow[]) {
    const key =
      (row.client_email && `email:${row.client_email.toLowerCase()}`) ||
      (row.client_phone && `phone:${row.client_phone}`) ||
      `name:${row.client_name}`

    const existing = buckets.get(key)
    if (existing) {
      existing.total_appointments += 1
      if (!existing.last_seen_at || row.scheduled_at > existing.last_seen_at) {
        existing.last_seen_at = row.scheduled_at
      }
    } else {
      buckets.set(key, {
        synthetic_id: `booker:${key}`,
        client_name: row.client_name,
        client_email: row.client_email,
        client_phone: row.client_phone,
        total_appointments: 1,
        last_seen_at: row.scheduled_at,
      })
    }
  }

  return Array.from(buckets.values()).sort((a, b) => {
    const aLast = a.last_seen_at ?? ''
    const bLast = b.last_seen_at ?? ''
    return bLast.localeCompare(aLast)
  })
}

/**
 * Promote a booker into a real patient row.
 * - Creates the patients row (DOB null, fillable later).
 * - Back-links all matching appointments to this patient by email AND/OR phone.
 */
export async function promoteBookerToPatient(input: {
  client_name: string
  client_email: string | null
  client_phone: string | null
}): Promise<Patient> {
  const supabase = client()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Not authenticated')

  const parts = input.client_name.trim().split(/\s+/)
  const first_name = parts[0]
  const last_name = parts.slice(1).join(' ') || '—'

  const { data: created, error: insertErr } = await supabase
    .from('patients')
    .insert({
      therapist_id: session.user.id,
      first_name,
      last_name,
      dob: null,
      email: input.client_email,
      phone: input.client_phone,
      status: 'active',
    })
    .select('*')
    .single()
  if (insertErr) throw insertErr

  const patient = created as Patient

  // Back-link any matching appointments. Best-effort: ignore failures.
  if (input.client_email) {
    await supabase
      .from('appointments')
      .update({ patient_id: patient.id })
      .eq('therapist_id', session.user.id)
      .is('patient_id', null)
      .ilike('client_email', input.client_email)
  }
  if (input.client_phone) {
    await supabase
      .from('appointments')
      .update({ patient_id: patient.id })
      .eq('therapist_id', session.user.id)
      .is('patient_id', null)
      .eq('client_phone', input.client_phone)
  }

  return patient
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
