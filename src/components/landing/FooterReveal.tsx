// components/landing/FooterReveal.tsx
'use client'

import { useRef } from 'react'

const WORDMARK = 'Counsellors of India'

export default function FooterReveal() {
  const wordRef = useRef<HTMLHeadingElement>(null)
  const touchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

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
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">

        {/* Eyebrow */}
        {/* <p
          className="text-xs font-bold uppercase tracking-[0.3em] mb-8"
          style={{ color: 'rgba(90,127,122,0.8)' }}
        >
          Your practice. Online.
        </p> */}

        {/* Hero type — the big statement */}
        <h2
          ref={wordRef}
          onClick={onTouch}
          onTouchStart={onTouch}
          className="font-bold leading-[0.9] tracking-tighter mb-8 select-none fr-word"
          style={{
            fontSize: 'clamp(52px, 7vw, 140px)',
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
          Claim your profile — it's free
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