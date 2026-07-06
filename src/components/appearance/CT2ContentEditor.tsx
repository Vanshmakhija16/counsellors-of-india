'use client'

import { useState } from 'react'
import ContentEditorShell from '@/components/appearance/ContentEditorShell'
import CardPager from '@/components/appearance/CardPager'
import type { CT2Content, CT2InsightItem, EditableFAQ, EditableService } from '@/components/booking/templates/templateUtils'
import { DEFAULT_CT2_CONTENT } from '@/components/booking/templates/templateUtils'

interface Props {
  value: CT2Content
  onChange: (val: CT2Content) => void
  saveButton?: React.ReactNode
}

type Section = 'services' | 'insights' | 'faq'

export default function CT2ContentEditor({ value, onChange, saveButton }: Props) {
  const [open, setOpen] = useState<Section | null>(null)

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

  return (
    <ContentEditorShell
      activeSection={open}
      onSelect={setOpen}
      sections={[
        { id: 'services', label: 'Services', meta: `${c.services.length} items` },
        { id: 'insights', label: 'Insights', meta: `${c.insights.length} articles` },
        { id: 'faq', label: 'FAQ', meta: `${c.faq.length} questions` },
      ]}
      saveButton={saveButton}
    >

      {/* ── SERVICES ─────────────────────────────────────────────────── */}
      <Accordion open={open === 'services'}>
        <p className="text-xs text-[#9ca3af] mb-2">Use the arrows to move between the services listed on your page.</p>
        <CardPager<EditableService>
          items={c.services}
          onChange={services => patch({ services })}
          newItem={() => ({ name: '', kind: '', desc: '', forWhom: [] })}
          itemLabel={(svc, i) => svc.name || `Service ${i + 1}`}
          addButtonLabel="Add service"
          emptyLabel="You haven't added any services yet."
          renderItem={(svc, update) => (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Field label="Service name">
                  <input value={svc.name} onChange={e => update({ name: e.target.value })}
                    placeholder="e.g. Individual Psychotherapy" className={inp} />
                </Field>
                <Field label="Kind / subtitle">
                  <input value={svc.kind ?? ''} onChange={e => update({ kind: e.target.value })}
                    placeholder="e.g. One-to-one · weekly" className={inp} />
                </Field>
                <Field label="Tags (comma-separated)">
                  <input value={(svc.forWhom ?? []).join(', ')}
                    onChange={e => update({ forWhom: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                    placeholder="e.g. Anxiety, PTSD, Burnout" className={inp} />
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

      {/* ── INSIGHTS ─────────────────────────────────────────────────── */}
      <Accordion open={open === 'insights'}>
        <p className="text-xs text-[#9ca3af] mb-2">
          These appear as editorial cards on your profile. Use the arrows to move between articles.
        </p>
        <CardPager<CT2InsightItem>
          items={c.insights}
          onChange={insights => patch({ insights })}
          newItem={() => ({ number: '', category: '', title: '', excerpt: '', readingTime: '', date: '' })}
          itemLabel={(item, i) => item.title || `Article ${i + 1}`}
          maxItems={6}
          addButtonLabel="Add article"
          emptyLabel="You haven't added any articles yet."
          renderItem={(item, update) => (
            <>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Number">
                  <input value={item.number} onChange={e => update({ number: e.target.value })}
                    placeholder="001" className={inp} />
                </Field>
                <Field label="Category">
                  <input value={item.category} onChange={e => update({ category: e.target.value })}
                    placeholder="On anxiety" className={inp} />
                </Field>
              </div>
              <Field label="Title">
                <input value={item.title} onChange={e => update({ title: e.target.value })}
                  placeholder="Article title" className={inp} />
              </Field>
              <Field label="Excerpt">
                <textarea rows={2} value={item.excerpt} onChange={e => update({ excerpt: e.target.value })}
                  placeholder="Short excerpt..." className={ta} />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Reading time">
                  <input value={item.readingTime} onChange={e => update({ readingTime: e.target.value })}
                    placeholder="6 min read" className={inp} />
                </Field>
                <Field label="Date">
                  <input value={item.date} onChange={e => update({ date: e.target.value })}
                    placeholder="May 2026" className={inp} />
                </Field>
              </div>
            </>
          )}
        />
      </Accordion>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <Accordion open={open === 'faq'}>
        <p className="text-xs text-[#9ca3af] mb-2">Use the arrows to move between questions.</p>
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

const inp = `w-full px-3 py-1.5 rounded-lg border border-[#e8e4df] text-sm text-[#1c1c1e]
  placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#a3b8b4]
  focus:border-transparent bg-white transition`

const ta = `w-full px-3 py-1.5 rounded-lg border border-[#e8e4df] text-sm text-[#1c1c1e]
  placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#a3b8b4]
  focus:border-transparent bg-white transition resize-none`

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
