'use client'

import { useEffect, useRef, useState } from 'react'
import type { TherapistProfile } from '../templateUtils'
import { resolveImage, getInitials } from '../templateUtils'

interface AboutProps { therapist: TherapistProfile }

const BIO_CHAR_LIMIT = 300

export default function About({ therapist }: AboutProps) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const [expanded, setExpanded] = useState(false)
  

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          e.target.querySelectorAll('.ct4-reveal').forEach(el => {
            if (e.isIntersecting) el.classList.add('visible')
          })
        })
      },
      { threshold: 0.12 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  const bio = therapist.bio?.trim() || 'I work with adults navigating anxiety, burnout, grief, and the long aftermath of difficult early relationships. My approach is integrative, rooted in psychodynamic listening, with tools from CBT, ACT, and somatic work woven in when the moment calls for them.'

  const isLong = bio.length > BIO_CHAR_LIMIT
  const displayedBio = isLong && !expanded ? bio.slice(0, BIO_CHAR_LIMIT).trimEnd() + '…' : bio

  const firstChar = displayedBio[0]?.toUpperCase() ?? 'I'
  const rest = displayedBio.slice(1)

  // Photo card details
  const displayName = therapist.name ?? 'Your Name'
  
const photoSrc = resolveImage(therapist?.image)
  const initials = therapist.initials ?? getInitials(displayName)

  return (
    <section id="about" ref={sectionRef} className="ct4-section ct4-about ct4-marble">
      <div className="ct4-container" style={{ position: 'relative', zIndex: 1 }}>

        {/* Section header */}
        <div className="ct4-section-header ct4-reveal">
          <div>
            {/* <span className="ct4-eyebrow">— II · Portrait</span> */}
            <h2 className="ct4-section-title">
              Who <em>I </em>am ?
            </h2>
          </div>
          {/* <span className="ct4-section-pg">PAGE 02</span> */}
        </div>

        {/* Two-column layout */}
        <div className="ct4-about-grid">

          {/* Left: Bio text */}
          <div className="ct4-reveal">
            <p style={{ fontSize: 'clamp(15px, 1.4vw, 18px)', lineHeight: 1.85, fontWeight: 300, color: 'var(--ghost)', margin: 0 }}>
              <span className="ct4-drop-cap">{firstChar}</span>
              {rest}
            </p>

            {/* Read More / Read Less button */}
            {isLong && (
              <button
                onClick={() => setExpanded(prev => !prev)}
                style={{
                  marginTop: '1rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'none',
                  border: '1px solid var(--border-gold)',
                  borderRadius: '2px',
                  padding: '0.45rem 1.1rem',
                  fontSize: '12px',
                  fontFamily: 'DM Mono, monospace',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--gold)',
                  cursor: 'pointer',
                  transition: 'background 0.25s, color 0.25s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--gold-glow)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'none'
                }}
              >
                {expanded ? (
                  <>
                    Read Less
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 8L6 4L10 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                ) : (
                  <>
                    Read More
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                )}
              </button>
            )}

            {therapist.approach_text && (
              <p style={{ fontSize: 15, lineHeight: 1.85, color: 'var(--silver)', marginTop: 20, fontWeight: 300, maxWidth: '60ch' }}>
                {therapist.approach_text}
              </p>
            )}

            {/* Specialties */}
            {therapist.specialties && therapist.specialties.length > 0 && (
              <div style={{ marginTop: '2.5rem' }}>
                <span className="ct4-eyebrow" style={{ display: 'block', marginBottom: '1rem' }}>
                  Areas of Focus
                </span>
                <div className="ct4-specialty-wrap">
                  {therapist.specialties.map((s, i) => (
                    <span key={i} className="ct4-specialty-chip">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Therapist photo card */}
          <div className="ct4-spec-card ct4-reveal" style={{ transitionDelay: '0.15s', padding: 0, overflow: 'hidden' }}>
            {/* Photo */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '4 / 5',
                background: photoSrc ? 'var(--surface-2)' : 'var(--gold-glow)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {photoSrc ? (
                <img
                  src={photoSrc} 
                  alt={displayName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }}
                />
              ) : (
                <span style={{ fontSize: 88, fontWeight: 300, color: 'var(--gold)', fontFamily: 'Georgia, serif', lineHeight: 1 }}>
                  {initials}
                </span>
                //  <img
                //   src={photoSrc} 
                //   alt={displayName}
                //   style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }}
                // />
              )}
            </div>

            {/* Details */}
            {/* <div style={{ padding: '1.8rem' }}>
              <h3 style={{ fontSize: 'clamp(20px, 2vw, 26px)', fontWeight: 300, fontFamily: 'Georgia, serif', margin: 0, color: 'var(--ghost)' }}>
                {displayName}
              </h3>
              {therapist.credentials && (
                <p style={{ fontSize: 13, color: 'var(--gold)', letterSpacing: '0.04em', marginTop: 6, marginBottom: 0 }}>
                  {therapist.credentials}
                </p>
              )}
              {therapist.tagline && (
                <p style={{ fontSize: 14, color: 'var(--silver)', lineHeight: 1.6, marginTop: 14, marginBottom: 0, fontWeight: 300 }}>
                  {therapist.tagline}
                </p>
              )}

              <div className="ct4-rule-gold" style={{ margin: '1.5rem 0' }} />

              <dl>
                {therapist.experience ? <Spec k="Experience" v={`${therapist.experience} Years`} /> : null}
                <Spec k="Location" v={therapist.city ?? therapist.location ?? '—'} />
                <Spec k="Languages" v={therapist.languages?.join(' · ') ?? 'English'} />
              </dl>
            </div> */}
          </div>
        </div>
      </div>
    </section>
  )
}

function Spec({ k, v }: { k: string; v: string }) {
  return (
    <div className="ct4-spec-row">
      <dt className="ct4-spec-key">{k}</dt>
      <dd className="ct4-spec-val">{v}</dd>
    </div>
  )
}
