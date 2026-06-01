import { createClient } from '@/lib/supabase'

export interface SessionNote {
  id: string
  therapist_id: string
  patient_id: string
  appointment_id: string | null
  content: string
  created_at: string
  updated_at: string
}

export interface SessionNoteWithRefs extends SessionNote {
  patient?: { id: string; first_name: string; last_name: string } | null
  appointment?: { id: string; scheduled_at: string } | null
}

function client() {
  return createClient()
}

export async function listNotesForPatient(patientId: string): Promise<SessionNote[]> {
  const { data, error } = await client()
    .from('session_notes')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as SessionNote[]
}

export async function listNotesForAppointment(appointmentId: string): Promise<SessionNote[]> {
  const { data, error } = await client()
    .from('session_notes')
    .select('*')
    .eq('appointment_id', appointmentId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as SessionNote[]
}

export async function listAllNotes(params: { search?: string } = {}): Promise<
  SessionNoteWithRefs[]
> {
  const { search } = params
  let q = client()
    .from('session_notes')
    .select(
      'id, therapist_id, patient_id, appointment_id, content, created_at, updated_at, patient:patients(id, first_name, last_name), appointment:appointments(id, scheduled_at)'
    )
    .order('created_at', { ascending: false })
    .limit(200)

  if (search && search.trim()) {
    const s = search.trim().replace(/[,()]/g, ' ')
    q = q.ilike('content', `%${s}%`)
  }

  const { data, error } = await q
  if (error) throw error
  return (data ?? []).map((row: any) => ({
    ...row,
    patient: Array.isArray(row.patient) ? row.patient[0] : row.patient,
    appointment: Array.isArray(row.appointment) ? row.appointment[0] : row.appointment,
  })) as SessionNoteWithRefs[]
}

export interface CreateNoteInput {
  patient_id: string
  appointment_id?: string | null
  content: string
}

export async function createNote(input: CreateNoteInput): Promise<SessionNote> {
  const supabase = client()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('session_notes')
    .insert({
      therapist_id: session.user.id,
      patient_id: input.patient_id,
      appointment_id: input.appointment_id ?? null,
      content: input.content,
    })
    .select('*')
    .single()
  if (error) throw error
  return data as SessionNote
}

export async function updateNote(id: string, content: string): Promise<SessionNote> {
  const { data, error } = await client()
    .from('session_notes')
    .update({ content })
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return data as SessionNote
}

export async function deleteNote(id: string): Promise<void> {
  const { error } = await client().from('session_notes').delete().eq('id', id)
  if (error) throw error
}
