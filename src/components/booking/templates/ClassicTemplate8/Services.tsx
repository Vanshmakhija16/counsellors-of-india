'use client'

import { ArrowUpRight } from 'lucide-react'
import type { TherapistProfile } from '../templateUtils'
import { resolveCT8Content } from '../templateUtils'
import type { Persona } from './Hero'

interface ServicesProps {
  therapist: TherapistProfile
  persona: Persona
}

const BADGE_LABEL: Record<string, string> = {
  student: 'For Students',
  professional: 'For Professionals',
  both: 'Open to Everyone',
}

function scrollToBooking() {
  document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' })
}

export default function Services({ therapist, persona }: ServicesProps) {
  const ct8 = resolveCT8Content(therapist.profile_content?.classic8)
  const defaultDuration = therapist.sessionDuration ?? 50

  // When a persona is active, its matching services (+ "both") float to the
  // front — content stays the same for everyone, just reordered so the
  // relevant option is what a visitor sees first.
  const services = persona
    ? [...ct8.services].sort((a, b) => {
        const score = (s: typeof a) => (s.audience === persona ? 0 : s.audience === 'both' ? 1 : 2)
        return score(a) - score(b)
      })
    : ct8.services

  return (
    <section id="services" className="ct8-section ct8-section-alt">
      <div className="ct8-container">
        <div className="ct8-section-head">
          <span className="ct8-eyebrow">Services</span>
          <h2 className="ct8-heading ct8-section-title">Priced and paced for<br /><em>who you are right now</em></h2>
          <p className="ct8-section-sub">
            A shorter, budget-conscious track for students and a full-length track for working professionals —
            plus an open option if you’re not sure which fits.
          </p>
        </div>

        <div className="ct8-bento-grid">
          {services.map((s, i) => {
            const price = s.price != null ? Number(s.price) : therapist.fee
            const duration = s.duration_mins ?? defaultDuration
            const audience = s.audience ?? 'both'
            // First card reads as the "featured" one — dark tile, echoing
            // the shared bento system used across the other sections.
            const featured = i === 0

            return (
              <div
                key={i}
                className={`ct8-card ct8-bento-tile ct8-reveal${featured ? ' ct8-bento-tile--dark' : ''}`}
              >
                <span className="ct8-bento-label">{BADGE_LABEL[audience]}</span>
                <h3 className="ct8-bento-title">{s.name}</h3>
                <p className="ct8-bento-desc">{s.desc}</p>

                <div className="ct8-bento-meta" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  {price != null ? (
                    <span>
                      From <b style={{ color: featured ? '#fff' : 'var(--ink)' }}>₹{Number(price).toLocaleString('en-IN')}</b> &middot; {duration} min
                    </span>
                  ) : <span />}
                  <button className="ct8-bento-link" style={{ marginTop: 0 }} onClick={scrollToBooking}>
                    Book now <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
