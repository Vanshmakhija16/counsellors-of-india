'use client'

import { useEffect, useRef } from 'react'
import type { TherapistProfile } from '../templateUtils'

interface AboutProps { therapist: TherapistProfile }

const VALUES = [
  { icon: '🌱', title: 'Growth-Oriented',    desc: 'Every session is a step toward lasting change — not just relief from symptoms.' },
  { icon: '🤝', title: 'Non-Judgmental',      desc: 'A safe, confidential space where you are accepted exactly as you are.' },
  { icon: '🧩', title: 'Evidence-Based',      desc: 'Integrating CBT, mindfulness, and psychodynamic approaches tailored to you.' },
  { icon: '💬', title: 'Collaborative',       desc: 'Your voice matters. Therapy works best when we build a plan together.' },
]

export default function About({ therapist }: AboutProps) {
  const sectionRef = useRef<HTMLElement | null>(null)

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

  const bio        = therapist.bio || 'I believe that healing is possible for everyone. With warmth, evidence-based tools, and genuine curiosity, I help individuals understand themselves more deeply and build lives of meaning.'
  const education  = (therapist.education || ['M.Phil Clinical Psychology', 'RCI Licensed Psychologist']).map((e: unknown) =>
    typeof e === 'string'
      ? e
      : [(e as { degree?: string }).degree, (e as { institution?: string }).institution, (e as { year?: string | number }).year]
          .filter(Boolean)
          .join(' — ')
  )
  const certs      = therapist.certifications || ['Cognitive Behavioral Therapy (CBT)', 'Mindfulness-Based Stress Reduction', 'Trauma-Informed Care']
  const langs      = therapist.languages || ['English', 'Hindi']
  const exp        = therapist.experience ?? 8

  return (
    <section id="about" ref={sectionRef} className="ct5-section ct5-about">
      <div className="ct5-container">
        <div className="ct5-about-grid">

          {/* LEFT — Bio + values */}
          <div>
            <div className="ct5-reveal">
              <div className="ct5-label">About Me</div>
              <h2 className="ct5-section-title">
                Where healing<br />
                <em>begins with listening</em>
              </h2>
            </div>

            <div className="ct5-reveal" style={{ transitionDelay: '0.1s' }}>
              <p className="ct5-about-body" style={{ marginBottom: '2.5rem' }}>
                {bio}
              </p>
            </div>

            {/* <div className="ct5-values ct5-reveal" style={{ transitionDelay: '0.2s' }}>
              {VALUES.map((v, i) => (
                <div key={i} className="ct5-value-row">
                  <div className="ct5-value-icon">{v.icon}</div>
                  <div>
                    <span className="ct5-value-title">{v.title}</span>
                    <p className="ct5-value-desc">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div> */}
          </div>

          {/* RIGHT — Credentials */}
          <div>
            <div className="ct5-reveal-right" style={{ transitionDelay: '0.15s' }}>
              {/* Experience strip */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '1.5rem',
              }}>
                {[
                  { num: `${exp}+`, lbl: 'Years of Experience' },
                  { num: `${therapist.totalReviews ?? 200}+`, lbl: 'Clients Helped' },
                ].map((s, i) => (
                  <div key={i} style={{
                    padding: '1.6rem',
                    background: 'var(--surface)',
                    borderRadius: '16px',
                    border: '1.5px solid var(--border)',
                    textAlign: 'center',
                  }}>
                    <div style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 40, fontWeight: 400,
                      color: 'var(--forest)', lineHeight: 1,
                    }}>{s.num}</div>
                    <div style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 10, fontWeight: 600,
                      letterSpacing: '0.12em', textTransform: 'uppercase',
                      color: 'var(--warm-gray)', marginTop: 6,
                    }}>{s.lbl}</div>
                  </div>
                ))}
              </div>

              {/* Education & certs card */}
              <div className="ct5-cred-card">
                <span className="ct5-cred-title">Education & Credentials</span>
                {education.map((e, i) => (
                  <div key={i} className="ct5-cred-item">
                    <span className="ct5-cred-dot" />
                    <span className="ct5-cred-text">{e}</span>
                  </div>
                ))}
                {certs.length > 0 && (
                  <>
                    <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '1rem 0' }} />
                    <span className="ct5-cred-title" style={{ marginBottom: '0.8rem' }}>Certifications</span>
                    {certs.map((c, i) => (
                      <div key={i} className="ct5-cred-item">
                        <span className="ct5-cred-dot" style={{ background: 'var(--terra-light)' }} />
                        <span className="ct5-cred-text">{c}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* Languages */}
              <div style={{
                marginTop: '1.5rem',
                padding: '1.5rem',
                background: 'var(--surface)',
                borderRadius: '16px',
                border: '1.5px solid var(--border)',
              }}>
                <span className="ct5-label" style={{ marginBottom: '0.8rem' }}>Languages</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {langs.map(l => (
                    <span key={l} className="ct5-chip">{l}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
