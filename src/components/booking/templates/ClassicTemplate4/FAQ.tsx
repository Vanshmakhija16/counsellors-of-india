'use client'

import { useEffect, useRef, useState } from 'react'
import type { TherapistProfile } from '../templateUtils'
import { resolveCT4Content } from '../templateUtils'

interface FAQProps { therapist: TherapistProfile }

export default function FAQ({ therapist }: FAQProps) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const [openIdx, setOpenIdx] = useState<number | null>(null)
  const ct4 = resolveCT4Content(therapist.profile_content?.classic4)
  const faqs = ct4.faq

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.querySelectorAll('.ct4-reveal').forEach(el => el.classList.add('visible'))
      })
    }, { threshold: 0.1 })
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="faq" ref={sectionRef} className="ct4-section ct4-faq">
      <div className="ct4-container">
        <div className="ct4-section-header ct4-reveal">
          <div>
            <h2 className="ct4-section-title">Common <em>questions</em></h2>
          </div>
        </div>

        <div>
          {faqs.map((faq, i) => {
            const isOpen = openIdx === i
            return (
              <div key={i} className="ct4-faq-item ct4-reveal" style={{ transitionDelay: `${i * 0.07}s` }}>
                <button className="ct4-faq-trigger" onClick={() => setOpenIdx(isOpen ? null : i)}>
                  <span className="ct4-faq-q">{faq.q}</span>
                  <span className={`ct4-faq-icon ${isOpen ? 'open' : ''}`}>+</span>
                </button>
                <div className={`ct4-faq-body ${isOpen ? 'open' : ''}`}>
                  <p className="ct4-faq-ans">{faq.a}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
