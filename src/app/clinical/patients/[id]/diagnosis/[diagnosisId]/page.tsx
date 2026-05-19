'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import {
  listDsmCriteria,
  updateDiagnosis,
  meetsCriteria,
  type PatientDiagnosisWithDisorder,
  type DsmCriterion,
  type DiagnosisStatus,
} from '@/lib/clinical/diagnosis'
import { createClient } from '@/lib/supabase'

const STATUSES: DiagnosisStatus[] = ['provisional', 'working', 'confirmed', 'ruled_out']

export default function EditDiagnosisPage({
  params,
}: {
  params: Promise<{ id: string; diagnosisId: string }>
}) {
  const router = useRouter()
  const [patientId, setPatientId] = useState<string | null>(null)
  const [diagnosisId, setDiagnosisId] = useState<string | null>(null)
  const [diagnosis, setDiagnosis] = useState<PatientDiagnosisWithDisorder | null>(null)
  const [criteria, setCriteria] = useState<DsmCriterion[]>([])
  const [loading, setLoading] = useState(true)

  const [status, setStatus] = useState<DiagnosisStatus>('provisional')
  const [metCriteriaIds, setMetCriteriaIds] = useState<string[]>([])
  const [onsetDate, setOnsetDate] = useState('')
  const [notes, setNotes] = useState('')

  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const { id, diagnosisId: dId } = await params
        if (!alive) return
        setPatientId(id)
        setDiagnosisId(dId)

        const supabase = createClient()
        const { data, error } = await supabase
          .from('patient_diagnoses')
          .select('*, disorder:dsm_disorders(id, code, name, category, criteria_summary)')
          .eq('id', dId)
          .maybeSingle()
        if (!alive) return
        if (error || !data) return

        const row = data as any
        const d: PatientDiagnosisWithDisorder = {
          ...row,
          disorder: Array.isArray(row.disorder) ? row.disorder[0] : row.disorder,
        }
        setDiagnosis(d)
        setStatus(d.status)
        setMetCriteriaIds(d.met_criteria_ids ?? [])
        setOnsetDate(d.onset_date ?? '')
        setNotes(d.notes ?? '')

        const c = await listDsmCriteria(d.disorder_id)
        if (!alive) return
        setCriteria(c)
      } catch (e) {
        console.error(e)
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [params])

  const { groups } = meetsCriteria(metCriteriaIds, criteria)

  function toggleCriterion(id: string) {
    setMetCriteriaIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  async function handleSave() {
    if (!diagnosisId || !patientId) return
    setSaving(true)
    setSubmitError(null)
    try {
      await updateDiagnosis(diagnosisId, {
        status,
        met_criteria_ids: metCriteriaIds,
        onset_date: onsetDate || null,
        notes: notes || null,
      })
      router.push(`/clinical/patients/${patientId}/diagnosis`)
      router.refresh()
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading)
    return (
      <div className="bg-white rounded-xl border border-[#e8e4df] px-6 py-16 flex justify-center">
        <div className="animate-spin w-6 h-6 rounded-full border-2 border-[#a3b8b4] border-t-transparent" />
      </div>
    )
  if (!diagnosis || !patientId) return <p className="text-sm text-red-600">Diagnosis not found.</p>

  return (
    <div className="space-y-6">
      <Link
        href={`/clinical/patients/${patientId}/diagnosis`}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6b7280] hover:text-[#1c1c1e] transition"
      >
        <ArrowLeft size={13} /> Back to diagnoses
      </Link>

      <div>
        <p className="text-xs font-mono text-[#9ca3af]">{diagnosis.disorder.code}</p>
        <h2
          className="text-lg font-semibold text-[#1c1c1e] mt-0.5"
          style={{ fontFamily: 'var(--font-fraunces), serif' }}
        >
          {diagnosis.disorder.name}
        </h2>
      </div>

      {criteria.length > 0 && (
        <div className="bg-white rounded-xl border border-[#e8e4df] overflow-hidden">
          <div className="px-5 py-3 border-b border-[#e8e4df]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280]">Criteria</p>
          </div>
          {groups.map((g) => (
            <div key={g.group} className="border-b border-[#f0ebe6] last:border-0">
              <div className="px-5 py-2 bg-[#fdf8f6] flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6b7280]">Group {g.group}</p>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${g.pass ? 'bg-[#d4e4e1] text-[#2d4a47]' : 'bg-gray-100 text-gray-500'}`}>
                  {g.met}/{g.required}
                </span>
              </div>
              <ul className="divide-y divide-[#f0ebe6]">
                {criteria.filter((c) => c.group === g.group).map((c) => (
                  <li key={c.id}>
                    <label className="flex items-start gap-3 px-5 py-3 cursor-pointer hover:bg-stone-50 transition">
                      <input
                        type="checkbox"
                        checked={metCriteriaIds.includes(c.id)}
                        onChange={() => toggleCriterion(c.id)}
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#354744] focus:ring-[#a3b8b4]"
                      />
                      <span className="text-sm text-gray-700">{c.label}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#e8e4df] p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Status</label>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <button key={s} type="button" onClick={() => setStatus(s)}
                className={`h-8 px-3 rounded-lg text-xs font-semibold border transition capitalize ${status === s ? 'bg-[#354744] text-white border-[#354744]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#354744]'}`}>
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">Onset date</label>
          <input type="date" value={onsetDate} onChange={(e) => setOnsetDate(e.target.value)}
            className="h-11 px-4 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#a3b8b4]" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a3b8b4] resize-y" />
        </div>
      </div>

      {submitError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</div>
      )}

      <div className="flex justify-end gap-3">
        <Link href={`/clinical/patients/${patientId}/diagnosis`}
          className="inline-flex h-10 items-center px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
          Cancel
        </Link>
        <button type="button" disabled={saving} onClick={handleSave}
          className="inline-flex h-10 items-center px-5 rounded-lg bg-[#354744] text-white text-sm font-medium hover:bg-[#1a2f2d] disabled:opacity-40 transition">
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}
