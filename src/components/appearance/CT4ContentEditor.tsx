'use client'

import { useState } from 'react'
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react'
import type { CT4Content, CT4TrustItem, CT4HeroQuote } from '@/components/booking/templates/templateUtils'
import { DEFAULT_CT4_CONTENT } from '@/components/booking/templates/templateUtils'

interface Props {
  value: CT4Content
  onChange: (val: CT4Content) => void
}

type Section = 'hero' | 'ticker' | 'about' | 'services' | 'faq' | 'insights'

export default function CT4ContentEditor({ value, onChange }: Props) {
  const [open, setOpen] = useState<Section | null>('hero')

  // Resolve quotes array — support both legacy single-quote and new array
  const resolvedQuotes: CT4HeroQuote[] = (() => {
    const h = value.hero as {
      quote?: string
      quote_author?: string
      quotes?: CT4HeroQuote[]
    } | undefined
    if (h?.quotes && h.quotes.length > 0) return h.quotes
    if (h?.quote) return [{ quote: h.quote, quote_author: h.quote_author ?? '' }]
    return DEFAULT_CT4_CONTENT.hero.quotes
  })()

  // CRITICAL: use Array.isArray — NOT .length — to distinguish "user saved an
  // empty list" from "field was never set". An empty [] means the user deleted
  // everything intentionally; it must render as empty, NOT fall back to defaults.
  const c = {
    ticker:   { items: value.ticker?.items ?? DEFAULT_CT4_CONTENT.ticker.items },
    services: Array.isArray(value.services) ? value.services : DEFAULT_CT4_CONTENT.services,
    faq:      Array.isArray(value.faq)      ? value.faq      : DEFAULT_CT4_CONTENT.faq,
    insights: {
      trust_bar: Array.isArray(value.insights?.trust_bar)
        ? value.insights!.trust_bar!
        : DEFAULT_CT4_CONTENT.insights.trust_bar,
    },
  }

  function patch(updates: Partial<CT4Content>) {
    onChange({ ...value, ...updates })
  }

  function patchQuotes(quotes: CT4HeroQuote[]) {
    patch({ hero: { ...(value.hero ?? {}), quotes } })
  }

  function updateQuote(i: number, field: keyof CT4HeroQuote, val: string) {
    const updated = resolvedQuotes.map((q, j) => j === i ? { ...q, [field]: val } : q)
    patchQuotes(updated)
  }

  function removeQuote(i: number) {
    patchQuotes(resolvedQuotes.filter((_, j) => j !== i))
  }

  function addQuote() {
    patchQuotes([...resolvedQuotes, { quote: '', quote_author: '' }])
  }

  const toggle = (s: Section) => setOpen(prev => prev === s ? null : s)

  return (
    <div className="space-y-3">

      {/* ── HERO QUOTES ──────────────────────────────────────────── */}
      <Accordion label="Hero — Rotating Quotes" open={open === 'hero'} onToggle={() => toggle('hero')}>
        <div className="space-y-4">
          <p className="text-xs text-[#9ca3af] mb-1">
            Add as many quotes as you like — they rotate automatically every 5 seconds with a smooth fade transition. Visitors can also click the dots to jump between quotes.
          </p>

          {resolvedQuotes.map((q, i) => (
            <div key={i} className="rounded-lg border border-[#e8e4df] p-3 space-y-2 bg-white">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af]">
                  Quote {String(i + 1).padStart(2, '0')}
                </span>
                <button
                  onClick={() => removeQuote(i)}
                  className="text-[#d1d5db] hover:text-red-400 transition"
                  disabled={resolvedQuotes.length === 1}
                  title={resolvedQuotes.length === 1 ? 'At least one quote is required' : 'Remove quote'}
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <Field label="Quote text">
                <textarea
                  rows={3}
                  value={q.quote}
                  onChange={e => updateQuote(i, 'quote', e.target.value)}
                  placeholder="The curious paradox is that when I accept myself just as I am, then I can change."
                  className={ta}
                />
              </Field>
              <Field label="Attribution (author name)">
                <input
                  value={q.quote_author}
                  onChange={e => updateQuote(i, 'quote_author', e.target.value)}
                  placeholder="Carl R. Rogers"
                  className={inp}
                />
              </Field>
            </div>
          ))}

          <button onClick={addQuote} className={addBtn}>
            <Plus size={13} /> Add quote
          </button>
        </div>
      </Accordion>

      {/* ── TICKER ───────────────────────────────────────────────── */}
      <Accordion label="Ticker Banner — Scrolling Tags" open={open === 'ticker'} onToggle={() => toggle('ticker')}>
        <div className="space-y-2">
          <p className="text-xs text-[#9ca3af] mb-3">
            These short tags scroll across the banner strip. Keep each under 30 characters.
          </p>
          {c.ticker.items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <GripVertical size={14} className="text-[#d1d5db] shrink-0" />
              <input
                value={item}
                onChange={e => {
                  const items = [...c.ticker.items]
                  items[i] = e.target.value
                  patch({ ticker: { items } })
                }}
                className={`${inp} flex-1`}
              />
              <button
                onClick={() => {
                  const items = c.ticker.items.filter((_, j) => j !== i)
                  patch({ ticker: { items } })
                }}
                className="text-[#d1d5db] hover:text-red-400 transition shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button onClick={() => patch({ ticker: { items: [...c.ticker.items, 'New tag'] } })} className={addBtn}>
            <Plus size={13} /> Add tag
          </button>
        </div>
      </Accordion>

      {/* ── ABOUT ────────────────────────────────────────────────── */}
      <Accordion label="About — Bio & Read More" open={open === 'about'} onToggle={() => toggle('about')}>
        <div className="space-y-3">
          <p className="text-xs text-[#9ca3af] mb-1">
            Bio text comes from your profile settings. If the bio exceeds 300 characters, a <strong>Read More</strong> button will automatically appear letting visitors expand the full text.
          </p>
          <div className="rounded-lg border border-dashed border-[#b8ceca] bg-[#f0f8f7] px-4 py-3 text-xs text-[#5a7f7a]">
            <span className="font-semibold">Tip:</span> Write a detailed bio in your Profile settings — the About section will truncate it with a gold "Read More" button automatically once it exceeds 300 characters.
          </div>
        </div>
      </Accordion>

      {/* ── SERVICES ─────────────────────────────────────────────── */}
      <Accordion label="Services - What You Offer" open={open === 'services'} onToggle={() => toggle('services')}>
        <div className="space-y-4">
          <p className="text-xs text-[#9ca3af] mb-1">
            Set a price per service to override the default session fee when a client clicks "Book Now" on that service.
          </p>
          {c.services.map((svc, i) => (
            <div key={i} className="rounded-lg border border-[#e8e4df] p-3 space-y-2 bg-white">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af]">
                  Service {String(i + 1).padStart(2, '0')}
                </span>
                <button
                  onClick={() => patch({ services: c.services.filter((_, j) => j !== i) })}
                  className="text-[#d1d5db] hover:text-red-400 transition"
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <Field label="Service name">
                <input
                  value={svc.name}
                  onChange={e => patch({ services: c.services.map((s, j) => j === i ? { ...s, name: e.target.value } : s) })}
                  placeholder="e.g. Couple Therapy"
                  className={inp}
                />
              </Field>
              <Field label="Description">
                <textarea
                  rows={2}
                  value={svc.desc}
                  onChange={e => patch({ services: c.services.map((s, j) => j === i ? { ...s, desc: e.target.value } : s) })}
                  placeholder="Short description of this service..."
                  className={ta}
                />
              </Field>
              <Field label="Price (₹) — leave blank to use default session fee">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#9ca3af]">₹</span>
                  <input
                    type="number"
                    min={0}
                    value={svc.price ?? ''}
                    onChange={e => {
                      const raw = e.target.value
                      const price = raw === '' ? undefined : Math.max(0, Number(raw))
                      patch({ services: c.services.map((s, j) => j === i ? { ...s, price } : s) })
                    }}
                    placeholder="e.g. 2000"
                    className={`${inp} pl-7`}
                  />
                </div>
              </Field>
            </div>
          ))}
          {c.services.length < 8 && (
            <button onClick={() => patch({ services: [...c.services, { name: 'New Service', desc: '' }] })} className={addBtn}>
              <Plus size={13} /> Add service
            </button>
          )}
        </div>
      </Accordion>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <Accordion label="FAQ — Common Questions" open={open === 'faq'} onToggle={() => toggle('faq')}>
        <div className="space-y-4">
          {c.faq.map((item, i) => (
            <div key={i} className="rounded-lg border border-[#e8e4df] p-3 space-y-2 bg-white">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af]">Q{i + 1}</span>
                <button
                  onClick={() => patch({ faq: c.faq.filter((_, j) => j !== i) })}
                  className="text-[#d1d5db] hover:text-red-400 transition"
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <input
                value={item.q}
                onChange={e => patch({ faq: c.faq.map((f, j) => j === i ? { ...f, q: e.target.value } : f) })}
                placeholder="Question..."
                className={inp}
              />
              <textarea
                rows={3}
                value={item.a}
                onChange={e => patch({ faq: c.faq.map((f, j) => j === i ? { ...f, a: e.target.value } : f) })}
                placeholder="Answer..."
                className={ta}
              />
            </div>
          ))}
          {c.faq.length < 10 && (
            <button onClick={() => patch({ faq: [...c.faq, { q: '', a: '' }] })} className={addBtn}>
              <Plus size={13} /> Add question
            </button>
          )}
        </div>
      </Accordion>

      {/* ── INSIGHTS TRUST BAR ───────────────────────────────────── */}
      <Accordion label="Testimonials — Trust Bar Items" open={open === 'insights'} onToggle={() => toggle('insights')}>
        <div className="space-y-2">
          <p className="text-xs text-[#9ca3af] mb-3">
            Four credential/trust items shown below client testimonials. E.g. "Approach — Integrative · Psychodynamic"
          </p>
          {c.insights.trust_bar.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={item.label}
                onChange={e => {
                  const trust_bar = c.insights.trust_bar.map((t, j) => j === i ? { ...t, label: e.target.value } : t)
                  patch({ insights: { trust_bar } })
                }}
                placeholder="Label"
                className={`${inp} w-32 shrink-0`}
              />
              <span className="text-[#d1d5db] text-sm">→</span>
              <input
                value={item.value}
                onChange={e => {
                  const trust_bar = c.insights.trust_bar.map((t, j) => j === i ? { ...t, value: e.target.value } : t)
                  patch({ insights: { trust_bar } })
                }}
                placeholder="Value"
                className={`${inp} flex-1`}
              />
              <button
                onClick={() => {
                  const trust_bar = c.insights.trust_bar.filter((_, j) => j !== i)
                  patch({ insights: { trust_bar } })
                }}
                className="text-[#d1d5db] hover:text-red-400 transition shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {c.insights.trust_bar.length < 6 && (
            <button
              onClick={() => patch({ insights: { trust_bar: [...c.insights.trust_bar, { label: '', value: '' }] } })}
              className={addBtn}
            >
              <Plus size={13} /> Add item
            </button>
          )}
        </div>
      </Accordion>
    </div>
  )
}

// ── Shared style strings ──────────────────────────────────────────────────

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
      <label className="block text-xs font-semibold text-[#6b7280] mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  )
}

function Accordion({ label, open, onToggle, children }: {
  label: string; open: boolean; onToggle: () => void; children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-[#e8e4df] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#f9f7f5] hover:bg-[#f2f0ed] transition text-left"
      >
        <span className="text-sm font-semibold text-[#1c1c1e]">{label}</span>
        {open ? <ChevronUp size={16} className="text-[#6b7280]" /> : <ChevronDown size={16} className="text-[#6b7280]" />}
      </button>
      {open && (
        <div className="px-4 py-4 bg-[#fdfcfb] border-t border-[#e8e4df]">
          {children}
        </div>
      )}
    </div>
  )
}
