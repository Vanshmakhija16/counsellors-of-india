'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteIntake } from '@/lib/clinical/intake'

interface Props {
  intakeId: string
  patientId: string
  /** Label override — defaults to "Delete intake". */
  label?: string
  /** Visual style. "subtle" matches the chart header pills. */
  variant?: 'subtle' | 'danger'
}

export default function DeleteIntakeButton({
  intakeId,
  patientId,
  label = 'Delete intake',
  variant = 'subtle',
}: Props) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function handleDelete() {
    setDeleting(true)
    setErr(null)
    try {
      await deleteIntake(intakeId)
      router.push(`/clinical/patients/${patientId}/intake`)
      router.refresh()
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Delete failed')
      setDeleting(false)
      setConfirming(false)
    }
  }

  if (!confirming) {
    const base = 'inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium transition'
    const style =
      variant === 'danger'
        ? 'bg-red-600 text-white hover:bg-red-700'
        : 'border border-gray-200 text-gray-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50'
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className={`${base} ${style}`}
      >
        <Trash2 size={12} />
        {label}
      </button>
    )
  }

  return (
    <span className="inline-flex items-center gap-2">
      <span className="text-xs text-red-700">Delete this intake?</span>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        disabled={deleting}
        className="h-8 px-3 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition disabled:opacity-50"
      >
        {deleting ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
        Yes, delete
      </button>
      {err && <span className="text-xs text-red-600 ml-2">{err}</span>}
    </span>
  )
}
