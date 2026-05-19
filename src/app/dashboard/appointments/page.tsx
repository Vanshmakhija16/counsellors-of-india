'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useTherapist } from '@/lib/useTherapist'
import { Calendar, Clock, User, CheckCircle, XCircle, Filter } from 'lucide-react'

type Status = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'

interface Appointment {
  id: string
  client_name: string
  client_email: string
  client_phone: string | null
  scheduled_at: string
  duration_mins: number
  status: string
  created_at: string
}

export default function AppointmentsPage() {
  const supabase = createClient()
  const { therapist } = useTherapist()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Status>('all')
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    if (!therapist) return
    fetchAppointments()
  }, [therapist])

  async function fetchAppointments() {
    setLoading(true)
    const { data } = await supabase
      .from('appointments')
      .select('*')
      .eq('therapist_id', therapist!.id)
      .order('scheduled_at', { ascending: false })

    setAppointments(data ?? [])
    setLoading(false)
  }

  async function updateStatus(id: string, status: string) {
    setUpdating(id)
    await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id)

    // Update local state instantly
    setAppointments(prev =>
      prev.map(a => a.id === id ? { ...a, status } : a)
    )
    setUpdating(null)
  }

  const filtered = filter === 'all'
    ? appointments
    : appointments.filter(a => a.status === filter)

  const counts = {
    all:       appointments.length,
    pending:   appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-IN', {
      weekday: 'short', day: 'numeric',
      month: 'short', year: 'numeric',
    })
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit',
    })
  }

  function statusStyle(status: string) {
    switch (status) {
      case 'confirmed': return 'bg-[#d4e4e1] text-[#2d4a47]'
      case 'pending':   return 'bg-amber-50 text-amber-700'
      case 'completed': return 'bg-blue-50 text-blue-700'
      case 'cancelled': return 'bg-red-50 text-red-500'
      default:          return 'bg-gray-100 text-gray-500'
    }
  }

  return (
    <div className="p-8 max-w-5xl">

      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl font-semibold text-[#1c1c1e]"
          style={{ fontFamily: 'var(--font-cormorant), serif' }}
        >
          Appointments
        </h1>
        <p className="text-[#6b7280] mt-1 text-sm">
          Manage and track all your client sessions.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(Object.keys(counts) as Status[]).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`
              px-4 py-2 rounded-full text-xs font-medium
              capitalize transition border
              ${filter === tab
                ? 'bg-[#1c1c1e] text-white border-[#1c1c1e]'
                : 'bg-white text-[#6b7280] border-[#e8e4df] hover:border-[#a3b8b4]'}
            `}
          >
            {tab} ({counts[tab]})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#e8e4df] overflow-hidden">

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-6 h-6 rounded-full border-2
                            border-[#a3b8b4] border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Calendar size={36} className="text-[#e8e4df] mx-auto mb-3" />
            <p className="text-sm font-medium text-[#6b7280]">
              No {filter === 'all' ? '' : filter} appointments yet
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e8e4df] bg-[#fafaf9]">
                {['Client', 'Date & Time', 'Duration', 'Status', 'Actions'].map(h => (
                  <th key={h}
                    className="text-left px-5 py-3 text-xs font-semibold
                               text-[#6b7280] uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e4df]">
              {filtered.map(apt => (
                <tr key={apt.id}
                  className="hover:bg-[#fafaf9] transition">

                  {/* Client */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#d4e4e1]
                                      flex items-center justify-center shrink-0">
                        <User size={14} className="text-[#5a7f7a]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#1c1c1e]">
                          {apt.client_name}
                        </p>
                        <p className="text-xs text-[#6b7280]">
                          {apt.client_email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-5 py-4">
                    <p className="text-sm text-[#1c1c1e] font-medium">
                      {formatDate(apt.scheduled_at)}
                    </p>
                    <p className="text-xs text-[#6b7280] mt-0.5">
                      {formatTime(apt.scheduled_at)}
                    </p>
                  </td>

                  {/* Duration */}
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1.5
                                     text-sm text-[#6b7280]">
                      <Clock size={13} />
                      {apt.duration_mins} min
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <span className={`
                      text-xs font-medium px-2.5 py-1
                      rounded-full capitalize
                      ${statusStyle(apt.status)}
                    `}>
                      {apt.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {apt.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateStatus(apt.id, 'confirmed')}
                            disabled={updating === apt.id}
                            className="flex items-center gap-1.5 px-3 py-1.5
                                       bg-[#d4e4e1] text-[#2d4a47] rounded-lg
                                       text-xs font-medium hover:bg-[#b8ceca]
                                       transition disabled:opacity-50"
                          >
                            <CheckCircle size={12} />
                            Confirm
                          </button>
                          <button
                            onClick={() => updateStatus(apt.id, 'cancelled')}
                            disabled={updating === apt.id}
                            className="flex items-center gap-1.5 px-3 py-1.5
                                       bg-red-50 text-red-500 rounded-lg
                                       text-xs font-medium hover:bg-red-100
                                       transition disabled:opacity-50"
                          >
                            <XCircle size={12} />
                            Cancel
                          </button>
                        </>
                      )}
                      {apt.status === 'confirmed' && (
                        <button
                          onClick={() => updateStatus(apt.id, 'completed')}
                          disabled={updating === apt.id}
                          className="flex items-center gap-1.5 px-3 py-1.5
                                     bg-blue-50 text-blue-600 rounded-lg
                                     text-xs font-medium hover:bg-blue-100
                                     transition disabled:opacity-50"
                        >
                          <CheckCircle size={12} />
                          Mark done
                        </button>
                      )}
                      {(apt.status === 'completed' ||
                        apt.status === 'cancelled') && (
                        <span className="text-xs text-[#6b7280]">—</span>
                      )}
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Summary */}
      {!loading && appointments.length > 0 && (
        <p className="text-xs text-[#6b7280] mt-4 text-right">
          Showing {filtered.length} of {appointments.length} appointments
        </p>
      )}
    </div>
  )
}