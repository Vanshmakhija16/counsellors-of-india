'use client'

import { useEffect, useRef, useState } from 'react'

const FAQS = [
  {
    q: 'How is the first session structured?',
    a: 'The first session (typically 60 minutes) is primarily an intake — I want to understand your history, what has brought you here, and what you hope to gain from our work together. By the end, we will have co-created a loose roadmap for our sessions.',
  },
  {
    q: 'Do you offer online sessions?',
    a: 'Yes. All sessions are available online via a secure, HIPAA-friendly video platform. Many clients actually prefer the comfort and privacy of attending from their own space. In-person sessions are also available on request.',
  },
  {
    q: 'How many sessions will I need?',
    a: 'This depends entirely on your goals and the nature of what you are working through. Some find significant relief within 8–12 sessions; others choose to continue for a year or more. We will periodically review progress and adjust our approach together.',
  },
  // {
  //   q: 'What is your cancellation policy?',
  //   a: 'Please cancel or reschedule at least 48 hours before your session to avoid a charge. I understand life is unpredictable — emergencies are always considered individually.',
  // },
  {
    q: 'Is everything I share confidential?',
    a: 'Absolutely. Confidentiality is both an ethical and legal obligation. The only exceptions are those required by law: imminent risk to yourself or others, or disclosure in cases of child or elder abuse.',
  },
]

export default function FAQ() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const revealAll = () =>
      section.querySelectorAll('.ct5-reveal, .ct5-reveal-left, .ct5-reveal-right')
        .forEach(el => el.classList.add('visible'))

    const rect = section.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) { revealAll(); return }

    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { revealAll(); obs.disconnect() } })
    }, { threshold: 0, rootMargin: '0px 0px -8% 0px' })
    obs.observe(section)
    return () => obs.disconnect()
  }, [])

  return (
    <section id="faq" ref={sectionRef} className="ct5-section ct5-faq">
      <div className="ct5-container">
        <div className="ct5-faq-grid">

          {/* LEFT — sticky header */}
          <div className="ct5-faq-sticky ct5-reveal">
            <div className="ct5-label">FAQ</div>
            <h2 className="ct5-section-title">
              Common<em> questions</em>
            </h2>
            <p className="ct5-section-body" style={{ marginTop: '1.5rem' }}>
              Have something else in mind? Feel free to reach out directly — I'm happy to help.
            </p>
          </div>

          {/* RIGHT — accordion */}
          <div className="ct5-faq-list ct5-reveal" style={{ transitionDelay: '0.12s' }}>
            {FAQS.map((faq, i) => {
              const isOpen = openIdx === i
              return (
                <div key={i} className="ct5-faq-item">
                  <button
                    className="ct5-faq-trigger"
                    onClick={() => setOpenIdx(isOpen ? null : i)}
                  >
                    <span className="ct5-faq-q">{faq.q}</span>
                    <span className={`ct5-faq-icon ${isOpen ? 'open' : ''}`}>+</span>
                  </button>
                  <div className={`ct5-faq-body ${isOpen ? 'open' : ''}`}>
                    <p className="ct5-faq-ans">{faq.a}</p>
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      </div>
    </section>
  )
}
