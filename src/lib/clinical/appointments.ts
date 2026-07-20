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

  if (status !== 'all') {
    q = q.eq('status', status)
  } else {
    // 'all' here means "every real booking", not literally every row in the
    // table — the paid-booking hold flow also writes pending_payment /
    // expired / payment_failed / cancelled rows for abandoned or incomplete
    // payment attempts. Those were never actual appointments and shouldn't
    // count toward (or appear in) the dashboard.
    q = q.not('status', 'in', '("pending_payment","expired","payment_failed","cancelled")')
  }
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

/** Permanently removes a booking. No status transition can bring it back. */
export async function deleteAppointment(id: string): Promise<void> {
  const { error } = await client()
    .from('appointments')
    .delete()
    .eq('id', id)
  if (error) throw error
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
