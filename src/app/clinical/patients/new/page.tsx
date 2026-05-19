'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import PatientForm from '@/components/clinical/PatientForm'
import { createPatient, formatPatientName, type Patient, type PatientCreateData } from '@/lib/clinical/patients'

export default function NewPatientPage() {
  const router = useRouter()
  const [saved, setSaved] = useState<Patient | null>(null)

  async function handleSubmit(data: PatientCreateData) {
    const patient = await createPatient(data)
    setSaved(patient)
    setTimeout(() => {
      router.push(`/clinical/patients/${patient.id}`)
      router.refresh()
    }, 1200)
  }

  return (
    <div className="p-8 max-w-3xl">
      <Link
        href="/clinical/patients"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6b7280] hover:text-[#1c1c1e] transition mb-4"
      >
        <ArrowLeft size={14} />
        Back to patients
      </Link>

      <div className="mb-8">
        <h1
          className="text-3xl font-semibold text-[#1c1c1e]"
          style={{ fontFamily: 'var(--font-fraunces), serif' }}
        >
          New patient
        </h1>
        <p className="text-[#6b7280] mt-1">
          Capture basic identity and contact details. You can complete intake and history next.
        </p>
      </div>

      {saved && (
        <div className="mb-6 rounded-lg border border-[#b8ceca] bg-[#d4e4e1] px-4 py-3 flex items-center gap-3 text-sm text-[#2d4a47]">
          <CheckCircle size={18} className="shrink-0" />
          <span>
            <strong>{formatPatientName(saved)}</strong> saved — opening their chart…
          </span>
        </div>
      )}

      <PatientForm
        submitLabel={saved ? 'Saved' : 'Create patient'}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/clinical/patients')}
      />
    </div>
  )
}
