'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Trash2 } from 'lucide-react'
import PatientForm from '@/components/clinical/PatientForm'
import {
  getPatient,
  updatePatient,
  deletePatient,
  type Patient,
  type PatientCreateData,
} from '@/lib/clinical/patients'

export default function EditPatientPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadErr, setLoadErr] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    let alive = true
    getPatient(id)
      .then((p) => {
        if (!alive) return
        if (!p) setLoadErr('Patient not found')
        else setPatient(p)
      })
      .catch((e) => {
        if (alive) setLoadErr(e.message ?? 'Failed to load patient')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [id])

  async function handleSubmit(data: PatientCreateData) {
    const updated = await updatePatient(id, data)
    setPatient(updated)
    setSaved(true)
    setTimeout(() => {
      router.push(`/clinical/patients/${id}`)
      router.refresh()
    }, 900)
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deletePatient(id)
      router.push('/clinical/patients')
      router.refresh()
    } catch (e) {
      console.error('[delete patient]', e)
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#e8e4df] px-6 py-16 flex justify-center">
        <div className="animate-spin w-6 h-6 rounded-full border-2 border-[#a3b8b4] border-t-transparent" />
      </div>
    )
  }

  if (loadErr || !patient) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {loadErr ?? 'Patient not found'}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2
          className="text-xl font-semibold text-[#1c1c1e]"
          style={{ fontFamily: 'var(--font-fraunces), serif' }}
        >
          Edit details
        </h2>
        <p className="text-sm text-[#6b7280] mt-1">
          Update identity, contact, emergency, and status fields.
        </p>
      </div>

      {saved && (
        <div className="mb-6 rounded-lg border border-[#b8ceca] bg-[#d4e4e1] px-4 py-3 flex items-center gap-3 text-sm text-[#2d4a47]">
          <CheckCircle size={18} className="shrink-0" />
          <span>Changes saved.</span>
        </div>
      )}

      <PatientForm
        initial={patient}
        submitLabel="Save changes"
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/clinical/patients/${id}`)}
      />

      <div className="mt-10 pt-6 border-t border-[#e8e4df]">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-red-700 mb-3">
          Danger zone
        </h2>
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-red-800">Delete this patient</p>
            <p className="text-xs text-red-700 mt-1 max-w-md">
              Permanently removes the patient and all linked intake, screening, diagnosis,
              and resource records. This cannot be undone.
            </p>
          </div>
          {confirmDelete ? (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="h-9 px-3 rounded-lg border border-gray-300 text-xs font-medium text-gray-700 hover:bg-white transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition disabled:opacity-50"
              >
                <Trash2 size={12} />
                {deleting ? 'Deleting…' : 'Yes, delete'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="shrink-0 inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-red-300 bg-white text-red-700 text-xs font-medium hover:bg-red-100 transition"
            >
              <Trash2 size={12} />
              Delete patient
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
