'use client'

import { useState, useEffect, useRef } from 'react'
import type { TherapistProfile } from '../templateUtils'
import { resolveCT3Content } from '../templateUtils'
import { Fullscreen } from 'lucide-react'

interface FAQProps {
  therapist: TherapistProfile
}

export default function FAQ({ therapist }: FAQProps) {
  const [open, setOpen] = useState<number | null>(0)
  const sectionRef = useRef<HTMLElement | null>(null)
  const ct3 = resolveCT3Content(therapist.profile_content?.classic3)
  const faqs = ct3.faq

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    function revealAll() {
      section!.querySelectorAll('.ct3-reveal').forEach((el, i) => {
        setTimeout(() => el.classList.add('visible'), i * 60)
      })
    }
    const rect = section.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) { revealAll(); return }
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { revealAll(); obs.disconnect() } })
    }, { threshold: 0.05 })
    obs.observe(section)
    return () => obs.disconnect()
  }, [])

  return (
    <section id="faq" ref={sectionRef} className="ct3-section ct3-faq ct3-gold-rule-top">
      <div className="ct3-container">

        <div className="ct3-folio-header ct3-reveal">
          <div>
            {/* <span className="ct3-eyebrow">— V · Notes</span> */}
            <h2 className="ct3-folio-title" style={{ marginTop: '0.5rem' }}>
               <em>FAQ's</em>.
            </h2>
          </div>
        </div>

        <div style={{ maxWidth: Fullscreen }}>
          {faqs.map((item, i) => {
            const isOpen = open === i
            return (
              <div key={i} className="ct3-faq-item ct3-reveal" style={{ transitionDelay: `${i * 0.05}s` }}>
                <button
                  className="ct3-faq-trigger"
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <div className="ct3-faq-q-wrap">
                    {/* <span className="ct3-faq-num">{String(i + 1).padStart(2, '0')}</span> */}
                    <span className="ct3-faq-q" style={isOpen ? { color: 'var(--gold)' } : {}}>
                      {item.q}
                    </span>
                  </div>
                  <span className={`ct3-faq-icon ${isOpen ? 'open' : ''}`}>+</span>
                </button>
                <div className={`ct3-faq-body ${isOpen ? 'open' : ''}`}>
                  <p className="ct3-faq-ans">{item.a}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
