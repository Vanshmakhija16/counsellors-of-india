'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { FileText, Search, Clock, User, Trash2, Edit2, Save, X } from 'lucide-react'
import { listAllNotes, updateNote, deleteNote, type SessionNoteWithRefs } from '@/lib/clinical/notes'

export default function NotesPage() {
  const [notes, setNotes] = useState<SessionNoteWithRefs[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    setLoading(true)
    listAllNotes()
      .then((rows) => {
        if (alive) setNotes(rows)
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
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return notes
    return notes.filter((n) => {
      const pname = n.patient ? `${n.patient.first_name} ${n.patient.last_name}` : ''
      return (
        pname.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q)
      )
    })
  }, [notes, search])

  async function handleSave(id: string) {
    setSavingId(id)
    try {
      const updated = await updateNote(id, editValue)
      setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...updated } : n)))
      setEditingId(null)
    } catch (e) {
      console.error('[notes] update failed:', e)
    } finally {
      setSavingId(null)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this note? This cannot be undone.')) return
    try {
      await deleteNote(id)
      setNotes((prev) => prev.filter((n) => n.id !== id))
    } catch (e) {
      console.error('[notes] delete failed:', e)
    }
  }

  return (
    <div className="p-5 sm:p-8 max-w-5xl">
      <div className="mb-6">
        <h1
          className="text-3xl font-semibold text-[#1c1c1e]"
          style={{ fontFamily: 'var(--font-fraunces), serif' }}
        >
          Session Notes
        </h1>
        <p className="text-sm text-[#6b7280] mt-1">
          Notes are visible only to you. Add notes from the appointments page when you mark a session complete.
        </p>
      </div>

      <div className="relative mb-5">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by patient name or note content"
          className="w-full h-11 pl-9 pr-4 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a3b8b4] focus:border-transparent"
        />
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-[#e8e4df] py-20 flex justify-center">
          <div className="animate-spin w-6 h-6 rounded-full border-2 border-[#a3b8b4] border-t-transparent" />
        </div>
      ) : err ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#e8e4df] px-6 py-16 text-center">
          <FileText size={32} className="text-[#e8e4df] mx-auto mb-3" />
          <p className="text-sm font-medium text-[#6b7280]">
            {notes.length === 0 ? 'No notes yet' : 'No matches'}
          </p>
          <p className="text-xs text-[#6b7280] mt-1">
            {notes.length === 0
              ? 'When you mark an appointment complete, a notes modal opens for you to capture session details.'
              : 'Try a different search.'}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((n) => {
            const isEditing = editingId === n.id
            const patientName = n.patient
              ? `${n.patient.first_name} ${n.patient.last_name}`
              : '(unlinked patient)'
            return (
              <li
                key={n.id}
                className="bg-white rounded-xl border border-[#e8e4df] p-5"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    {n.patient ? (
                      <Link
                        href={`/clinical/patients/${n.patient.id}`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1c1c1e] hover:text-[#2d4a47] transition"
                      >
                        <User size={13} className="text-[#9ca3af]" />
                        {patientName}
                      </Link>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6b7280]">
                        <User size={13} className="text-[#9ca3af]" />
                        {patientName}
                      </span>
                    )}
                    <p className="flex items-center gap-1.5 text-xs text-[#9ca3af] mt-1">
                      <Clock size={11} />
                      {formatDate(n.created_at)}
                      {n.appointment?.scheduled_at && (
                        <span> · Session {formatDate(n.appointment.scheduled_at)}</span>
                      )}
                      {n.updated_at !== n.created_at && <span> · edited</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(n.id)
                          setEditValue(n.content)
                        }}
                        className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#2d4a47] hover:border-[#b8ceca] transition"
                        title="Edit"
                      >
                        <Edit2 size={12} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(n.id)}
                      className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-600 hover:border-red-200 transition"
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {isEditing ? (
                  <div className="mt-3 space-y-3">
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      rows={6}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#a3b8b4] focus:border-transparent resize-y"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        disabled={savingId === n.id}
                        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                      >
                        <X size={11} /> Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSave(n.id)}
                        disabled={savingId === n.id || editValue.trim().length === 0}
                        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-[#354744] text-white text-xs font-medium hover:bg-[#1a2f2d] transition disabled:opacity-50"
                      >
                        <Save size={11} /> Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-[#1c1c1e] whitespace-pre-wrap leading-relaxed">
                    {n.content}
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
