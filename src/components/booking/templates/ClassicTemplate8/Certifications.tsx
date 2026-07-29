'use client'

import type { TherapistProfile } from '../templateUtils'
import { resolveCT8Content } from '../templateUtils'

interface CertificationsProps { therapist: TherapistProfile }

export default function Certifications({ therapist }: CertificationsProps) {
  const ct8 = resolveCT8Content(therapist.profile_content?.classic8)
  const items = ct8.certifications
  if (items.length === 0) return null

  return (
    <section id="certifications" className="ct8-section ct8-section-alt">
      <div className="ct8-container">
        <div className="ct8-section-head">
          <span className="ct8-eyebrow">Certifications &amp; Workshops</span>
          <h2 className="ct8-heading ct8-section-title">Beyond the core degree</h2>
        </div>

        <div className="ct8-bento-grid">
          {items.map((c, i) => (
            <div key={i} className={`ct8-card ct8-bento-tile ct8-reveal${i === 0 ? ' ct8-bento-tile--dark' : ''}`}>
              <span className="ct8-bento-label">{c.year}</span>
              <h3 className="ct8-bento-title">{c.title}</h3>
              <p className="ct8-bento-sub">{c.issuer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
