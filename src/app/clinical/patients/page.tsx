'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, Plus, Users, ChevronRight } from 'lucide-react'
import {
  listPatients,
  calculateAge,
  formatPatientName,
  type Patient,
  type PatientStatus,
} from '@/lib/clinical/patients'

const statusFilters: { label: string; value: PatientStatus | 'all' }[] = [
  { label: 'Active', value: 'active' },
  { label: 'Archived', value: 'archived' },
  { label: 'Discharged', value: 'discharged' },
  { label: 'All', value: 'all' },
]

export default function PatientsListPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<PatientStatus | 'all'>('active')

  useEffect(() => {
    let alive = true
    setLoading(true)
    setErr(null)
    listPatients({ status })
      .then((rows) => {
        if (alive) setPatients(rows)
      })
      .catch((e) => {
        if (alive) setErr(e.message ?? 'Failed to load patients')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [status])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return patients
    return patients.filter((p) => {
      const name = formatPatientName(p).toLowerCase()
      return (
        name.includes(q) ||
        (p.email?.toLowerCase().includes(q) ?? false) ||
        (p.phone?.toLowerCase().includes(q) ?? false)
      )
    })
  }, [patients, search])

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-semibold text-[#1c1c1e]"
            style={{ fontFamily: 'var(--font-fraunces), serif' }}
          >
            Patients
          </h1>
          <p className="text-[#6b7280] mt-1">
            Manage your patient charts and clinical history.
          </p>
        </div>
        <Link
          href="/clinical/patients/new"
          className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-[#354744] text-white text-sm font-medium hover:bg-[#1a2f2d] transition"
        >
          <Plus size={16} />
          New patient
        </Link>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone"
            className="w-full h-11 pl-9 pr-4 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a3b8b4] focus:border-transparent"
          />
        </div>
        <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatus(f.value)}
              className={`px-3 h-9 rounded-md text-xs font-medium transition ${
                status === f.value
                  ? 'bg-[#d4e4e1] text-[#2d4a47]'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#e8e4df]">
        {loading ? (
          <div className="px-6 py-16 flex items-center justify-center">
            <div className="animate-spin w-6 h-6 rounded-full border-2 border-[#a3b8b4] border-t-transparent" />
          </div>
        ) : err ? (
          <div className="px-6 py-10 text-center text-sm text-red-600">{err}</div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Users size={32} className="text-[#e8e4df] mx-auto mb-3" />
            <p className="text-sm font-medium text-[#6b7280]">
              {patients.length === 0 ? 'No patients yet' : 'No matches'}
            </p>
            <p className="text-xs text-[#6b7280] mt-1">
              {patients.length === 0
                ? 'Add your first patient to start building their chart.'
                : 'Try a different search or status filter.'}
            </p>
            {patients.length === 0 && (
              <Link
                href="/clinical/patients/new"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#2d4a47] hover:underline"
              >
                <Plus size={13} />
                Add patient
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#e8e4df]">
            {filtered.map((p) => (
              <Link
                key={p.id}
                href={`/clinical/patients/${p.id}`}
                className="group px-6 py-4 flex items-center justify-between hover:bg-stone-50 transition"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#d4e4e1] text-[#2d4a47] flex items-center justify-center text-sm font-semibold shrink-0">
                    {p.first_name.charAt(0)}
                    {p.last_name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1c1c1e] truncate">
                      {formatPatientName(p)}
                    </p>
                    <p className="text-xs text-[#6b7280] mt-0.5 truncate">
                      {calculateAge(p.dob)} yrs
                      {p.gender ? ` · ${p.gender}` : ''}
                      {p.phone ? ` · ${p.phone}` : p.email ? ` · ${p.email}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusPill status={p.status} />
                  <ChevronRight
                    size={16}
                    className="text-[#9ca3af] transition group-hover:translate-x-0.5 group-hover:text-[#2d4a47]"
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatusPill({ status }: { status: PatientStatus }) {
  const styles: Record<PatientStatus, string> = {
    active: 'bg-[#d4e4e1] text-[#2d4a47]',
    archived: 'bg-gray-100 text-gray-600',
    discharged: 'bg-amber-50 text-amber-700',
  }
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wide ${styles[status]}`}>
      {status}
    </span>
  )
}
