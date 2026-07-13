'use client'

import { useRef } from 'react'
import { ArrowDownRight } from 'lucide-react'
import type { TherapistProfile } from '../templateUtils'
import { resolveImage } from '../templateUtils'
import { useQuietRoomMotion } from './_motion'

interface HeroProps {
  therapist: TherapistProfile
  scrollTo: (id: string) => void
}

export default function Hero({ therapist, scrollTo }: HeroProps) {
  const rootRef   = useRef<HTMLElement | null>(null)
  const windowRef = useRef<HTMLDivElement | null>(null)

  const specialty = therapist.specialties?.[0]?.trim()
  const specialtyList = (therapist.specialties ?? []).slice(0, 3).join(' · ')

  useQuietRoomMotion(({ gsap, ScrollTrigger, reduced, narrow }) => {
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(['.qr-hero-opener', '.qr-hero-sub', '.qr-hero-actions', '.qr-hero-signoff', '.qr-hero-photowrap', '.qr-hero-identity'],
          { opacity: 1, y: 0, scale: 1 })
        return
      }

      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
      tl.to('.qr-hero-eyebrow', { opacity: 1, y: 0, duration: 0.7 }, 0.1)
        .to('.qr-hero-identity', { opacity: 1, y: 0, duration: 0.7 }, 0.18)
        .to('.qr-hero-opener', { opacity: 1, y: 0, duration: 0.9 }, 0.28)
        .to('.qr-hero-sub', { opacity: 1, y: 0, duration: 0.8 }, 0.5)
        .to('.qr-hero-actions', { opacity: 1, y: 0, duration: 0.7 }, 0.66)
        .to('.qr-hero-signoff', { opacity: 1, y: 0, duration: 0.6 }, 0.78)
        .fromTo('.qr-hero-photowrap', { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.9 }, 0.4)

      const win = windowRef.current
      if (win) {
        const drift = () => gsap.to(win, {
          xPercent: gsap.utils.random(-8, 8),
          yPercent: gsap.utils.random(-6, 6),
          scale: gsap.utils.random(1.0, 1.06),
          opacity: gsap.utils.random(0.16, 0.26),
          duration: gsap.utils.random(7, 11),
          ease: 'sine.inOut',
          onComplete: drift,
        })
        drift()
      }

      if (!narrow) {
        gsap.to('.qr-hero-left', {
          yPercent: 8, ease: 'none',
          scrollTrigger: { trigger: rootRef.current, start: 'top top', end: 'bottom top', scrub: true },
        })
        gsap.to(windowRef.current!, {
          yPercent: -10, ease: 'none',
          scrollTrigger: { trigger: rootRef.current, start: 'top top', end: 'bottom top', scrub: true },
        })
      }

      ScrollTrigger.refresh()
    }, rootRef)
    return () => ctx.revert()
  })

  return (
    <section id="home" ref={rootRef} className="qr-dusk qr-hero">
      <style>{`
        .qr-hero {
          position: relative;
          min-height: 92vh;
          display: flex;
          align-items: center;
          padding: 130px 0 90px;
          overflow: hidden;
        }

        .qr-hero-grid {
          position: relative; z-index: 2;
          width: 100%; max-width: 1140px; margin: 0 auto;
          padding: 0 clamp(20px, 5vw, 56px);
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: clamp(32px, 5vw, 64px);
          align-items: center;
        }
        @media (max-width: 900px) {
          .qr-hero-grid { grid-template-columns: 1fr; gap: 56px; }
        }

        .qr-hero-left { padding-left: clamp(0px, 2vw, 32px); }
        @media (max-width: 900px) { .qr-hero-left { padding-left: 0; } }

        /* ── Left: a quiet first-person opener, not a headline shout ─── */
        .qr-hero-eyebrow { opacity: 0; transform: translateY(10px); }

        /* Name + specialties — answers "whose practice is this" in the very
           first thing read, before the poetic opener does its emotional work. */
        .qr-hero-identity {
          opacity: 0;
          transform: translateY(10px);
          display: flex; flex-direction: column; gap: 6px;
          margin-top: 4px;
        }
        .qr-hero-identity-name {
          font-family: 'Spectral', serif; font-weight: 600; font-style: normal;
          font-size: clamp(30px, 3.6vw, 42px); letter-spacing: -0.01em;
          color: var(--qr-paper);
        }
        .qr-hero-identity-role {
          font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--qr-honey); opacity: 0.85;
        }
        .qr-hero-identity-specialties {
          font-family: 'IBM Plex Sans', sans-serif; font-size: clamp(15px, 1.3vw, 17px);
          color: rgba(242,238,228,0.6); letter-spacing: 0.005em;
        }
        .qr-hero-identity-title {
          font-family: 'IBM Plex Sans', sans-serif; font-size: clamp(14px, 1.15vw, 15.5px);
          font-weight: 400; color: rgba(242,238,228,0.6); letter-spacing: 0.005em;
          line-height: 1.5; max-width: 42ch;
        }

        .qr-hero-opener {
          opacity: 0;
          transform: translateY(14px);
          font-family: 'Spectral', serif;
          font-weight: 300;
          font-style: italic;
          letter-spacing: -0.01em;
          font-size: clamp(26px, 2.8vw, 34px);
          line-height: 1.4;
          color: var(--qr-paper);
          margin: 20px 0 0;
          max-width: 28ch;
        }
        .qr-hero-opener em {
          font-style: normal;
          color: var(--qr-honey);
        }

        .qr-hero-signoff {
          opacity: 0;
          transform: translateY(10px);
          display: flex; align-items: center; gap: 12px;
          margin-top: 22px;
        }
        .qr-hero-signoff-rule { width: 30px; height: 1px; background: var(--qr-honey); opacity: 0.7; }
        .qr-hero-signoff-name {
          font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 0.08em;
          text-transform: uppercase; color: rgba(242,238,228,0.55);
        }

        .qr-hero-sub {
          max-width: 40ch;
          margin-top: 28px;
          font-size: clamp(15px, 1.2vw, 16.5px);
          line-height: 1.75;
          color: rgba(242,238,228,0.62);
          opacity: 0;
          transform: translateY(12px);
        }

        .qr-hero-actions {
          display: flex; align-items: center; gap: 22px; flex-wrap: wrap;
          margin-top: 32px;
          opacity: 0;
          transform: translateY(10px);
        }
        .qr-hero-ghost {
          display: inline-flex; align-items: center; gap: 6px;
          background: none; border: none; cursor: pointer;
          color: rgba(242,238,228,0.65);
          font-family: 'IBM Plex Sans', sans-serif; font-size: 14px;
          padding: 4px 0; position: relative;
          transition: color 300ms var(--qr-calm-out);
        }
        .qr-hero-ghost::after {
          content: ''; position: absolute; left: 0; bottom: 0;
          height: 1px; width: 100%; background: var(--qr-honey);
          transform: scaleX(0); transform-origin: left;
          transition: transform 350ms var(--qr-calm-inout);
        }
        .qr-hero-ghost:hover { color: var(--qr-paper); }
        .qr-hero-ghost:hover::after { transform: scaleX(1); }

        .qr-hero-cred {
          margin-top: 44px;
          font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase;
          color: rgba(242,238,228,0.4);
          font-family: 'IBM Plex Mono', monospace;
          opacity: 0;
        }

        /* ── Right: therapist portrait ─────────────────────────────── */
        .qr-hero-right { display: flex; align-items: center; justify-content: center; height: 100%; }
        .qr-hero-photowrap {
          opacity: 0;
          position: relative;
          width: 100%;
          max-width: 420px;
        }
        .qr-hero-photo {
          position: relative; width: 100%; aspect-ratio: 4/5;
          border-radius: 18px; overflow: hidden;
          background: var(--qr-stone-warm, rgba(242,238,228,0.08));
          box-shadow: 0 30px 70px -20px rgba(0,0,0,0.4);
        }
        .qr-hero-photo-img { width: 100%; height: 100%; object-fit: cover; display: block; }

        .qr-scrollcue {
          position: absolute; bottom: 28px; left: 50%; transform: translateX(-50%);
          z-index: 3; display: flex; flex-direction: column; align-items: center; gap: 8px;
        }
        @media (max-width: 860px) { .qr-scrollcue { display: none; } }
        .qr-scrollcue span { font-size: 9px; letter-spacing: 0.3em; color: rgba(242,238,228,0.35); font-family: 'IBM Plex Mono', monospace; }
        .qr-scrollcue i { width: 1px; height: 28px; background: rgba(242,238,228,0.18); display: block; }
      `}</style>

      <div ref={windowRef} className="qr-window" style={{ right: '4%', top: '6%' }} />

      <div className="qr-hero-grid">

        {/* ── LEFT: a quiet first-person opener ── */}
        <div className="qr-hero-left">
          <span className="qr-eyebrow qr-hero-eyebrow">
            {/* A note, before we begin */}
            </span>

          {therapist.name && (
            <p className="qr-hero-identity">
              <span className="qr-hero-identity-role">Sr Psychologist</span>
              <span className="qr-hero-identity-name">{therapist.name}</span>
              {therapist.credentials?.trim() && (
                <span className="qr-hero-identity-title">{therapist.credentials}</span>
              )}
              {/* {specialtyList && (
                <span className="qr-hero-identity-specialties">{specialtyList}, Depression, Overthinking</span>
              )} */}
            </p>
          )}

          <p className="qr-hero-opener">
            {therapist.tagline?.trim()
              ? therapist.tagline
              : (specialty
                ? <> I beleive You don&rsquo;t need the right words to explain,  <em>instead a person to understand.</em></>
                // ? <>You don&rsquo;t need the right words for {specialty.toLowerCase()},  <em>just a place to start.</em></>
                : <>You don&rsquo;t need the right words yet  <em>just a place to start.</em></>)}
          </p>

          {/* <p className="qr-hero-sub">
            A calm, confidential space to think clearly, feel fully, and move at your own pace. No scripts, no pressure, just a conversation, whenever you&rsquo;re ready for one.
          </p> */}

          <div className="qr-hero-actions">
            <button className="qr-hero-ghost" onClick={() => scrollTo('about')}>
              About the practice <ArrowDownRight size={14} />
            </button>
          </div>

          {/* <div className="qr-hero-signoff">
            <span className="qr-hero-signoff-rule" />
            <span className="qr-hero-signoff-name">
              {therapist.name || 'The Quiet Room'}
              {therapist.experience ? `  ·  ${therapist.experience} yrs in practice` : ''}
            </span>
          </div> */}
        </div>

        {/* ── RIGHT: therapist portrait ── */}
        <div className="qr-hero-right">
          <div className="qr-hero-photowrap">
            <div
              className="qr-hero-photo"
              role="img"
              aria-label={therapist.name ? `Photo of ${therapist.name}` : 'Therapist photo'}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resolveImage(therapist.image)} alt={therapist.name || 'Therapist'} className="qr-hero-photo-img" />
            </div>
          </div>
        </div>

      </div>

      <div className="qr-scrollcue">
        <span>Scroll</span>
        <i />
      </div>
    </section>
  )
}
