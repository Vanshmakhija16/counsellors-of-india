'use client'

import { useState } from 'react'
import ContentEditorShell from '@/components/appearance/ContentEditorShell'
import CardPager from '@/components/appearance/CardPager'
import type {
  CT6Content, CT6ExpertiseItem, CT6ProcessStep, CT6Reading, EditableFAQ,
} from '@/components/booking/templates/templateUtils'
import { DEFAULT_CT6_CONTENT } from '@/components/booking/templates/templateUtils'

interface Props {
  value: CT6Content
  onChange: (val: CT6Content) => void
  saveButton?: React.ReactNode
}

type Section = 'expertise' | 'process' | 'faq' | 'readings'

// The Process section's illustration is a fixed 5-node winding path, so we
// cap steps at 5 to keep the artwork from breaking (see Process.tsx).
const MAX_PROCESS_STEPS = 5

export default function CT6ContentEditor({ value, onChange, saveButton }: Props) {
  const [open, setOpen] = useState<Section | null>(null)

  // CRITICAL: use Array.isArray — NOT .length — to distinguish "user saved an
  // empty list" from "field was never set". An empty [] means the user deleted
  // everything intentionally; it must render as empty, NOT fall back to defaults.
  const c = {
    expertise: Array.isArray(value.expertise) ? value.expertise : DEFAULT_CT6_CONTENT.expertise,
    process:   Array.isArray(value.process)   ? value.process   : DEFAULT_CT6_CONTENT.process,
    faq:       Array.isArray(value.faq)       ? value.faq       : DEFAULT_CT6_CONTENT.faq,
    readings:  Array.isArray(value.readings)  ? value.readings  : DEFAULT_CT6_CONTENT.readings,
  }

  function patch(updates: Partial<CT6Content>) {
    onChange({ ...value, ...updates })
  }

  return (
    <ContentEditorShell
      activeSection={open}
      onSelect={setOpen}
      sections={[
        { id: 'expertise', label: 'What we can work on', meta: `${c.expertise.length} items` },
        { id: 'process',   label: 'How it unfolds',       meta: `${c.process.length} steps` },
        { id: 'faq',       label: 'FAQ',                  meta: `${c.faq.length} questions` },
        { id: 'readings',  label: 'Readings',             meta: `${c.readings.length} pieces` },
      ]}
      saveButton={saveButton}
    >

      {/* ── EXPERTISE ────────────────────────────────────────────────── */}
      <Accordion open={open === 'expertise'}>
        <p className="text-xs text-[#9ca3af] mb-3">
          The focus-area cards shown under &ldquo;What we can work on.&rdquo; Use the arrows to move between them.
        </p>
        <CardPager<CT6ExpertiseItem>
          items={c.expertise}
          onChange={expertise => patch({ expertise })}
          newItem={() => ({ label: '', blurb: '' })}
          itemLabel={(item, i) => item.label || `Item ${i + 1}`}
          maxItems={9}
          addButtonLabel="Add item"
          emptyLabel="You haven't added any focus areas yet."
          renderItem={(item, update) => (
            <>
              <Field label="Label">
                <input value={item.label} onChange={e => update({ label: e.target.value })}
                  placeholder="e.g. Anxiety & Stress" className={inp} />
              </Field>
              <Field label="Short blurb">
                <textarea rows={3} value={item.blurb} onChange={e => update({ blurb: e.target.value })}
                  placeholder="e.g. For the worry that never quite switches off." className={ta} />
              </Field>
            </>
          )}
        />
      </Accordion>

      {/* ── PROCESS ──────────────────────────────────────────────────── */}
      <Accordion open={open === 'process'}>
        <p className="text-xs text-[#9ca3af] mb-3">
          The winding step-by-step path under &ldquo;How it unfolds.&rdquo; Limited to {MAX_PROCESS_STEPS} steps
          so the illustration lines up correctly.
        </p>
        <CardPager<CT6ProcessStep>
          items={c.process}
          onChange={process => patch({ process })}
          newItem={() => ({ n: String(c.process.length + 1).padStart(2, '0'), t: '', d: '' })}
          itemLabel={(item, i) => item.t || `Step ${i + 1}`}
          maxItems={MAX_PROCESS_STEPS}
          addButtonLabel="Add step"
          emptyLabel="You haven't added any steps yet."
          renderItem={(item, update) => (
            <>
              <Field label="Step number">
                <input value={item.n} onChange={e => update({ n: e.target.value })}
                  placeholder="e.g. 01" className={inp} />
              </Field>
              <Field label="Title">
                <input value={item.t} onChange={e => update({ t: e.target.value })}
                  placeholder="e.g. Reach out" className={inp} />
              </Field>
              <Field label="Description">
                <textarea rows={3} value={item.d} onChange={e => update({ d: e.target.value })}
                  placeholder="e.g. A short message or a form..." className={ta} />
              </Field>
            </>
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

      {/* ── READINGS ─────────────────────────────────────────────────── */}
      <Accordion open={open === 'readings'}>
        <p className="text-xs text-[#9ca3af] mb-3">
          The first item shown becomes the large featured card; the rest fill the grid below it.
        </p>
        <CardPager<CT6Reading>
          items={c.readings}
          onChange={readings => patch({ readings })}
          newItem={() => ({ category: '', title: '', excerpt: '', read: '5 min' })}
          itemLabel={(item, i) => item.title || `Reading ${i + 1}`}
          maxItems={8}
          addButtonLabel="Add reading"
          emptyLabel="You haven't added any readings yet."
          renderItem={(item, update) => (
            <>
              <Field label="Category">
                <input value={item.category} onChange={e => update({ category: e.target.value })}
                  placeholder="e.g. On anxiety" className={inp} />
              </Field>
              <Field label="Title">
                <input value={item.title} onChange={e => update({ title: e.target.value })}
                  placeholder="e.g. The anxiety underneath your productivity" className={inp} />
              </Field>
              <Field label="Excerpt">
                <textarea rows={3} value={item.excerpt} onChange={e => update({ excerpt: e.target.value })}
                  placeholder="A one or two sentence teaser..." className={ta} />
              </Field>
              <Field label="Read time">
                <input value={item.read} onChange={e => update({ read: e.target.value })}
                  placeholder="e.g. 6 min" className={inp} />
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
