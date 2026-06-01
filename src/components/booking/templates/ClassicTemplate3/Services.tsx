'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { TherapistProfile, EditableService } from '../templateUtils'
import { resolveCT3Content } from '../templateUtils'

interface ServicesProps {
  therapist: TherapistProfile
  onBookService: (svc: EditableService) => void
}

const ICONS = ['◎', '◈', '◇', '◉', '◆', '○', '◐', '◑']
const ACCENTS = [
  'rgba(61,122,106,0.15)',
  'rgba(232,130,90,0.15)',
  'rgba(123,111,172,0.15)',
  'rgba(61,122,106,0.1)',
  'rgba(232,130,90,0.1)',
  'rgba(123,111,172,0.1)',
]
const ACCENT_BORDERS = [
  'rgba(61,122,106,0.55)',
  'rgba(232,130,90,0.55)',
  'rgba(123,111,172,0.55)',
  'rgba(61,122,106,0.4)',
  'rgba(232,130,90,0.4)',
  'rgba(123,111,172,0.4)',
]

// ─── Card geometry ────────────────────────────────────────────────────────
const CARD_W_ACTIVE = 320   // active card width
const CARD_W_SIDE   = 272   // side card width
const CARD_GAP      = 20

export default function Services({ therapist, onBookService }: ServicesProps) {
  const sectionRef = useRef<HTMLElement | null>(null)

  const ct3      = resolveCT3Content(therapist.profile_content?.classic3)
  const services = ct3.services

  const [activeIdx, setActiveIdx] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [dragStart, setDragStart]   = useState<number | null>(null)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [visible, setVisible]       = useState(false)

  const total = services.length

  // ── Reveal on scroll ───────────────────────────────────────────────────
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.06 }
    )
    obs.observe(section)
    return () => obs.disconnect()
  }, [])

  // ── Navigate ───────────────────────────────────────────────────────────
  const navigate = useCallback((dir: 1 | -1) => {
    if (animating) return
    setAnimating(true)
    setActiveIdx(i => (i + dir + total) % total)
    setTimeout(() => setAnimating(false), 460)
  }, [animating, total])

  const goTo = useCallback((idx: number) => {
    if (idx === activeIdx || animating) return
    setAnimating(true)
    setActiveIdx(idx)
    setTimeout(() => setAnimating(false), 460)
  }, [activeIdx, animating])

  // ── Keyboard ───────────────────────────────────────────────────────────
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  navigate(-1)
      if (e.key === 'ArrowRight') navigate(1)
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [navigate])

  // ── Touch ──────────────────────────────────────────────────────────────
  function onTouchStart(e: React.TouchEvent) {
    setTouchStart(e.touches[0].clientX); setDragStart(e.touches[0].clientX); setIsDragging(true)
  }
  function onTouchMove(e: React.TouchEvent) {
    if (dragStart === null) return; setDragOffset(e.touches[0].clientX - dragStart)
  }
  function onTouchEnd() {
    if (Math.abs(dragOffset) > 44) navigate(dragOffset < 0 ? 1 : -1)
    setTouchStart(null); setDragStart(null); setDragOffset(0); setIsDragging(false)
  }

  // ── Mouse drag ─────────────────────────────────────────────────────────
  function onMouseDown(e: React.MouseEvent) { setDragStart(e.clientX); setIsDragging(true) }
  function onMouseMove(e: React.MouseEvent) {
    if (!isDragging || dragStart === null) return; setDragOffset(e.clientX - dragStart)
  }
  function onMouseUp() {
    if (isDragging && Math.abs(dragOffset) > 44) navigate(dragOffset < 0 ? 1 : -1)
    setDragStart(null); setDragOffset(0); setIsDragging(false)
  }

  // ── Always show exactly 3 cards: [prev, active, next] ─────────────────
  const cardIndices = [
    (activeIdx - 1 + total) % total,   // pos 0 — left
    activeIdx,                          // pos 1 — center (active)
    (activeIdx + 1) % total,            // pos 2 — right
  ]

  const active = services[activeIdx]

  return (
    <section
      id="services"
      ref={sectionRef}
      className="ct3-section ct3-services"
      style={{ overflow: 'hidden', paddingBottom: 'clamp(3rem,8vh,6rem)' }}
    >
      <div className="ct3-container">

        {/* ── Header ── */}
        <div
          className="ct3-svc-header"
          style={{
            opacity:   visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(24px)',
            transition:'opacity 0.7s ease, transform 0.7s ease',
          }}
        >
          <div>
            {/* <span className="ct3-eyebrow">— III · Method</span> */}
            <h2 className="ct3-folio-title" style={{ marginTop: '0.5rem' }}>
              Shapes of <em>work</em>.
            </h2>
          </div>
          {/* <p className="ct3-svc-header-sub">
            {total} distinct formats. Each designed around a specific kind of need.
          </p> */}
        </div>

        {/* ── Carousel + arrows in one row ── */}
        <div
          style={{
            
            opacity:   visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(28px)',
            transition:'opacity 0.75s ease 0.1s, transform 0.75s ease 0.1s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>

            {/* ◀ Prev */}
            <button
              onClick={() => navigate(-1)}
              aria-label="Previous service"
              style={{
                flexShrink:    0,
                width:         44, height: 44,
                borderRadius:  '50%',
                border:        '1.5px solid var(--rule-strong)',
                background:    'var(--bg-card)',
                color:         'var(--ink)',
                display:       'flex', alignItems: 'center', justifyContent: 'center',
                cursor:        'pointer',
                transition:    'all 0.22s ease',
                boxShadow:     '0 2px 12px rgba(28,43,38,0.07)',
                zIndex:        20,
              }}
              onMouseEnter={e => { const b = e.currentTarget; b.style.background = 'var(--sage)'; b.style.color = '#fff'; b.style.borderColor = 'var(--sage)' }}
              onMouseLeave={e => { const b = e.currentTarget; b.style.background = 'var(--bg-card)'; b.style.color = 'var(--ink)'; b.style.borderColor = 'var(--rule-strong)' }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* ── Card track ── */}
            <div
            
              style={{
                flex:       1,
                overflow:   'hidden',
                position:   'relative',
                // top padding gives room for the center card to float up
                padding:    '80px 0 8px',
                cursor:     isDragging ? 'grabbing' : 'grab',
                userSelect: 'none',
              }}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
            >
              {/* Soft edge fades */}
              <div style={{
                position:      'absolute', inset: 0, zIndex: 10, pointerEvents: 'none',
                background:    'linear-gradient(to right, var(--bg-base) 0%, transparent 6%, transparent 94%, var(--bg-base) 100%)',
              }} />

              {/* Cards row */}
              <div style={{
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                gap:            `${CARD_GAP}px`,
                transform:      `translateX(${isDragging ? dragOffset * 0.15 : 0}px)`,
                transition:     isDragging ? 'none' : 'transform 0.42s cubic-bezier(0.25,0.46,0.45,0.94)',
              }}>
                {cardIndices.map((svcIdx, pos) => {
                  const isActive = pos === 1          // center slot is always active
                  const svc      = services[svcIdx]
                  const cardAccent       = ACCENTS[svcIdx % ACCENTS.length]
                  const cardAccentBorder = ACCENT_BORDERS[svcIdx % ACCENT_BORDERS.length]

                  // Per-slot visual params
                  const translateY = isActive ? -36 : 0
                  const scale      = isActive ? 1.04 : 0.93
                  const opacity    = isActive ? 1    : 0.75
                  const zIdx       = isActive ? 20   : 5
                  const cardW      = isActive ? CARD_W_ACTIVE : CARD_W_SIDE
                  const minH       = isActive ? 340  : 290

                  return (
                    <div
                      key={`${svcIdx}-${pos}`}
                      onClick={() => !isDragging && !isActive && goTo(svcIdx)}
                      style={{
                        width:         cardW,
                        flexShrink:    0,
                        minHeight:     minH,
                        transform:     `translateY(${translateY}px) scale(${scale})`,
                        opacity,
                        zIndex:        zIdx,
                        transition:    'transform 0.42s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.42s ease, box-shadow 0.42s ease, width 0.42s ease, min-height 0.42s ease',
                        cursor:        isActive ? 'default' : 'pointer',
                        position:      'relative',
                        borderRadius:  20,
                        background:    `linear-gradient(155deg, ${cardAccent}, rgba(255,255,255,0.03))`,
                        border:        `1.5px solid ${isActive ? cardAccentBorder : 'rgba(28,43,38,0.09)'}`,
                        boxShadow:     isActive
                          ? `0 24px 56px rgba(28,43,38,0.2), 0 6px 24px rgba(28,43,38,0.1), 0 0 0 1px ${cardAccentBorder}`
                          : '0 3px 14px rgba(28,43,38,0.06)',
                        padding:       isActive ? '1.8rem 1.8rem' : '1.5rem 1.5rem',
                        display:       'flex',
                        flexDirection: 'column',
                        overflow:      'hidden',
                      }}
                    >
                      {/* Icon + kind badge */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.9rem' }}>
                        <span style={{
                          fontSize:   isActive ? 20 : 16,
                          color:      isActive ? 'var(--sage)' : 'var(--ink-4)',
                          lineHeight: 1,
                          transition: 'all 0.42s ease',
                        }}>
                          {ICONS[svcIdx % ICONS.length]}
                        </span>
                        <span style={{
                          fontFamily:    "'JetBrains Mono', monospace",
                          fontSize:      8.5,
                          letterSpacing: '0.2em',
                          textTransform: 'uppercase',
                          color:         isActive ? 'var(--sage)' : 'var(--ink-4)',
                          padding:       '3px 9px',
                          borderRadius:  100,
                          border:        `1px solid ${isActive ? cardAccentBorder : 'rgba(28,43,38,0.1)'}`,
                          background:    isActive ? cardAccent : 'transparent',
                          transition:    'all 0.42s ease',
                        }}>
                          {svc?.kind || 'Individual'}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 style={{
                        fontFamily:    "'Playfair Display', serif",
                        fontSize:      isActive ? 22 : 18,
                        fontWeight:    500,
                        fontStyle:     'italic',
                        color:         'var(--ink)',
                        lineHeight:    1.2,
                        margin:        '0 0 0.75rem',
                        letterSpacing: '-0.02em',
                        transition:    'font-size 0.42s ease',
                      }}>
                        {svc?.name ?? '—'}
                      </h3>

                      {/* Divider */}
                      <div style={{
                        height:        1,
                        background:    isActive ? cardAccentBorder : 'var(--rule)',
                        marginBottom:  '0.75rem',
                        transition:    'background 0.42s ease',
                      }} />

                      {/* Description — 3 lines on side, more on active */}
                      <p style={{
                        fontFamily:       "'Plus Jakarta Sans', sans-serif",
                        fontSize:         isActive ? 13.5 : 12.5,
                        lineHeight:       1.72,
                        fontWeight:       400,
                        color:            isActive ? 'var(--ink-2)' : 'var(--ink-3)',
                        flex:             1,
                        margin:           0,
                        transition:       'all 0.42s ease',
                        display:          '-webkit-box',
                        WebkitLineClamp:  isActive ? 4 : 3,
                        WebkitBoxOrient:  'vertical',
                        overflow:         'hidden',
                      } as React.CSSProperties}>
                        {svc?.desc ?? ''}
                      </p>

                      {/* Tags — active only, compact */}
                      {isActive && (svc?.forWhom ?? []).length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, margin: '0.75rem 0 0' }}>
                          {(svc.forWhom ?? []).slice(0, 4).map(tag => (
                            <span key={tag} style={{
                              fontFamily:    "'JetBrains Mono', monospace",
                              fontSize:      8,
                              letterSpacing: '0.1em',
                              textTransform: 'uppercase',
                              padding:       '3px 8px',
                              borderRadius:  100,
                              border:        '1px solid rgba(28,43,38,0.12)',
                              color:         'var(--ink-3)',
                            }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Footer */}
                      <div style={{
                        marginTop:      '1rem',
                        paddingTop:     '0.85rem',
                        borderTop:      `1px solid ${isActive ? cardAccentBorder : 'var(--rule)'}`,
                        display:        'flex',
                        alignItems:     'center',
                        justifyContent: 'space-between',
                        gap:            10,
                      }}>
                        {svc?.price != null ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 7.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-4)' }}>
                              Per session
                            </span>
                            <span style={{
                              fontFamily: "'Playfair Display', serif",
                              fontSize:   isActive ? 20 : 16,
                              fontWeight: 500,
                              color:      isActive ? 'var(--sage)' : 'var(--ink-3)',
                              transition: 'all 0.42s ease',
                            }}>
                              ₹{svc.price.toLocaleString()}
                            </span>
                          </div>
                        ) : <div />}

                        {isActive ? (
                          <button
                            onClick={e => { e.stopPropagation(); active && onBookService(active) }}
                            style={{
                              display:      'inline-flex',
                              alignItems:   'center',
                              gap:          7,
                              background:   'var(--sage)',
                              color:        '#fff',
                              border:       'none',
                              borderRadius: 10,
                              padding:      '9px 17px',
                              fontFamily:   "'Plus Jakarta Sans', sans-serif",
                              fontSize:     12.5,
                              fontWeight:   600,
                              cursor:       'pointer',
                              whiteSpace:   'nowrap',
                              boxShadow:    '0 4px 16px rgba(61,122,106,0.3)',
                              transition:   'background 0.22s ease, transform 0.2s ease',
                            }}
                            onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = 'var(--sage-light)'; b.style.transform = 'translateY(-2px)' }}
                            onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = 'var(--sage)'; b.style.transform = 'translateY(0)' }}
                          >
                            Book
                            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                              <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        ) : (
                          <span style={{
                            fontFamily:    "'JetBrains Mono', monospace",
                            fontSize:      8,
                            letterSpacing: '0.14em',
                            textTransform: 'uppercase',
                            color:         'var(--sage)',
                            opacity:       0.65,
                          }}>
                            Tap →
                          </span>
                        )}
                      </div>

                      {/* Active glow ring */}
                      {isActive && (
                        <div style={{
                          position:      'absolute',
                          inset:         -1,
                          borderRadius:  20,
                          border:        `2px solid ${cardAccentBorder}`,
                          pointerEvents: 'none',
                          animation:     'ct3-card-pulse 2.8s ease infinite',
                        }} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ▶ Next */}
            <button
              onClick={() => navigate(1)}
              aria-label="Next service"
              style={{
                flexShrink:    0,
                width:         44, height: 44,
                borderRadius:  '50%',
                border:        '1.5px solid var(--rule-strong)',
                background:    'var(--bg-card)',
                color:         'var(--ink)',
                display:       'flex', alignItems: 'center', justifyContent: 'center',
                cursor:        'pointer',
                transition:    'all 0.22s ease',
                boxShadow:     '0 2px 12px rgba(28,43,38,0.07)',
                zIndex:        20,
              }}
              onMouseEnter={e => { const b = e.currentTarget; b.style.background = 'var(--sage)'; b.style.color = '#fff'; b.style.borderColor = 'var(--sage)' }}
              onMouseLeave={e => { const b = e.currentTarget; b.style.background = 'var(--bg-card)'; b.style.color = 'var(--ink)'; b.style.borderColor = 'var(--rule-strong)' }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Dot indicators + counter */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginTop: '1.4rem' }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {services.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Service ${i + 1}`}
                  style={{
                    width:      i === activeIdx ? 20 : 6,
                    height:     6,
                    borderRadius: 3,
                    background: i === activeIdx ? 'var(--sage)' : 'rgba(28,43,38,0.16)',
                    border:     'none',
                    cursor:     'pointer',
                    padding:    0,
                    transition: 'all 0.35s cubic-bezier(0.25,0.46,0.45,0.94)',
                  }}
                />
              ))}
            </div>
            <span style={{
              fontFamily:    "'JetBrains Mono', monospace",
              fontSize:      9,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color:         'var(--ink-4)',
            }}>
              {String(activeIdx + 1)} / {String(total)}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ct3-card-pulse {
          0%,100% { opacity: 0.5; }
          50%      { opacity: 1;   }
        }
      `}</style>
    </section>
  )
}
