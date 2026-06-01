'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ClipboardList, CheckCircle } from 'lucide-react'
import IntakeStepper from '@/components/clinical/IntakeStepper'
import DeleteIntakeButton from '@/components/clinical/DeleteIntakeButton'
import {
  getOrCreateDraftIntake,
  type PatientIntake,
} from '@/lib/clinical/intake'

interface Props {
  patientId: string
}

export default function IntakeClientShell({ patientId }: Props) {
  const router = useRouter()
  const [draft, setDraft] = useState<PatientIntake | null>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [finalized, setFinalized] = useState(false)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setErr(null)
    getOrCreateDraftIntake(patientId, { prefillFromLatest: true })
      .then((d) => {
        if (alive) setDraft(d)
      })
      .catch((e: unknown) => {
        if (alive) setErr(e instanceof Error ? e.message : 'Failed to load intake')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [patientId])

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#e8e4df] px-6 py-16 flex justify-center">
        <div className="animate-spin w-6 h-6 rounded-full border-2 border-[#a3b8b4] border-t-transparent" />
      </div>
    )
  }

  if (err) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {err}
      </div>
    )
  }

  if (!draft) return null

  if (finalized) {
    return (
      <div className="bg-white rounded-xl border border-[#e8e4df] px-6 py-12 text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-[#d4e4e1] text-[#2d4a47] flex items-center justify-center mb-4">
          <CheckCircle size={20} />
        </div>
        <p
          className="text-base font-semibold text-[#1c1c1e]"
          style={{ fontFamily: 'var(--font-fraunces), serif' }}
        >
          Intake v{draft.version} finalised
        </p>
        <p className="text-sm text-[#6b7280] mt-1 max-w-md mx-auto">
          The intake is filed under this patient's history. The next time you click
          &ldquo;Add intake&rdquo; a new version will start, prefilled from this one.
        </p>
        <div className="mt-5 flex items-center justify-center gap-3">
          <Link
            href={`/clinical/patients/${patientId}/intake`}
            className="h-9 px-4 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Back to intake list
          </Link>
          <Link
            href={`/clinical/patients/${patientId}`}
            className="h-9 px-4 py-2 rounded-lg bg-[#354744] text-white text-xs font-medium hover:bg-[#1a2f2d]  transition"
          >
            Open patient chart
          </Link>
        </div>
      </div>
    )
  }

  const isFirst = draft.version === 1

  return (
    <div className="space-y-4">
      <Link
        href={`/clinical/patients/${patientId}/intake`}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6b7280] hover:text-[#1c1c1e] transition"
      >
        <ArrowLeft size={14} /> Intake list
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2
            className="text-xl font-semibold text-[#1c1c1e]"
            style={{ fontFamily: 'var(--font-fraunces), serif' }}
          >
            <ClipboardList size={18} className="inline mr-2 -mt-0.5" />
            Intake v{draft.version}
          </h2>
          <p className="text-sm text-[#6b7280] mt-1">
            {isFirst
              ? 'Capture this patient’s first clinical intake.'
              : 'Prefilled from the previous intake. Update any fields that have changed before finalising.'}
          </p>
        </div>
        <DeleteIntakeButton
          intakeId={draft.id}
          patientId={patientId}
          label="Discard draft"
        />
      </div>

      <IntakeStepper
        intake={draft}
        onFinalized={() => {
          setFinalized(true)
          router.refresh()
        }}
      />
    </div>
  )
}
