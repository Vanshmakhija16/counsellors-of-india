'use client'

import { use, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, AlertTriangle, CheckCircle } from 'lucide-react'
import {
  getInstrumentBySlug,
  createSession,
  severityFor,
  type InstrumentWithItems,
} from '@/lib/clinical/screening'

export default function NewScreeningPage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>
}) {
  const { id: patientId, slug } = use(params)
  const router = useRouter()

  const [instrument, setInstrument] = useState<InstrumentWithItems | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadErr, setLoadErr] = useState<string | null>(null)

  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitErr, setSubmitErr] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    setLoading(true)
    getInstrumentBySlug(slug)
      .then((inst) => {
        if (!alive) return
        if (!inst) setLoadErr(`Instrument "${slug}" not found`)
        else setInstrument(inst)
      })
      .catch((e) => {
        if (alive) setLoadErr(e.message ?? 'Failed to load instrument')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [slug])

  const totalItems = instrument?.items.length ?? 0
  const answered = Object.keys(answers).length
  const progress = totalItems === 0 ? 0 : Math.round((answered / totalItems) * 100)

  const previewScore = useMemo(() => {
    if (!instrument) return null
    if (answered === 0) return null
    let total = 0
    for (const item of instrument.items) {
      total += answers[item.id] ?? 0
    }
    const sev = severityFor(total, instrument.severity_bands)
    return { total, severity: sev }
  }, [answers, instrument, answered])

  async function handleSubmit() {
    if (!instrument) return
    setSubmitErr(null)
    const missing = instrument.items.filter((i) => answers[i.id] === undefined)
    if (missing.length > 0) {
      setSubmitErr(`Please answer all items — ${missing.length} remaining`)
      return
    }
    setSubmitting(true)
    try {
      const sess = await createSession({
        patient_id: patientId,
        instrument_slug: slug,
        responses: instrument.items.map((i) => ({
          item_id: i.id,
          value: answers[i.id],
        })),
        notes: notes.trim() || null,
      })
      router.push(`/clinical/patients/${patientId}/screening/${sess.id}`)
      router.refresh()
    } catch (e: unknown) {
      console.error('[Screening] submit failed:', e)
      setSubmitErr(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#e8e4df] px-6 py-16 flex justify-center">
        <div className="animate-spin w-6 h-6 rounded-full border-2 border-[#a3b8b4] border-t-transparent" />
      </div>
    )
  }

  if (loadErr || !instrument) {
    return (
      <div className="space-y-4">
        <Link
          href={`/clinical/patients/${patientId}/screening`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6b7280] hover:text-[#1c1c1e]"
        >
          <ArrowLeft size={14} /> Back to screening
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadErr ?? 'Instrument not found'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/clinical/patients/${patientId}/screening`}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6b7280] hover:text-[#1c1c1e]"
      >
        <ArrowLeft size={14} /> Back to screening
      </Link>

      <header className="bg-white rounded-xl border border-[#e8e4df] p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1
              className="text-2xl font-semibold text-[#1c1c1e]"
              style={{ fontFamily: 'var(--font-fraunces), serif' }}
            >
              {instrument.short_name}
            </h1>
            <p className="text-sm text-[#6b7280] mt-1">{instrument.name}</p>
            {instrument.recall_window && (
              <p className="text-xs text-[#6b7280] mt-2 italic">{instrument.recall_window}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-[#9ca3af]">Progress</p>
            <p className="text-base font-semibold text-[#1c1c1e]">
              {answered} / {totalItems}
            </p>
          </div>
        </div>
        <div className="mt-4 h-1.5 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#2d4a47] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <ol className="space-y-3">
        {instrument.items.map((item) => (
          <li
            key={item.id}
            className={`bg-white rounded-xl border p-5 ${
              item.is_critical ? 'border-amber-300' : 'border-[#e8e4df]'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-xs font-semibold text-[#9ca3af] w-6 pt-0.5">
                {String(item.position).padStart(2, '0')}
              </span>
              <div className="flex-1">
                <p className="text-sm text-[#1c1c1e] leading-relaxed">
                  {item.prompt}
                  {item.is_critical && (
                    <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                      <AlertTriangle size={11} /> Critical
                    </span>
                  )}
                </p>

                <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                  {instrument.options.map((opt) => {
                    const checked = answers[item.id] === opt.value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          setAnswers((prev) => ({ ...prev, [item.id]: opt.value }))
                        }
                        className={`text-left px-3 py-2 rounded-lg border text-xs transition ${
                          checked
                            ? 'border-[#2d4a47] bg-[#d4e4e1] text-[#2d4a47] font-semibold'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-[#b8ceca] hover:bg-stone-50'
                        }`}
                      >
                        <span className="block text-[10px] uppercase tracking-wide opacity-70">
                          {opt.value}
                        </span>
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <div className="bg-white rounded-xl border border-[#e8e4df] p-5">
        <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280] mb-2">
          Clinical notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Observed presentation, context, or comments to file with this administration."
          className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a3b8b4] focus:border-transparent"
        />
      </div>

      <div className="sticky bottom-4 z-10">
        <div className="bg-white rounded-xl border border-[#e8e4df] p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm">
            {previewScore ? (
              <span className="inline-flex items-center gap-2">
                <CheckCircle size={14} className="text-[#2d4a47]" />
                Running score: <strong>{previewScore.total}</strong>
                <span className="text-[#6b7280]">·</span>
                <span className="text-[#6b7280]">{previewScore.severity}</span>
              </span>
            ) : (
              <span className="text-[#6b7280]">Score will appear as you answer.</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {submitErr && (
              <span className="text-xs text-red-600 max-w-[260px] truncate">{submitErr}</span>
            )}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || answered < totalItems}
              className="h-11 px-5 rounded-lg bg-[#354744] text-white text-sm font-medium hover:bg-[#1a2f2d] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving…' : 'Save screening'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
