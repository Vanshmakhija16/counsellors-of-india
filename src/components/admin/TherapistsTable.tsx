'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ChevronUp, ChevronDown, User, Trash2, AlertTriangle, X, Crown, Rocket, TriangleAlert } from 'lucide-react'

export interface TherapistRow {
  id: string
  name: string
  email: string | null
  phone: string | null
  photo_url: string | null
  city: string | null
  plan: string | null
  subscription_status: string | null
  payments_enabled: boolean
  payments_health: string
  is_active: boolean
  created_at: string
  booking_count: number
}

type SortKey = 'name' | 'plan' | 'booking_count' | 'created_at'

// A therapist with plan = null (never set), plan = 'free' (explicitly on
// the free tier), or plan = 'none'/'None' (some rows literally store the
// string "None" instead of a real null) all belong in the same
// "No plan" bucket -- none of these are Starter or Pro.
function isNoPlan(plan: string | null) {
  if (!plan) return true
  const normalized = plan.trim().toLowerCase()
  return normalized === '' || normalized === 'free' || normalized === 'none'
}

// Solid, high-contrast pill with an icon -- echoes the Crown/Rocket marks
// already used on the public pricing cards, so "Pro"/"Starter" reads as
// the same idea in both places instead of a flat, low-contrast label.
function PlanBadge({ plan }: { plan: string | null }) {
  if (isNoPlan(plan)) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[13.5px] font-semibold border border-dashed border-amber-500/40 text-amber-400">
        <TriangleAlert size={12} strokeWidth={2.4} />
        No plan
      </span>
    )
  }
  if (plan === 'pro') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[13.5px] font-semibold border border-[#FF9933]/[0.35] bg-[#FF9933]/[0.08] text-[#FFB565]">
        <Crown size={12} strokeWidth={2.4} />
        Pro
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[13.5px] font-semibold border border-white/[0.18] text-[#F5F1EA] capitalize">
      <Rocket size={12} strokeWidth={2.4} />
      {plan}
    </span>
  )
}

