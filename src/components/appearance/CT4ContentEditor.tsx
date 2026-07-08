'use client'

import { useState } from 'react'
import ContentEditorShell from '@/components/appearance/ContentEditorShell'
import CardPager from '@/components/appearance/CardPager'
import type { CT4Content, CT4TrustItem, CT4HeroQuote, EditableFAQ, EditableService } from '@/components/booking/templates/templateUtils'
import { DEFAULT_CT4_CONTENT } from '@/components/booking/templates/templateUtils'

interface Props {
  value: CT4Content
  onChange: (val: CT4Content) => void
  saveButton?: React.ReactNode
}

type Section = 'hero' | 'ticker' | 'about' | 'services' | 'faq' | 'insights'

// CardPager needs a spreadable object per item — ticker tags are plain
// strings, so we wrap/unwrap them at the boundary instead of touching
// CardPager itself (which CT1's services & carousel already depend on).
type TickerTag = { text: string }

export default function CT4ContentEditor({ value, onChange, saveButton }: Props) {
  const [open, setOpen] = useState<Section | null>(null)

  // Resolve quotes array - support both legacy single-quote and new array
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

  // CRITICAL: use Array.isArray - NOT .length - to distinguish "user saved an
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

  const toggle = (s: Section) => setOpen(prev => prev === s ? null : s)

  return (
    <ContentEditorShell
      activeSection={open}
      onSelect={setOpen}
      sections={[
        { id: 'hero', label: 'Hero quotes', meta: `${resolvedQuotes.length} quotes` },
        { id: 'ticker', label: 'Ticker banner', meta: `${c.ticker.items.length} tags` },
        { id: 'about', label: 'About', meta: 'Profile bio' },
        { id: 'services', label: 'Services', meta: `${c.services.length} items` },
        { id: 'faq', label: 'FAQ', meta: `${c.faq.length} questions` },
        { id: 'insights', label: 'Trust bar', meta: `${c.insights.trust_bar.length} items` },
      ]}
      saveButton={saveButton}
    >

      {/* ── HERO QUOTES ──────────────────────────────────────────── */}
      <Accordion label="Hero" open={open === 'hero'} onToggle={() => toggle('hero')}>
        <p className="text-xs text-[#9ca3af] mb-2">
          These rotate automatically on your live page. Use the arrows to move between quotes.
        </p>
        <CardPager<CT4HeroQuote>
          items={resolvedQuotes}
          onChange={patchQuotes}
          newItem={() => ({ quote: '', quote_author: '' })}
          itemLabel={(q, i) => q.quote_author || `Quote ${i + 1}`}
          addButtonLabel="Add quote"
          emptyLabel="You haven't added any quotes yet."
          renderItem={(q, update) => (
            <>
              <Field label="Quote text">
                <textarea
                  rows={3}
                  value={q.quote}
                  onChange={e => update({ quote: e.target.value })}
                  placeholder="The curious paradox is that when I accept myself just as I am, then I can change."
                  className={ta}
                />
              </Field>
              <Field label="Attribution (author name)">
                <input
                  value={q.quote_author}
                  onChange={e => update({ quote_author: e.target.value })}
                  placeholder="Carl R. Rogers"
                  className={inp}
                />
              </Field>
            </>
          )}
        />
      </Accordion>

      {/* ── TICKER ───────────────────────────────────────────────── */}
      <Accordion label="Ticker Banner" open={open === 'ticker'} onToggle={() => toggle('ticker')}>
        <p className="text-xs text-[#9ca3af] mb-2">
          Short tags that scroll across the banner. Use the arrows to move between them.
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

      {/* ── ABOUT ────────────────────────────────────────────────── */}
      <Accordion label="About" open={open === 'about'} onToggle={() => toggle('about')}>
        <div className="rounded-lg border border-dashed border-[#b8ceca] bg-[#f0f8f7] px-4 py-3 text-xs text-[#5a7f7a]">
          <span className="font-semibold">Tip:</span> Write a detailed bio in your Profile settings - the About section will truncate it with a gold "Read More" button automatically once it exceeds 300 characters.
        </div>
      </Accordion>

      {/* ── SERVICES ─────────────────────────────────────────────── */}
      <Accordion label="Services" open={open === 'services'} onToggle={() => toggle('services')}>
        <p className="text-xs text-[#9ca3af] mb-2">
          Use the arrows to move between the services listed on your page.
        </p>
        <CardPager<EditableService>
          items={c.services}
          onChange={services => patch({ services })}
          newItem={() => ({ name: 'New Service', desc: '' })}
          itemLabel={(svc, i) => svc.name || `Service ${i + 1}`}
          addButtonLabel="Add service"
          emptyLabel="You haven't added any services yet."
          renderItem={(svc, update) => (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Field label="Service name">
                  <input value={svc.name} onChange={e => update({ name: e.target.value })}
                    placeholder="e.g. Couple Therapy" className={inp} />
                </Field>
                <Field label="Price (₹) - blank uses default fee">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#9ca3af]">₹</span>
                    <input type="number" min={0} value={svc.price ?? ''}
                      onChange={e => { const raw = e.target.value; update({ price: raw === '' ? undefined : raw }) }}
                      placeholder="e.g. 2000" className={`${inp} pl-7`} />
                  </div>
                </Field>
                <Field label="Duration (min) - blank uses default">
                  <input type="number" min={5} max={360} value={svc.duration_mins ?? ''}
                    onChange={e => update({ duration_mins: e.target.value === '' ? undefined : Number(e.target.value) })}
                    placeholder="e.g. 60" className={inp} />
                </Field>
              </div>
              <div>
                <Field label="Description">
                  <textarea rows={6} value={svc.desc} onChange={e => update({ desc: e.target.value })}
                    placeholder="Short description of this service..." className={ta} style={{ minHeight: '130px' }} />
                </Field>
              </div>
            </div>
          )}
        />
      </Accordion>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <Accordion label="FAQ " open={open === 'faq'} onToggle={() => toggle('faq')}>
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

      {/* ── INSIGHTS TRUST BAR ───────────────────────────────────── */}
      <Accordion label="Testimonials - Trust Bar Items" open={open === 'insights'} onToggle={() => toggle('insights')}>
        <p className="text-xs text-[#9ca3af] mb-2">
          Credential/trust items shown below testimonials. Use the arrows to move between them.
        </p>
        <CardPager<CT4TrustItem>
          items={c.insights.trust_bar}
          onChange={trust_bar => patch({ insights: { trust_bar } })}
          newItem={() => ({ label: '', value: '' })}
          itemLabel={(item, i) => item.label || `Item ${i + 1}`}
          maxItems={6}
          addButtonLabel="Add item"
          emptyLabel="You haven't added any trust bar items yet."
          renderItem={(item, update) => (
            <>
              <Field label="Label">
                <input value={item.label} onChange={e => update({ label: e.target.value })}
                  placeholder="Label" className={inp} />
              </Field>
              <Field label="Value">
                <input value={item.value} onChange={e => update({ value: e.target.value })}
                  placeholder="Value" className={inp} />
              </Field>
            </>
          )}
        />
      </Accordion>
    </ContentEditorShell>
  )
}

// ── Shared style strings ──────────────────────────────────────────────────

const inp = `w-full px-3 py-1.5 rounded-lg border border-[#e8e4df] text-sm text-[#1c1c1e]
  placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#a3b8b4]
  focus:border-transparent bg-white transition`

const ta = `w-full px-3 py-1.5 rounded-lg border border-[#e8e4df] text-sm text-[#1c1c1e]
  placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#a3b8b4]
  focus:border-transparent bg-white transition resize-none`

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#6b7280] mb-1 uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  )
}

function Accordion({ label, open, onToggle, children }: {
  label: string; open: boolean; onToggle: () => void; children: React.ReactNode
}) {
  void label
  void onToggle
  return open ? <>{children}</> : null
}
