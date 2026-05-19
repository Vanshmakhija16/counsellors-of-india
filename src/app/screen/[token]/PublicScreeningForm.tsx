'use client'

import { useState } from 'react'
import type { InstrumentWithItems, InstrumentOption } from '@/lib/clinical/screening'

interface Props {
  token: string
  instrument: InstrumentWithItems
}

export default function PublicScreeningForm({ token, instrument }: Props) {
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const total = instrument.items.length
  const answered = Object.keys(answers).length
  const allAnswered = answered === total

  async function handleSubmit() {
    if (!allAnswered) return
    setSubmitting(true)
    setError(null)
    try {
      const responses = instrument.items.map((item) => ({
        item_id: item.id,
        value: answers[item.id],
      }))
      const res = await fetch('/api/screening/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, responses, notes: notes.trim() || null }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error ?? 'Submission failed')
      setDone(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="bg-white rounded-2xl border border-[#e8e4df] p-10 text-center shadow-sm">
        <div className="w-14 h-14 mx-auto rounded-full bg-[#d4e4e1] text-[#2d4a47] flex items-center justify-center mb-5">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-[#1c1c1e]" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
          Thank you!
        </h2>
        <p className="text-sm text-[#6b7280] mt-2">
          Your responses have been submitted. Your therapist will review them before your next session.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {instrument.recall_window && (
        <div className="bg-[#d4e4e1]/40 rounded-lg px-4 py-3 text-sm text-[#2d4a47] font-medium text-center">
          {instrument.recall_window}
        </div>
      )}

      {/* Progress bar */}
      <div className="bg-white rounded-full h-1.5 border border-[#e8e4df] overflow-hidden">
        <div
          className="h-full bg-[#354744] transition-all duration-300"
          style={{ width: `${(answered / total) * 100}%` }}
        />
      </div>
      <p className="text-xs text-right text-[#9ca3af]">{answered}/{total} answered</p>

      {instrument.items.map((item, i) => (
        <ItemCard
          key={item.id}
          index={i + 1}
          prompt={item.prompt}
          options={instrument.options}
          value={answers[item.id]}
          onChange={(v) => setAnswers((a) => ({ ...a, [item.id]: v }))}
          isCritical={item.is_critical}
        />
      ))}

      <div className="bg-white rounded-xl border border-[#e8e4df] p-5">
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Additional notes <span className="text-[10px] text-[#9ca3af] font-normal uppercase tracking-wide">(optional)</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anything else you'd like your therapist to know…"
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a3b8b4] focus:border-transparent resize-none"
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 text-center">
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!allAnswered || submitting}
        className="w-full h-12 rounded-xl bg-[#354744] text-white text-sm font-semibold hover:bg-[#1a2f2d] disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        {submitting ? 'Submitting…' : 'Submit responses'}
      </button>
    </div>
  )
}

function ItemCard({
  index,
  prompt,
  options,
  value,
  onChange,
  isCritical,
}: {
  index: number
  prompt: string
  options: InstrumentOption[]
  value: number | undefined
  onChange: (v: number) => void
  isCritical: boolean
}) {
  return (
    <div
      className={`bg-white rounded-xl border p-5 ${
        isCritical ? 'border-amber-200' : 'border-[#e8e4df]'
      }`}
    >
      <p className="text-sm font-medium text-[#1c1c1e] mb-4">
        <span className="text-[#9ca3af] mr-2">{index}.</span>
        {prompt}
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`h-10 rounded-lg text-xs font-medium transition border ${
              value === opt.value
                ? 'bg-[#354744] text-white border-[#354744]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-[#354744] hover:text-[#354744]'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
