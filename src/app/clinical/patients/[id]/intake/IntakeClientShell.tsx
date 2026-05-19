'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ClipboardList } from 'lucide-react'
import IntakeStepper from '@/components/clinical/IntakeStepper'
import type { PatientIntake } from '@/lib/clinical/intake'

interface Props {
  patientId: string
  initial: PatientIntake | null
  isFinalized: boolean
}

export default function IntakeClientShell({ patientId, initial, isFinalized }: Props) {
  const router = useRouter()
  const [finalized, setFinalized] = useState(isFinalized)

  if (finalized) {
    return (
      <div className="bg-white rounded-xl border border-[#e8e4df] px-6 py-10 text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-[#d4e4e1] text-[#2d4a47] flex items-center justify-center mb-4">
          <ClipboardList size={20} />
        </div>
        <p
          className="text-base font-semibold text-[#1c1c1e]"
          style={{ fontFamily: 'var(--font-fraunces), serif' }}
        >
          Intake complete
        </p>
        <p className="text-sm text-[#6b7280] mt-1">
          This intake has been finalised. Edit by clicking "Edit intake" below.
        </p>
        <button
          onClick={() => setFinalized(false)}
          className="mt-5 inline-flex h-9 items-center gap-2 px-4 rounded-lg bg-[#354744] text-white text-xs font-medium hover:bg-[#1a2f2d] transition"
        >
          Edit intake
        </button>
      </div>
    )
  }

  return (
    <IntakeStepper
      patientId={patientId}
      initial={initial}
      onFinalized={() => {
        setFinalized(true)
        router.refresh()
      }}
    />
  )
}
