'use client'

import type { TherapistProfile } from '../templateUtils'
import { resolveCT8Content } from '../templateUtils'

interface RecommendationsProps { therapist: TherapistProfile }

export default function Recommendations({ therapist }: RecommendationsProps) {
  const ct8 = resolveCT8Content(therapist.profile_content?.classic8)
  const items = ct8.recommendations
  if (items.length === 0) return null

  return (
    <section id="recommendations" className="ct8-section">
      <div className="ct8-container">
        <div className="ct8-section-head">
          <span className="ct8-eyebrow">Recommendations</span>
          <h2 className="ct8-heading ct8-section-title">What supervisors say</h2>
        </div>

        <div className="ct8-bento-grid">
          {items.map((r, i) => (
            <div key={i} className={`ct8-card ct8-bento-tile ct8-reveal${i === 0 ? ' ct8-bento-tile--dark' : ''}`}>
              <span className="ct8-bento-quote-mark">&ldquo;</span>
              <p className="ct8-bento-desc">{r.quote}</p>
              <div className="ct8-bento-meta">{r.name} &middot; {r.role}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
