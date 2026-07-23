'use client'

import { useState } from 'react'
import ContentEditorShell from '@/components/appearance/ContentEditorShell'
import CardPager from '@/components/appearance/CardPager'
import type { CT3Content, EditableFAQ, EditableService } from '@/components/booking/templates/templateUtils'
import { DEFAULT_CT3_CONTENT } from '@/components/booking/templates/templateUtils'

interface Props {
  value: CT3Content
  onChange: (val: CT3Content) => void
  saveButton?: React.ReactNode
}

type Section = 'hero' | 'ticker' | 'nav' | 'services' | 'faq'

// CardPager needs a spreadable object per item — ticker tags are plain
// strings, so we wrap/unwrap them at the boundary instead of touching
// CardPager itself.
type TickerTag = { text: string }

export default function CT3ContentEditor({ value, onChange, saveButton }: Props) {
  const [open, setOpen] = useState<Section | null>(null)

  // CRITICAL: use Array.isArray — NOT .length — to distinguish "user saved an
  // empty list" from "field was never set". An empty [] means the user deleted
  // everything intentionally; it must render as empty, NOT fall back to defaults.
  const c = {
    hero:     { ...DEFAULT_CT3_CONTENT.hero, ...(value.hero ?? {}) },
    footer:   { ...DEFAULT_CT3_CONTENT.footer, ...(value.footer ?? {}) },
    ticker:   { items: value.ticker?.items ?? DEFAULT_CT3_CONTENT.ticker.items },
    nav: {
      reserveLabel: value.nav?.reserveLabel ?? DEFAULT_CT3_CONTENT.nav.reserveLabel,
      labels: { ...DEFAULT_CT3_CONTENT.nav.labels, ...(value.nav?.labels ?? {}) },
    },
    services: Array.isArray(value.services) ? value.services : DEFAULT_CT3_CONTENT.services,
    faq:      Array.isArray(value.faq)      ? value.faq      : DEFAULT_CT3_CONTENT.faq,
  }

  function patch(updates: Partial<CT3Content>) {
    onChange({ ...value, ...updates })
  }

  return (
    <ContentEditorShell
      activeSection={open}
      onSelect={setOpen}
      sections={[
        { id: 'nav', label: 'Nav', meta: 'menu labels' },
        { id: 'hero', label: 'Hero', meta: 'headline text' },
        { id: 'ticker', label: 'Rotating Line', meta: `${c.ticker.items.length} tags` },
        { id: 'services', label: 'Services', meta: `${c.services.length} items` },
        { id: 'faq', label: 'FAQ', meta: `${c.faq.length} questions` },
      ]}
      saveButton={saveButton}
    >

      {/* ── HERO ───────────────────────────────────── */}
      <Accordion open={open === 'hero'}>
        <p className="text-xs text-[#9ca3af] mb-2">This is the big headline shown at the top of your page.</p>
        <Field label="Eyebrow tag — the small label above the headline">
          <input value={c.hero.eyebrow ?? ''} onChange={e => patch({ hero: { ...c.hero, eyebrow: e.target.value } })}
            placeholder="THERAPIST • WELLNESS • CARE" className={inp} />
        </Field>
        <div className="mt-3">
          <Field label="Headline">
            <textarea rows={3} value={c.hero.headline ?? ''}
              onChange={e => patch({ hero: { ...c.hero, headline: e.target.value } })}
              placeholder="Helping you feel safe, heard, and understood." className={ta} />
          </Field>
        </div>
        <div className="mt-3">
          <Field label="Introduction text — shown below the headline">
            <textarea rows={4} value={c.hero.subtitle ?? ''}
              onChange={e => patch({ hero: { ...c.hero, subtitle: e.target.value } })}
              placeholder="Leave blank to use your name and credentials automatically." className={ta} />
          </Field>
        </div>
        <div className="mt-4 pt-4 border-t border-[#e8e4df]">
          <p className="text-xs text-[#9ca3af] mb-2">Footer note — the short line at the bottom of your page (label + text).</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Section label — blank to use your name automatically">
              <input value={c.footer.label ?? ''} onChange={e => patch({ footer: { ...c.footer, label: e.target.value } })}
                placeholder="e.g. Dr. Vansh Makhija" className={inp} />
            </Field>
          </div>
          <div className="mt-3">
            <Field label="Note text — blank to use your credentials & location automatically">
              <textarea rows={2} value={c.footer.note ?? ''}
                onChange={e => patch({ footer: { ...c.footer, note: e.target.value } })}
                placeholder="e.g. Psychotherapy practice based in Mumbai." className={ta} />
            </Field>
          </div>
        </div>
      </Accordion>



      <Accordion open={open === 'ticker'} >
        <p className="text-xs text-[#9ca3af] mb-2">
          Short tags that scroll across the rotating line above your About section. Use the arrows to move between them.
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

      {/* ── MENU ───────────────────────────────────── */}
      <Accordion open={open === 'nav'}>
        <p className="text-xs text-[#9ca3af] mb-2">Change the words shown in your website's top menu.</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="First menu item">
            <input value={c.nav.labels.home ?? ''} onChange={e => patch({ nav: { ...c.nav, labels: { ...c.nav.labels, home: e.target.value } } })}
              placeholder="Cover" className={inp} />
          </Field>
          <Field label="Second menu item">
            <input value={c.nav.labels.about ?? ''} onChange={e => patch({ nav: { ...c.nav, labels: { ...c.nav.labels, about: e.target.value } } })}
              placeholder="Practice" className={inp} />
          </Field>
          <Field label="Third menu item">
            <input value={c.nav.labels.services ?? ''} onChange={e => patch({ nav: { ...c.nav, labels: { ...c.nav.labels, services: e.target.value } } })}
              placeholder="Method" className={inp} />
          </Field>
          <Field label="Fourth menu item">
            <input value={c.nav.labels.insights ?? ''} onChange={e => patch({ nav: { ...c.nav, labels: { ...c.nav.labels, insights: e.target.value } } })}
              placeholder="Writing" className={inp} />
          </Field>
          <Field label="Fifth menu item">
            <input value={c.nav.labels.faq ?? ''} onChange={e => patch({ nav: { ...c.nav, labels: { ...c.nav.labels, faq: e.target.value } } })}
              placeholder="FAQ" className={inp} />
          </Field>
          <Field label="Booking button">
            <input value={c.nav.reserveLabel ?? ''} onChange={e => patch({ nav: { ...c.nav, reserveLabel: e.target.value } })}
              placeholder="Reserve" className={inp} />
          </Field>
        </div>
      </Accordion>

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
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Price (₹) — blank for default">
                    <input type="number" min={0} value={svc.price ?? ''}
                      onChange={e => update({ price: e.target.value === '' ? undefined : e.target.value })}
                      placeholder="1500" className={inp} />
                  </Field>
                  <Field label="Duration (min) — blank for default">
                    <input type="number" min={5} max={360} value={svc.duration_mins ?? ''}
                      onChange={e => update({ duration_mins: e.target.value === '' ? undefined : Number(e.target.value) })}
                      placeholder="50" className={inp} />
                  </Field>
                </div>
                <Field label="Tags (comma-separated)">
                  <input value={(svc.forWhom ?? []).join(', ')}
                    onChange={e => update({ forWhom: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                    placeholder="e.g. Anxiety, PTSD, Somatic" className={inp} />
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
