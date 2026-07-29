'use client'

import { useState } from 'react'
import type { TherapistProfile } from '../templateUtils'
import { resolveCT8Content } from '../templateUtils'

interface FAQProps { therapist: TherapistProfile }

export default function FAQ({ therapist }: FAQProps) {
  const ct8 = resolveCT8Content(therapist.profile_content?.classic8)
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  return (
    <section id="faq" className="ct8-section">
      <div className="ct8-container ct8-faq-grid">
        <div className="ct8-section-head" style={{ margin: 0 }}>
          <span className="ct8-eyebrow">FAQ</span>
          <h2 className="ct8-heading ct8-section-title">Common<br /><em>questions</em></h2>
          <p className="ct8-section-sub">
            Whether you’re a student weighing the cost or a professional weighing the time — here’s what people usually ask first.
          </p>
        </div>

        <div>
          {ct8.faq.map((faq, i) => {
            const isOpen = openIdx === i
            return (
              <div key={i} className="ct8-faq-item">
                <button className="ct8-faq-trigger" onClick={() => setOpenIdx(isOpen ? null : i)}>
                  <span className="ct8-faq-q">{faq.q}</span>
                  <span className={`ct8-faq-icon ${isOpen ? 'open' : ''}`}>+</span>
                </button>
                <div className={`ct8-faq-body ${isOpen ? 'open' : ''}`}>
                  <p className="ct8-faq-ans">{faq.a}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
