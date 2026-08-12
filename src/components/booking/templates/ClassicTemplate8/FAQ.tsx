'use client'

import { useState } from 'react'
import type { TherapistProfile } from '../templateUtils'
import { resolveCT8Content } from '../templateUtils'

interface FAQProps { therapist: TherapistProfile }

export default function FAQ({ therapist }: FAQProps) {
  const ct8 = resolveCT8Content(therapist.profile_content?.classic8)
  const [openSet, setOpenSet] = useState<Set<number>>(new Set())

  const allOpen = ct8.faq.length > 0 && openSet.size === ct8.faq.length

  function toggle(i: number) {
    setOpenSet(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  function toggleAll() {
    setOpenSet(allOpen ? new Set() : new Set(ct8.faq.map((_, i) => i)))
  }

  // Structured data so search engines can show these as rich FAQ results.
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: ct8.faq.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  }

  return (
    <section id="faq" className="ct8-section">
      {ct8.faq.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <div className="ct8-container ct8-faq-grid">
        <div className="ct8-section-head" style={{ margin: 0 }}>
          <span className="ct8-eyebrow">FAQ</span>
          <h2 className="ct8-heading ct8-section-title">Common<br /><em>questions</em></h2>
          <p className="ct8-section-sub">
            Whether you’re a student weighing the cost or a professional weighing the time — here’s what people usually ask first.
          </p>
          {ct8.faq.length > 1 && (
            <button type="button" className="ct8-faq-expand-all" onClick={toggleAll}>
              {allOpen ? 'Collapse all' : 'Expand all'}
            </button>
          )}
        </div>

        <div>
          {ct8.faq.map((faq, i) => {
            const isOpen = openSet.has(i)
            return (
              <div key={i} className="ct8-faq-item">
                <button className="ct8-faq-trigger" onClick={() => toggle(i)}>
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
