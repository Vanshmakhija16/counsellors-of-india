'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check } from 'lucide-react'
import Link from 'next/link'
import {
  listDsmDisorders,
  listDsmCriteria,
  createDiagnosis,
  meetsCriteria,
  type DsmDisorder,
  type DsmCriterion,
  type DiagnosisStatus,
} from '@/lib/clinical/diagnosis'
import { diagnosisCreateSchema } from '@/lib/clinical/diagnosis'

const STATUSES: DiagnosisStatus[] = ['provisional', 'working', 'confirmed', 'ruled_out']

export default function NewDiagnosisPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const [patientId, setPatientId] = useState<string | null>(null)
  const [disorders, setDisorders] = useState<DsmDisorder[]>([])
  const [criteria, setCriteria] = useState<DsmCriterion[]>([])
  const [search, setSearch] = useState('')

  const [selectedDisorderId, setSelectedDisorderId] = useState('')
  const [status, setStatus] = useState<DiagnosisStatus>('provisional')
  const [metCriteriaIds, setMetCriteriaIds] = useState<string[]>([])
  const [onsetDate, setOnsetDate] = useState('')
  const [notes, setNotes] = useState('')

  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    params.then(({ id }) => {
      setPatientId(id)
    })
    listDsmDisorders().then(setDisorders).catch(console.error)
  }, [params])

  useEffect(() => {
    if (!selectedDisorderId) { setCriteria([]); setMetCriteriaIds([]); return }
    listDsmCriteria(selectedDisorderId).then(setCriteria).catch(console.error)
    setMetCriteriaIds([])
  }, [selectedDisorderId])

  const filteredDisorders = disorders.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.code.toLowerCase().includes(search.toLowerCase()) ||
      d.category.toLowerCase().includes(search.toLowerCase())
  )

  const selectedDisorder = disorders.find((d) => d.id === selectedDisorderId)
  const { groups, allPass } = meetsCriteria(metCriteriaIds, criteria)

  function toggleCriterion(id: string) {
    setMetCriteriaIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  async function handleSave() {
    if (!patientId || !selectedDisorderId) return
    setSaving(true)
    setSubmitError(null)
    try {
      const parsed = diagnosisCreateSchema.parse({
        disorder_id: selectedDisorderId,
        status,
        met_criteria_ids: metCriteriaIds,
        onset_date: onsetDate || null,
        notes: notes || null,
      })
      await createDiagnosis(patientId, parsed)
      router.push(`/clinical/patients/${patientId}/diagnosis`)
      router.refresh()
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (!patientId) return null

  return (
    <div className="space-y-6">
      <Link
        href={`/clinical/patients/${patientId}/diagnosis`}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6b7280] hover:text-[#1c1c1e] transition"
      >
        <ArrowLeft size={13} /> Back to diagnoses
      </Link>

      <h2
        className="text-lg font-semibold text-[#1c1c1e]"
        style={{ fontFamily: 'var(--font-fraunces), serif' }}
      >
        Add diagnosis
      </h2>

      <div className="grid lg:grid-cols-[300px_1fr] gap-6">
        {/* Disorder picker */}
        <div className="bg-white rounded-xl border border-[#e8e4df] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#e8e4df]">
            <input
              type="text"
              placeholder="Search disorders…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a3b8b4] focus:border-transparent"
            />
          </div>
          <ul className="overflow-y-auto max-h-[400px] divide-y divide-[#f0ebe6]">
            {filteredDisorders.map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => setSelectedDisorderId(d.id)}
                  className={`w-full text-left px-4 py-3 transition hover:bg-stone-50 ${
                    selectedDisorderId === d.id ? 'bg-[#d4e4e1]' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-mono text-[#9ca3af]">{d.code}</p>
                      <p className="text-sm font-medium text-[#1c1c1e] mt-0.5">{d.name}</p>
                      <p className="text-[11px] text-[#6b7280] mt-0.5">{d.category}</p>
                    </div>
                    {selectedDisorderId === d.id && (
                      <Check size={14} className="text-[#2d4a47] mt-1 shrink-0" />
                    )}
                  </div>
                </button>
              </li>
            ))}
            {filteredDisorders.length === 0 && (
              <li className="px-4 py-8 text-center text-sm text-[#9ca3af]">No results</li>
            )}
          </ul>
        </div>

        {/* Details panel */}
        <div className="space-y-5">
          {!selectedDisorder ? (
            <div className="bg-white rounded-xl border border-[#e8e4df] px-6 py-16 text-center">
              <p className="text-sm text-[#6b7280]">Select a disorder on the left to continue</p>
            </div>
          ) : (
            <>
              {/* Disorder info */}
              <div className="bg-white rounded-xl border border-[#e8e4df] p-5">
                <p className="text-xs font-mono text-[#9ca3af] mb-1">{selectedDisorder.code}</p>
                <h3
                  className="text-base font-semibold text-[#1c1c1e]"
                  style={{ fontFamily: 'var(--font-fraunces), serif' }}
                >
                  {selectedDisorder.name}
                </h3>
                {selectedDisorder.criteria_summary && (
                  <p className="text-xs text-[#6b7280] mt-2 leading-relaxed">
                    {selectedDisorder.criteria_summary}
                  </p>
                )}
              </div>

              {/* Criteria checklist */}
              {criteria.length > 0 && (
                <div className="bg-white rounded-xl border border-[#e8e4df] overflow-hidden">
                  <div className="px-5 py-3 border-b border-[#e8e4df]">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
                      Criteria — {allPass ? '✓ Met' : 'Not met'}
                    </p>
                  </div>
                  {groups.map((g) => (
                    <div key={g.group} className="border-b border-[#f0ebe6] last:border-0">
                      <div className="px-5 py-2 bg-[#fdf8f6] flex items-center justify-between">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6b7280]">
                          Group {g.group}
                        </p>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            g.pass
                              ? 'bg-[#d4e4e1] text-[#2d4a47]'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {g.met}/{g.required} required
                        </span>
                      </div>
                      <ul className="divide-y divide-[#f0ebe6]">
                        {criteria
                          .filter((c) => c.group === g.group)
                          .map((c) => {
                            const checked = metCriteriaIds.includes(c.id)
                            return (
                              <li key={c.id}>
                                <label className="flex items-start gap-3 px-5 py-3 cursor-pointer hover:bg-stone-50 transition">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleCriterion(c.id)}
                                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#354744] focus:ring-[#a3b8b4]"
                                  />
                                  <span className="text-sm text-gray-700">{c.label}</span>
                                </label>
                              </li>
                            )
                          })}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Status + details */}
              <div className="bg-white rounded-xl border border-[#e8e4df] p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Status</label>
                  <div className="flex flex-wrap gap-2">
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatus(s)}
                        className={`h-8 px-3 rounded-lg text-xs font-semibold border transition capitalize ${
                          status === s
                            ? 'bg-[#354744] text-white border-[#354744]'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-[#354744]'
                        }`}
                      >
                        {s.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">
                    Onset date <span className="text-[10px] text-[#9ca3af] font-normal">(optional)</span>
                  </label>
                  <input
                    type="date"
                    value={onsetDate}
                    onChange={(e) => setOnsetDate(e.target.value)}
                    className="h-11 px-4 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#a3b8b4]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">
                    Clinical notes <span className="text-[10px] text-[#9ca3af] font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Differential reasoning, specifiers, rule-outs…"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a3b8b4] focus:border-transparent resize-y"
                  />
                </div>
              </div>

              {submitError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {submitError}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Link
                  href={`/clinical/patients/${patientId}/diagnosis`}
                  className="inline-flex h-10 items-center px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </Link>
                <button
                  type="button"
                  disabled={saving || !selectedDisorderId}
                  onClick={handleSave}
                  className="inline-flex h-10 items-center px-5 rounded-lg bg-[#354744] text-white text-sm font-medium hover:bg-[#1a2f2d] disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  {saving ? 'Saving…' : 'Save diagnosis'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
