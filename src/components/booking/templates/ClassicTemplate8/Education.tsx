'use client'

import { useState } from 'react'
import { GraduationCap, BookOpen, Award, School, Briefcase } from 'lucide-react'
import type { TherapistProfile } from '../templateUtils'
import { resolveCT8Content, type CT8EducationItem, type CT8ExperienceItem } from '../templateUtils'

interface EducationProps { therapist: TherapistProfile }

// Best-effort icon + ordering priority per milestone, inferred from the
// degree/institution text so existing therapist data doesn't need a new
// field to look right. Priority controls display order (school → college
// → masters → doctorate), independent of the order the therapist typed
// entries in or what year they cover.
function getEduIcon(item: CT8EducationItem) {
  const text = `${item.degree} ${item.institution}`.toLowerCase()
  if (/phd|doctor/.test(text)) return Award
  if (/m\.?a\.?|m\.?sc\.?|master|post[- ]?grad/.test(text)) return BookOpen
  if (/school|class (x|xi|xii|\d)|secondary|high school/.test(text)) return School
  return GraduationCap
}

function getEduPriority(item: CT8EducationItem): number {
  const text = `${item.degree} ${item.institution}`.toLowerCase()
  if (/school|class (x|xi|xii|\d)|secondary|high school/.test(text)) return 0
  if (/phd|doctor/.test(text)) return 3
  if (/m\.?a\.?|m\.?sc\.?|master|post[- ]?grad/.test(text)) return 2
  return 1 // bachelor's / college, the default bucket
}

// Pull a leading 4-digit year out of strings like "2021 – 2024" or
// "2024 – 2026 (expected)" — used only as a tiebreaker within the same
// category (e.g. two bachelor's degrees).
function startYear(item: CT8EducationItem): number {
  const match = item.year.match(/\d{4}/)
  return match ? parseInt(match[0], 10) : 0
}

// A journey node is either a single education milestone, or one combined
// "Experience" node summarizing every clinicalExperience entry — always
// appended last, so the icon row reads: school → college → masters →
// experience.
type JourneyNode =
  | { kind: 'education'; label: string; icon: typeof GraduationCap; data: CT8EducationItem }
  | { kind: 'experience'; label: string; icon: typeof GraduationCap; data: CT8ExperienceItem[] }

export default function Education({ therapist }: EducationProps) {
  const ct8 = resolveCT8Content(therapist.profile_content?.classic8)
  const eduItems = ct8.education
  const expItems = ct8.clinicalExperience
  if (eduItems.length === 0 && expItems.length === 0) return null

  const orderedEdu = [...eduItems].sort((a, b) => getEduPriority(a) - getEduPriority(b) || startYear(a) - startYear(b))
  const nodes: JourneyNode[] = [
    ...orderedEdu.map((e): JourneyNode => ({ kind: 'education', label: `${e.degree} — ${e.institution}`, icon: getEduIcon(e), data: e })),
    ...(expItems.length > 0 ? [{ kind: 'experience', label: 'Clinical experience', icon: Briefcase, data: expItems } as JourneyNode] : []),
  ]

  // Nothing selected until the visitor actually clicks an icon — no detail
  // card shown up front, and hovering only highlights (via CSS), it does
  // not open the panel.
  const [selected, setSelected] = useState<number | null>(null)
  const active = selected !== null ? nodes[selected] : null

  return (
    <section id="education" className="ct8-section ct8-section-alt">
      <div className="ct8-container">
        <div className="ct8-section-head">
          <span className="ct8-eyebrow">Education</span>
          <h2 className="ct8-heading ct8-section-title">Academic background</h2>
          <p className="ct8-section-sub">Tap an icon to see the story behind it.</p>
        </div>

        <div className="ct8-journey ct8-reveal">
          <div className="ct8-journey-track">
            {nodes.map((n, i) => {
              const Icon = n.icon
              const isActive = selected === i
              return (
                <button
                  key={i}
                  type="button"
                  className={`ct8-journey-node-wrap${isActive ? ' active' : ''}`}
                  onClick={() => setSelected(prev => (prev === i ? null : i))}
                  aria-pressed={isActive}
                  aria-label={n.label}
                >
                  <span className="ct8-journey-node">
                    <Icon size={32} strokeWidth={1.8} />
                  </span>
                </button>
              )
            })}
          </div>

          {active && (
            <div key={selected} className="ct8-card ct8-journey-detail">
              {active.kind === 'education' ? (
                <>
                  <span className="ct8-bento-label ct8-journey-detail-year">{active.data.year}</span>
                  <h3 className="ct8-journey-detail-degree">{active.data.degree}</h3>
                  <p className="ct8-journey-detail-inst">{active.data.institution}</p>
                  {active.data.details && <p className="ct8-journey-detail-desc">{active.data.details}</p>}
                </>
              ) : (
                <>
                  <span className="ct8-bento-label ct8-journey-detail-year">Experience</span>
                  <h3 className="ct8-journey-detail-degree">Clinical &amp; supervised experience</h3>
                  <div className="ct8-journey-exp-list">
                    {active.data.map((x, i) => (
                      <div key={i} className="ct8-journey-exp-item">
                        <div className="ct8-journey-exp-head">
                          <span className="ct8-journey-exp-role">{x.role}</span>
                          <span className="ct8-journey-exp-duration">{x.duration}</span>
                        </div>
                        <p className="ct8-journey-detail-inst" style={{ margin: '0.2rem 0 0.4rem' }}>{x.organization}</p>
                        <p className="ct8-journey-detail-desc">{x.description}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
