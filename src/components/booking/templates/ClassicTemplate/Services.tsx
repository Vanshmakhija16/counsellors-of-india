'use client'

import type { RefObject } from 'react'
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { useEditableTemplate } from '../edit/EditContext'
import type { EditableService } from '../templateUtils'

export interface ServiceItem {
  code: string
  title: string
  kind: string
  desc: string
  forWhom: string[]
  price?: string
}

interface ServicesProps {
  services: ServiceItem[]
  svcTrackRef: RefObject<HTMLDivElement | null>
  svcCanPrev: boolean
  svcCanNext: boolean
  scrollSvc: (dir: 1 | -1) => void
  defaultFee?: number
  onBookService?: (service: ServiceItem) => void
}

// ── tiny shared edit-mode input styles ───────────────────────────────────
const editInp = `w-full rounded border border-dashed border-[#ff9933] bg-[#fffbf5]/70
  px-2 py-1 text-[#1a1a18] outline-none focus:border-solid focus:ring-2
  focus:ring-[#ff9933]/30 resize-none placeholder:text-[#9a8f80]`

export default function Services({
  services, svcTrackRef, svcCanPrev, svcCanNext, scrollSvc, defaultFee, onBookService,
}: ServicesProps) {
  const { editMode, updateProfileContent } = useEditableTemplate()

  // ── helpers to patch individual service fields ────────────────────────
  function patchService(i: number, patch: Partial<EditableService>) {
    updateProfileContent(pc => {
      const existing: EditableService[] = (pc as any)?.classic?.services ?? services.map(s => ({
        name: s.title, kind: s.kind, desc: s.desc, forWhom: s.forWhom, price: s.price, code: s.code,
      }))
      const updated = existing.map((s, j) => j === i ? { ...s, ...patch } : s)
      return { ...pc, classic: { ...((pc as any)?.classic ?? {}), services: updated } }
    })
  }

  function addService() {
    updateProfileContent(pc => {
      const existing: EditableService[] = (pc as any)?.classic?.services ?? services.map(s => ({
        name: s.title, kind: s.kind, desc: s.desc, forWhom: s.forWhom, price: s.price, code: s.code,
      }))
      const next: EditableService = { name: 'New Service', kind: '', desc: '', forWhom: [] }
      return { ...pc, classic: { ...((pc as any)?.classic ?? {}), services: [...existing, next] } }
    })
  }

  function removeService(i: number) {
    updateProfileContent(pc => {
      const existing: EditableService[] = (pc as any)?.classic?.services ?? services.map(s => ({
        name: s.title, kind: s.kind, desc: s.desc, forWhom: s.forWhom, price: s.price, code: s.code,
      }))
      const updated = existing.filter((_, j) => j !== i)
      return { ...pc, classic: { ...((pc as any)?.classic ?? {}), services: updated } }
    })
  }

  return (
    <section
      id="services"
      className="relative overflow-hidden bg-[#efe7d6] px-6 py-20 lg:px-12 lg:py-24"
      style={{ borderTop: '2px solid #c9b59a' }}
    >
      <div className="pointer-events-none absolute left-[-120px] top-[-80px] h-[320px] w-[320px] rounded-full bg-[#e8dfc8] blur-3xl opacity-60" />
      <div className="pointer-events-none absolute bottom-[-120px] right-[-100px] h-[280px] w-[280px] rounded-full bg-[#e8dfc8] blur-3xl opacity-50" />

      <div className="relative mx-auto max-w-[1180px]">

        {/* Header */}
        <div className="grid gap-10 border-b border-[#e8dfc8] pb-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.30em] text-[#b46b50]">
              Services
            </p>
            <h2
              className="mt-6 text-[34px] leading-[1.02] tracking-[-0.03em] text-[#1a1a18] lg:text-[44px]"
              style={{ fontFamily: 'var(--font-fraunces), serif' }}
            >
              A considered{' '}
              <span className="italic text-[#6b6056]">therapeutic practice.</span>
            </h2>
          </div>
          <div className="flex flex-col justify-end">
            <p className="max-w-[480px] text-[15px] leading-[1.85] text-[#6b6056]">
              Every engagement begins with a thoughtful conversation — creating space to understand
              what you're carrying and whether this practice feels aligned for your journey ahead.
            </p>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative mt-12">
          <>
            <button
              type="button" onClick={() => scrollSvc(-1)} disabled={!svcCanPrev}
              className={[
                'absolute left-0 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border transition-all duration-300 lg:flex',
                svcCanPrev
                  ? 'border-[#e8dfc8] bg-[#efe7d6] text-[#1a1a18] hover:-translate-x-1 hover:border-[#b46b50]'
                  : 'cursor-not-allowed border-[#e8dfc8] bg-[#efe7d6] text-[#6b6056]',
              ].join(' ')}
            >
              <ChevronLeft size={18} strokeWidth={1.5} />
            </button>
            <button
              type="button" onClick={() => scrollSvc(1)} disabled={!svcCanNext}
              className={[
                'absolute right-0 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border transition-all duration-300 lg:flex',
                svcCanNext
                  ? 'border-[#e8dfc8] bg-[#efe7d6] text-[#1a1a18] hover:translate-x-1 hover:border-[#b46b50]'
                  : 'cursor-not-allowed border-[#e8dfc8] bg-[#efe7d6] text-[#6b6056]',
              ].join(' ')}
            >
              <ChevronRight size={18} strokeWidth={1.5} />
            </button>
          </>

          <div
            ref={svcTrackRef}
            className="flex gap-5 pb-2 pt-2 snap-x snap-mandatory overflow-x-auto scroll-smooth no-scrollbar"
          >
            {services.map((s, i) => {
              const price = s.price ?? (defaultFee ? String(defaultFee) : undefined)
              return (
                <article
                  key={i}
                  className={[
                    'group ct-svc-card relative flex flex-col rounded-[24px] border border-[#e8dfc8] bg-[#f5ecd6] p-7 transition-all duration-500 min-w-[280px] max-w-[280px] flex-shrink-0 snap-start',
                    editMode
                      ? 'ring-2 ring-[#ff9933]/20'
                      : 'hover:-translate-y-1 hover:border-[#b46b50] hover:shadow-[0_10px_30px_rgba(0,0,0,0.04)]',
                  ].join(' ')}
                >
                  {/* Delete button in edit mode */}
                  {editMode && (
                    <button
                      type="button"
                      onClick={() => removeService(i)}
                      className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition"
                      title="Remove service"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}

                  {/* Number */}
                  <span
                    className="text-[38px] leading-none text-[#e8dfc8] transition-all duration-500 group-hover:text-[#b46b50]"
                    style={{ fontFamily: 'var(--font-fraunces), serif' }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  {/* Text */}
                  <div className="mt-8 flex-1 space-y-2">
                    {editMode ? (
                      <>
                        <label className="block text-[10px] uppercase tracking-widest text-[#b46b50] font-semibold">Title</label>
                        <input
                          value={s.title}
                          onChange={e => patchService(i, { name: e.target.value })}
                          className={`${editInp} text-[17px] font-semibold text-[#1a1a18]`}
                          placeholder="Service name"
                        />
                        <label className="block text-[10px] uppercase tracking-widest text-[#9ca3af] font-semibold mt-2">Kind / subtitle</label>
                        <input
                          value={s.kind}
                          onChange={e => patchService(i, { kind: e.target.value })}
                          className={`${editInp} text-[13px]`}
                          placeholder="e.g. One-to-one · weekly"
                        />
                        <label className="block text-[10px] uppercase tracking-widest text-[#9ca3af] font-semibold mt-2">Description</label>
                        <textarea
                          rows={3}
                          value={s.desc}
                          onChange={e => patchService(i, { desc: e.target.value })}
                          className={`${editInp} text-[13px]`}
                          placeholder="Short description..."
                        />
                        <label className="block text-[10px] uppercase tracking-widest text-[#9ca3af] font-semibold mt-2">Tags (comma-separated)</label>
                        <input
                          value={(s.forWhom ?? []).join(', ')}
                          onChange={e => patchService(i, { forWhom: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                          className={`${editInp} text-[12px]`}
                          placeholder="Anxiety, Burnout, PTSD"
                        />
                      </>
                    ) : (
                      <>
                        <h3
                          className="text-[19px] font-semibold leading-[1.1] tracking-[-0.03em] text-[#1a1a18]"
                          style={{ fontFamily: 'var(--font-fraunces), serif' }}
                        >
                          {s.title}
                        </h3>
                        <p className="mt-4 text-[14px] leading-[1.85] text-[#6b6056]">{s.desc}</p>
                      </>
                    )}
                  </div>

                  {/* Tags (view mode only — in edit mode they're the comma input above) */}
                  {!editMode && s.forWhom && s.forWhom.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {s.forWhom.map(tag => (
                        <span key={tag} className="rounded-full bg-[#e8dfc8] px-2.5 py-0.5 text-[11px] text-[#6b6056]">{tag}</span>
                      ))}
                    </div>
                  )}

                  {/* Price + Book Now */}
                  <div className="mt-8 border-t border-[#e8dfc8] pt-5">
                    {editMode ? (
                      <div className="mb-4">
                        <label className="block text-[10px] uppercase tracking-widest text-[#9ca3af] font-semibold mb-1">Price (₹) — leave blank for default</label>
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-[#9ca3af]">₹</span>
                          <input
                            type="number"
                            min={0}
                            value={s.price ?? ''}
                            onChange={e => patchService(i, { price: e.target.value === '' ? undefined : e.target.value })}
                            className={`${editInp} pl-6 text-[15px] font-semibold text-[#1a1a18]`}
                            placeholder={defaultFee ? String(defaultFee) : '1500'}
                          />
                        </div>
                      </div>
                    ) : (
                      price != null && (
                        <div className="mb-4 flex items-baseline gap-1.5">
                          <span
                            className="text-[22px] font-semibold leading-none tracking-tight text-[#1a1a18]"
                            style={{ fontFamily: 'var(--font-fraunces), serif' }}
                          >
                            {/^\d+$/.test(price) ? `₹${Number(price).toLocaleString('en-IN')}` : price}
                          </span>
                          {/^\d+$/.test(price) && (
                            <span className="text-[11px] uppercase tracking-[0.2em] text-[#6b6056]">/ session</span>
                          )}
                        </div>
                      )
                    )}

                    {!editMode && (
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); onBookService?.(s) }}
                        className="w-full rounded-xl bg-[#1a1a18] py-3 text-[11px] font-bold uppercase tracking-[0.26em] text-[#f5ecd6] transition-all duration-200 hover:bg-[#b46b50] hover:shadow-md active:scale-[0.98]"
                      >
                        Book Now →
                      </button>
                    )}
                  </div>
                </article>
              )
            })}

            {/* Add service card — edit mode only */}
            {editMode && (
              <button
                type="button"
                onClick={addService}
                className="flex min-w-[280px] w-[280px] flex-shrink-0 flex-col items-center justify-center gap-3 rounded-[24px] border-2 border-dashed border-[#b46b50]/40 bg-[#f5ecd6]/50 p-7 text-[#b46b50] transition hover:border-[#b46b50] hover:bg-[#f5ecd6]"
              >
                <Plus size={28} strokeWidth={1.5} />
                <span className="text-[13px] font-semibold uppercase tracking-widest">Add service</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
