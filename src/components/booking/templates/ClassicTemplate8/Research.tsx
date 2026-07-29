'use client'

import type { TherapistProfile } from '../templateUtils'
import { resolveCT8Content } from '../templateUtils'

interface ResearchProps { therapist: TherapistProfile }

export default function Research({ therapist }: ResearchProps) {
  const ct8 = resolveCT8Content(therapist.profile_content?.classic8)
  const items = ct8.research
  if (items.length === 0) return null

  return (
    <section id="research" className="ct8-section">
      <div className="ct8-container">
        <div className="ct8-section-head">
          <span className="ct8-eyebrow">Research &amp; Projects</span>
          <h2 className="ct8-heading ct8-section-title">Work I&rsquo;ve dug into</h2>
          <p className="ct8-section-sub">Thesis work, class research, and independent projects — the real credibility signal for anyone still building a practice.</p>
        </div>

        <div className="ct8-bento-grid">
          {items.map((r, i) => (
            <div key={i} className={`ct8-card ct8-bento-tile ct8-reveal${i === 0 ? ' ct8-bento-tile--dark' : ''}`}>
              <span className="ct8-bento-label">{r.type} &middot; {r.year}</span>
              <h3 className="ct8-bento-title">{r.title}</h3>
              <p className="ct8-bento-desc">{r.description}</p>
              {r.link && (
                <a href={r.link} target="_blank" rel="noopener noreferrer" className="ct8-bento-link">
                  Read more &rarr;
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