function PaymentsBadge({ enabled, health }: { enabled: boolean; health: string }) {
  if (!enabled) return <span className="text-[14.5px] text-[#7A7568]">Not connected</span>
  if (health === 'broken') return <span className="inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-red-400"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Broken</span>
  if (health === 'healthy') return <span className="inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Connected</span>
  return <span className="inline-flex items-center gap-1.5 text-[14.5px] text-[#7A7568]"><span className="w-1.5 h-1.5 rounded-full bg-[#4A463E]" /> Connected</span>
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function TherapistsTable({ rows: initialRows }: { rows: TherapistRow[] }) {
  const router = useRouter()
  const [rows, setRows] = useState(initialRows)
  const [query, setQuery] = useState('')
  const [planFilter, setPlanFilter] = useState<'all' | 'starter' | 'pro' | 'no-plan'>('all')
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  // ── Delete flow: two-step confirmation, never a single click away ──
  const [deleteTarget, setDeleteTarget] = useState<TherapistRow | null>(null)
  const [confirmStep, setConfirmStep] = useState<1 | 2>(1)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  function openDeleteModal(row: TherapistRow) {
    setDeleteTarget(row)
    setConfirmStep(1)
    setConfirmText('')
    setDeleteError('')
  }

  function closeDeleteModal() {
    if (deleting) return // don't let it close mid-request
    setDeleteTarget(null)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    setDeleteError('')
    try {
      const res = await fetch(`/api/admin/therapists/${deleteTarget.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) {
        setDeleteError(data.error ?? 'Failed to delete. Please try again.')
        return
      }
      setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch {
      setDeleteError('Network error. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const noPlanCount = useMemo(() => rows.filter((r) => isNoPlan(r.plan)).length, [rows])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = rows.filter((r) => {
      if (planFilter === 'no-plan' && !isNoPlan(r.plan)) return false
      if (planFilter !== 'all' && planFilter !== 'no-plan' && r.plan !== planFilter) return false
      if (!q) return true
      return (
        r.name.toLowerCase().includes(q) ||
        (r.email ?? '').toLowerCase().includes(q) ||
        (r.phone ?? '').toLowerCase().includes(q) ||
        (r.city ?? '').toLowerCase().includes(q)
      )
    })
    list = [...list].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name)
      else if (sortKey === 'plan') cmp = (a.plan ?? '').localeCompare(b.plan ?? '')
      else if (sortKey === 'booking_count') cmp = a.booking_count - b.booking_count
      else cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      return sortDir === 'asc' ? cmp : -cmp
    })
    return list
  }, [rows, query, planFilter, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('desc') }
  }

  function SortHeader({ label, k, align }: { label: string; k: SortKey; align?: 'right' }) {
    const active = sortKey === k
    return (
      <button
        onClick={() => toggleSort(k)}
        className={`flex items-center gap-1 text-[13.5px] font-semibold uppercase tracking-wide ${align === 'right' ? 'ml-auto flex-row-reverse' : ''} ${active ? 'text-[#F5F1EA]' : 'text-[#7A7568]'} hover:text-[#F5F1EA] transition`}
      >
        {label}
        {active ? (sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />) : null}
      </button>
    )
  }

  return (
    <div className="px-5 md:px-8 py-6 max-w-6xl" style={{ fontFamily: 'var(--font-instrument-sans)' }}>
      <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[21px] font-bold text-[#F5F1EA]" style={{ fontFamily: 'var(--font-jakarta)' }}>Therapists</h1>
          <p className="text-[14px] text-[#9C9385] mt-0.5">{rows.length} total &middot; {filtered.length} shown</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px] max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A7568]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, phone, city…"
            className="w-full h-10 pl-9 pr-3 rounded-full border border-white/[0.08] bg-[#18181B] text-[14px] text-[#F5F1EA] outline-none focus:border-[#FF9933] transition placeholder:text-[#7A7568]"
          />
        </div>
        <div className="flex items-center gap-1 bg-[#18181B] border border-white/[0.08] rounded-full p-0.5">
          {(['all', 'starter', 'pro', 'no-plan'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPlanFilter(p)}
              className={`h-9 px-3.5 rounded-full text-[13px] font-semibold capitalize transition whitespace-nowrap ${
                planFilter === p
                  ? 'bg-white/[0.12] text-[#F5F1EA] border border-white/[0.25]'
                  : 'text-[#9C9385] hover:bg-white/[0.05] border border-transparent'
              }`}
            >
              {p === 'no-plan' ? `No plan${noPlanCount ? ` (${noPlanCount})` : ''}` : p}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#18181B] rounded-lg border border-white/[0.07] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[860px]">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.03] sticky top-0 z-10">
                <th className="px-4 py-3"><SortHeader label="Therapist" k="name" /></th>
                <th className="px-4 py-3 text-[13.5px] font-semibold uppercase tracking-wide text-[#7A7568]">Contact</th>
                <th className="px-4 py-3 text-[13.5px] font-semibold uppercase tracking-wide text-[#7A7568]">Payments</th>
                <th className="px-4 py-3 text-right"><SortHeader label="Bookings" k="booking_count" align="right" /></th>
                <th className="px-4 py-3"><SortHeader label="Plan" k="plan" /></th>
                <th className="px-4 py-3"><SortHeader label="Joined" k="created_at" /></th>
                <th className="px-4 py-3 text-[13.5px] font-semibold uppercase tracking-wide text-[#7A7568] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => router.push(`/admin/therapists/${r.id}`)}
                  className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.03] transition group cursor-pointer"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {r.photo_url ? (
                        <img src={r.photo_url} alt={r.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                      ) : (
                        <span className="w-9 h-9 rounded-full bg-white/[0.06] text-[#7A7568] flex items-center justify-center shrink-0"><User size={15} /></span>
                      )}
                      <span className="min-w-0">
                        <span className="block text-[15.5px] font-semibold text-[#F5F1EA] truncate">{r.name}</span>
                        {r.city && <span className="block text-[14px] text-[#7A7568] truncate">{r.city}</span>}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="block text-[13px] text-[#C9C3B5] truncate max-w-[190px]">{r.email ?? '—'}</span>
                    <span className="block text-[14px] text-[#7A7568]">{r.phone ?? '—'}</span>
                  </td>
                  <td className="px-4 py-4">
                    <PaymentsBadge enabled={r.payments_enabled} health={r.payments_health} />
                  </td>
                  <td className="px-4 py-4 text-[15.5px] font-semibold text-[#F5F1EA] text-right tabular-nums">{r.booking_count}</td>
                  <td className="px-4 py-4">
                    <PlanBadge plan={r.plan} />
                  </td>
                  <td className="px-4 py-4 text-[15px] text-[#9C9385]">{formatDate(r.created_at)}</td>
                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); openDeleteModal(r) }}
                      title="Delete therapist"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-md text-[#7A7568] hover:text-red-400 hover:bg-red-500/10 transition"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-[14px] text-[#7A7568]">No therapists match your search.</p>
          </div>
        )}
      </div>

      {/* ── Delete confirmation modal: two explicit steps before anything happens ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] px-4">
          <div className="w-full max-w-md bg-[#18181B] rounded-xl border border-white/[0.08] shadow-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">
                  <AlertTriangle size={17} />
                </span>
                <h2 className="text-[15px] font-bold text-[#F5F1EA]">Delete therapist</h2>
              </div>
              <button onClick={closeDeleteModal} disabled={deleting} className="text-[#7A7568] hover:text-[#F5F1EA] transition disabled:opacity-40">
                <X size={16} />
              </button>
            </div>

            {confirmStep === 1 ? (
              <>
                <p className="text-[13px] text-[#C9C3B5] leading-relaxed mb-2">
                  You're about to permanently delete <strong className="text-[#F5F1EA]">{deleteTarget.name}</strong>.
                </p>
                <p className="text-[13px] text-[#C9C3B5] leading-relaxed mb-5">
                  This also permanently deletes everything tied to their account —
                  {' '}<strong>{deleteTarget.booking_count} booking{deleteTarget.booking_count === 1 ? '' : 's'}</strong>, their clients,
                  session notes, and intake records. <strong>This cannot be undone.</strong>
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={closeDeleteModal}
                    className="h-9 px-4 rounded-md text-[13px] font-semibold text-[#C9C3B5] hover:bg-white/[0.05] transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setConfirmStep(2)}
                    className="h-9 px-4 rounded-md text-[13px] font-semibold bg-red-600 text-white hover:bg-red-700 transition"
                  >
                    Continue
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-[13px] text-[#C9C3B5] leading-relaxed mb-3">
                  To confirm, type <strong className="text-[#F5F1EA]">{deleteTarget.name}</strong> below.
                </p>
                <input
                  autoFocus
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={deleteTarget.name}
                  className="w-full h-9 px-3 rounded-md border border-white/[0.08] bg-[#101012] text-[#F5F1EA] text-[13px] outline-none focus:border-red-400 transition mb-1"
                />
                {deleteError && <p className="text-[12px] text-red-400 mt-2">{deleteError}</p>}
                <div className="flex justify-end gap-2 mt-5">
                  <button
                    onClick={closeDeleteModal}
                    disabled={deleting}
                    className="h-9 px-4 rounded-md text-[13px] font-semibold text-[#C9C3B5] hover:bg-white/[0.05] transition disabled:opacity-40"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={confirmText !== deleteTarget.name || deleting}
                    className="h-9 px-4 rounded-md text-[13px] font-semibold bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {deleting ? 'Deleting…' : 'Permanently delete'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
