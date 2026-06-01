'use client'

import { useEffect, useRef } from 'react'
import type { TherapistProfile, EditableService } from '../templateUtils'
import { resolveCT4Content } from '../templateUtils'

interface ServicesProps {
  therapist: TherapistProfile
  onBookService: (service: EditableService) => void
}

export default function Services({ therapist, onBookService }: ServicesProps) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const ct4 = resolveCT4Content(therapist.profile_content?.classic4)
  const services = ct4.services
  const defaultFee = therapist.fee

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    function revealAll() {
      section!.querySelectorAll('.ct4-reveal').forEach((el, idx) => {
        setTimeout(() => el.classList.add('visible'), idx * 80)
      })
    }
    const rect = section.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) { revealAll(); return }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { revealAll(); observer.disconnect() } })
    }, { threshold: 0.05 })
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="services" ref={sectionRef} className="ct4-section ct4-services">
      <style>{svcStyles}</style>
      <div className="ct4-container">
        <div className="ct4-section-header ct4-reveal">
          <h2 className="ct4-section-title"><em>My</em> Services</h2>
        </div>

        <div className="ct4-services-grid">
          {services.map((svc, i) => {
            const price = svc.price ?? defaultFee
            const isCustomPrice = svc.price != null

            return (
              <div
                key={i}
                className="ct4-service-card ct4-reveal"
                style={{ transitionDelay: `${i * 0.07}s` }}
              >
                <span className="ct4-service-number">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="ct4-service-name">{svc.name}</h3>
                <p className="ct4-service-desc">{svc.desc}</p>

                {/* Price badge */}
                <div className="ct4-svc-price-row">
                  <div className="ct4-svc-price-badge">
                    <span className="ct4-svc-price-amount">
                      ₹{price != null ? price.toLocaleString('en-IN') : '—'}
                    </span>
                    <span className="ct4-svc-price-label">per session</span>
                  </div>
                  {isCustomPrice && defaultFee && svc.price !== defaultFee && (
                    <span className="ct4-svc-price-diff">
                      {svc.price! > defaultFee ? '↑' : '↓'} vs standard
                    </span>
                  )}
                </div>

                {/* Book Now */}
                <button
                  className="ct4-svc-book-btn"
                  onClick={e => { e.stopPropagation(); onBookService(svc) }}
                >
                  Book {svc.name.split(' ')[0]} →
                </button>
              </div>
            )
          })}
        </div>

        {/* Footer row */}
        <div className="ct4-reveal" style={{
          marginTop: '3rem', paddingTop: '2rem',
          borderTop: '0.5px solid var(--border)',
          display: 'flex', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '1rem', alignItems: 'center',
        }}>
          <p style={{ fontSize: 14, color: 'var(--silver)', fontWeight: 300, maxWidth: '56ch', lineHeight: 1.8 }}>
            {/* All approaches are integrative, I draw from what genuinely helps rather than adhering to a single school. Every first session is diagnostic; together we craft a plan. */}
          </p>
          <button
            className="ct4-btn-ghost"
            style={{ position: 'relative', zIndex: 10 }}
            onClick={() => document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Begin Your Journey →
          </button>
        </div>
      </div>
    </section>
  )
}

const svcStyles = `
  /* Price row */
  .ct4-svc-price-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-top: 1.1rem;
  }

  /* Price badge — gold pill */
  .ct4-svc-price-badge {
    display: flex;
    align-items: baseline;
    gap: 0.35rem;
    background: rgba(212, 175, 55, 0.1);
    border: 0.5px solid rgba(212, 175, 55, 0.35);
    border-radius: 3px;
    padding: 0.35rem 0.75rem;
  }
  .ct4-svc-price-amount {
    font-family: var(--font-mono, monospace);
    font-size: 15px;
    font-weight: 500;
    color: var(--gold);
    letter-spacing: 0.04em;
  }
  .ct4-svc-price-label {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: var(--gold-muted, #b8922a);
    font-weight: 400;
  }

  /* ↑↓ vs standard label */
  .ct4-svc-price-diff {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: var(--silver);
    opacity: 0.6;
  }

  /* Book Now button */
  .ct4-svc-book-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    margin-top: 1.4rem;
    padding: 0.6rem 1.4rem;
    font-size: 11px;
    font-family: var(--font-mono, monospace);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--obsidian, #080808);
    background: var(--gold);
    border: none;
    border-radius: 2px;
    cursor: pointer;
    position: relative;
    z-index: 10;
    pointer-events: auto;
    transition: background 0.25s ease, transform 0.2s ease, box-shadow 0.25s ease;
  }
  .ct4-svc-book-btn:hover {
    background: #e6c740;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(212, 175, 55, 0.35);
  }
  .ct4-svc-book-btn:active {
    transform: translateY(0);
    box-shadow: none;
  }
`
