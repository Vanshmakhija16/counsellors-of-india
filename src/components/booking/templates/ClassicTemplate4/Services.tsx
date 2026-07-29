'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { TherapistProfile, EditableService } from '../templateUtils'
import { resolveCT4Content } from '../templateUtils'

interface ServicesProps {
  therapist: TherapistProfile
  onBookService: (service: EditableService) => void
}

export default function Services({ therapist, onBookService }: ServicesProps) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const ct4 = resolveCT4Content(therapist.profile_content?.classic4)
  const services = ct4.services
  const defaultFee = therapist.fee

  // ── Single-row carousel: one active (floating) card centered in the
  // viewport, neighbours peeking at reduced scale/opacity either side.
  // Track position is measured in JS (not pure CSS) so the active card
  // stays perfectly centered regardless of container width. ──
  const [activeIndex, setActiveIndex] = useState(() => Math.max(0, Math.floor((services.length - 1) / 2)))
  const [isMobile, setIsMobile] = useState(false)
  const [translate, setTranslate] = useState(0)

  const CARD_W = isMobile ? 268 : 340
  const GAP = isMobile ? 18 : 28

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    function recompute() {
      const wrapW = wrapRef.current?.offsetWidth ?? 0
      setTranslate(wrapW / 2 - CARD_W / 2 - activeIndex * (CARD_W + GAP))
    }
    recompute()
    window.addEventListener('resize', recompute)
    return () => window.removeEventListener('resize', recompute)
  }, [activeIndex, CARD_W, GAP])

  function goPrev() { setActiveIndex(i => (i - 1 + services.length) % services.length) }
  function goNext() { setActiveIndex(i => (i + 1) % services.length) }

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

        <div className="ct4-services-carousel ct4-reveal">
          {services.length > 1 && (
            <button className="ct4-svc-arrow" onClick={goPrev} aria-label="Previous service">
              <ChevronLeft size={18} />
            </button>
          )}

          <div className="ct4-services-track-wrap" ref={wrapRef}>
            <div
              className="ct4-services-track"
              style={{ transform: `translateX(${translate}px)`, gap: `${GAP}px` }}
            >
              {services.map((svc, i) => {
                const price = svc.price ?? defaultFee
                const isCustomPrice = svc.price != null
                const isActive = i === activeIndex

                return (
                  <div
                    key={i}
                    className={`ct4-service-card ${isActive ? 'ct4-service-card--active' : ''}`}
                    style={{ width: `${CARD_W}px` }}
                    onClick={() => !isActive && setActiveIndex(i)}
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
                      <div className="ct4-svc-duration-badge">
                        <span className="ct4-svc-duration-amount">
                          {svc.duration_mins ?? therapist.sessionDuration ?? 50} min
                        </span>
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
          </div>

          {services.length > 1 && (
            <button className="ct4-svc-arrow" onClick={goNext} aria-label="Next service">
              <ChevronRight size={18} />
            </button>
          )}
        </div>

        {services.length > 1 && (
          <div className="ct4-services-dots ct4-reveal">
            {services.map((_, i) => (
              <button
                key={i}
                className={`ct4-services-dot ${i === activeIndex ? 'active' : ''}`}
                onClick={() => setActiveIndex(i)}
                aria-label={`Show service ${i + 1}`}
              />
            ))}
          </div>
        )}

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
  /* ── Single-row carousel shell ── */
  .ct4-services-carousel {
    display: flex;
    align-items: center;
    gap: clamp(0.5rem, 2vw, 1.25rem);
  }

  .ct4-svc-arrow {
    flex-shrink: 0;
    width: 46px; height: 46px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    background: var(--surface);
    border: 0.5px solid var(--border-gold);
    color: var(--gold);
    cursor: pointer;
    transition: all var(--dur) var(--ease);
    z-index: 5;
  }
  .ct4-svc-arrow:hover {
    background: var(--gold); color: var(--void);
    box-shadow: 0 0 24px rgba(212,175,55,0.35);
    transform: translateY(-2px);
  }
  .ct4-svc-arrow:active { transform: translateY(0); }

  .ct4-services-track-wrap {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    padding: 3rem 0;
  }
  .ct4-services-track {
    display: flex;
    align-items: center;
    will-change: transform;
    transition: transform 0.55s cubic-bezier(0.65,0,0.35,1);
  }

  /* Card: base = a dimmed, slightly-shrunk "neighbour" state */
  .ct4-services-track .ct4-service-card {
    flex-shrink: 0;
    background: var(--charcoal);
    padding: 2.5rem 2rem;
    position: relative; overflow: hidden;
    border: 0.5px solid var(--border);
    border-radius: var(--radius);
    opacity: 0.45;
    transform: scale(0.86);
    cursor: pointer;
    transition: opacity 0.5s var(--ease), transform 0.5s var(--ease),
                box-shadow 0.5s var(--ease), border-color 0.5s var(--ease);
  }
  .ct4-services-track .ct4-service-card::before {
    content: ''; position: absolute;
    inset: 0; opacity: 0;
    background: radial-gradient(ellipse at top left, var(--gold-glow) 0%, transparent 70%);
    transition: opacity 0.4s var(--ease);
  }
  .ct4-services-track .ct4-service-card:hover:not(.ct4-service-card--active) { opacity: 0.7; }

  /* Card: active = "floating" \u2014 lifted, enlarged, gold-lit, sharp focus */
  .ct4-services-track .ct4-service-card--active {
    opacity: 1;
    transform: scale(1.07) translateY(-16px);
    border-color: var(--border-gold);
    box-shadow: var(--shadow-2), 0 30px 60px -20px rgba(212,175,55,0.16), var(--edge-light);
    z-index: 2;
    cursor: default;
  }
  .ct4-services-track .ct4-service-card--active::before { opacity: 1; }
  .ct4-services-track .ct4-service-card--active .ct4-service-number { opacity: 0.4; }

  /* ── Dot indicators beneath the carousel ── */
  .ct4-services-dots { display: flex; justify-content: center; gap: 8px; margin-top: 2.5rem; }
  .ct4-services-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--border); border: none; cursor: pointer; padding: 0;
    transition: background 0.3s ease, width 0.3s ease, border-radius 0.3s ease;
  }
  .ct4-services-dot.active { background: var(--gold); width: 22px; border-radius: 3px; }

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

  /* Duration badge — quiet, secondary pill next to price */
  .ct4-svc-duration-badge {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.04);
    border: 0.5px solid var(--border, rgba(255,255,255,0.12));
    border-radius: 3px;
    padding: 0.35rem 0.75rem;
  }
  .ct4-svc-duration-amount {
    font-family: var(--font-mono, monospace);
    font-size: 11px;
    font-weight: 400;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--silver);
    opacity: 0.75;
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
    background: var(--gold);
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(212, 175, 55, 0.35);
  }
  .ct4-svc-book-btn:active {
    transform: translateY(0);
    box-shadow: none;
  }
`
