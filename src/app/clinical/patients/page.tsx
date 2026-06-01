'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Search, Plus, Users, ChevronRight, Calendar,
  ClipboardList, Activity, Sparkles, UserPlus, Loader2,
} from 'lucide-react'
import {
  listPatientsWithStats,
  listUnlinkedBookers,
  promoteBookerToPatient,
  calculateAge,
  formatPatientName,
  type PatientStatus,
  type PatientWithStats,
  type BookerRow,
} from '@/lib/clinical/patients'

const statusFilters: { label: string; value: PatientStatus | 'all' }[] = [
  { label: 'Active', value: 'active' },
  { label: 'Archived', value: 'archived' },
  { label: 'Discharged', value: 'discharged' },
  { label: 'All', value: 'all' },
]

export default function PatientsListPage() {
  const router = useRouter()
  const [patients, setPatients] = useState<PatientWithStats[]>([])
  const [bookers, setBookers] = useState<BookerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<PatientStatus | 'all'>('active')
  const [promotingKey, setPromotingKey] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setErr(null)
    Promise.all([listPatientsWithStats({ status }), listUnlinkedBookers()])
      .then(([rows, b]) => {
        if (!alive) return
        setPatients(rows)
        setBookers(b)
      })
      .catch((e) => {
        if (alive) setErr(e.message ?? 'Failed to load clients')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [status])

  async function handlePromote(b: BookerRow) {
    setPromotingKey(b.synthetic_id)
    try {
      const created = await promoteBookerToPatient({
        client_name: b.client_name,
        client_email: b.client_email,
        client_phone: b.client_phone,
      })
      router.push(`/clinical/patients/${created.id}`)
      router.refresh()
    } catch (e) {
      console.error('[promote booker]', e)
      setPromotingKey(null)
    }
  }

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

  const filteredBookers = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return bookers
    return bookers.filter((b) => {
      return (
        b.client_name.toLowerCase().includes(q) ||
        (b.client_email?.toLowerCase().includes(q) ?? false) ||
        (b.client_phone?.toLowerCase().includes(q) ?? false)
      )
    })
  }, [bookers, search])

  const totals = useMemo(() => {
    const sessions =
      patients.reduce((s, p) => s + p.stats.total_appointments, 0) +
      bookers.reduce((s, b) => s + b.total_appointments, 0)
    const intakesDone = patients.filter((p) => p.stats.intake_state === 'final').length
    const totalPeople = patients.length + bookers.length
    return { sessions, intakesDone, totalPeople }
  }, [patients, bookers])

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1
            className="text-3xl font-semibold text-[#1c1c1e]"
            style={{ fontFamily: 'var(--font-fraunces), serif' }}
          >
            My Clients
          </h1>
          <p className="text-[#6b7280] mt-1">
            Every person you work with, in one place. Add new clients, jump into intake, and track sessions.
          </p>
        </div>
        <Link
          href="/clinical/patients/new"
          className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-[#354744] text-white text-sm font-medium hover:bg-[#1a2f2d] transition"
        >
          <Plus size={16} />
          New client
        </Link>
      </div>

      {/* Summary strip */}
      {(patients.length > 0 || bookers.length > 0) && (
        <div className="mb-5 grid sm:grid-cols-3 gap-3">
          <SummaryCard icon={Users} label="Clients" value={totals.totalPeople} />
          <SummaryCard icon={Calendar} label="Sessions booked" value={totals.sessions} />
          <SummaryCard icon={ClipboardList} label="Intakes finalised" value={totals.intakesDone} />
        </div>
      )}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
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
        ) : filtered.length === 0 && filteredBookers.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Users size={32} className="text-[#e8e4df] mx-auto mb-3" />
            <p className="text-sm font-medium text-[#6b7280]">
              {patients.length === 0 && bookers.length === 0 ? 'No clients yet' : 'No matches'}
            </p>
            <p className="text-xs text-[#6b7280] mt-1 max-w-md mx-auto">
              {patients.length === 0 && bookers.length === 0
                ? 'Add your first client to begin. Bookings made through your public link will land here automatically.'
                : 'Try a different search or status filter.'}
            </p>
            {patients.length === 0 && bookers.length === 0 && (
              <Link
                href="/clinical/patients/new"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#2d4a47] hover:underline"
              >
                <Plus size={13} />
                Add client
              </Link>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-[#e8e4df]">
            {filtered.map((p) => (
              <li key={p.id} className="px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <Link
                    href={`/clinical/patients/${p.id}`}
                    className="group flex items-center gap-4 min-w-0 flex-1"
                  >
                    <div className="w-11 h-11 rounded-full bg-[#d4e4e1] text-[#2d4a47] flex items-center justify-center text-sm font-semibold shrink-0">
                      {p.first_name.charAt(0)}
                      {p.last_name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#1c1c1e] truncate group-hover:text-[#2d4a47] transition">
                        {formatPatientName(p)}
                      </p>
                      <p className="text-xs text-[#6b7280] mt-0.5 truncate">
                        {(() => {
                          const age = calculateAge(p.dob)
                          return age !== null ? `${age} yrs` : 'Age —'
                        })()}
                        {p.gender ? ` · ${p.gender}` : ''}
                        {p.phone ? ` · ${p.phone}` : p.email ? ` · ${p.email}` : ''}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#6b7280]">
                        <StatChip icon={Calendar}>
                          {p.stats.total_appointments === 0
                            ? 'No sessions yet'
                            : `${p.stats.total_appointments} session${p.stats.total_appointments === 1 ? '' : 's'}`}
                        </StatChip>
                        {/* {p.stats.last_seen_at && (
                          <span className="text-[#9ca3af]">
                            Last seen {formatRelativeDate(p.stats.last_seen_at)}
                          </span>
                        )} */}
                        <IntakeChip
                          state={p.stats.intake_state}
                          version={p.stats.latest_intake_version}
                        />
                        {p.stats.diagnosis_count > 0 && (
                          <StatChip icon={Activity}>
                            {p.stats.diagnosis_count} diagnos{p.stats.diagnosis_count === 1 ? 'is' : 'es'}
                          </StatChip>
                        )}
                      </div>
                    </div>
                  </Link>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/clinical/patients/${p.id}/intake/new`}
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[#b8ceca] text-[#2d4a47] text-xs font-medium hover:bg-[#d4e4e1] transition"
                    >
                      {p.stats.intake_state === 'none' ? (
                        <>
                          <Sparkles size={11} /> Begin intake
                        </>
                      ) : (
                        <>
                          <Plus size={11} /> Add intake
                        </>
                      )}
                    </Link>
                    <StatusPill status={p.status} />
                    <Link
                      href={`/clinical/patients/${p.id}`}
                      aria-label={`Open ${formatPatientName(p)}`}
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-[#9ca3af] hover:text-[#2d4a47] hover:bg-stone-50 transition"
                    >
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              </li>
            ))}

            {filteredBookers.length > 0 && (
              <li className="px-5 py-3 bg-stone-50">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
                  Booked, not yet on chart
                </p>
              </li>
            )}

            {filteredBookers.map((b) => {
              const initials =
                b.client_name.trim().split(/\s+/).slice(0, 2).map((p) => p.charAt(0)).join('') || '?'
              const promoting = promotingKey === b.synthetic_id
              return (
                <li key={b.synthetic_id} className="px-5 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="w-11 h-11 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center text-sm font-semibold shrink-0">
                        {initials.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#1c1c1e] truncate">
                          {b.client_name}
                        </p>
                        <p className="text-xs text-[#6b7280] mt-0.5 truncate">
                          {b.client_phone ? b.client_phone : ''}
                          {b.client_phone && b.client_email ? ' · ' : ''}
                          {b.client_email ? b.client_email : ''}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#6b7280]">
                          <StatChip icon={Calendar}>
                            {b.total_appointments} session{b.total_appointments === 1 ? '' : 's'}
                          </StatChip>
                          {/* {b.last_seen_at && (
                            <span className="text-[#9ca3af]">
                              Last seen {formatRelativeDate(b.last_seen_at)}
                            </span>
                          )} */}
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wide">
                            Not on chart
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePromote(b)}
                      disabled={promoting}
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#354744] text-white text-xs font-medium hover:bg-[#1a2f2d] transition disabled:opacity-50 shrink-0"
                    >
                      {promoting ? (
                        <>
                          <Loader2 size={11} className="animate-spin" /> Adding…
                        </>
                      ) : (
                        <>
                          <UserPlus size={11} /> Add to chart
                        </>
                      )}
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  value: number
}) {
  return (
    <div className="bg-white rounded-xl border border-[#e8e4df] p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-[#d4e4e1] text-[#2d4a47] flex items-center justify-center shrink-0">
        <Icon size={16} />
      </div>
      <div>
        <p
          className="text-2xl font-semibold text-[#1c1c1e] leading-none"
          style={{ fontFamily: 'var(--font-fraunces), serif' }}
        >
          {value}
        </p>
        <p className="text-xs text-[#6b7280] mt-1">{label}</p>
      </div>
    </div>
  )
}

function StatChip({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  children: React.ReactNode
}) {
  return (
    <span className="inline-flex items-center gap-1 text-[#6b7280]">
      <Icon size={11} className="text-[#9ca3af]" />
      {children}
    </span>
  )
}

function IntakeChip({
  state,
  version,
}: {
  state: 'none' | 'draft' | 'final'
  version: number | null
}) {
  if (state === 'none') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-stone-100 text-[#6b7280] uppercase tracking-wide">
        No intake
      </span>
    )
  }
  if (state === 'draft') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wide">
        Intake in progress
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#d4e4e1] text-[#2d4a47] uppercase tracking-wide">
      Intake v{version ?? 1}
    </span>
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

function formatRelativeDate(iso: string): string {
  const then = new Date(iso).getTime()
  const now = Date.now()
  const diffMs = then - now
  const day = 24 * 60 * 60 * 1000
  const diffDays = Math.round(diffMs / day)
  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'tomorrow'
  if (diffDays === -1) return 'yesterday'
  if (diffDays > 1 && diffDays <= 14) return `in ${diffDays} days`
  if (diffDays < -1 && diffDays >= -30) return `${Math.abs(diffDays)} days ago`
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
