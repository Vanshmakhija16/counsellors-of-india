'use client'

import { useEffect, useState } from 'react'
import { X, CheckCircle, Loader2, AlertTriangle } from 'lucide-react'
import { createNote, listNotesForAppointment, updateNote, type SessionNote } from '@/lib/clinical/notes'

interface SessionNotesModalProps {
  open: boolean
  onClose: () => void
  appointment: {
    id: string
    patient_id: string | null
    client_name: string
    scheduled_at: string
  }
  onSaved?: () => void
}

export default function SessionNotesModal({
  open,
  onClose,
  appointment,
  onSaved,
}: SessionNotesModalProps) {
  const [existing, setExisting] = useState<SessionNote | null>(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<Date | null>(null)

  useEffect(() => {
    if (!open) return
    let alive = true
    setLoading(true)
    setErr(null)
    setSavedAt(null)
    listNotesForAppointment(appointment.id)
      .then((notes) => {
        if (!alive) return
        const first = notes[0] ?? null
        setExisting(first)
        setContent(first?.content ?? '')
      })
      .catch((e: unknown) => {
        if (alive) setErr(e instanceof Error ? e.message : 'Failed to load notes')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [open, appointment.id])

  if (!open) return null

  const noPatient = !appointment.patient_id

  async function handleSave() {
    if (!appointment.patient_id) return
    if (!content.trim()) {
      setErr('Note cannot be empty')
      return
    }
    setSaving(true)
    setErr(null)
    try {
      if (existing) {
        const updated = await updateNote(existing.id, content)
        setExisting(updated)
      } else {
        const created = await createNote({
          patient_id: appointment.patient_id,
          appointment_id: appointment.id,
          content,
        })
        setExisting(created)
      }
      setSavedAt(new Date())
      onSaved?.()
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const dateLabel = new Date(appointment.scheduled_at).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="bg-white rounded-2xl border border-[#e8e4df] w-full max-w-xl shadow-xl">
        <div className="px-6 py-4 border-b border-[#e8e4df] flex items-start justify-between gap-3">
          <div>
            <h2
              className="text-base font-semibold text-[#1c1c1e]"
              style={{ fontFamily: 'var(--font-fraunces), serif' }}
            >
              Session notes — {appointment.client_name}
            </h2>
            <p className="text-xs text-[#6b7280] mt-0.5">{dateLabel}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
          >
            <X size={14} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {noPatient ? (
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
              <AlertTriangle size={15} className="text-amber-700 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  This appointment isn't linked to a patient chart
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Link the appointment to a patient first, then notes will save to that
                  patient's history.
                </p>
              </div>
            </div>
          ) : loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin w-5 h-5 rounded-full border-2 border-[#a3b8b4] border-t-transparent" />
            </div>
          ) : (
            <>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                placeholder="Session summary, observations, plan, homework assigned…"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a3b8b4] focus:border-transparent resize-y"
              />

              {err && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {err}
                </div>
              )}

              {savedAt && (
                <div className="flex items-center gap-2 text-xs text-[#2d4a47]">
                  <CheckCircle size={13} />
                  Saved {savedAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  · you can come back later to add more
                </div>
              )}
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-[#e8e4df] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            {savedAt ? 'Done' : 'Skip for now'}
          </button>
          {!noPatient && (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loading}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[#354744] text-white text-sm font-medium hover:bg-[#1a2f2d] transition disabled:opacity-50"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : null}
              {existing ? 'Update note' : 'Save note'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
