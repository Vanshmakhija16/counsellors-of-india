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

  // Whichever card sits in the middle of the row visually "floats" above
  // its neighbours (pricing-table style) — a fixed layout position, not
  // tied to which service happens to be persona-featured, so the card
  // that lifts stays predictable even as sort order changes above.
  const floatingIndex = Math.floor((services.length - 1) / 2)

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

        <div className="ct8-services-grid">
          {services.map((s, i) => {
            const price = s.price != null ? Number(s.price) : therapist.fee
            const duration = s.duration_mins ?? defaultDuration
            const audience = s.audience ?? 'both'
            const isFloating = services.length > 1 && i === floatingIndex

            return (
              <div
                key={i}
                className={`ct8-service-card ct8-reveal${isFloating ? ' ct8-service-card--floating' : ''}`}
              >
                <span className="ct8-service-badge">{BADGE_LABEL[audience]}</span>
                <h3 className="ct8-service-title">{s.name}</h3>
                <p className="ct8-service-desc">{s.desc}</p>

                {price != null ? (
                  <div className="ct8-service-price-row">
                    <span className="ct8-service-price">₹{Number(price).toLocaleString('en-IN')}</span>
                    <span className="ct8-service-price-unit">/ {duration} min session</span>
                  </div>
                ) : (
                  <div className="ct8-service-price-contact">Contact for pricing</div>
                )}

                <button className="ct8-service-cta" onClick={scrollToBooking}>
                  Book now <ArrowUpRight size={15} />
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
