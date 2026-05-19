'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  BookOpen, Link2, Video, FileText,
  Check, X, Plus, ExternalLink, Search, Loader2,
} from 'lucide-react'
import {
  listResources,
  listAssignedResources,
  assignResource,
  unassignResource,
  markResourceComplete,
  type Resource,
  type ResourceKind,
  type PatientResourceWithResource,
} from '@/lib/clinical/resources'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const KIND_META: Record<ResourceKind, { label: string; icon: React.ElementType; color: string }> = {
  worksheet: { label: 'Worksheet', icon: FileText, color: 'text-[#2d4a47] bg-[#d4e4e1]' },
  reading:   { label: 'Reading',   icon: BookOpen, color: 'text-amber-700 bg-amber-50' },
  video:     { label: 'Video',     icon: Video,    color: 'text-blue-700 bg-blue-50' },
  link:      { label: 'Link',      icon: Link2,    color: 'text-purple-700 bg-purple-50' },
}

function KindBadge({ kind }: { kind: ResourceKind }) {
  const m = KIND_META[kind] ?? KIND_META.link
  const Icon = m.icon
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${m.color}`}>
      <Icon size={10} />
      {m.label}
    </span>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ResourcesClientPage({ patientId }: { patientId: string }) {
  const [tab, setTab] = useState<'assigned' | 'library'>('assigned')
  const [assigned, setAssigned] = useState<PatientResourceWithResource[]>([])
  const [library, setLibrary] = useState<Resource[]>([])
  const [loadingA, setLoadingA] = useState(true)
  const [loadingL, setLoadingL] = useState(false)
  const [search, setSearch] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [actionId, setActionId] = useState<string | null>(null)

  // Load assigned resources
  useEffect(() => {
    setLoadingA(true)
    listAssignedResources(patientId)
      .then(setAssigned)
      .catch((e) => setErr(e.message))
      .finally(() => setLoadingA(false))
  }, [patientId])

  // Load library when tab switches
  const loadLibrary = useCallback(async (q?: string) => {
    setLoadingL(true)
    setErr(null)
    try {
      const data = await listResources({ search: q })
      setLibrary(data)
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Failed to load library')
    } finally {
      setLoadingL(false)
    }
  }, [])

  useEffect(() => {
    if (tab === 'library') loadLibrary()
  }, [tab, loadLibrary])

  // Search debounce
  useEffect(() => {
    if (tab !== 'library') return
    const t = setTimeout(() => loadLibrary(search), 300)
    return () => clearTimeout(t)
  }, [search, tab, loadLibrary])

  async function handleAssign(resource: Resource) {
    setActionId(resource.id)
    setErr(null)
    try {
      const pr = await assignResource(patientId, { resource_id: resource.id })
      setAssigned((prev) => {
        // replace or prepend
        const next = prev.filter((p) => p.resource_id !== resource.id)
        return [{ ...pr, resource } as PatientResourceWithResource, ...next]
      })
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Assign failed')
    } finally {
      setActionId(null)
    }
  }

  async function handleUnassign(pr: PatientResourceWithResource) {
    setActionId(pr.id)
    setErr(null)
    try {
      await unassignResource(pr.id)
      setAssigned((prev) => prev.filter((p) => p.id !== pr.id))
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Remove failed')
    } finally {
      setActionId(null)
    }
  }

  async function handleToggleComplete(pr: PatientResourceWithResource) {
    setActionId(pr.id)
    setErr(null)
    try {
      const updated = await markResourceComplete(pr.id, !pr.completed_at)
      setAssigned((prev) =>
        prev.map((p) => (p.id === pr.id ? { ...p, completed_at: updated.completed_at } : p))
      )
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setActionId(null)
    }
  }

  const assignedIds = new Set(assigned.map((p) => p.resource_id))

  return (
    <div className="space-y-5">
      {err && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      )}

      {/* Tab bar */}
      <div className="flex items-center gap-1 bg-white rounded-xl border border-[#e8e4df] p-1 w-fit">
        {(['assigned', 'library'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`h-9 px-4 rounded-lg text-sm font-medium capitalize transition ${
              tab === t
                ? 'bg-[#d4e4e1] text-[#2d4a47]'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t === 'assigned' ? `Assigned (${assigned.length})` : 'Library'}
          </button>
        ))}
      </div>

      {/* ── Assigned tab ──────────────────────────────────────── */}
      {tab === 'assigned' && (
        <section>
          {loadingA ? (
            <EmptyState icon={Loader2} msg="Loading…" spin />
          ) : assigned.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              msg="No resources assigned"
              sub='Switch to "Library" to browse and assign resources.'
            />
          ) : (
            <ul className="space-y-3">
              {assigned.map((pr) => (
                <li
                  key={pr.id}
                  className={`bg-white rounded-xl border p-5 flex items-start gap-4 ${
                    pr.completed_at ? 'border-[#b8ceca] opacity-80' : 'border-[#e8e4df]'
                  }`}
                >
                  <button
                    onClick={() => handleToggleComplete(pr)}
                    disabled={actionId === pr.id}
                    title={pr.completed_at ? 'Mark incomplete' : 'Mark complete'}
                    className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                      pr.completed_at
                        ? 'bg-[#2d4a47] border-[#2d4a47] text-white'
                        : 'border-gray-300 hover:border-[#2d4a47]'
                    }`}
                  >
                    {pr.completed_at && <Check size={10} strokeWidth={3} />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-semibold text-[#1c1c1e] ${pr.completed_at ? 'line-through text-[#6b7280]' : ''}`}>
                        {pr.resource.title}
                      </p>
                      <KindBadge kind={pr.resource.kind} />
                    </div>
                    {pr.resource.description && (
                      <p className="text-xs text-[#6b7280] mt-1 line-clamp-2">
                        {pr.resource.description}
                      </p>
                    )}
                    {pr.due_date && (
                      <p className="text-xs text-[#9ca3af] mt-1">Due: {pr.due_date}</p>
                    )}
                    {(pr.resource.external_url || pr.resource.file_path) && (
                      <a
                        href={pr.resource.external_url ?? '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-[#2d4a47] hover:underline mt-1"
                      >
                        Open <ExternalLink size={10} />
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => handleUnassign(pr)}
                    disabled={actionId === pr.id}
                    title="Remove"
                    className="shrink-0 h-7 w-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-600 hover:border-red-200 transition disabled:opacity-40"
                  >
                    <X size={13} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* ── Library tab ───────────────────────────────────────── */}
      {tab === 'library' && (
        <section className="space-y-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-lg border border-gray-200 bg-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a3b8b4]"
            />
          </div>

          {loadingL ? (
            <EmptyState icon={Loader2} msg="Loading library…" spin />
          ) : library.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              msg="No resources found"
              sub="Try a different search term, or ask an admin to upload resources."
            />
          ) : (
            <ul className="space-y-3">
              {library.map((r) => {
                const alreadyAssigned = assignedIds.has(r.id)
                return (
                  <li
                    key={r.id}
                    className="bg-white rounded-xl border border-[#e8e4df] p-5 flex items-start gap-4"
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${KIND_META[r.kind]?.color ?? 'bg-gray-100 text-gray-500'}`}>
                      {(() => { const Icon = KIND_META[r.kind]?.icon ?? BookOpen; return <Icon size={16} /> })()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-[#1c1c1e]">{r.title}</p>
                        <KindBadge kind={r.kind} />
                        {r.domain && (
                          <span className="text-[10px] text-[#9ca3af] uppercase tracking-wide">{r.domain}</span>
                        )}
                      </div>
                      {r.description && (
                        <p className="text-xs text-[#6b7280] mt-1 line-clamp-2">{r.description}</p>
                      )}
                      {r.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {r.tags.map((tag) => (
                            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => !alreadyAssigned && handleAssign(r)}
                      disabled={alreadyAssigned || actionId === r.id}
                      title={alreadyAssigned ? 'Already assigned' : 'Assign to patient'}
                      className={`shrink-0 h-8 px-3 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition ${
                        alreadyAssigned
                          ? 'bg-[#d4e4e1] text-[#2d4a47] border-[#b8ceca] cursor-default'
                          : 'bg-[#354744] text-white border-[#354744] hover:bg-[#1a2f2d] disabled:opacity-40'
                      }`}
                    >
                      {alreadyAssigned ? (
                        <><Check size={11} /> Assigned</>
                      ) : actionId === r.id ? (
                        <><Loader2 size={11} className="animate-spin" /> Adding…</>
                      ) : (
                        <><Plus size={11} /> Assign</>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      )}
    </div>
  )
}

function EmptyState({
  icon: Icon,
  msg,
  sub,
  spin,
}: {
  icon: React.ElementType
  msg: string
  sub?: string
  spin?: boolean
}) {
  return (
    <div className="bg-white rounded-xl border border-[#e8e4df] px-6 py-14 text-center">
      <Icon size={28} className={`text-[#e8e4df] mx-auto mb-3 ${spin ? 'animate-spin text-[#a3b8b4]' : ''}`} />
      <p className="text-sm font-medium text-[#6b7280]">{msg}</p>
      {sub && <p className="text-xs text-[#9ca3af] mt-1">{sub}</p>}
    </div>
  )
}
