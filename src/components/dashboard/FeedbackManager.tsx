'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Star, Trash2, Plus, Loader2 } from 'lucide-react'

export interface Feedback {
  id: string
  therapist_id: string
  client_name: string
  client_role: string | null
  rating: number
  text: string
  is_published: boolean
  created_at: string
}

interface FeedbackManagerProps {
  therapistId: string
}

export default function FeedbackManager({ therapistId }: FeedbackManagerProps) {
  const supabase = createClient()
  const [items, setItems] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // new-row form state
  const [form, setForm] = useState({
    client_name: '',
    client_role: '',
    rating: 5,
    text: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)

  useEffect(() => {
    if (!therapistId) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('feedbacks')
        .select('*')
        .eq('therapist_id', therapistId)
        .order('created_at', { ascending: false })
      if (cancelled) return
      if (error) setError(error.message)
      else setItems(data ?? [])
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [therapistId, supabase])

  async function handleAdd() {
    setError('')
    if (!form.client_name.trim() || !form.text.trim()) {
      setError('Client name and feedback text are required.')
      return
    }
    setSubmitting(true)
    const { data, error } = await supabase
      .from('feedbacks')
      .insert({
        therapist_id: therapistId,
        client_name: form.client_name.trim(),
        client_role: form.client_role.trim() || null,
        rating: form.rating,
        text: form.text.trim(),
        is_published: true,
      })
      .select()
      .single()
    setSubmitting(false)
    if (error) {
      setError(error.message)
      return
    }
    setItems((prev) => [data as Feedback, ...prev])
    setForm({ client_name: '', client_role: '', rating: 5, text: '' })
  }

  async function handleDelete(id: string) {
    setRemovingId(id)
    const { error } = await supabase.from('feedbacks').delete().eq('id', id)
    setRemovingId(null)
    if (error) {
      setError(error.message)
      return
    }
    setItems((prev) => prev.filter((f) => f.id !== id))
  }

  async function togglePublished(item: Feedback) {
    const next = !item.is_published
    setItems((prev) => prev.map((f) => (f.id === item.id ? { ...f, is_published: next } : f)))
    const { error } = await supabase
      .from('feedbacks')
      .update({ is_published: next })
      .eq('id', item.id)
    if (error) {
      // revert
      setItems((prev) => prev.map((f) => (f.id === item.id ? { ...f, is_published: !next } : f)))
      setError(error.message)
    }
  }

  return (
    <div className="mt-10 rounded-2xl border border-[#e8e4df] bg-[#faf8f4] p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3
            className="text-xl font-semibold text-[#1c1c1e]"
            style={{ fontFamily: 'var(--font-cormorant), serif' }}
          >
            Client Feedback
          </h3>
          <p className="mt-0.5 text-xs text-[#6b7280]">
            Shown on your public portfolio. {items.filter((f) => f.is_published).length} published · {items.length} total.
          </p>
        </div>
      </div>

      {/* Add new */}
      <div className="rounded-xl border border-[#e8e4df] bg-white p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
          Add a Feedback
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            value={form.client_name}
            onChange={(e) => setForm((f) => ({ ...f, client_name: e.target.value }))}
            placeholder="Client name (e.g. Karan M.)"
            className="h-10 w-full rounded-lg border border-[#e8e4df] bg-white px-3 text-sm text-[#1c1c1e] placeholder-[#9ca3af] outline-none focus:border-[#a3b8b4] focus:ring-2 focus:ring-[#a3b8b4]/30"
          />
          <input
            type="text"
            value={form.client_role}
            onChange={(e) => setForm((f) => ({ ...f, client_role: e.target.value }))}
            placeholder="Optional · role/year (e.g. Client — 2025)"
            className="h-10 w-full rounded-lg border border-[#e8e4df] bg-white px-3 text-sm text-[#1c1c1e] placeholder-[#9ca3af] outline-none focus:border-[#a3b8b4] focus:ring-2 focus:ring-[#a3b8b4]/30"
          />
        </div>

        <div className="mt-3 flex items-center gap-3">
          <span className="text-xs font-medium text-[#6b7280]">Rating</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setForm((f) => ({ ...f, rating: n }))}
                className="rounded transition-transform hover:scale-110"
                aria-label={`${n} star${n > 1 ? 's' : ''}`}
              >
                <Star
                  size={20}
                  className={
                    n <= form.rating ? 'fill-[#d4a259] text-[#d4a259]' : 'text-[#d1d5db]'
                  }
                />
              </button>
            ))}
          </div>
        </div>

        <textarea
          rows={3}
          value={form.text}
          onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
          placeholder="What did this client share about their experience?"
          className="mt-3 w-full resize-none rounded-lg border border-[#e8e4df] bg-white px-3 py-2.5 text-sm text-[#1c1c1e] placeholder-[#9ca3af] outline-none focus:border-[#a3b8b4] focus:ring-2 focus:ring-[#a3b8b4]/30"
        />

        <div className="mt-3 flex items-center justify-between">
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            type="button"
            onClick={handleAdd}
            disabled={submitting}
            className="ml-auto flex items-center gap-2 rounded-lg bg-[#1c1c1e] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#000] disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Plus size={14} />
            )}
            Publish feedback
          </button>
        </div>
      </div>

      {/* Existing list */}
      <div className="mt-5 space-y-3">
        {loading && (
          <p className="rounded-lg bg-white px-4 py-3 text-xs text-[#6b7280]">
            Loading…
          </p>
        )}

        {!loading && items.length === 0 && (
          <p className="rounded-lg border border-dashed border-[#e8e4df] bg-white px-4 py-6 text-center text-xs text-[#6b7280]">
            No feedback yet. Add your first above.
          </p>
        )}

        {items.map((f) => (
          <div
            key={f.id}
            className={`group rounded-xl border bg-white p-4 transition ${
              f.is_published ? 'border-[#e8e4df]' : 'border-dashed border-[#e8e4df] opacity-70'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-[#1c1c1e]">{f.client_name}</span>
                  {f.client_role && (
                    <span className="text-xs text-[#6b7280]">· {f.client_role}</span>
                  )}
                  <span className="inline-flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        size={12}
                        className={
                          n <= f.rating ? 'fill-[#d4a259] text-[#d4a259]' : 'text-[#d1d5db]'
                        }
                      />
                    ))}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[#3d4a45]">{f.text}</p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <label className="flex cursor-pointer items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-[#6b7280]">
                  <input
                    type="checkbox"
                    checked={f.is_published}
                    onChange={() => togglePublished(f)}
                    className="h-3.5 w-3.5 accent-[#a3b8b4]"
                  />
                  Published
                </label>
                <button
                  type="button"
                  onClick={() => handleDelete(f.id)}
                  disabled={removingId === f.id}
                  className="rounded p-1 text-[#9ca3af] transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  aria-label="Delete feedback"
                >
                  {removingId === f.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
