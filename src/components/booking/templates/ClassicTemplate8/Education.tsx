'use client'

import { useEffect, useRef, useState } from 'react'
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

// A timeline node is a single education milestone OR a single clinical-
// experience entry — each gets its own node (own icon, own left/right slot)
// so the alternating zig-zag stays consistent all the way down instead of
// dumping every experience entry into one crowded node at the end.
type JourneyNode =
  | { kind: 'education'; icon: typeof GraduationCap; data: CT8EducationItem }
  | { kind: 'experience'; icon: typeof GraduationCap; data: CT8ExperienceItem }

export default function Education({ therapist }: EducationProps) {
  const ct8 = resolveCT8Content(therapist.profile_content?.classic8)
  const eduItems = ct8.education
  const expItems = ct8.clinicalExperience
  if (eduItems.length === 0 && expItems.length === 0) return null

  const orderedEdu = [...eduItems].sort((a, b) => getEduPriority(a) - getEduPriority(b) || startYear(a) - startYear(b))
  const nodes: JourneyNode[] = [
    ...orderedEdu.map((e): JourneyNode => ({ kind: 'education', icon: getEduIcon(e), data: e })),
    ...expItems.map((x): JourneyNode => ({ kind: 'experience', icon: Briefcase, data: x })),
  ]

  // The connecting line should stop exactly at the last node's icon (the
  // final experience entry) instead of running the full height of the
  // container — which would drag it through that item's description text
  // below the icon. Measured on mount/resize since item heights (and thus
  // the last icon's position) vary with content and viewport width.
  const journeyRef = useRef<HTMLDivElement | null>(null)
  const iconRefs = useRef<(HTMLSpanElement | null)[]>([])
  const [lineHeight, setLineHeight] = useState<number | null>(null)

  useEffect(() => {
    const measure = () => {
      const container = journeyRef.current
      const lastIcon = iconRefs.current[nodes.length - 1]
      if (!container || !lastIcon) return
      const containerTop = container.getBoundingClientRect().top
      const iconRect = lastIcon.getBoundingClientRect()
      setLineHeight(iconRect.top - containerTop + iconRect.height / 2)
    }
    measure()
    window.addEventListener('resize', measure)
    const ro = new ResizeObserver(measure)
    if (journeyRef.current) ro.observe(journeyRef.current)
    return () => { window.removeEventListener('resize', measure); ro.disconnect() }
  }, [nodes.length])

  return (
    <section id="education" className="ct8-section ct8-section-alt">
      <div className="ct8-container">
        <div className="ct8-section-head">
          <span className="ct8-eyebrow">Education</span>
          <h2 className="ct8-heading ct8-section-title">Academic background</h2>
          <p className="ct8-section-sub">School to practice, one step at a time.</p>
        </div>

        {/* Scroll-revealed, alternating (zig-zag) timeline — no boxes, no
            click interaction. Each milestone sits directly on the page,
            fading in as it scrolls into view, alternating left/right of a
            central connecting line so it reads as one continuous path
            rather than a row of clickable icons. */}
        <div className="ct8-journey-alt" ref={journeyRef}>
          <div
            className="ct8-journey-alt-line"
            aria-hidden="true"
            style={lineHeight != null ? { height: lineHeight, bottom: 'auto' } : undefined}
          />
          {nodes.map((n, i) => {
            const Icon = n.icon
            const side = i % 2 === 0 ? 'right' : 'left'
            return (
              <div key={i} className={`ct8-journey-alt-item ct8-journey-alt-item--${side} ct8-reveal`}>
                <span
                  className="ct8-journey-alt-icon"
                  ref={(el) => { iconRefs.current[i] = el }}
                ><Icon size={22} strokeWidth={1.9} /></span>
                <div className="ct8-journey-alt-content">
                  {n.kind === 'education' ? (
                    <>
                      <span className="ct8-journey-alt-year">
                        <span className="ct8-journey-alt-year-num">{n.data.year}</span>
                        <span className="ct8-journey-alt-year-rule" aria-hidden="true" />
                      </span>
                      <h3 className="ct8-journey-alt-title">{n.data.degree}</h3>
                      <p className="ct8-journey-alt-inst">{n.data.institution}</p>
                      {n.data.details && <p className="ct8-journey-alt-desc">{n.data.details}</p>}
                    </>
                  ) : (
                    <>
                      <span className="ct8-journey-alt-year">
                        <span className="ct8-journey-alt-year-num">{n.data.duration}</span>
                        <span className="ct8-journey-alt-year-rule" aria-hidden="true" />
                      </span>
                      <h3 className="ct8-journey-alt-title">{n.data.role}</h3>
                      <p className="ct8-journey-alt-inst">{n.data.organization}</p>
                      <p className="ct8-journey-alt-desc">{n.data.description}</p>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
