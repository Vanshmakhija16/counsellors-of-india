'use client'

import { useMemo, useState } from 'react'
import { Search, Clock } from 'lucide-react'

export interface BookingRow {
  id: string
  client_name: string | null
  client_email: string | null
  client_phone: string | null
  service_name: string | null
  scheduled_at: string | null
  duration_mins: number | null
  service_price: number | null
  status: string | null
  payment_status: string | null
}

const STATUS_STYLES: Record<string, string> = {
  upcoming:    'bg-[#3D8FFF]/[0.14] text-[#7FB4FF]',
  completed:   'bg-emerald-500/[0.14] text-emerald-400',
  cancelled:   'bg-red-500/[0.14] text-red-400',
  rescheduled: 'bg-[#FF9933]/[0.14] text-[#FFB565]',
}

const PAYMENT_STYLES: Record<string, string> = {
  paid:            'text-emerald-400',
  pending_payment: 'text-amber-400',
  free:            'text-[#9C9385]',
}

function formatDateTime(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function BookingsTable({ rows }: { rows: BookingRow[] }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) =>
      (r.client_name ?? '').toLowerCase().includes(q) ||
      (r.client_email ?? '').toLowerCase().includes(q) ||
      (r.client_phone ?? '').toLowerCase().includes(q)
    )
  }, [rows, query])

  if (rows.length === 0) {
    return (
      <div className="bg-[#18181B] rounded-lg border border-white/[0.07] py-16 text-center">
        <Clock size={22} className="text-white/[0.12] mx-auto mb-2" />
        <p className="text-[13px] text-[#7A7568]">No bookings yet for this therapist.</p>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'var(--font-instrument-sans)' }}>
      <div className="relative max-w-xs mb-3">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A7568]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search client…"
          className="w-full h-9 pl-9 pr-3 rounded-md border border-white/[0.08] bg-[#18181B] text-[13px] text-[#F5F1EA] outline-none focus:border-[#FF9933] transition placeholder:text-[#7A7568]"
        />
      </div>

      <div className="bg-[#18181B] rounded-lg border border-white/[0.07] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[720px]">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.03]">
                {['Client', 'Service', 'Date & Time', 'Price', 'Status', 'Payment'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-[13px] font-semibold uppercase tracking-wide text-[#7A7568]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.03] transition">
                  <td className="px-4 py-3">
                    <span className="block text-[15px] font-semibold text-[#F5F1EA]">{b.client_name ?? '—'}</span>
                    <span className="block text-[13.5px] text-[#7A7568]">{b.client_email ?? b.client_phone ?? ''}</span>
                  </td>
                  <td className="px-4 py-3 text-[14.5px] text-[#C9C3B5]">{b.service_name ?? 'Session'}</td>
                  <td className="px-4 py-3 text-[14.5px] text-[#C9C3B5]">
                    {formatDateTime(b.scheduled_at)}
                    {b.duration_mins && <span className="text-[#7A7568]"> &middot; {b.duration_mins}m</span>}
                  </td>
                  <td className="px-4 py-3 text-[14.5px] font-semibold text-[#F5F1EA]">
                    {b.service_price ? `₹${b.service_price.toLocaleString('en-IN')}` : 'Free'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[13px] font-semibold capitalize ${STATUS_STYLES[b.status ?? ''] ?? 'bg-white/[0.06] text-[#C9C3B5]'}`}>
                      {b.status ?? '—'}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-[14px] font-medium capitalize ${PAYMENT_STYLES[b.payment_status ?? ''] ?? 'text-[#9C9385]'}`}>
                    {b.payment_status?.replace('_', ' ') ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center"><p className="text-[13px] text-[#7A7568]">No matches.</p></div>
        )}
      </div>
    </div>
  )
}
