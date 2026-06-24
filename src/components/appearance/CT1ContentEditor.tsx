'use client'

import { useState } from 'react'
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react'
import type { CT1Content, CT1CarouselSlide, EditableService } from '@/components/booking/templates/templateUtils'
import { DEFAULT_CT1_CONTENT } from '@/components/booking/templates/templateUtils'

interface Props {
  value: CT1Content
  onChange: (val: CT1Content) => void
}

type Section = 'services' | 'carousel'

export default function CT1ContentEditor({ value, onChange }: Props) {
  const [open, setOpen] = useState<Section | null>('services')

  // CRITICAL: use Array.isArray — NOT .length — to distinguish "user saved an
  // empty list" from "field was never set". An empty [] means the user deleted
  // everything intentionally; it must render as empty, NOT fall back to defaults.
  const c = {
    services: Array.isArray(value.services) ? value.services : DEFAULT_CT1_CONTENT.services,
    carousel: Array.isArray(value.carousel) ? value.carousel : DEFAULT_CT1_CONTENT.carousel,
  }

  function patch(updates: Partial<CT1Content>) {
    onChange({ ...value, ...updates })
  }

  const toggle = (s: Section) => setOpen(prev => prev === s ? null : s)

  return (
    <div className="space-y-3">

      {/* ── SERVICES ─────────────────────────────────────────────────── */}
      <Accordion label="Services - What You Offer" open={open === 'services'} onToggle={() => toggle('services')}>
        <div className="space-y-4">
          {c.services.map((svc, i) => (
            <div key={i} className="rounded-lg border border-[#e8e4df] p-3 space-y-2 bg-white">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af]">
                  Service {String(i + 1).padStart(2, '0')}
                </span>
                <button onClick={() => patch({ services: c.services.filter((_, j) => j !== i) })}
                  className="text-[#d1d5db] hover:text-red-400 transition">
                  <Trash2 size={13} />
                </button>
              </div>
              <Field label="Service name">
                <input value={svc.name}
                  onChange={e => patch({ services: c.services.map((s, j) => j === i ? { ...s, name: e.target.value } : s) })}
                  placeholder="e.g. Individual Psychotherapy" className={inp} />
              </Field>
              <Field label="Kind / subtitle">
                <input value={svc.kind ?? ''}
                  onChange={e => patch({ services: c.services.map((s, j) => j === i ? { ...s, kind: e.target.value } : s) })}
                  placeholder="e.g. One-to-one · weekly" className={inp} />
              </Field>
              <Field label="Description">
                <textarea rows={2} value={svc.desc}
                  onChange={e => patch({ services: c.services.map((s, j) => j === i ? { ...s, desc: e.target.value } : s) })}
                  placeholder="Short description..." className={ta} />
              </Field>
              <Field label="Tags (comma-separated)">
                <input value={(svc.forWhom ?? []).join(', ')}
                  onChange={e => patch({ services: c.services.map((s, j) => j === i ? { ...s, forWhom: e.target.value.split(',').map(t => t.trim()).filter(Boolean) } : s) })}
                  placeholder="e.g. Anxiety, Burnout, Self-Esteem" className={inp} />
              </Field>
            </div>
          ))}
          {c.services.length < 8 && (
            <button onClick={() => patch({ services: [...c.services, { name: '', kind: '', desc: '', forWhom: [] }] })} className={addBtn}>
              <Plus size={13} /> Add service
            </button>
          )}
        </div>
      </Accordion>

      {/* ── CAROUSEL ─────────────────────────────────────────────────── */}
      <Accordion label="Insights Carousel — Slides" open={open === 'carousel'} onToggle={() => toggle('carousel')}>
        <div className="space-y-4">
          <p className="text-xs text-[#9ca3af] mb-3">
            Each slide has a type. Fill in the fields relevant to that type.
          </p>
          {c.carousel.map((slide, i) => (
            <div key={i} className="rounded-lg border border-[#e8e4df] p-3 space-y-2 bg-white">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af]">Slide {i + 1}</span>
                <button onClick={() => patch({ carousel: c.carousel.filter((_, j) => j !== i) })}
                  className="text-[#d1d5db] hover:text-red-400 transition">
                  <Trash2 size={13} />
                </button>
              </div>
              <Field label="Tag (badge label)">
                <input value={slide.tag}
                  onChange={e => patch({ carousel: c.carousel.map((s, j) => j === i ? { ...s, tag: e.target.value } : s) })}
                  placeholder="e.g. Guiding Philosophy" className={inp} />
              </Field>
              <Field label="Type">
                <select value={slide.type}
                  onChange={e => patch({ carousel: c.carousel.map((s, j) => j === i ? { ...s, type: e.target.value as CT1CarouselSlide['type'] } : s) })}
                  className={inp}>
                  <option value="quote">Quote</option>
                  <option value="stats">Stats</option>
                  <option value="process">Process</option>
                  <option value="testimonial">Testimonial</option>
                </select>
              </Field>
              {slide.type === 'quote' && (<>
                <Field label="Quote text">
                  <textarea rows={2} value={slide.text ?? ''}
                    onChange={e => patch({ carousel: c.carousel.map((s, j) => j === i ? { ...s, text: e.target.value } : s) })}
                    placeholder='"The curious paradox..."' className={ta} />
                </Field>
                <Field label="Author">
                  <input value={slide.author ?? ''}
                    onChange={e => patch({ carousel: c.carousel.map((s, j) => j === i ? { ...s, author: e.target.value } : s) })}
                    placeholder="— Carl Rogers" className={inp} />
                </Field>
                <Field label="Sub-caption">
                  <input value={slide.sub ?? ''}
                    onChange={e => patch({ carousel: c.carousel.map((s, j) => j === i ? { ...s, sub: e.target.value } : s) })}
                    placeholder="On becoming a person" className={inp} />
                </Field>
              </>)}
              {slide.type === 'stats' && (<>
                <Field label="Headline">
                  <input value={slide.headline ?? ''}
                    onChange={e => patch({ carousel: c.carousel.map((s, j) => j === i ? { ...s, headline: e.target.value } : s) })}
                    placeholder="Proven Results" className={inp} />
                </Field>
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-wider text-[#9ca3af] font-semibold">Stats</p>
                  {(slide.stats ?? []).map((st, si) => (
                    <div key={si} className="flex gap-2 items-center">
                      <input value={st.val}
                        onChange={e => {
                          const stats = (slide.stats ?? []).map((s, k) => k === si ? { ...s, val: e.target.value } : s)
                          patch({ carousel: c.carousel.map((s, j) => j === i ? { ...s, stats } : s) })
                        }}
                        placeholder="94%" className={`${inp} w-20 shrink-0`} />
                      <input value={st.label}
                        onChange={e => {
                          const stats = (slide.stats ?? []).map((s, k) => k === si ? { ...s, label: e.target.value } : s)
                          patch({ carousel: c.carousel.map((s, j) => j === i ? { ...s, stats } : s) })
                        }}
                        placeholder="Label" className={`${inp} flex-1`} />
                      <button onClick={() => {
                        const stats = (slide.stats ?? []).filter((_, k) => k !== si)
                        patch({ carousel: c.carousel.map((s, j) => j === i ? { ...s, stats } : s) })
                      }} className="text-[#d1d5db] hover:text-red-400 transition shrink-0"><Trash2 size={13} /></button>
                    </div>
                  ))}
                  <button onClick={() => {
                    const stats = [...(slide.stats ?? []), { val: '', label: '' }]
                    patch({ carousel: c.carousel.map((s, j) => j === i ? { ...s, stats } : s) })
                  }} className={addBtn}><Plus size={13} /> Add stat</button>
                </div>
              </>)}
              {slide.type === 'process' && (<>
                <Field label="Headline">
                  <input value={slide.headline ?? ''}
                    onChange={e => patch({ carousel: c.carousel.map((s, j) => j === i ? { ...s, headline: e.target.value } : s) })}
                    placeholder="How We Work Together" className={inp} />
                </Field>
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-wider text-[#9ca3af] font-semibold">Steps</p>
                  {(slide.steps ?? []).map((st, si) => (
                    <div key={si} className="rounded border border-[#f0ece8] p-2 space-y-1.5 bg-[#fdfcfb]">
                      <div className="flex gap-2">
                        <input value={st.n}
                          onChange={e => {
                            const steps = (slide.steps ?? []).map((s, k) => k === si ? { ...s, n: e.target.value } : s)
                            patch({ carousel: c.carousel.map((s, j) => j === i ? { ...s, steps } : s) })
                          }}
                          placeholder="01" className={`${inp} w-12 shrink-0`} />
                        <input value={st.t}
                          onChange={e => {
                            const steps = (slide.steps ?? []).map((s, k) => k === si ? { ...s, t: e.target.value } : s)
                            patch({ carousel: c.carousel.map((s, j) => j === i ? { ...s, steps } : s) })
                          }}
                          placeholder="Step title" className={`${inp} flex-1`} />
                        <button onClick={() => {
                          const steps = (slide.steps ?? []).filter((_, k) => k !== si)
                          patch({ carousel: c.carousel.map((s, j) => j === i ? { ...s, steps } : s) })
                        }} className="text-[#d1d5db] hover:text-red-400 transition shrink-0"><Trash2 size={13} /></button>
                      </div>
                      <textarea rows={1} value={st.d}
                        onChange={e => {
                          const steps = (slide.steps ?? []).map((s, k) => k === si ? { ...s, d: e.target.value } : s)
                          patch({ carousel: c.carousel.map((s, j) => j === i ? { ...s, steps } : s) })
                        }}
                        placeholder="Step description" className={ta} />
                    </div>
                  ))}
                  <button onClick={() => {
                    const steps = [...(slide.steps ?? []), { n: '', t: '', d: '' }]
                    patch({ carousel: c.carousel.map((s, j) => j === i ? { ...s, steps } : s) })
                  }} className={addBtn}><Plus size={13} /> Add step</button>
                </div>
              </>)}
              {slide.type === 'testimonial' && (<>
                <Field label="Quote">
                  <textarea rows={2} value={slide.quote ?? ''}
                    onChange={e => patch({ carousel: c.carousel.map((s, j) => j === i ? { ...s, quote: e.target.value } : s) })}
                    placeholder='"I came in feeling completely lost..."' className={ta} />
                </Field>
                <Field label="Client name">
                  <input value={slide.name ?? ''}
                    onChange={e => patch({ carousel: c.carousel.map((s, j) => j === i ? { ...s, name: e.target.value } : s) })}
                    placeholder="Karan M." className={inp} />
                </Field>
                <Field label="Role / label">
                  <input value={slide.role ?? ''}
                    onChange={e => patch({ carousel: c.carousel.map((s, j) => j === i ? { ...s, role: e.target.value } : s) })}
                    placeholder="Client — 2024" className={inp} />
                </Field>
              </>)}
            </div>
          ))}
          {c.carousel.length < 8 && (
            <button onClick={() => patch({ carousel: [...c.carousel, { type: 'quote', tag: 'New Slide' }] })} className={addBtn}>
              <Plus size={13} /> Add slide
            </button>
          )}
        </div>
      </Accordion>
    </div>
  )
}

