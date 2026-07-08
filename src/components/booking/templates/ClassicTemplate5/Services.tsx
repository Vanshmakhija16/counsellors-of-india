'use client'

import { useEffect, useRef } from 'react'
import type { TherapistProfile } from '../templateUtils'
import { resolveCT5Content } from '../templateUtils'

interface ServicesProps { therapist: TherapistProfile }

export default function Services({ therapist }: ServicesProps) {
  const sectionRef = useRef<HTMLElement | null>(null)

  const ct5 = resolveCT5Content(therapist.profile_content?.classic5)
  const services = ct5.services
  const defaultFee = therapist.fee
  const defaultDuration = therapist.sessionDuration ?? 50

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const revealAll = () => section.querySelectorAll('.ct5-reveal, .ct5-reveal-left, .ct5-reveal-right')
      .forEach(el => el.classList.add('visible'))
    const rect = section.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) { revealAll(); return }
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { revealAll(); obs.disconnect() } })
    }, { threshold: 0, rootMargin: '0px 0px -8% 0px' })
    obs.observe(section)
    return () => obs.disconnect()
  }, [])

  const specialties = therapist.specialties || []

  return (
    <section id="specialties" ref={sectionRef} className="ct5-section ct5-services">
      <div className="ct5-container">
        <div className="ct5-services-header ct5-reveal">
          <div>
            <div className="ct5-label">Specialties</div>
            <h2 className="ct5-section-title">
              Services <em>for you</em>
            </h2>
          </div>
          <p className="ct5-section-body" style={{ maxWidth: '36ch', margin: 0 }}>
            Every person I work with is unique. My approach adapts to your specific needs, goals, and pace.
          </p>
        </div>

        <div className="ct5-services-grid ct5-reveal" style={{ transitionDelay: '0.12s' }}>
          {services.map((s, i) => {
            const price = s.price != null ? Number(s.price) : defaultFee
            const duration = s.duration_mins ?? defaultDuration
            return (
              <div key={i} className="ct5-service-card">
                <span className="ct5-service-num">0{i + 1}</span>
                <h3 className="ct5-service-name">{s.name}</h3>
                <p className="ct5-service-desc">{s.desc}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: '1.2rem' }}>
                  {s.tag && <span className="ct5-service-tag">{s.tag}</span>}
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '5px 12px',
                      borderRadius: 999,
                      border: '1px solid var(--border)',
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: 'var(--warm-gray)',
                    }}
                  >
                    {duration} min{price != null ? ` · ₹${price.toLocaleString('en-IN')}` : ''}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Specialty chips from therapist data */}
        {specialties.length > 0 && (
          <div className="ct5-reveal" style={{ transitionDelay: '0.25s' }}>
            <p style={{
              fontSize: 12, fontWeight: 600, letterSpacing: '0.15em',
              textTransform: 'uppercase', color: 'var(--warm-gray)',
              marginTop: '3rem', marginBottom: '1rem',
            }}>
              Also experienced in
            </p>
            <div className="ct5-chip-wrap">
              {specialties.map(sp => (
                <span key={sp} className="ct5-chip">{sp}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
