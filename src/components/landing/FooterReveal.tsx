// components/landing/FooterReveal.tsx
'use client'

import { useEffect, useRef } from 'react'

const MIN_FONT = 30   // below this, switch to a two-line wrap instead of shrinking further
const MAX_FONT = 150  // design ceiling, matches the old clamp() max
const SAFETY = 0.95   // small margin so the text never touches the container edge

export default function FooterReveal({ wordmark = 'Counsellors of India' }: { wordmark?: string }) {
  const WORDMARK = wordmark
  const wordRef = useRef<HTMLHeadingElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const touchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Measures the real available width and the wordmark's actual rendered
  // width at a reference font-size (via canvas, accounting for the
  // negative letter-spacing too), then scales the font linearly so the
  // text always fills — but never exceeds — that width. Re-runs on any
  // container resize, so it's correct at every breakpoint without
  // hand-tuned vw/cqw guesses per screen size.
  useEffect(() => {
    const headingEl = wordRef.current
    const containerEl = containerRef.current
    if (!headingEl || !containerEl) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    function fit() {
      if (!ctx || !headingEl || !containerEl) return
      const cs = window.getComputedStyle(containerEl)
      const available = containerEl.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
      if (available <= 0) return

      const refSize = 100
      const hs = window.getComputedStyle(headingEl)
      ctx.font = `${hs.fontWeight} ${refSize}px ${hs.fontFamily}`
      const baseWidth = ctx.measureText(WORDMARK).width
      const letterSpacingAtRef = refSize * -0.01 // matches the inline letterSpacing below
      const totalWidthAtRef = baseWidth + letterSpacingAtRef * (WORDMARK.length - 1)

      const idealFont = (available / totalWidthAtRef) * refSize * SAFETY

      if (idealFont < MIN_FONT) {
        // Too tight even at the readability floor — wrap onto two lines
        // instead of shrinking further.
        headingEl.style.fontSize = `${MIN_FONT}px`
        headingEl.style.whiteSpace = 'normal'
      } else {
        headingEl.style.fontSize = `${Math.min(idealFont, MAX_FONT)}px`
        headingEl.style.whiteSpace = 'nowrap'
      }
    }

    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(containerEl)
    window.addEventListener('resize', fit)
    document.fonts?.ready?.then(fit) // re-fit once the real webfont has loaded (canvas measured a fallback font before that)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', fit)
    }
  }, [])

  // :hover does nothing on touch devices, so a tap re-triggers the same
  // letter-wave animation via a .fr-touch class instead. Timed to outlast
  // the last letter's staggered start (--i * 35ms) plus its own 0.7s run,
  // then removed so the very next tap can fire it again.
  function onTouch() {
    const el = wordRef.current
    if (!el) return
    if (touchTimer.current) clearTimeout(touchTimer.current)
    el.classList.remove('fr-touch')
    // force reflow so re-adding the class restarts the animation even if
    // the previous run hasn't finished yet
    void el.offsetWidth
    el.classList.add('fr-touch')
    const totalMs = WORDMARK.length * 35 + 700
    touchTimer.current = setTimeout(() => el.classList.remove('fr-touch'), totalMs)
  }

  return (
    <div
      className="relative bottom-0 z-0 h-[50vh] w-full flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'var(--surf-dark, #14110C)' }}
    >

      {/* ── Subtle grid texture ── */}
      <div
        className="pointer-events-none absolute inset-0"
        // style={{
        //   backgroundImage: `
        //     linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
        //     linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
        //   `,
        //   backgroundSize: '80px 80px',
        // }}
      />

      {/* Radial glow overlay removed — flat solid background now, to match SiteFooter exactly */}

      {/* ── Content ── */}
      <div ref={containerRef} className="relative z-10 text-center px-6 w-full max-w-5xl mx-auto fr-word-container">

        {/* Eyebrow */}
        {/* <p
          className="text-xs font-bold uppercase tracking-[0.3em] mb-8"
          style={{ color: 'rgba(90,127,122,0.8)' }}
        >
          Your practice. Online.
        </p> */}

        {/* Hero type — the big statement */}
        <style>{`
          .fr-heading {
            font-size: clamp(40px, 7vw, 140px); /* pre-hydration fallback only — JS takes over and measures the exact fit on mount */
            white-space: nowrap;
          }
        `}</style>
        <h2
          ref={wordRef}
          onClick={onTouch}
          onTouchStart={onTouch}
          className="font-bold leading-[0.9] tracking-tighter mb-8 select-none fr-word fr-heading"
          style={{
            letterSpacing: '-0.01em',
          }}
        >
          {WORDMARK.split('').map((ch, i) => (
            <span key={i} className="fr-letter" style={{ ['--i' as string]: i }}>
              {ch === ' ' ? '\u00A0' : ch}
            </span>
          ))}
        </h2>

        {/* Sub statement */}
        {/* <p
          className="text-base md:text-lg font-normal leading-relaxed mb-12 max-w-md mx-auto"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          A beautiful profile. Real bookings.
          <br />
          Built for therapists in India.
        </p> */}

        {/* CTA */}
        {/* <a 
          href="/signup"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-semibold transition-opacity hover:opacity-80"
          style={{
            background: '#5a7f7a',
            color: '#fff',
            boxShadow: '0 8px 40px rgba(90,127,122,0.4)',
          }}
        >
          Claim your profile 
          <span style={{ fontSize: 16 }}>→</span>
        </a> */}
      </div>

      {/* ── Bottom micro footer ──
      <div
        className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-8"
        style={{ color: 'rgba(255,255,255,0.15)', fontSize: 11 }}
      >
        <span>© 2025 Counsellors of India</span>
        <span>·</span>
        <a href="/privacy" className="hover:text-white/40 transition">Privacy</a>
        <span>·</span>
        <a href="/terms" className="hover:text-white/40 transition">Terms</a>
      </div> */}

    </div>
  )
}