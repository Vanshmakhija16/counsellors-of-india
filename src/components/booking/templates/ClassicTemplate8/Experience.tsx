'use client'

import type { TherapistProfile } from '../templateUtils'
import { resolveCT8Content } from '../templateUtils'

interface ExperienceProps { therapist: TherapistProfile }

export default function Experience({ therapist }: ExperienceProps) {
  const ct8 = resolveCT8Content(therapist.profile_content?.classic8)
  const items = ct8.clinicalExperience
  if (items.length === 0) return null

  return (
    <section id="experience" className="ct8-section ct8-section-alt">
      <div className="ct8-container">
        <div className="ct8-section-head">
          <span className="ct8-eyebrow">Clinical &amp; Practicum Experience</span>
          <h2 className="ct8-heading ct8-section-title">Supervised, hands-on experience</h2>
          <p className="ct8-section-sub">All work below was carried out under professional supervision as part of training — not independent practice.</p>
        </div>

        <div className="ct8-bento-grid">
          {items.map((e, i) => (
            <div key={i} className={`ct8-card ct8-bento-tile ct8-reveal${i === 0 ? ' ct8-bento-tile--dark' : ''}`}>
              <span className="ct8-bento-label">{e.organization}</span>
              <h3 className="ct8-bento-title">{e.role}</h3>
              <p className="ct8-bento-desc">{e.description}</p>
              <div className="ct8-bento-meta">{e.duration}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
