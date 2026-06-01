'use client'

import { useState } from 'react'
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react'
import type { CT5Content } from '@/components/booking/templates/templateUtils'
import { DEFAULT_CT5_CONTENT } from '@/components/booking/templates/templateUtils'

interface Props {
  value: CT5Content
  onChange: (val: CT5Content) => void
}

type Section = 'ticker' | 'services' | 'faq'

export default function CT5ContentEditor({ value, onChange }: Props) {
  const [open, setOpen] = useState<Section | null>('services')

  const c = {
    ticker:   { items: value.ticker?.items ?? DEFAULT_CT5_CONTENT.ticker.items },
    services: value.services?.length ? value.services : DEFAULT_CT5_CONTENT.services,
    faq:      value.faq?.length      ? value.faq      : DEFAULT_CT5_CONTENT.faq,
  }

  function patch(updates: Partial<CT5Content>) {
    onChange({ ...value, ...updates })
  }

  const toggle = (s: Section) => setOpen(prev => prev === s ? null : s)

  return (
    <div className="space-y-3">

      {/* ── TICKER ───────────────────────────────────────────────────── */}
      <Accordion label="Ticker Banner — Scrolling Tags" open={open === 'ticker'} onToggle={() => toggle('ticker')}>
        <div className="space-y-2">
          <p className="text-xs text-[#9ca3af] mb-3">These short tags scroll across the banner strip. Keep each under 30 characters.</p>
          {c.ticker.items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <GripVertical size={14} className="text-[#d1d5db] shrink-0" />
              <input value={item}
                onChange={e => {
                  const items = [...c.ticker.items]
                  items[i] = e.target.value
                  patch({ ticker: { items } })
                }}
                className={`${inp} flex-1`} />
              <button onClick={() => patch({ ticker: { items: c.ticker.items.filter((_, j) => j !== i) } })}
                className="text-[#d1d5db] hover:text-red-400 transition shrink-0"><Trash2 size={14} /></button>
            </div>
          ))}
          <button onClick={() => patch({ ticker: { items: [...c.ticker.items, 'New tag'] } })} className={addBtn}>
            <Plus size={13} /> Add tag
          </button>
        </div>
      </Accordion>

      {/* ── SERVICES ─────────────────────────────────────────────────── */}
      <Accordion label="Services — What You Offer" open={open === 'services'} onToggle={() => toggle('services')}>
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
                  placeholder="e.g. Individual Therapy" className={inp} />
              </Field>
              <Field label="Badge / tag">
                <input value={svc.tag ?? ''}
                  onChange={e => patch({ services: c.services.map((s, j) => j === i ? { ...s, tag: e.target.value } : s) })}
                  placeholder="e.g. Core Service" className={inp} />
              </Field>
              <Field label="Description">
                <textarea rows={2} value={svc.desc}
                  onChange={e => patch({ services: c.services.map((s, j) => j === i ? { ...s, desc: e.target.value } : s) })}
                  placeholder="Description..." className={ta} />
              </Field>
            </div>
          ))}
          {c.services.length < 8 && (
            <button onClick={() => patch({ services: [...c.services, { name: '', tag: '', desc: '' }] })} className={addBtn}>
              <Plus size={13} /> Add service
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
