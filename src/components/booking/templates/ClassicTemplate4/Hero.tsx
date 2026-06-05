'use client'

import { useEffect, useRef, useState, useCallback, type RefObject } from 'react'
import type { TherapistProfile } from '../templateUtils'
import { resolveCT4Content } from '../templateUtils'

interface HeroProps {
  therapist: TherapistProfile
  loaded: boolean
  heroRef: RefObject<HTMLElement | null>
}

type AnimPhase = 'idle' | 'exit' | 'enter'

export default function Hero({ therapist, loaded, heroRef }: HeroProps) {
  const sectionRef  = useRef<HTMLElement | null>(null)
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const ct4 = resolveCT4Content(therapist.profile_content?.classic4)

  const quotes: { quote: string; quote_author: string }[] = (() => {
    const h = ct4.hero as {
      quote?: string
      quote_author?: string
      quotes?: { quote: string; quote_author: string }[]
    }
    if (h.quotes && h.quotes.length > 0) return h.quotes
    return [{ quote: h.quote ?? '', quote_author: h.quote_author ?? '' }]
  })()

  const [activeIdx, setActiveIdx]   = useState(0)
  const [phase, setPhase]           = useState<AnimPhase>('idle')
  const [direction, setDirection]   = useState<'next' | 'prev'>('next')

  useEffect(() => {
    if (heroRef && 'current' in heroRef)
      (heroRef as React.MutableRefObject<HTMLElement | null>).current = sectionRef.current
  }, [heroRef])

  const goTo = useCallback((nextIdx: number, dir: 'next' | 'prev' = 'next') => {
    setDirection(dir)
    setPhase('exit')
    timerRef.current = setTimeout(() => {
      setActiveIdx(nextIdx)
      setPhase('enter')
      timerRef.current = setTimeout(() => setPhase('idle'), 900)
    }, 650)
  }, [])

  useEffect(() => {
    if (quotes.length <= 1) return
    intervalRef.current = setInterval(() => {
      setActiveIdx(prev => {
        const next = (prev + 1) % quotes.length
        goTo(next, 'next')
        return prev
      })
    }, 6000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (timerRef.current)    clearTimeout(timerRef.current)
    }
  }, [quotes.length, goTo])

  function resetInterval() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (quotes.length <= 1) return
    intervalRef.current = setInterval(() => {
      setActiveIdx(prev => {
        const next = (prev + 1) % quotes.length
        goTo(next, 'next')
        return prev
      })
    }, 6000)
  }

  function handleDot(i: number) {
    if (i === activeIdx || phase !== 'idle') return
    if (timerRef.current) clearTimeout(timerRef.current)
    const dir = i > activeIdx ? 'next' : 'prev'
    goTo(i, dir)
    resetInterval()
  }

  function scrollToBook()  { document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' }) }
  function scrollToAbout() { document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }) }

  const current = quotes[activeIdx]

  const quoteClass = [
    'ct4-qr-wrap',
    phase === 'exit'  ? (direction === 'next' ? 'ct4-qr-exit-next'  : 'ct4-qr-exit-prev')  : '',
    phase === 'enter' ? (direction === 'next' ? 'ct4-qr-enter-next' : 'ct4-qr-enter-prev') : '',
    phase === 'idle'  ? 'ct4-qr-idle' : '',
  ].filter(Boolean).join(' ')

  return (
    <section
      id="home"
      ref={sectionRef}
      className="ct4-hero-plain"
      style={{ paddingTop: 'var(--nav-h)', opacity: loaded ? 1 : 0, transition: 'opacity 1s ease' }}
    >
      <style>{QUOTE_ANIM_CSS}</style>

      <div
        className={`ct4-hero-plain-ornament ${loaded ? 'ct4-fade-up' : 'opacity-0'}`}
        style={{ animationDelay: '0.46s' }}
      />

      <div
        className={`${quoteClass} ${loaded ? 'ct4-fade-up' : 'opacity-0'}`}
        style={{ animationDelay: '0.58s' }}
      >
        <span className={`ct4-qr-shimmer-bar${phase !== 'idle' ? ' ct4-qr-shimmer-active' : ''}`} />

        <blockquote className="ct4-hero-plain-quote" style={{ margin: 0 }}>
          <span className="ct4-hero-plain-qmark ct4-qr-qmark-open">"</span>
          <span className="ct4-qr-text">
            {current.quote.split(' ').map((word, wi) => (
              <span
                key={`${activeIdx}-${wi}`}
                className="ct4-qr-word"
                style={{ '--wi': wi } as React.CSSProperties}
              >
                {word}{' '}
              </span>
            ))}
          </span>
          <span className="ct4-hero-plain-qmark ct4-hero-plain-qmark-close ct4-qr-qmark-close">"</span>
        </blockquote>

        <div className="ct4-hero-plain-attr ct4-qr-attr" style={{ marginTop: '1.4rem' }}>
          <span
            className="ct4-mono"
            style={{
              fontSize: 9,
              letterSpacing: '0.26em',
              textTransform: 'uppercase',
              color: 'var(--gold-muted)',
            }}
          >
            by {current.quote_author}
          </span>
        </div>
      </div>

      {/* ── Dot navigation ───────────────────────────────────────── */}
      {quotes.length > 1 && (
        <div
          className={loaded ? 'ct4-fade-up' : 'opacity-0'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginTop: '2.2rem',
            animationDelay: '0.82s',
          }}
        >
          {quotes.map((_, i) => (
            <button
              key={i}
              className={`ct4-qr-dot${i === activeIdx ? ' ct4-qr-dot-active' : ''}`}
              onClick={() => handleDot(i)}
              aria-label={`Quote ${i + 1}`}
            />
          ))}
        </div>
      )}

      <div
        className={`ct4-hero-plain-ctas ${loaded ? 'ct4-fade-up' : 'opacity-0'}`}
        style={{ animationDelay: '0.94s' }}
      >
        <button className="ct4-btn-primary" onClick={scrollToBook}>Book a Session&nbsp;&nbsp;→</button>
        <button className="ct4-btn-ghost"   onClick={scrollToAbout}>Learn More</button>
      </div>

      <div
        className={`ct4-hero-plain-scroll ${loaded ? 'ct4-fade-up' : 'opacity-0'}`}
        style={{ animationDelay: '1.1s' }}
      >
        <span
          className="ct4-mono"
          style={{
            fontSize: 8, letterSpacing: '0.32em',
            textTransform: 'uppercase', color: 'var(--silver)', opacity: 0.4,
          }}
        >
          Scroll
        </span>
        <span className="ct4-hero-plain-scroll-line" />
      </div>
    </section>
  )
}

