'use client'

import type { TherapistProfile } from '../templateUtils'
import { resolveCT8Content } from '../templateUtils'

interface EducationProps { therapist: TherapistProfile }

export default function Education({ therapist }: EducationProps) {
  const ct8 = resolveCT8Content(therapist.profile_content?.classic8)
  const items = ct8.education
  if (items.length === 0) return null

  return (
    <section id="education" className="ct8-section ct8-section-alt">
      <div className="ct8-container">
        <div className="ct8-section-head">
          <span className="ct8-eyebrow">Education</span>
          <h2 className="ct8-heading ct8-section-title">Academic background</h2>
        </div>

        <div className="ct8-bento-grid">
          {items.map((e, i) => (
            <div key={i} className={`ct8-card ct8-bento-tile ct8-reveal${i === 0 ? ' ct8-bento-tile--dark' : ''}`}>
              <span className="ct8-bento-label">{e.year}</span>
              <h3 className="ct8-bento-title">{e.degree}</h3>
              <p className="ct8-bento-sub">{e.institution}</p>
              {e.details && <p className="ct8-bento-desc">{e.details}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
