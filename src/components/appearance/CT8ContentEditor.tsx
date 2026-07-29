'use client'

import { useState } from 'react'
import ContentEditorShell from '@/components/appearance/ContentEditorShell'
import CardPager from '@/components/appearance/CardPager'
import type {
  CT8Content, EditableFAQ, EditableService,
  CT8EducationItem, CT8ResearchItem, CT8ExperienceItem,
  CT8CertificationItem, CT8RecommendationItem,
} from '@/components/booking/templates/templateUtils'
import { DEFAULT_CT8_CONTENT } from '@/components/booking/templates/templateUtils'

interface Props {
  value: CT8Content
  onChange: (val: CT8Content) => void
  saveButton?: React.ReactNode
}

type Section =
  | 'hero' | 'services' | 'faq'
  | 'education' | 'research' | 'experience' | 'skills' | 'certifications' | 'recommendations'

// CardPager needs a spreadable object per item — plain-string skill tags
// are wrapped/unwrapped at the boundary, same trick used for ticker tags
// in the other template editors.
type SkillTag = { text: string }

export default function CT8ContentEditor({ value, onChange, saveButton }: Props) {
  const [open, setOpen] = useState<Section | null>(null)

  // CRITICAL: use Array.isArray — NOT .length — to distinguish "user saved an
  // empty list" from "field was never set". An empty [] means the user deleted
  // everything intentionally; it must render as empty, NOT fall back to defaults.
  const c = {
    hero:     { ...DEFAULT_CT8_CONTENT.hero, ...(value.hero ?? {}) },
    services: Array.isArray(value.services) ? value.services : DEFAULT_CT8_CONTENT.services,
    faq:      Array.isArray(value.faq)      ? value.faq      : DEFAULT_CT8_CONTENT.faq,
    education:          Array.isArray(value.education)          ? value.education          : DEFAULT_CT8_CONTENT.education,
    research:           Array.isArray(value.research)           ? value.research           : DEFAULT_CT8_CONTENT.research,
    clinicalExperience: Array.isArray(value.clinicalExperience) ? value.clinicalExperience : DEFAULT_CT8_CONTENT.clinicalExperience,
    certifications:     Array.isArray(value.certifications)     ? value.certifications     : DEFAULT_CT8_CONTENT.certifications,
    recommendations:    Array.isArray(value.recommendations)    ? value.recommendations    : DEFAULT_CT8_CONTENT.recommendations,
    skills: {
      clinical:  Array.isArray(value.skills?.clinical)  ? value.skills!.clinical!  : DEFAULT_CT8_CONTENT.skills.clinical,
      technical: Array.isArray(value.skills?.technical) ? value.skills!.technical! : DEFAULT_CT8_CONTENT.skills.technical,
    },
  }

  function patch(updates: Partial<CT8Content>) {
    onChange({ ...value, ...updates })
  }
  function patchHero(updates: Partial<CT8Content['hero']>) {
    patch({ hero: { ...c.hero, ...updates } })
  }

  const toggle = (s: Section) => setOpen(prev => prev === s ? null : s)

  return (
    <ContentEditorShell
      activeSection={open}
      onSelect={setOpen}
      sections={[
        { id: 'hero', label: 'Hero copy', meta: 'Student / Professional' },
        { id: 'education', label: 'Education', meta: `${c.education.length} entries` },
        { id: 'research', label: 'Research & Projects', meta: `${c.research.length} items` },
        { id: 'experience', label: 'Clinical Experience', meta: `${c.clinicalExperience.length} entries` },
        { id: 'skills', label: 'Skills', meta: `${c.skills.clinical.length + c.skills.technical.length} skills` },
        { id: 'certifications', label: 'Certifications', meta: `${c.certifications.length} items` },
        { id: 'recommendations', label: 'Recommendations', meta: `${c.recommendations.length} quotes` },
        { id: 'services', label: 'Services', meta: `${c.services.length} items` },
        { id: 'faq', label: 'FAQ', meta: `${c.faq.length} questions` },
      ]}
      saveButton={saveButton}
    >

      {/* ── HERO COPY ────────────────────────────────────────────── */}
      <Accordion open={open === 'hero'}>
        <p className="text-xs text-[#9ca3af] mb-3">
          The hero has a toggle for &ldquo;Student Portfolio&rdquo; vs &ldquo;Practicing Professional&rdquo; mode.
          Write the supporting line shown in each mode (and a default shown before either is picked).
        </p>
        <div className="flex flex-col gap-4">
          <Field label="Eyebrow — default (neither picked)">
            <input value={c.hero.eyebrowDefault} onChange={e => patchHero({ eyebrowDefault: e.target.value })} className={inp} />
          </Field>
          <Field label="Sub-line — default">
            <textarea rows={2} value={c.hero.subDefault} onChange={e => patchHero({ subDefault: e.target.value })} className={ta} />
          </Field>
          <div className="h-px bg-[#ede9e4]" />
          <Field label="Eyebrow — Student Portfolio mode">
            <input value={c.hero.eyebrowStudent} onChange={e => patchHero({ eyebrowStudent: e.target.value })} className={inp} />
          </Field>
          <Field label="Sub-line — Student Portfolio mode">
            <textarea rows={2} value={c.hero.subStudent} onChange={e => patchHero({ subStudent: e.target.value })} className={ta} />
          </Field>
          <div className="h-px bg-[#ede9e4]" />
          <Field label="Eyebrow — Practicing Professional mode">
            <input value={c.hero.eyebrowProfessional} onChange={e => patchHero({ eyebrowProfessional: e.target.value })} className={inp} />
          </Field>
          <Field label="Sub-line — Practicing Professional mode">
            <textarea rows={2} value={c.hero.subProfessional} onChange={e => patchHero({ subProfessional: e.target.value })} className={ta} />
          </Field>
        </div>
      </Accordion>

      {/* ── EDUCATION ────────────────────────────────────────────── */}
      <Accordion open={open === 'education'}>
        <p className="text-xs text-[#9ca3af] mb-2">Degrees, in order. Use the arrows to move between entries.</p>
        <CardPager<CT8EducationItem>
          items={c.education}
          onChange={education => patch({ education })}
          newItem={() => ({ degree: '', institution: '', year: '', details: '' })}
          itemLabel={(e, i) => e.degree || `Entry ${i + 1}`}
          addButtonLabel="Add education"
          emptyLabel="You haven't added any education yet."
          renderItem={(e, update) => (
            <>
              <Field label="Degree">
                <input value={e.degree} onChange={ev => update({ degree: ev.target.value })} placeholder="e.g. M.A. Clinical Psychology" className={inp} />
              </Field>
              <Field label="Institution">
                <input value={e.institution} onChange={ev => update({ institution: ev.target.value })} placeholder="e.g. University of Delhi" className={inp} />
              </Field>
              <Field label="Year(s)">
                <input value={e.year} onChange={ev => update({ year: ev.target.value })} placeholder="e.g. 2024 – 2026 (expected)" className={inp} />
              </Field>
              <Field label="Details (optional)">
                <textarea rows={2} value={e.details ?? ''} onChange={ev => update({ details: ev.target.value })} className={ta} />
              </Field>
            </>
          )}
        />
      </Accordion>

      {/* ── RESEARCH & PROJECTS ──────────────────────────────────── */}
      <Accordion open={open === 'research'}>
        <p className="text-xs text-[#9ca3af] mb-2">Thesis work, class research, or independent projects.</p>
        <CardPager<CT8ResearchItem>
          items={c.research}
          onChange={research => patch({ research })}
          newItem={() => ({ title: '', type: 'Research Project', year: '', description: '' })}
          itemLabel={(r, i) => r.title || `Project ${i + 1}`}
          addButtonLabel="Add project"
          emptyLabel="You haven't added any research or projects yet."
          renderItem={(r, update) => (
            <>
              <Field label="Title">
                <input value={r.title} onChange={e => update({ title: e.target.value })} placeholder="e.g. Anxiety and Academic Performance..." className={inp} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Type">
                  <input value={r.type} onChange={e => update({ type: e.target.value })} placeholder="e.g. Undergraduate Thesis" className={inp} />
                </Field>
                <Field label="Year">
                  <input value={r.year} onChange={e => update({ year: e.target.value })} placeholder="e.g. 2024" className={inp} />
                </Field>
              </div>
              <Field label="Description">
                <textarea rows={3} value={r.description} onChange={e => update({ description: e.target.value })} className={ta} />
              </Field>
              <Field label="Link (optional)">
                <input value={r.link ?? ''} onChange={e => update({ link: e.target.value })} placeholder="https://..." className={inp} />
              </Field>
            </>
          )}
        />
      </Accordion>

      {/* ── CLINICAL / PRACTICUM EXPERIENCE ──────────────────────── */}
      <Accordion open={open === 'experience'}>
        <p className="text-xs text-[#9ca3af] mb-2">Supervised placements and internships — always framed as supervised training, not independent practice.</p>
        <CardPager<CT8ExperienceItem>
          items={c.clinicalExperience}
          onChange={clinicalExperience => patch({ clinicalExperience })}
          newItem={() => ({ role: '', organization: '', duration: '', description: '' })}
          itemLabel={(e, i) => e.role || `Entry ${i + 1}`}
          addButtonLabel="Add experience"
          emptyLabel="You haven't added any clinical experience yet."
          renderItem={(e, update) => (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Role">
                  <input value={e.role} onChange={ev => update({ role: ev.target.value })} placeholder="e.g. Clinical Intern" className={inp} />
                </Field>
                <Field label="Duration">
                  <input value={e.duration} onChange={ev => update({ duration: ev.target.value })} placeholder="e.g. Jun 2025 – Present" className={inp} />
                </Field>
              </div>
              <Field label="Organization">
                <input value={e.organization} onChange={ev => update({ organization: ev.target.value })} placeholder="e.g. City Mental Health Clinic" className={inp} />
              </Field>
              <Field label="Description">
                <textarea rows={3} value={e.description} onChange={ev => update({ description: ev.target.value })} className={ta} />
              </Field>
            </>
          )}
        />
      </Accordion>

      {/* ── SKILLS ───────────────────────────────────────────────── */}
      <Accordion open={open === 'skills'}>
        <p className="text-xs text-[#9ca3af] mb-2">Two groups: clinical/therapeutic approaches, and research/technical tools.</p>
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-xs font-semibold text-[#6b7280] mb-2 uppercase tracking-wider">Clinical &amp; Therapeutic</p>
            <CardPager<SkillTag>
              items={c.skills.clinical.map(text => ({ text }))}
              onChange={tags => patch({ skills: { ...c.skills, clinical: tags.map(t => t.text) } })}
              newItem={() => ({ text: 'New skill' })}
              itemLabel={(t, i) => t.text || `Skill ${i + 1}`}
              maxItems={16}
              addButtonLabel="Add skill"
              emptyLabel="No clinical skills added yet."
              renderItem={(t, update) => (
                <Field label="Skill">
                  <input value={t.text} onChange={e => update({ text: e.target.value })} className={inp} />
                </Field>
              )}
            />
          </div>
          <div className="h-px bg-[#ede9e4]" />
          <div>
            <p className="text-xs font-semibold text-[#6b7280] mb-2 uppercase tracking-wider">Research &amp; Technical</p>
            <CardPager<SkillTag>
              items={c.skills.technical.map(text => ({ text }))}
              onChange={tags => patch({ skills: { ...c.skills, technical: tags.map(t => t.text) } })}
              newItem={() => ({ text: 'New skill' })}
              itemLabel={(t, i) => t.text || `Skill ${i + 1}`}
              maxItems={16}
              addButtonLabel="Add skill"
              emptyLabel="No technical skills added yet."
              renderItem={(t, update) => (
                <Field label="Skill">
                  <input value={t.text} onChange={e => update({ text: e.target.value })} className={inp} />
                </Field>
              )}
            />
          </div>
        </div>
      </Accordion>

      {/* ── CERTIFICATIONS ───────────────────────────────────────── */}
      <Accordion open={open === 'certifications'}>
        <p className="text-xs text-[#9ca3af] mb-2">Workshops and certifications beyond the core degree.</p>
        <CardPager<CT8CertificationItem>
          items={c.certifications}
          onChange={certifications => patch({ certifications })}
          newItem={() => ({ title: '', issuer: '', year: '' })}
          itemLabel={(item, i) => item.title || `Item ${i + 1}`}
          addButtonLabel="Add certification"
          emptyLabel="You haven't added any certifications yet."
          renderItem={(item, update) => (
            <>
              <Field label="Title">
                <input value={item.title} onChange={e => update({ title: e.target.value })} placeholder="e.g. Foundations of CBT" className={inp} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Issuer">
                  <input value={item.issuer} onChange={e => update({ issuer: e.target.value })} placeholder="e.g. Beck Institute" className={inp} />
                </Field>
                <Field label="Year">
                  <input value={item.year} onChange={e => update({ year: e.target.value })} placeholder="e.g. 2025" className={inp} />
                </Field>
              </div>
            </>
          )}
        />
      </Accordion>

      {/* ── RECOMMENDATIONS ──────────────────────────────────────── */}
      <Accordion open={open === 'recommendations'}>
        <p className="text-xs text-[#9ca3af] mb-2">Quotes from professors or clinical supervisors (not client testimonials).</p>
        <CardPager<CT8RecommendationItem>
          items={c.recommendations}
          onChange={recommendations => patch({ recommendations })}
          newItem={() => ({ quote: '', name: '', role: '' })}
          itemLabel={(item, i) => item.name || `Quote ${i + 1}`}
          addButtonLabel="Add recommendation"
          emptyLabel="You haven't added any recommendations yet."
          renderItem={(item, update) => (
            <>
              <Field label="Quote">
                <textarea rows={3} value={item.quote} onChange={e => update({ quote: e.target.value })} className={ta} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Name">
                  <input value={item.name} onChange={e => update({ name: e.target.value })} placeholder="e.g. Dr. A. Sharma" className={inp} />
                </Field>
                <Field label="Role">
                  <input value={item.role} onChange={e => update({ role: e.target.value })} placeholder="e.g. Thesis Supervisor" className={inp} />
                </Field>
              </div>
            </>
          )}
        />
      </Accordion>

      {/* ── SERVICES ─────────────────────────────────────────────── */}
      <Accordion open={open === 'services'}>
        <p className="text-xs text-[#9ca3af] mb-2">
          Set which audience each service is for — it controls the badge shown on the card, and which mode it's highlighted in.
        </p>
        <CardPager<EditableService>
          items={c.services}
          onChange={services => patch({ services })}
          newItem={() => ({ name: 'New Service', desc: '', audience: 'both' })}
          itemLabel={(svc, i) => svc.name || `Service ${i + 1}`}
          addButtonLabel="Add service"
          emptyLabel="You haven't added any services yet."
          renderItem={(svc, update) => (
            <>
              <Field label="Service name">
                <input value={svc.name} onChange={e => update({ name: e.target.value })} placeholder="e.g. Student Support Session" className={inp} />
              </Field>
              <Field label="Description">
                <textarea rows={3} value={svc.desc} onChange={e => update({ desc: e.target.value })} className={ta} />
              </Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Price (₹)">
                  <input type="number" min={0} value={svc.price ?? ''}
                    onChange={e => update({ price: e.target.value === '' ? undefined : e.target.value })}
                    placeholder="e.g. 600" className={inp} />
                </Field>
                <Field label="Duration (min)">
                  <input type="number" min={5} max={360} value={svc.duration_mins ?? ''}
                    onChange={e => update({ duration_mins: e.target.value === '' ? undefined : Number(e.target.value) })}
                    placeholder="e.g. 30" className={inp} />
                </Field>
                <Field label="Audience">
                  <select
                    value={svc.audience ?? 'both'}
                    onChange={e => update({ audience: e.target.value as EditableService['audience'] })}
                    className={inp}
                  >
                    <option value="student">Student</option>
                    <option value="professional">Professional</option>
                    <option value="both">Everyone</option>
                  </select>
                </Field>
              </div>
            </>
          )}
        />
      </Accordion>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
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
                <input value={item.q} onChange={e => update({ q: e.target.value })} className={inp} />
              </Field>
              <Field label="Answer">
                <textarea rows={3} value={item.a} onChange={e => update({ a: e.target.value })} className={ta} />
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

function Accordion({ open, children }: { open: boolean; children: React.ReactNode }) {
  return open ? <>{children}</> : null
}
