'use client'

import { useState } from 'react'
import type { TherapistProfile } from '../templateUtils'
import { resolveCT8Content } from '../templateUtils'

interface FAQProps { therapist: TherapistProfile }

export default function FAQ({ therapist }: FAQProps) {
  const ct8 = resolveCT8Content(therapist.profile_content?.classic8)
  const [openSet, setOpenSet] = useState<Set<number>>(new Set())

  function toggle(i: number) {
    setOpenSet(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
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
      <div className="ct8-container">
        <h2 className="ct8-heading ct8-faq-title">FAQs</h2>
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
