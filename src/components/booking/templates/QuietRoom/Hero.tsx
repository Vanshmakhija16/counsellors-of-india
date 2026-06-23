'use client'

import { useEffect, useRef } from 'react'
import { ArrowDownRight } from 'lucide-react'
import type { TherapistProfile } from '../templateUtils'
import { resolveImage, getFirstName } from '../templateUtils'
import { useQuietRoomMotion } from './_motion'

interface HeroProps {
  therapist: TherapistProfile
  scrollTo: (id: string) => void
}

// "A space to be heard" — three masked lines so each clips up on its own.
function headlineLines(name: string): string[] {
  return ['A space', 'to be', 'heard.']
  // (name reserved for future personalisation; kept stable for the mask rhythm)
  void name
}

export default function Hero({ therapist, scrollTo }: HeroProps) {
  const rootRef     = useRef<HTMLElement | null>(null)
  const windowRef   = useRef<HTMLDivElement | null>(null)
  const portraitRef = useRef<HTMLDivElement | null>(null)
  const linesRef    = useRef<HTMLDivElement | null>(null)

  const firstName = getFirstName(therapist.name ?? '')
  const lines = headlineLines(firstName)

  useQuietRoomMotion(({ gsap, ScrollTrigger, reduced, narrow }) => {
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set('.qr-hero-line > span', { y: 0 })
        gsap.to(['.qr-hero-line > span', '.qr-hero-portrait', '.qr-hero-aside'], { opacity: 1, duration: 0.15 })
        return
      }

      // Headline: each line clips up from its mask, 80ms stagger, calm-out.
      gsap.to('.qr-hero-line > span', {
        yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08, delay: 0.15,
      })

      // Portrait scales 1.04 → 1.0 as it fades in, slightly behind the headline.
      gsap.fromTo('.qr-hero-portrait',
        { scale: 1.04, opacity: 0 },
        { scale: 1.0, opacity: 1, duration: 1.2, ease: 'expo.out', delay: 0.3 })

      gsap.to('.qr-hero-aside', { opacity: 1, duration: 1.0, ease: 'expo.out', delay: 0.55 })

      // The Window — wandering Perlin-ish drift + breathing, never a clean loop.
      const win = windowRef.current
      if (win) {
        const drift = () => {
          gsap.to(win, {
            xPercent: gsap.utils.random(-8, 8),
            yPercent: gsap.utils.random(-6, 6),
            scale: gsap.utils.random(1.0, 1.06),
            opacity: gsap.utils.random(0.18, 0.26),
            duration: gsap.utils.random(7, 11),
            ease: 'sine.inOut',
            onComplete: drift,
          })
        }
        drift()
      }

      // Three depth layers on scroll-away, capped at 12% offset (no theatrics).
      if (!narrow) {
        const mkParallax = (sel: string | Element, pct: number) =>
          gsap.to(sel, {
            yPercent: pct, ease: 'none',
            scrollTrigger: { trigger: rootRef.current, start: 'top top', end: 'bottom top', scrub: true },
          })
        mkParallax('.qr-hero-text', 10)     // 0.9x
        mkParallax('.qr-hero-portrait', 0)  // 1x (anchor)
        mkParallax(windowRef.current!, -12) // 0.5x glow drifts slower
      }

      ScrollTrigger.refresh()
    }, rootRef)

    return () => ctx.revert()
  })

  // Caption reveal on portrait hover (name + title).
  useEffect(() => {
    const p = portraitRef.current
    if (!p) return
    const cap = p.querySelector<HTMLElement>('.qr-hero-cap')
    if (!cap) return
    const enter = () => { cap.style.opacity = '1'; cap.style.transform = 'translateY(0)' }
    const leave = () => { cap.style.opacity = '0'; cap.style.transform = 'translateY(8px)' }
    p.addEventListener('mouseenter', enter); p.addEventListener('mouseleave', leave)
    return () => { p.removeEventListener('mouseenter', enter); p.removeEventListener('mouseleave', leave) }
  }, [])

  return (
    <section id="home" ref={rootRef} className="qr-dusk qr-hero">
      <style>{`
        .qr-hero { position: relative; min-height: 100vh; display: flex; align-items: center;
          padding: 140px clamp(20px, 5vw, 56px) 90px; overflow: hidden; }
        .qr-hero-grid { position: relative; z-index: 2; width: 100%; max-width: 1140px; margin: 0 auto;
          display: grid; grid-template-columns: 1.25fr 1fr; gap: clamp(28px, 5vw, 72px); align-items: center; }
        @media (max-width: 860px) { .qr-hero-grid { grid-template-columns: 1fr; gap: 40px; } }

        .qr-hero-h1 { font-family: 'Spectral', serif; font-weight: 300; letter-spacing: -0.03em;
          font-size: clamp(54px, 8.5vw, 116px); line-height: 0.96; color: var(--qr-paper); margin: 18px 0 0; }
        .qr-hero-line { display: block; overflow: hidden; }
        .qr-hero-line > span { display: block; transform: translateY(110%); }
        .qr-hero-line:last-child > span { color: var(--qr-honey); font-style: italic; }

        .qr-hero-sub { max-width: 40ch; margin-top: 26px; font-size: 18px; line-height: 1.7;
          color: rgba(242,238,228,0.78); }
        .qr-hero-actions { display: flex; align-items: center; gap: 18px; margin-top: 34px; flex-wrap: wrap; }

        .qr-hero-cred { margin-top: 52px; font-size: 11px; color: rgba(242,238,228,0.5); }

        .qr-hero-aside { position: relative; opacity: 0; }
        .qr-hero-portrait { position: relative; z-index: 2; opacity: 0; border-radius: 14px; overflow: hidden;
          aspect-ratio: 4 / 4.6; background: var(--qr-ink-soft); border: 1px solid rgba(242,238,228,0.08); }
        .qr-hero-portrait img { width: 100%; height: 100%; object-fit: cover; object-position: center 18%;
          filter: grayscale(0.12) contrast(1.04); display: block; }
        .qr-hero-cap { position: absolute; left: 14px; bottom: 14px; right: 14px;
          background: rgba(42,35,48,0.78); backdrop-filter: blur(8px); border-radius: 9px; padding: 11px 14px;
          opacity: 0; transform: translateY(8px); transition: opacity 250ms var(--qr-calm-out), transform 250ms var(--qr-calm-out); }
        .qr-hero-cap b { font-family: 'Spectral', serif; font-weight: 400; font-size: 15px; color: var(--qr-paper); }
        .qr-hero-cap span { display: block; font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase;
          color: rgba(242,238,228,0.6); margin-top: 2px; }

        .qr-scrollcue { position: absolute; bottom: 26px; left: 50%; transform: translateX(-50%); z-index: 3;
          display: flex; flex-direction: column; align-items: center; gap: 8px; }
        @media (max-width: 860px) { .qr-scrollcue { display: none; } }
        .qr-scrollcue span { font-size: 9px; letter-spacing: 0.3em; color: rgba(242,238,228,0.45); }
        .qr-scrollcue i { width: 1px; height: 30px; background: rgba(242,238,228,0.2); display: block; }
      `}</style>

      {/* The Window — full strength here, behind the portrait. */}
      <div ref={windowRef} className="qr-window" style={{ right: '4%', top: '12%' }} />

      <div className="qr-hero-grid">
        <div className="qr-hero-text">
          <span className="qr-eyebrow" style={{ color: 'var(--qr-honey)' }}>The Quiet Room</span>
          <h1 className="qr-hero-h1" ref={linesRef}>
            {lines.map((l, i) => (
              <span key={i} className="qr-hero-line"><span>{l}</span></span>
            ))}
          </h1>
          <p className="qr-hero-sub">
            {therapist.tagline?.trim()
              || "Therapy that doesn't rush you. A calm, confidential space to think clearly, feel fully, and move at your own pace."}
          </p>
          <div className="qr-hero-actions">
            <button className="qr-cta" onClick={() => scrollTo('book')}>
              Book a session <ArrowDownRight size={16} />
            </button>
            <button className="qr-ghost qr-underline" onClick={() => scrollTo('process')}>
              How sessions work
            </button>
          </div>
          <p className="qr-hero-cred qr-mono">
            {therapist.credentials || 'Clinical Psychologist'}
            {therapist.experience ? ` · ${therapist.experience} years in practice` : ''}
          </p>
        </div>

        <aside className="qr-hero-aside">
          <div className="qr-hero-portrait" ref={portraitRef}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={resolveImage(therapist.image)} alt={therapist.name} />
            <div className="qr-hero-cap">
              <b>{therapist.name}</b>
              <span>{therapist.credentials?.split('·')[0]?.trim() || 'Psychologist'}</span>
            </div>
          </div>
        </aside>
      </div>

      <div className="qr-scrollcue">
        <span className="qr-mono">Scroll</span>
        <i />
      </div>
    </section>
  )
}
