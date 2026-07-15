'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import ContentEditorShell from '@/components/appearance/ContentEditorShell'
import CardPager from '@/components/appearance/CardPager'
import type { CT1Content, CT1CarouselSlide, EditableService } from '@/components/booking/templates/templateUtils'
import { DEFAULT_CT1_CONTENT } from '@/components/booking/templates/templateUtils'

interface Props {
  value: CT1Content
  onChange: (val: CT1Content) => void
  saveButton?: React.ReactNode
}

type Section = 'services' | 'carousel'

export default function CT1ContentEditor({ value, onChange, saveButton }: Props) {
  const [open, setOpen] = useState<Section | null>(null)

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
    <ContentEditorShell
      activeSection={open}
      onSelect={setOpen}
      sections={[
        { id: 'services', label: 'Services', meta: `${c.services.length} services`, description: 'Edit the therapy services shown on your public page.' },
        { id: 'carousel', label: 'Insights carousel', meta: `${c.carousel.length} cards`, description: 'Edit quotes, stats, process steps, or testimonials.' },
      ]}
      saveButton={saveButton}
    >

      {/* ── SERVICES ─────────────────────────────────────────────────── */}
      <Accordion open={open === 'services'}>
        <p className="text-xs text-[#9ca3af] mb-2">
          Each card below is one service on your page — like "Individual Therapy" or "Couples Counselling."
          Use the arrows to move between them.
        </p>
        <CardPager<EditableService>
          items={c.services}
          onChange={services => patch({ services })}
          newItem={() => ({ name: '', kind: '', desc: '', forWhom: [] })}
          itemLabel={(svc, i) => svc.name || `Service ${i + 1}`}
          addButtonLabel="Add another service"
          emptyLabel="You haven't added any services yet."
          renderItem={(svc, update) => (
            <div className="grid grid-cols-2 gap-3">
              {/* Left column: name + price */}
              <div className="flex flex-col gap-3">
                <Field label="Service name">
                  <input value={svc.name} onChange={e => update({ name: e.target.value })}
                    placeholder="e.g. Individual Psychotherapy" className={inp} />
                </Field>
                <Field label="Price">
                  <input value={svc.price ?? ''} onChange={e => update({ price: e.target.value })}
                    placeholder="e.g. 1500 or Free" className={inp} />
                </Field>
                <Field label="Kind / subtitle">
                  <input value={svc.kind ?? ''} onChange={e => update({ kind: e.target.value })}
                    placeholder="e.g. One-to-one · weekly" className={inp} />
                </Field>
                <Field label="Tags (comma-separated)">
                  <input value={(svc.forWhom ?? []).join(', ')}
                    onChange={e => update({ forWhom: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                    placeholder="e.g. Anxiety, Burnout" className={inp} />
                </Field>
              </div>
              {/* Right column: description */}
              <div>
                <Field label="Description">
                  <textarea rows={7} value={svc.desc} onChange={e => update({ desc: e.target.value })}
                    placeholder="Short description of this service..." className={ta} />
                </Field>
              </div>
            </div>
          )}
        />
      </Accordion>

      {/* ── CAROUSEL ─────────────────────────────────────────────────── */}
      <Accordion open={open === 'carousel'}>
        <p className="text-xs text-[#9ca3af] mb-2">
          This is the scrolling strip on your page that shows quotes, stats, or client testimonials —
          one card at a time on your live site. Use the arrows below to edit each card.
        </p>
        <CardPager<CT1CarouselSlide>
          items={c.carousel}
          onChange={carousel => patch({ carousel })}
          newItem={() => ({ type: 'quote', tag: 'New card' })}
          itemLabel={(slide, i) => slide.tag || `Card ${i + 1}`}
          addButtonLabel="Add another card"
          emptyLabel="You haven't added any cards yet."
          renderItem={(slide, update) => (
            <>
              <Field label="Badge label">
                <input value={slide.tag} onChange={e => update({ tag: e.target.value })}
                  placeholder="e.g. Guiding Philosophy" className={inp} />
              </Field>
              <Field label="Card type">
                <select value={slide.type}
                  onChange={e => update({ type: e.target.value as CT1CarouselSlide['type'] })}
                  className={inp}>
                  <option value="quote">Quote</option>
                  <option value="stats">Stats</option>
                  <option value="process">Process / how it works</option>
                  <option value="testimonial">Client testimonial</option>
                </select>
              </Field>

              {slide.type === 'quote' && (<>
                <Field label="Quote text">
                  <textarea rows={2} value={slide.text ?? ''} onChange={e => update({ text: e.target.value })}
                    placeholder='"The curious paradox..."' className={ta} />
                </Field>
                <Field label="Author">
                  <input value={slide.author ?? ''} onChange={e => update({ author: e.target.value })}
                    placeholder=" - Carl Rogers" className={inp} />
                </Field>
                <Field label="Sub-caption">
                  <input value={slide.sub ?? ''} onChange={e => update({ sub: e.target.value })}
                    placeholder="On becoming a person" className={inp} />
                </Field>
              </>)}

              {slide.type === 'stats' && (<>
                <Field label="Headline">
                  <input value={slide.headline ?? ''} onChange={e => update({ headline: e.target.value })}
                    placeholder="Proven Results" className={inp} />
                </Field>
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-wider text-[#9ca3af] font-semibold">Stats</p>
                  {(slide.stats ?? []).map((st, si) => (
                    <div key={si} className="flex gap-2 items-center">
                      <input value={st.val}
                        onChange={e => {
                          const stats = (slide.stats ?? []).map((s, k) => k === si ? { ...s, val: e.target.value } : s)
                          update({ stats })
                        }}
                        placeholder="94%" className={`${inp} w-20 shrink-0`} />
                      <input value={st.label}
                        onChange={e => {
                          const stats = (slide.stats ?? []).map((s, k) => k === si ? { ...s, label: e.target.value } : s)
                          update({ stats })
                        }}
                        placeholder="Label" className={`${inp} flex-1`} />
                      <button onClick={() => {
                        const stats = (slide.stats ?? []).filter((_, k) => k !== si)
                        update({ stats })
                      }} className="text-[#d1d5db] hover:text-red-400 transition shrink-0"><Trash2 size={13} /></button>
                    </div>
                  ))}
                  <button onClick={() => update({ stats: [...(slide.stats ?? []), { val: '', label: '' }] })} className={addBtn}>
                    <Plus size={13} /> Add stat
                  </button>
                </div>
              </>)}

              {slide.type === 'process' && (<>
                <Field label="Headline">
                  <input value={slide.headline ?? ''} onChange={e => update({ headline: e.target.value })}
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
                            update({ steps })
                          }}
                          placeholder="01" className={`${inp} w-12 shrink-0`} />
                        <input value={st.t}
                          onChange={e => {
                            const steps = (slide.steps ?? []).map((s, k) => k === si ? { ...s, t: e.target.value } : s)
                            update({ steps })
                          }}
                          placeholder="Step title" className={`${inp} flex-1`} />
                        <button onClick={() => {
                          const steps = (slide.steps ?? []).filter((_, k) => k !== si)
                          update({ steps })
                        }} className="text-[#d1d5db] hover:text-red-400 transition shrink-0"><Trash2 size={13} /></button>
                      </div>
                      <textarea rows={1} value={st.d}
                        onChange={e => {
                          const steps = (slide.steps ?? []).map((s, k) => k === si ? { ...s, d: e.target.value } : s)
                          update({ steps })
                        }}
                        placeholder="Step description" className={ta} />
                    </div>
                  ))}
                  <button onClick={() => update({ steps: [...(slide.steps ?? []), { n: '', t: '', d: '' }] })} className={addBtn}>
                    <Plus size={13} /> Add step
                  </button>
                </div>
              </>)}

              {slide.type === 'testimonial' && (<>
                <Field label="Quote">
                  <textarea rows={2} value={slide.quote ?? ''} onChange={e => update({ quote: e.target.value })}
                    placeholder='"I came in feeling completely lost..."' className={ta} />
                </Field>
                <Field label="Client name">
                  <input value={slide.name ?? ''} onChange={e => update({ name: e.target.value })}
                    placeholder="Karan M." className={inp} />
                </Field>
                <Field label="Role / label">
                  <input value={slide.role ?? ''} onChange={e => update({ role: e.target.value })}
                    placeholder="Client - 2024" className={inp} />
                </Field>
              </>)}
            </>
          )}
        />
      </Accordion>
    </ContentEditorShell>
  )
}

const inp = `w-full px-3 py-1.5 rounded-lg border border-[#e8e4df] text-sm text-[#1c1c1e]
  placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#a3b8b4]
  focus:border-transparent bg-white transition`

const ta = `w-full px-3 py-1.5 rounded-lg border border-[#e8e4df] text-sm text-[#1c1c1e]
  placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#a3b8b4]
  focus:border-transparent bg-white transition resize-none`

const addBtn = `flex items-center gap-1.5 text-xs font-medium text-[#5a7f7a]
  hover:text-[#3d5c58] border border-dashed border-[#b8ceca] rounded-lg
  px-3 py-1.5 w-full justify-center hover:bg-[#f0f8f7] transition`

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#6b7280] mb-1 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}

function Accordion({ open, children }: { open: boolean; children: React.ReactNode }) {
  return open ? <>{children}</> : null
}
