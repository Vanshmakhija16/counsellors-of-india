'use client'

import { ArrowUpRight } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { TherapistProfile } from '../templateUtils'
import { resolveCT3Content } from '../templateUtils'

interface InsightsProps {
  therapist: TherapistProfile
}

export default function Insights({ therapist }: InsightsProps) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const ct3 = resolveCT3Content(therapist.profile_content?.classic3)
  const insights = ct3.faq.length > 0
    ? [
        { n: '001', category: 'On anxiety',     title: 'The anxiety underneath your productivity',  excerpt: 'When ambition is fuelled by avoidance, achievement starts to feel like relief instead of joy. A note on the difference.', meta: 'May 2026 · 6 min' },
        { n: '002', category: 'On grief',        title: 'Grief without a vocabulary',               excerpt: 'Some losses do not arrive with a name — the friendship that thinned, the self you outgrew. They are still grief.', meta: 'Apr 2026 · 8 min' },
        { n: '003', category: 'On relationships',title: 'Why repair matters more than rupture',     excerpt: 'Conflict is not the threat to intimacy we think it is. Unrepaired conflict is. A piece on returning to each other.', meta: 'Mar 2026 · 5 min' },
      ]
    : [
        { n: '001', category: 'On anxiety',     title: 'The anxiety underneath your productivity',  excerpt: 'When ambition is fuelled by avoidance, achievement starts to feel like relief instead of joy. A note on the difference.', meta: 'May 2026 · 6 min' },
        { n: '002', category: 'On grief',        title: 'Grief without a vocabulary',               excerpt: 'Some losses do not arrive with a name — the friendship that thinned, the self you outgrew. They are still grief.', meta: 'Apr 2026 · 8 min' },
        { n: '003', category: 'On relationships',title: 'Why repair matters more than rupture',     excerpt: 'Conflict is not the threat to intimacy we think it is. Unrepaired conflict is. A piece on returning to each other.', meta: 'Mar 2026 · 5 min' },
      ]

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    function revealAll() {
      section!.querySelectorAll('.ct3-reveal').forEach((el, i) => {
        setTimeout(() => el.classList.add('visible'), i * 80)
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
    <section id="insights" ref={sectionRef} className="ct3-section ct3-insights ct3-gold-rule-top">
      <div className="ct3-container">

        <div className="ct3-folio-header ct3-reveal">
          <div>
            {/* <span className="ct3-eyebrow">— IV · Writing</span> */}
            <h2 className="ct3-folio-title" style={{ marginTop: '0.5rem' }}>
              Notes from <em>the room</em>.
            </h2>
          </div>
        </div>

        <div className="ct3-insights-grid">
          {insights.map((p, i) => (
            <article key={p.n} className="ct3-insight-card ct3-reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
              <div className="ct3-insight-meta">
                <span className="ct3-insight-num">⌗ {p.n}</span>
                <span className="ct3-insight-category">{p.category}</span>
              </div>
              <div className="ct3-insight-rule" />
              <h3 className="ct3-insight-title">{p.title}</h3>
              <p className="ct3-insight-excerpt">{p.excerpt}</p>
              <div className="ct3-insight-footer">
                <span className="ct3-insight-date">{p.meta.toUpperCase()}</span>
                <ArrowUpRight size={16} className="ct3-insight-arrow" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
