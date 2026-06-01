import { createClient } from '@/lib/supabase'

export type AppointmentStatus = 'upcoming' | 'rescheduled' | 'completed'

export interface Appointment {
  id: string
  therapist_id: string
  patient_id: string | null
  client_name: string
  client_email: string | null
  client_phone: string | null
  scheduled_at: string
  duration_mins: number
  status: AppointmentStatus
  created_at: string
}

export interface ListAppointmentsParams {
  status?: AppointmentStatus | 'all'
  patientId?: string
  search?: string
  limit?: number
}

function client() {
  return createClient()
}

export async function listAppointments(
  params: ListAppointmentsParams = {}
): Promise<Appointment[]> {
  const { status = 'all', patientId, search, limit = 200 } = params
  let q = client()
    .from('appointments')
    .select('*')
    .order('scheduled_at', { ascending: false })
    .limit(limit)

  if (status !== 'all') q = q.eq('status', status)
  if (patientId) q = q.eq('patient_id', patientId)
  if (search && search.trim()) {
    const s = search.trim().replace(/[,()]/g, ' ')
    q = q.or(
      `client_name.ilike.%${s}%,client_email.ilike.%${s}%,client_phone.ilike.%${s}%`
    )
  }

  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as Appointment[]
}

export async function listAppointmentsForPatient(
  patientId: string
): Promise<Appointment[]> {
  return listAppointments({ patientId })
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus
): Promise<Appointment> {
  const { data, error } = await client()
    .from('appointments')
    .update({ status })
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return data as Appointment
}

/** Manually link (or unlink) an appointment to a patient chart. */
export async function setAppointmentPatient(
  appointmentId: string,
  patientId: string | null
): Promise<Appointment> {
  const { data, error } = await client()
    .from('appointments')
    .update({ patient_id: patientId })
    .eq('id', appointmentId)
    .select('*')
    .single()
  if (error) throw error
  return data as Appointment
}
