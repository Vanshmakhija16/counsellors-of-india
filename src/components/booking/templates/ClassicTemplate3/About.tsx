'use client'

import type { TherapistProfile } from '../templateUtils'

interface AboutProps {
  therapist: TherapistProfile
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="ct3-spec-row">
      <dt className="ct3-spec-key">{k}</dt>
      <dd className="ct3-spec-val">{v}</dd>
    </div>
  )
}

const TICKER_ITEMS = [
  'Licensed Practitioner',
  'Confidential Sessions',
  'Evidence-Based Practice',
  'Online & In-Person',
  'Integrative Approach',
  'First Session Diagnostic',
]

export default function About({ therapist }: AboutProps) {
  const bio = therapist.bio?.trim() || 'I work with adults navigating anxiety, burnout, grief, and the long aftermath of difficult early relationships. My approach is integrative, rooted in psychodynamic listening, with tools from CBT, ACT, and somatic work woven in when the moment asks for them.'
  const firstLetter = bio[0]?.toUpperCase() ?? 'I'
  const restOfBio   = bio.slice(1)

  return (
    <>
      {/* ── Ticker ── */}
      <div className="ct3-ticker-wrap">
        <div className="ct3-ticker-belt">
          {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="ct3-ticker-item">
              {item}
              <span className="ct3-ticker-dot" />
            </span>
          ))}
        </div>
      </div>

      {/* ── About ── */}
      <section id="about" className="ct3-section ct3-about ct3-gold-rule-top">
        <div className="ct3-container">

          <div className="ct3-folio-header">
            <div>
              {/* <span className="ct3-eyebrow">— II · Practice</span> */}
              <h2 className="ct3-folio-title" style={{ marginTop: '0.5rem' }}>
                About  <em>Me</em>.
              </h2>
            </div>
            {/* <span className="ct3-folio-pg" style={{ display: 'none' }} aria-hidden="true">PAGE 02</span> */}
          </div>

          <div className="ct3-about-grid">
            {/* Left — drop-cap bio */}
            <div>
              <p className="ct3-about-body">
                <span className="ct3-drop-cap">{firstLetter}</span>
                {restOfBio}
              </p>
              {therapist.approach_text && (
                <p className="ct3-about-body-2">{therapist.approach_text}</p>
              )}

              {/* Specialties chips */}
              {/* {therapist.specialties && therapist.specialties.length > 0 && (
                <div style={{ marginTop: '2rem', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {therapist.specialties.map(s => (
                    <span key={s} style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase',
                      padding: '6px 12px',
                      border: '1px solid var(--gold-border)',
                      color: 'var(--ink-3)', background: 'transparent',
                    }}>
                      {s}
                    </span>
                  ))}
                </div>
              )} */}
            </div>

            {/* Right — spec card */}
            <aside className="ct3-spec-card">
              <span className="ct3-eyebrow" style={{ display: 'block', marginBottom: '1.2rem' }}>Specifications</span>
              <dl>
                {/* <Row k="Experience"  v={therapist.experience ? `${therapist.experience} years` : '—'} /> */}
                <Row k="Session"     v={`${therapist.sessionDuration ?? 50} minutes`} />
                {/* <Row k="Investment"  v={therapist.fee ? `₹ ${therapist.fee.toLocaleString()}` : '—'} /> */}
                <Row k="Format"      v="Online · In-person" />
                <Row k="Languages"   v={therapist.languages?.join(' · ') ?? 'English'} />
                {therapist.specialties?.length > 0 && (
                  <Row k="Focus" v={therapist.specialties.slice(0, 3).join(' · ')} />
                )}
                {/* <Row k="Cancellation" v="Free up to 48 hrs" /> */}
              </dl>
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}
