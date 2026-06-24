'use client'

import { useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import type { CT2Content, CT2InsightItem, EditableFAQ, EditableService } from '@/components/booking/templates/templateUtils'
import { DEFAULT_CT2_CONTENT } from '@/components/booking/templates/templateUtils'

interface Props {
  value: CT2Content
  onChange: (val: CT2Content) => void
}

type Section = 'services' | 'insights' | 'faq'

export default function CT2ContentEditor({ value, onChange }: Props) {
  const [open, setOpen] = useState<Section | null>('services')

  // CRITICAL: use Array.isArray — NOT .length — to distinguish "user saved an
  // empty list" from "field was never set". An empty [] means the user deleted
  // everything intentionally; it must render as empty, NOT fall back to defaults.
  const c = {
    services: Array.isArray(value.services) ? value.services : DEFAULT_CT2_CONTENT.services,
    insights: Array.isArray(value.insights) ? value.insights : DEFAULT_CT2_CONTENT.insights,
    faq:      Array.isArray(value.faq)      ? value.faq      : DEFAULT_CT2_CONTENT.faq,
  }

  function patch(updates: Partial<CT2Content>) {
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
                  className="text-[#d1d5db] hover:text-red-400 transition"><Trash2 size={13} /></button>
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
                  placeholder="Description..." className={ta} />
              </Field>
              <Field label="Tags (comma-separated)">
                <input value={(svc.forWhom ?? []).join(', ')}
                  onChange={e => patch({ services: c.services.map((s, j) => j === i ? { ...s, forWhom: e.target.value.split(',').map(t => t.trim()).filter(Boolean) } : s) })}
                  placeholder="e.g. Anxiety, PTSD, Burnout" className={inp} />
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

      {/* ── INSIGHTS ─────────────────────────────────────────────────── */}
      <Accordion label="Insights — Articles & Reflections" open={open === 'insights'} onToggle={() => toggle('insights')}>
        <div className="space-y-4">
          <p className="text-xs text-[#9ca3af] mb-3">
            These appear as editorial cards on your profile. Keep titles and excerpts concise.
          </p>
          {c.insights.map((item, i) => (
            <div key={i} className="rounded-lg border border-[#e8e4df] p-3 space-y-2 bg-white">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af]">Article {i + 1}</span>
                <button onClick={() => patch({ insights: c.insights.filter((_, j) => j !== i) })}
                  className="text-[#d1d5db] hover:text-red-400 transition"><Trash2 size={13} /></button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Number">
                  <input value={item.number}
                    onChange={e => patch({ insights: c.insights.map((s, j) => j === i ? { ...s, number: e.target.value } : s) })}
                    placeholder="001" className={inp} />
                </Field>
                <Field label="Category">
                  <input value={item.category}
                    onChange={e => patch({ insights: c.insights.map((s, j) => j === i ? { ...s, category: e.target.value } : s) })}
                    placeholder="On anxiety" className={inp} />
                </Field>
              </div>
              <Field label="Title">
                <input value={item.title}
                  onChange={e => patch({ insights: c.insights.map((s, j) => j === i ? { ...s, title: e.target.value } : s) })}
                  placeholder="Article title" className={inp} />
              </Field>
              <Field label="Excerpt">
                <textarea rows={2} value={item.excerpt}
                  onChange={e => patch({ insights: c.insights.map((s, j) => j === i ? { ...s, excerpt: e.target.value } : s) })}
                  placeholder="Short excerpt..." className={ta} />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Reading time">
                  <input value={item.readingTime}
                    onChange={e => patch({ insights: c.insights.map((s, j) => j === i ? { ...s, readingTime: e.target.value } : s) })}
                    placeholder="6 min read" className={inp} />
                </Field>
                <Field label="Date">
                  <input value={item.date}
                    onChange={e => patch({ insights: c.insights.map((s, j) => j === i ? { ...s, date: e.target.value } : s) })}
                    placeholder="May 2026" className={inp} />
                </Field>
              </div>
            </div>
          ))}
          {c.insights.length < 6 && (
            <button onClick={() => patch({ insights: [...c.insights, { number: '', category: '', title: '', excerpt: '', readingTime: '', date: '' }] })} className={addBtn}>
              <Plus size={13} /> Add article
            </button>
          )}
        </div>
      </Accordion>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <Accordion label="FAQ — Common Questions" open={open === 'faq'} onToggle={() => toggle('faq')}>
        <div className="space-y-4">
          {c.faq.map((item, i) => (
            <div key={i} className="rounded-lg border border-[#e8e4df] p-3 space-y-2 bg-white">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af]">Q{i + 1}</span>
                <button onClick={() => patch({ faq: c.faq.filter((_, j) => j !== i) })}
                  className="text-[#d1d5db] hover:text-red-400 transition"><Trash2 size={13} /></button>
              </div>
              <input value={item.q}
                onChange={e => patch({ faq: c.faq.map((f, j) => j === i ? { ...f, q: e.target.value } : f) })}
                placeholder="Question..." className={inp} />
              <textarea rows={3} value={item.a}
                onChange={e => patch({ faq: c.faq.map((f, j) => j === i ? { ...f, a: e.target.value } : f) })}
                placeholder="Answer..." className={ta} />
            </div>
          ))}
          {c.faq.length < 10 && (
            <button onClick={() => patch({ faq: [...c.faq, { q: '', a: '' }] })} className={addBtn}>
              <Plus size={13} /> Add question
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
