'use client'

import { useEffect, useRef, useState } from 'react'
import type { TherapistProfile } from '../templateUtils'
import { resolveCT4Content } from '../templateUtils'

interface InsightsProps { therapist: TherapistProfile }

const DEFAULT_REVIEWS = [
  { text: 'Working with this therapist has been one of the most transformative decisions of my life. The depth of understanding — both clinical and human — is extraordinary.', name: 'A.M.' },
  { text: 'I was deeply sceptical of therapy before our first session. Within six weeks I had tools I still use every day. The care in this practice is genuinely rare.', name: 'R.V.' },
  { text: 'Professional, warm, entirely non-judgmental. I always leave a session with clarity I did not enter with. I cannot recommend this practice highly enough.', name: 'S.P.' },
]

export default function Insights({ therapist }: InsightsProps) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const [active, setActive] = useState(0)
  const ct4 = resolveCT4Content(therapist.profile_content?.classic4)
  const trustBar = ct4.insights.trust_bar

  const reviews = therapist.reviews?.map(r => ({ text: r.text, name: r.name })) ?? DEFAULT_REVIEWS

  useEffect(() => {
    const timer = setInterval(() => setActive(a => (a + 1) % reviews.length), 6000)
    return () => clearInterval(timer)
  }, [reviews.length])

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.querySelectorAll('.ct4-reveal').forEach(el => el.classList.add('visible'))
      })
    }, { threshold: 0.15 })
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  const r = reviews[active]

  return (
    <section id="insights" ref={sectionRef} className="ct4-section ct4-testimonials">
      <div className="ct4-container">
        <div className="ct4-section-header ct4-reveal">
          <div>
            <h2 className="ct4-section-title">Client <em>voices</em></h2>
          </div>
        </div>

        <div className="ct4-testimonial-main ct4-reveal">
          <span className="ct4-quote-mark">"</span>
          <blockquote className="ct4-quote-text">{r.text}</blockquote>
          <div className="ct4-quote-author">
            {/* <span className="ct4-quote-author-line" /> */}
            <cite className="ct4-quote-author-name"> - {r.name}</cite>
          </div>
          <div className="ct4-quote-dots" style={{ marginTop: '2.5rem' }}>
            {reviews.map((_, i) => (
              <button key={i} className={`ct4-quote-dot ${active === i ? 'active' : ''}`} onClick={() => setActive(i)} style={{ width: active === i ? 36 : 20 }} />
            ))}
          </div>
        </div>

        {/* Trust bar — now editable */}
        {/* <div className="ct4-reveal" style={{ marginTop: '4rem', paddingTop: '3rem', borderTop: '0.5px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem' }}>
          {trustBar.map((item, i) => (
            <div key={i} style={{ borderLeft: '1px solid var(--border-gold)', paddingLeft: '1.4rem' }}>
              <span className="ct4-eyebrow" style={{ display: 'block', marginBottom: '0.5rem' }}>{item.label}</span>
              <span className="ct4-serif" style={{ fontSize: 15, color: 'var(--platinum)', fontWeight: 400 }}>{item.value}</span>
            </div>
          ))}
        </div> */}
      </div>
    </section>
  )
}
