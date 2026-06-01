'use client'

import { useEffect, useRef, useState } from 'react'
import type { TherapistProfile } from '../templateUtils'

interface InsightsProps { therapist: TherapistProfile }

export default function Insights({ therapist }: InsightsProps) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const [active, setActive] = useState(0)

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

  const rawReviews = therapist.reviews || []
  const reviews = rawReviews.length > 0 ? rawReviews : [
    { name: 'A.M.', rating: 5, text: 'I came in feeling completely lost. After just a few months of working together, I have tools I use every single day. My anxiety is manageable now — something I didn\'t think was possible.' },
    { name: 'R.V.', rating: 5, text: 'I was nervous about opening up to a stranger, but there was something warm and safe about the space. I felt heard from the very first session.' },
    { name: 'S.P.', rating: 5, text: 'Very professional, deeply empathetic, and completely non-judgmental. My relationship with my partner has transformed. I\'m grateful.' },
  ]

  const rating     = therapist.rating ?? 4.9
  const totalReviews = therapist.totalReviews ?? 127

  return (
    <section id="testimonials" ref={sectionRef} className="ct5-section ct5-testimonials">
      <div className="ct5-container">

        {/* Header */}
        <div className="ct5-reveal" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem', marginBottom: '1rem' }}>
          <div>
            <div className="ct5-label">Testimonials</div>
            <h2 className="ct5-section-title">
              Stories of <em>transformation</em>
            </h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, fontWeight: 300, color: 'var(--cream)', lineHeight: 1 }}>
              {rating}
            </div>
            <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(247,244,239,0.4)', marginTop: 4 }}>
              Avg rating · {totalReviews} sessions
            </div>
            <div style={{ display: 'flex', gap: 3, justifyContent: 'flex-end', marginTop: 6 }}>
              {[1,2,3,4,5].map(i => (
                <span key={i} className="ct5-star">★</span>
              ))}
            </div>
          </div>
        </div>

        {/* Review cards */}
        <div className="ct5-review-grid ct5-reveal" style={{ transitionDelay: '0.12s' }}>
          {reviews.map((r, i) => (
            <div key={i} className="ct5-review-card">
              <div className="ct5-review-stars">
                {Array.from({ length: r.rating }).map((_, j) => (
                  <span key={j} className="ct5-star">★</span>
                ))}
              </div>
              <p className="ct5-review-text">"{r.text}"</p>
              <div className="ct5-review-author">
                <div className="ct5-review-avatar">{r.name[0]}</div>
                <span className="ct5-review-name">{r.name}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div
          className="ct5-reveal"
          style={{
            transitionDelay: '0.25s',
            marginTop: '3rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          {[
            { icon: '🔒', text: '100% Confidential' },
            { icon: '✅', text: 'RCI Licensed' },
            { icon: '📋', text: 'Evidence-Based Practice' },
            { icon: '💬', text: 'Online & In-Person' },
          ].map((b, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              background: 'rgba(247,244,239,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '999px',
            }}>
              <span style={{ fontSize: 14 }}>{b.icon}</span>
              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: '0.06em',
                color: 'rgba(247,244,239,0.65)',
              }}>{b.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
