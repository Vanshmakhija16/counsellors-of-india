import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import PatientHeader from '@/components/clinical/PatientHeader'
import JourneyStepper from '@/components/clinical/JourneyStepper'
import type { Patient } from '@/lib/clinical/patients'

export default async function PatientDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error || !data) notFound()
  const patient = data as Patient

  // Resolve completion flags for JourneyStepper
  const [intakeRow, diagnosesRow, sessionsRow] = await Promise.all([
    supabase
      .from('patient_intakes')
      .select('status')
      .eq('patient_id', id)
      .maybeSingle()
      .then((r) => r.data),
    supabase
      .from('patient_diagnoses')
      .select('id')
      .eq('patient_id', id)
      .limit(1)
      .then((r) => r.data),
    supabase
      .from('screening_sessions')
      .select('id')
      .eq('patient_id', id)
      .limit(1)
      .then((r) => r.data),
  ])

  const completed = {
    intake: (intakeRow as any)?.status === 'final',
    diagnosis: Array.isArray(diagnosesRow) && diagnosesRow.length > 0,
    screening: Array.isArray(sessionsRow) && sessionsRow.length > 0,
  }

  return (
    <div className="p-8 max-w-5xl">
      <Link
        href="/clinical/patients"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6b7280] hover:text-[#1c1c1e] transition mb-4"
      >
        <ArrowLeft size={14} />
        Back to patients
      </Link>

      <PatientHeader patient={patient} />

      <div className="mt-5">
        <JourneyStepper patientId={patient.id} completed={completed} />
      </div>

      <div className="mt-6">{children}</div>
    </div>
  )
}
