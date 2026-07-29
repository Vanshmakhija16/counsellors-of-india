'use client'

import type { TherapistProfile } from '../templateUtils'
import { resolveImage, resolveCT8Content } from '../templateUtils'

// Persona here means "which mode is this site in" — the OWNER's identity
// (a psychology student building a portfolio vs. a practicing
// professional's client-facing site) — not "which client is visiting."
// Toggling it swaps the hero framing/CTAs and retints the accent color;
// the new portfolio sections (Education, Research, Experience, Skills,
// Certifications, Recommendations) are the ones that actually matter in
// student mode, while Services/Booking still matter in professional mode.
//
// v4 — premium/editorial pass: no icons, no colored pills, no gradient
// text. A serif display headline, thin-underline text tabs for the
// persona switch, and a plain numeric stat row. Color is used in exactly
// one place (the primary button's hover state) — everything else is
// ink / paper / hairline.
export type Persona = 'student' | 'professional' | null

interface HeroProps {
  therapist: TherapistProfile
  persona: Persona
  setPersona: (p: Persona) => void
}

export default function Hero({ therapist, persona, setPersona }: HeroProps) {
  const ct8 = resolveCT8Content(therapist.profile_content?.classic8)
  const name = therapist.name || 'Your Name'
  const cred = therapist.credentials || 'Clinical Psychologist'
  const photo = resolveImage(therapist.image)

  const eyebrow =
    persona === 'student' ? ct8.hero.eyebrowStudent :
    persona === 'professional' ? ct8.hero.eyebrowProfessional :
    ct8.hero.eyebrowDefault

  const sub =
    persona === 'student' ? ct8.hero.subStudent :
    persona === 'professional' ? ct8.hero.subProfessional :
    ct8.hero.subDefault ||
    therapist.bio ||
    'From classroom training to real client work — a page that grows with wherever I am right now.'

  const headline =
    persona === 'student'
      ? <>Psychology student, <em>building real experience</em></>
      : persona === 'professional'
        ? <>Support that fits <em>your season of life</em></>
        : <>From classroom <em>to practice</em></>

  const primaryCta = persona === 'student' ? 'View My Work' : 'Book a Session'
  const ghostCta    = persona === 'student' ? 'Download Resume' : 'About Me'

  const researchCount    = ct8.research.length
  const experienceCount  = ct8.clinicalExperience.length
  const exp              = therapist.experience ?? 8
  const reviews           = therapist.totalReviews ?? 200

  const marqueeItems = (
    therapist.specialties?.length ? therapist.specialties : ['Anxiety', 'Depression', 'Relationships', 'Burnout', 'Life Transitions', 'Self-Esteem']
  )

  function handlePrimaryCta() {
    if (persona === 'student') {
      document.getElementById('research')?.scrollIntoView({ behavior: 'smooth' })
    } else {
      document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' })
    }
  }
  function handleGhostCta() {
    if (persona === 'student') {
      document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' })
    } else {
      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section id="hero" className="ct8-hero-premium">
      <div className="ct8-hero-premium-inner">
        <div className="ct8-persona-tabs" role="group" aria-label="Which mode is this site in?">
          <button
            type="button"
            className={`ct8-persona-tab ${persona === 'student' ? 'active' : ''}`}
            onClick={() => setPersona(persona === 'student' ? null : 'student')}
          >
            Student Portfolio
          </button>
          <button
            type="button"
            className={`ct8-persona-tab ${persona === 'professional' ? 'active' : ''}`}
            onClick={() => setPersona(persona === 'professional' ? null : 'professional')}
          >
            Practicing Professional
          </button>
        </div>

        <span className="ct8-hero-premium-eyebrow">{eyebrow}</span>

        <h1 className="ct8-hero-premium-headline">{headline}</h1>

        <div className="ct8-hero-premium-cred">
          <span className="ct8-hero-premium-cred-avatar"><img src={photo} alt={name} /></span>
          {name}
          <span className="ct8-hero-premium-cred-sep">·</span>
          {cred}
          {therapist.city && <><span className="ct8-hero-premium-cred-sep">·</span>{therapist.city}</>}
        </div>

        <p className="ct8-hero-bio">{sub}</p>

        <div className="ct8-hero-ctas">
          <button className="ct8-hero-premium-btn" onClick={handlePrimaryCta}>{primaryCta}</button>
          <button className="ct8-hero-premium-link" onClick={handleGhostCta}>{ghostCta}</button>
        </div>

        <div className="ct8-hero-stats">
          {persona === 'professional' ? (
            <>
              <div className="ct8-hero-stat">
                <span className="ct8-hero-stat-num">{exp}+</span>
                <span className="ct8-hero-stat-lbl">Years Practice</span>
              </div>
              <div className="ct8-hero-stat-divider" />
              <div className="ct8-hero-stat">
                <span className="ct8-hero-stat-num">{reviews}+</span>
                <span className="ct8-hero-stat-lbl">Sessions</span>
              </div>
            </>
          ) : (
            <>
              <div className="ct8-hero-stat">
                <span className="ct8-hero-stat-num">{researchCount || 2}</span>
                <span className="ct8-hero-stat-lbl">Research Projects</span>
              </div>
              <div className="ct8-hero-stat-divider" />
              <div className="ct8-hero-stat">
                <span className="ct8-hero-stat-num">{experienceCount || 2}</span>
                <span className="ct8-hero-stat-lbl">Placements</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="ct8-hero-marquee-wrap">
        <div className="ct8-hero-marquee-track">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="ct8-hero-marquee-item">
              {item} <span aria-hidden="true">·</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