const inp = `w-full px-3 py-2 rounded-lg border border-[#e8e4df] text-sm text-[#1c1c1e]
  placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#a3b8b4]
  focus:border-transparent bg-white transition`

const ta = `w-full px-3 py-2 rounded-lg border border-[#e8e4df] text-sm text-[#1c1c1e]
  placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#a3b8b4]
  focus:border-transparent bg-white transition resize-none`

const addBtn = `flex items-center gap-1.5 text-xs font-medium text-[#5a7f7a]
  hover:text-[#3d5c58] border border-dashed border-[#b8ceca] rounded-lg
  px-3 py-2 w-full justify-center hover:bg-[#f0f8f7] transition`

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#6b7280] mb-1.5 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}

function Accordion({ label, open, onToggle, children }: { label: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#e8e4df] overflow-hidden">
      <button onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#f9f7f5] hover:bg-[#f2f0ed] transition text-left">
        <span className="text-sm font-semibold text-[#1c1c1e]">{label}</span>
        {open ? <ChevronUp size={16} className="text-[#6b7280]" /> : <ChevronDown size={16} className="text-[#6b7280]" />}
      </button>
      {open && <div className="px-4 py-4 bg-[#fdfcfb] border-t border-[#e8e4df]">{children}</div>}
    </div>
  )
}
