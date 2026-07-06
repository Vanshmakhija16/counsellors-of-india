'use client'

import { useState } from 'react'
import ContentEditorShell from '@/components/appearance/ContentEditorShell'
import CardPager from '@/components/appearance/CardPager'
import type { CT5Content, EditableFAQ, EditableService } from '@/components/booking/templates/templateUtils'
import { DEFAULT_CT5_CONTENT } from '@/components/booking/templates/templateUtils'

interface Props {
  value: CT5Content
  onChange: (val: CT5Content) => void
  saveButton?: React.ReactNode
}

type Section = 'ticker' | 'services' | 'faq'

// CardPager needs a spreadable object per item — ticker tags are plain
// strings, so we wrap/unwrap them at the boundary instead of touching
// CardPager itself (which CT1's services & carousel already depend on).
type TickerTag = { text: string }

export default function CT5ContentEditor({ value, onChange, saveButton }: Props) {
  const [open, setOpen] = useState<Section | null>(null)

  // CRITICAL: use Array.isArray — NOT .length — to distinguish "user saved an
  // empty list" from "field was never set". An empty [] means the user deleted
  // everything intentionally; it must render as empty, NOT fall back to defaults.
  const tickerItems = value.ticker?.items ?? DEFAULT_CT5_CONTENT.ticker.items ?? []
  const c = {
    ticker:   { items: tickerItems },
    services: Array.isArray(value.services) ? value.services : DEFAULT_CT5_CONTENT.services,
    faq:      Array.isArray(value.faq)      ? value.faq      : DEFAULT_CT5_CONTENT.faq,
  }

  function patch(updates: Partial<CT5Content>) {
    onChange({ ...value, ...updates })
  }

  return (
    <ContentEditorShell
      activeSection={open}
      onSelect={setOpen}
      sections={[
        { id: 'ticker', label: 'Ticker banner', meta: `${c.ticker.items.length} tags` },
        { id: 'services', label: 'Services', meta: `${c.services.length} items` },
        { id: 'faq', label: 'FAQ', meta: `${c.faq.length} questions` },
      ]}
      saveButton={saveButton}
    >

      {/* ── TICKER ───────────────────────────────────────────────────── */}
      <Accordion open={open === 'ticker'}>
        <p className="text-xs text-[#9ca3af] mb-3">
          These short tags scroll across the banner strip. Keep each under 30 characters. Use the arrows to move between them.
        </p>
        <CardPager<TickerTag>
          items={c.ticker.items.map(text => ({ text }))}
          onChange={tags => patch({ ticker: { items: tags.map(t => t.text) } })}
          newItem={() => ({ text: 'New tag' })}
          itemLabel={(t, i) => t.text || `Tag ${i + 1}`}
          maxItems={20}
          addButtonLabel="Add tag"
          emptyLabel="You haven't added any tags yet."
          renderItem={(t, update) => (
            <Field label="Tag text">
              <input value={t.text} onChange={e => update({ text: e.target.value })} className={inp} />
            </Field>
          )}
        />
      </Accordion>

      {/* ── SERVICES ─────────────────────────────────────────────────── */}
      <Accordion open={open === 'services'}>
        <p className="text-xs text-[#9ca3af] mb-3">Use the arrows to move between the services listed on your page.</p>
        <CardPager<EditableService>
          items={c.services}
          onChange={services => patch({ services })}
          newItem={() => ({ name: '', tag: '', desc: '' })}
          itemLabel={(svc, i) => svc.name || `Service ${i + 1}`}
          addButtonLabel="Add service"
          emptyLabel="You haven't added any services yet."
          renderItem={(svc, update) => (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Field label="Service name">
                  <input value={svc.name} onChange={e => update({ name: e.target.value })}
                    placeholder="e.g. Individual Therapy" className={inp} />
                </Field>
                <Field label="Badge / tag">
                  <input value={svc.tag ?? ''} onChange={e => update({ tag: e.target.value })}
                    placeholder="e.g. Core Service" className={inp} />
                </Field>
              </div>
              <div>
                <Field label="Description">
                  <textarea rows={6} value={svc.desc} onChange={e => update({ desc: e.target.value })}
                    placeholder="Description..." className={ta} style={{ minHeight: '130px' }} />
                </Field>
              </div>
            </div>
          )}
        />
      </Accordion>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <Accordion open={open === 'faq'}>
        <p className="text-xs text-[#9ca3af] mb-3">Use the arrows to move between questions.</p>
        <CardPager<EditableFAQ>
          items={c.faq}
          onChange={faq => patch({ faq })}
          newItem={() => ({ q: '', a: '' })}
          itemLabel={(item, i) => item.q || `Question ${i + 1}`}
          maxItems={10}
          addButtonLabel="Add question"
          emptyLabel="You haven't added any questions yet."
          renderItem={(item, update) => (
            <>
              <Field label="Question">
                <input value={item.q} onChange={e => update({ q: e.target.value })}
                  placeholder="Question..." className={inp} />
              </Field>
              <Field label="Answer">
                <textarea rows={3} value={item.a} onChange={e => update({ a: e.target.value })}
                  placeholder="Answer..." className={ta} />
              </Field>
            </>
          )}
        />
      </Accordion>
    </ContentEditorShell>
  )
}

const inp = `w-full px-3 py-2 rounded-lg border border-[#e8e4df] text-sm text-[#1c1c1e]
  placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#a3b8b4]
  focus:border-transparent bg-white transition`

const ta = `w-full px-3 py-2 rounded-lg border border-[#e8e4df] text-sm text-[#1c1c1e]
  placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#a3b8b4]
  focus:border-transparent bg-white transition resize-none`

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#6b7280] mb-1.5 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}

function Accordion({ open, children }: { open: boolean; children: React.ReactNode }) {
  return open ? <>{children}</> : null
}
