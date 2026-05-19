'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Trash2, ExternalLink, AlertCircle } from 'lucide-react'
import {
  listPatientDiagnoses,
  deleteDiagnosis,
  type PatientDiagnosisWithDisorder,
  type DiagnosisStatus,
} from '@/lib/clinical/diagnosis'

const STATUS_STYLES: Record<DiagnosisStatus, string> = {
  provisional: 'bg-amber-50 text-amber-700 border-amber-200',
  working: 'bg-blue-50 text-blue-700 border-blue-200',
  confirmed: 'bg-[#d4e4e1] text-[#2d4a47] border-[#b8ceca]',
  ruled_out: 'bg-gray-50 text-gray-500 border-gray-200 line-through',
}

export default function DiagnosisPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [patientId, setPatientId] = useState<string | null>(null)
  const [diagnoses, setDiagnoses] = useState<PatientDiagnosisWithDisorder[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    params.then(({ id }) => {
      setPatientId(id)
      listPatientDiagnoses(id)
        .then(setDiagnoses)
        .catch((e) => setErr(e.message))
        .finally(() => setLoading(false))
    })
  }, [params])

  async function handleDelete(diagId: string) {
    if (!confirm('Remove this diagnosis?')) return
    try {
      await deleteDiagnosis(diagId)
      setDiagnoses((d) => d.filter((x) => x.id !== diagId))
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  if (loading) return <Spinner />
  if (err) return <ErrorBanner msg={err} />
  if (!patientId) return null

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <div className="flex items-start gap-3 rounded-lg border border-[#e8e4df] bg-[#fdf8f6] px-4 py-3">
        <AlertCircle size={15} className="text-[#6b7280] mt-0.5 shrink-0" />
        <p className="text-xs text-[#6b7280]">
          DSM-5 criteria summaries are paraphrased for clinical reference only — not reproduced from APA source material.
          Refer to your licensed DSM-5 copy for authoritative diagnostic criteria.
          This tool does not replace clinical judgement.
        </p>
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
            Active diagnoses
          </h2>
          <Link
            href={`/clinical/patients/${patientId}/diagnosis/new`}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#354744] text-white text-xs font-medium hover:bg-[#1a2f2d] transition"
          >
            <Plus size={13} /> Add diagnosis
          </Link>
        </div>

        {diagnoses.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#e8e4df] px-6 py-12 text-center">
            <p className="text-sm font-medium text-[#6b7280]">No diagnoses recorded</p>
            <p className="text-xs text-[#6b7280] mt-1">Use "Add diagnosis" to record a provisional or working diagnosis.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {diagnoses.map((d) => (
              <li key={d.id} className="bg-white rounded-xl border border-[#e8e4df] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono text-[#6b7280]">{d.disorder.code}</span>
                      <h3 className="text-sm font-semibold text-[#1c1c1e]">{d.disorder.name}</h3>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wide ${STATUS_STYLES[d.status]}`}
                      >
                        {d.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#6b7280] mt-0.5">{d.disorder.category}</p>
                    {d.onset_date && (
                      <p className="text-xs text-[#9ca3af] mt-1">Onset: {d.onset_date}</p>
                    )}
                    {d.notes && (
                      <p className="text-xs text-[#6b7280] mt-2 line-clamp-2">{d.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/clinical/patients/${patientId}/diagnosis/${d.id}`}
                      className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#2d4a47] hover:border-[#b8ceca] transition"
                      title="Edit"
                    >
                      <ExternalLink size={13} />
                    </Link>
                    <button
                      onClick={() => handleDelete(d.id)}
                      className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-600 hover:border-red-200 transition"
                      title="Remove"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function Spinner() {
  return (
    <div className="bg-white rounded-xl border border-[#e8e4df] px-6 py-16 flex justify-center">
      <div className="animate-spin w-6 h-6 rounded-full border-2 border-[#a3b8b4] border-t-transparent" />
    </div>
  )
}

function ErrorBanner({ msg }: { msg: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {msg}
    </div>
  )
}