const QUOTE_ANIM_CSS = `

  .ct4-qr-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    z-index: 1;
  }

  @keyframes ct4-qr-exit-up {
    from { opacity: 1;  transform: translateY(0)     scale(1);    filter: blur(0px); }
    to   { opacity: 0;  transform: translateY(-32px) scale(0.97); filter: blur(4px); }
  }
  @keyframes ct4-qr-exit-down {
    from { opacity: 1;  transform: translateY(0)    scale(1);    filter: blur(0px); }
    to   { opacity: 0;  transform: translateY(32px) scale(0.97); filter: blur(4px); }
  }
  .ct4-qr-exit-next { animation: ct4-qr-exit-up   0.65s cubic-bezier(0.4, 0, 1, 1) both; }
  .ct4-qr-exit-prev { animation: ct4-qr-exit-down 0.65s cubic-bezier(0.4, 0, 1, 1) both; }

  @keyframes ct4-qr-enter-from-below {
    from { opacity: 0;  transform: translateY(36px)  scale(0.97); filter: blur(6px); }
    to   { opacity: 1;  transform: translateY(0)     scale(1);    filter: blur(0px); }
  }
  @keyframes ct4-qr-enter-from-above {
    from { opacity: 0;  transform: translateY(-36px) scale(0.97); filter: blur(6px); }
    to   { opacity: 1;  transform: translateY(0)     scale(1);    filter: blur(0px); }
  }
  .ct4-qr-enter-next { animation: ct4-qr-enter-from-below 0.9s cubic-bezier(0.16, 0.84, 0.3, 1) both; }
  .ct4-qr-enter-prev { animation: ct4-qr-enter-from-above 0.9s cubic-bezier(0.16, 0.84, 0.3, 1) both; }

  .ct4-qr-idle { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }

  .ct4-qr-text { display: inline; }
  .ct4-qr-word {
    display: inline;
    opacity: 0;
    animation: ct4-qr-word-in 0.55s cubic-bezier(0.16, 0.84, 0.3, 1) both;
    animation-delay: calc(0.1s + var(--wi, 0) * 0.038s);
  }
  @keyframes ct4-qr-word-in {
    from { opacity: 0; transform: translateY(10px); filter: blur(3px); }
    to   { opacity: 1; transform: translateY(0);    filter: blur(0);   }
  }

  .ct4-qr-qmark-open {
    animation: ct4-qr-qmark-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.05s both;
  }
  .ct4-qr-qmark-close {
    animation: ct4-qr-qmark-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.12s both;
  }
  @keyframes ct4-qr-qmark-pop {
    from { opacity: 0; transform: scale(0.5) rotate(-15deg); }
    to   { opacity: 0.55; transform: scale(1) rotate(0deg); }
  }

  .ct4-qr-attr {
    animation: ct4-qr-attr-in 0.7s cubic-bezier(0.16, 0.84, 0.3, 1) 0.45s both;
  }
  @keyframes ct4-qr-attr-in {
    from { opacity: 0; transform: translateX(-14px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  .ct4-qr-shimmer-bar {
    display: block;
    width: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--gold), transparent);
    margin-bottom: 2rem;
    transition: width 0.6s cubic-bezier(0.16, 0.84, 0.3, 1), opacity 0.4s ease;
    opacity: 0;
  }
  .ct4-qr-shimmer-active {
    width: min(280px, 60vw);
    opacity: 1;
    animation: ct4-qr-shimmer-sweep 0.9s ease both;
  }
  @keyframes ct4-qr-shimmer-sweep {
    0%   { width: 0;               opacity: 0; }
    40%  { width: min(280px, 60vw); opacity: 1; }
    80%  { width: min(280px, 60vw); opacity: 0.6; }
    100% { width: min(280px, 60vw); opacity: 0; }
  }

  /* ── Dot navigation ─────────────────────────────────────────────── */
  .ct4-qr-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(123, 110, 139, 0.4);
    border: 1px solid #7B6E8B ;
    padding: 0;
    cursor: pointer;
    transition:
      background  0.3s ease,
      border-color 0.3s ease,
      transform   0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
      box-shadow  0.3s ease;
  }
  .ct4-qr-dot:hover {
    background: rgba(212, 175, 55, 0.45);
    transform: scale(1.25);
  }
  .ct4-qr-dot-active {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--gold);
    border-color: var(--gold);
    box-shadow:
      0 0 6px rgba(212, 175, 55, 0.7),
      0 0 12px rgba(212, 175, 55, 0.35);
    transform: scale(1.35);
    animation: ct4-dot-pulse 2.4s ease-in-out infinite;
  }
  @keyframes ct4-dot-pulse {
    0%, 100% { box-shadow: 0 0 6px rgba(212,175,55,0.7), 0 0 12px rgba(212,175,55,0.35); }
    50%       { box-shadow: 0 0 9px rgba(212,175,55,0.9), 0 0 20px rgba(212,175,55,0.5); }
  }
`
