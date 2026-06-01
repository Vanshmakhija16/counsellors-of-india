'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Calendar, Clock, User, CheckCircle, RotateCw, Search,
  Loader2, FileText, ExternalLink,
} from 'lucide-react'
import {
  listAppointments,
  updateAppointmentStatus,
  type Appointment,
  type AppointmentStatus,
} from '@/lib/clinical/appointments'
import SessionNotesModal from '@/components/clinical/SessionNotesModal'

type Tab = AppointmentStatus | 'all'

const TABS: { key: Tab; label: string }[] = [
  { key: 'upcoming',    label: 'Upcoming' },
  { key: 'rescheduled', label: 'Rescheduled' },
  { key: 'completed',   label: 'Completed' },
  { key: 'all',         label: 'All' },
]

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('upcoming')
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [notesFor, setNotesFor] = useState<Appointment | null>(null)

  async function load() {
    setLoading(true)
    setErr(null)
    try {
      const data = await listAppointments({ status: 'all', limit: 500 })
      setAppointments(data)
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return appointments.filter((a) => {
      if (tab !== 'all' && a.status !== tab) return false
      if (q) {
        const hay = `${a.client_name} ${a.client_email ?? ''} ${a.client_phone ?? ''}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (dateFrom) {
        const min = new Date(dateFrom + 'T00:00:00').getTime()
        if (new Date(a.scheduled_at).getTime() < min) return false
      }
      return true
    })
  }, [appointments, tab, search, dateFrom])

  const counts: Record<Tab, number> = {
    all:         appointments.length,
    upcoming:    appointments.filter((a) => a.status === 'upcoming').length,
    rescheduled: appointments.filter((a) => a.status === 'rescheduled').length,
    completed:   appointments.filter((a) => a.status === 'completed').length,
  }

  async function setStatus(apt: Appointment, status: AppointmentStatus) {
    setUpdatingId(apt.id)
    try {
      const updated = await updateAppointmentStatus(apt.id, status)
      setAppointments((prev) => prev.map((a) => (a.id === apt.id ? updated : a)))
      if (status === 'completed') setNotesFor(updated)
    } catch (e) {
      console.error('[appointments] status update failed:', e)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="p-5 sm:p-8 max-w-6xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-semibold text-[#1c1c1e]"
            style={{ fontFamily: 'var(--font-fraunces), serif' }}
          >
            Appointments
          </h1>
          <p className="text-sm text-[#6b7280] mt-1">
            Track upcoming sessions, mark them complete, and file notes.
          </p>
        </div>
      </div>

      {/* Filters row */}
      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_180px_auto]">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone"
            className="w-full h-11 pl-9 pr-4 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a3b8b4] focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af] pointer-events-none" />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full h-11 pl-9 pr-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#a3b8b4] focus:border-transparent"
          />
        </div>
        {(search || dateFrom) && (
          <button
            type="button"
            onClick={() => { setSearch(''); setDateFrom('') }}
            className="h-11 px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
          >
            Clear
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {TABS.map((t) => {
          const active = tab === t.key
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`px-4 h-9 rounded-full text-xs font-medium border transition ${
                active
                  ? 'bg-[#1c1c1e] text-white border-[#1c1c1e]'
                  : 'bg-white text-[#6b7280] border-[#e8e4df] hover:border-[#a3b8b4]'
              }`}
            >
              {t.label} ({counts[t.key]})
            </button>
          )
        })}
      </div>

      <div className="bg-white rounded-xl border border-[#e8e4df] overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-6 h-6 rounded-full border-2 border-[#a3b8b4] border-t-transparent" />
          </div>
        ) : err ? (
          <div className="p-6 text-sm text-red-700">{err}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Calendar size={32} className="text-[#e8e4df] mx-auto mb-3" />
            <p className="text-sm font-medium text-[#6b7280]">
              {appointments.length === 0 ? 'No appointments yet' : 'No matches'}
            </p>
            <p className="text-xs text-[#6b7280] mt-1">
              {appointments.length === 0
                ? 'Bookings via your public link will appear here.'
                : 'Try a different search or clear the filters.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[#e8e4df]">
            {filtered.map((apt) => (
              <li key={apt.id} className="px-4 sm:px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 rounded-full bg-[#d4e4e1] text-[#2d4a47] flex items-center justify-center shrink-0">
                  <User size={16} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-[#1c1c1e] truncate">{apt.client_name}</p>
                    <StatusPill status={apt.status} />
                    {apt.patient_id ? (
                      <Link
                        href={`/clinical/patients/${apt.patient_id}`}
                        className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[#2d4a47] hover:underline"
                      >
                        Chart <ExternalLink size={10} />
                      </Link>
                    ) : (
                      <span className="text-[10px] font-medium uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        Unlinked
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center flex-wrap gap-x-3 gap-y-0.5 text-xs text-[#6b7280]">
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={12} /> {formatDate(apt.scheduled_at)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock size={12} /> {formatTime(apt.scheduled_at)} · {apt.duration_mins} min
                    </span>
                    {apt.client_email && <span>{apt.client_email}</span>}
                    {apt.client_phone && <span>{apt.client_phone}</span>}
                  </div>
                </div>

                <div className="flex items-center flex-wrap gap-2 shrink-0 pl-12 sm:pl-0">
                  {apt.status === 'upcoming' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setStatus(apt, 'rescheduled')}
                        disabled={updatingId === apt.id}
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                      >
                        <RotateCw size={11} /> Reschedule
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus(apt, 'completed')}
                        disabled={updatingId === apt.id}
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#354744] text-white text-xs font-medium hover:bg-[#1a2f2d] transition disabled:opacity-50"
                      >
                        {updatingId === apt.id ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle size={11} />}
                        Mark complete
                      </button>
                    </>
                  )}
                  {apt.status === 'rescheduled' && (
                    <button
                      type="button"
                      onClick={() => setStatus(apt, 'upcoming')}
                      disabled={updatingId === apt.id}
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                    >
                      Back to upcoming
                    </button>
                  )}
                  {apt.status === 'completed' && (
                    <button
                      type="button"
                      onClick={() => setNotesFor(apt)}
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[#b8ceca] text-[#2d4a47] text-xs font-medium hover:bg-[#d4e4e1] transition"
                    >
                      <FileText size={11} /> Notes
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {notesFor && (
        <SessionNotesModal
          open={!!notesFor}
          onClose={() => setNotesFor(null)}
          appointment={notesFor}
        />
      )}
    </div>
  )
}

function StatusPill({ status }: { status: AppointmentStatus }) {
  const styles: Record<AppointmentStatus, string> = {
    upcoming: 'bg-amber-50 text-amber-700 border-amber-200',
    rescheduled: 'bg-blue-50 text-blue-700 border-blue-200',
    completed: 'bg-[#d4e4e1] text-[#2d4a47] border-[#b8ceca]',
  }
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wide ${styles[status]}`}>
      {status}
    </span>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
