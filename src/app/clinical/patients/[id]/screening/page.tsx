'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Plus, Stethoscope, AlertTriangle, ChevronRight,
  Send, Copy, Check, X, Loader2, MessageCircle, Mail,
} from 'lucide-react'
import {
  listInstruments,
  listPatientSessions,
  type Instrument,
  type ScreeningSessionWithInstrument,
} from '@/lib/clinical/screening'
import {
  createInvite,
  listInvitesForPatient,
  type InviteWithDetails,
} from '@/lib/clinical/invites'
import ScreeningTrend from '@/components/clinical/ScreeningTrend'

export default function ScreeningIndexPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: patientId } = use(params)
  const [instruments, setInstruments] = useState<Instrument[]>([])
  const [sessions, setSessions] = useState<ScreeningSessionWithInstrument[]>([])
  const [invites, setInvites] = useState<InviteWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [selectedSlug, setSelectedSlug] = useState('')
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
  const [creatingInvite, setCreatingInvite] = useState(false)
  const [copied, setCopied] = useState(false)
  const [inviteErr, setInviteErr] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    setLoading(true)
    Promise.all([listInstruments(), listPatientSessions(patientId), listInvitesForPatient(patientId)])
      .then(([instr, sess, inv]) => {
        if (!alive) return
        setInstruments(instr)
        setSessions(sess)
        setInvites(inv)
      })
      .catch((e) => { if (alive) setErr(e.message ?? 'Failed to load screenings') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [patientId])

  async function handleCreateInvite() {
    if (!selectedSlug) return
    setCreatingInvite(true)
    setInviteErr(null)
    try {
      const { url } = await createInvite(patientId, selectedSlug)
      setInviteUrl(url)
    } catch (e: unknown) {
      setInviteErr(e instanceof Error ? e.message : 'Failed to create link')
    } finally {
      setCreatingInvite(false)
    }
  }

  function handleCopy() {
    if (!inviteUrl) return
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function closeModal() {
    setShowInviteModal(false)
    setSelectedSlug('')
    setInviteUrl(null)
    setInviteErr(null)
    setCopied(false)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#e8e4df] px-6 py-16 flex justify-center">
        <div className="animate-spin w-6 h-6 rounded-full border-2 border-[#a3b8b4] border-t-transparent" />
      </div>
    )
  }

  if (err) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {err}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* ── Instrument cards ───────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
            Start a screening
          </h2>
          <button
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[#b8ceca] text-[#2d4a47] text-xs font-medium hover:bg-[#d4e4e1] transition"
          >
            <Send size={12} /> Send link to patient
          </button>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {instruments.map((inst) => (
            <Link
              key={inst.id}
              href={`/clinical/patients/${patientId}/screening/new/${inst.slug}`}
              className="group bg-white rounded-xl border border-[#e8e4df] p-4 transition hover:border-[#b8ceca] hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#d4e4e1] text-[#2d4a47] flex items-center justify-center">
                    <Stethoscope size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1c1c1e]">{inst.short_name}</p>
                    <p className="text-xs text-[#6b7280] mt-0.5">{inst.name}</p>
                  </div>
                </div>
                <Plus size={16} className="text-[#9ca3af] transition group-hover:rotate-90 group-hover:text-[#2d4a47]" />
              </div>
              <p className="text-[11px] uppercase tracking-wider text-[#9ca3af] mt-3">
                {inst.domain} · range {inst.min_score}–{inst.max_score}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Recent invites ─────────────────────────────── */}
      {invites.filter((i) => !i.completed_session_id && new Date(i.expires_at) > new Date()).length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280] mb-3">
            Pending patient links
          </h2>
          <ul className="space-y-2">
            {invites
              .filter((i) => !i.completed_session_id && new Date(i.expires_at) > new Date())
              .map((inv) => (
                <li key={inv.id} className="bg-white rounded-xl border border-[#e8e4df] px-5 py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[#1c1c1e]">{inv.instrument.short_name}</p>
                    <p className="text-xs text-[#9ca3af]">
                      Sent · expires {new Date(inv.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wide">
                    Awaiting
                  </span>
                </li>
              ))}
          </ul>
        </section>
      )}

      {/* ── History ────────────────────────────────────── */}
      <SessionsByInstrument sessions={sessions} instruments={instruments} patientId={patientId} />

      {/* ── Invite modal ───────────────────────────────── */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="bg-white rounded-2xl border border-[#e8e4df] w-full max-w-md shadow-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2
                className="text-base font-semibold text-[#1c1c1e]"
                style={{ fontFamily: 'var(--font-fraunces), serif' }}
              >
                Send screening link
              </h2>
              <button onClick={closeModal} className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition">
                <X size={14} />
              </button>
            </div>

            {!inviteUrl ? (
              <>
                <p className="text-xs text-[#6b7280] mb-4">
                  Choose an instrument, then share the generated link with the patient. It expires in 14 days and is single-use.
                </p>
                <label className="block text-sm font-medium text-gray-600 mb-2">Instrument</label>
                <select
                  value={selectedSlug}
                  onChange={(e) => setSelectedSlug(e.target.value)}
                  className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#a3b8b4] mb-5"
                >
                  <option value="">Select…</option>
                  {instruments.map((i) => (
                    <option key={i.slug} value={i.slug}>{i.short_name} — {i.name}</option>
                  ))}
                </select>

                {inviteErr && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 mb-4">
                    {inviteErr}
                  </div>
                )}

                <button
                  disabled={!selectedSlug || creatingInvite}
                  onClick={handleCreateInvite}
                  className="w-full h-11 rounded-xl bg-[#354744] text-white text-sm font-medium hover:bg-[#1a2f2d] disabled:opacity-40 transition flex items-center justify-center gap-2"
                >
                  {creatingInvite ? <><Loader2 size={14} className="animate-spin" /> Generating…</> : 'Generate link'}
                </button>
              </>
            ) : (
              <>
                <p className="text-xs text-[#6b7280] mb-3">Share this link with the patient. It's single-use and expires in 14 days.</p>

                <div className="flex items-center gap-2 mb-4">
                  <input
                    readOnly
                    value={inviteUrl}
                    className="flex-1 h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-xs text-gray-700 font-mono focus:outline-none"
                  />
                  <button
                    onClick={handleCopy}
                    className="h-10 px-3 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition shrink-0"
                  >
                    {copied ? <><Check size={12} className="text-green-600" /> Copied!</> : <><Copy size={12} /> Copy</>}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-5">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Please complete this screening before your next session: ${inviteUrl}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10 rounded-lg border border-[#b8ceca] text-[#2d4a47] text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-[#d4e4e1] transition"
                  >
                    <MessageCircle size={13} /> WhatsApp
                  </a>
                  <a
                    href={`mailto:?subject=Please complete this screening&body=Please complete this screening before your next session: ${inviteUrl}`}
                    className="h-10 rounded-lg border border-gray-200 text-gray-700 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-gray-50 transition"
                  >
                    <Mail size={13} /> Email
                  </a>
                </div>

                <button
                  onClick={closeModal}
                  className="w-full h-10 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Done
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function SessionsByInstrument({
  sessions, instruments, patientId,
}: {
  sessions: ScreeningSessionWithInstrument[]
  instruments: Instrument[]
  patientId: string
}) {
  if (sessions.length === 0) {
    return (
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280] mb-3">History</h2>
        <div className="bg-white rounded-xl border border-[#e8e4df] px-6 py-12 text-center">
          <Stethoscope size={28} className="text-[#e8e4df] mx-auto mb-3" />
          <p className="text-sm font-medium text-[#6b7280]">No screenings yet</p>
          <p className="text-xs text-[#6b7280] mt-1">Pick an instrument above to administer a session.</p>
        </div>
      </section>
    )
  }

  const grouped = new Map<string, ScreeningSessionWithInstrument[]>()
  for (const s of sessions) {
    const k = s.instrument?.slug ?? 'unknown'
    const arr = grouped.get(k) ?? []
    arr.push(s)
    grouped.set(k, arr)
  }

  return (
    <section className="space-y-6">
      <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280]">History</h2>
      {Array.from(grouped.entries()).map(([slug, items]) => {
        const inst = instruments.find((i) => i.slug === slug) ?? items[0].instrument
        const chronological = [...items].reverse()
        const trendData = chronological.map((s) => ({
          date: s.administered_at,
          score: s.total_score,
          severity: s.severity_label,
        }))
        return (
          <div key={slug} className="bg-white rounded-xl border border-[#e8e4df] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e8e4df] flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#1c1c1e]">{inst?.short_name}</p>
                <p className="text-xs text-[#6b7280] mt-0.5">
                  {items.length} administration{items.length === 1 ? '' : 's'} · latest score{' '}
                  <strong>{items[0].total_score}</strong> · {items[0].severity_label}
                </p>
              </div>
              <Link
                href={`/clinical/patients/${patientId}/screening/new/${slug}`}
                className="shrink-0 inline-flex items-center gap-1 h-8 px-3 rounded-md bg-[#354744] text-white text-xs font-medium hover:bg-[#1a2f2d] transition"
              >
                <Plus size={12} /> New
              </Link>
            </div>

            <div className="px-5 py-4">
              <ScreeningTrend data={trendData} min={inst?.min_score ?? 0} max={inst?.max_score ?? 27} />
            </div>

            <ul className="divide-y divide-[#e8e4df]">
              {items.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/clinical/patients/${patientId}/screening/${s.id}`}
                    className="group px-5 py-3 flex items-center justify-between hover:bg-stone-50 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {s.flagged && (
                        <span title="Critical-item response flagged">
                          <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#1c1c1e]">
                          Score {s.total_score}
                          <span className="ml-2 text-xs font-normal text-[#6b7280]">· {s.severity_label}</span>
                        </p>
                        <p className="text-xs text-[#6b7280] mt-0.5">
                          {new Date(s.administered_at).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-[#9ca3af] transition group-hover:translate-x-0.5 group-hover:text-[#2d4a47]" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </section>
  )
}
