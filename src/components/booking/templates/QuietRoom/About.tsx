'use client'

import { useRef } from 'react'
import type { TherapistProfile } from '../templateUtils'
import { resolveImage } from '../templateUtils'
import { useQuietRoomMotion } from './_motion'

interface AboutProps { therapist: TherapistProfile }

// Build a small, dotted credentials line from whatever the profile offers.
function credentials(t: TherapistProfile): { label: string; detail: string }[] {
  const out: { label: string; detail: string }[] = []
  if (t.experience) out.push({ label: `${t.experience} years in practice`, detail: 'Working with adults across anxiety, grief, trauma and life transitions.' })
  ;(t.certifications ?? []).slice(0, 3).forEach(c =>
    out.push({ label: c, detail: 'A recognised qualification underpinning the work offered here.' }))
  if (out.length === 0) out.push({ label: 'Licensed Clinical Psychologist', detail: 'Registered and bound by professional standards of confidentiality and care.' })
  return out
}

export default function About({ therapist }: AboutProps) {
  const rootRef = useRef<HTMLElement | null>(null)
  const photoRef = useRef<HTMLDivElement | null>(null)
  const creds = credentials(therapist)

  const paras = (therapist.bio || '')
    .split(/\n+/).map(s => s.trim()).filter(Boolean)
  const bioParas = paras.length ? paras : [
    "I'm a licensed clinical psychologist. People usually find their way here at a point where something has become too heavy to carry alone.",
    "My work is unhurried and collaborative — less about fixing you, more about helping you understand yourself with a little more compassion and a lot less judgement.",
  ]

  useQuietRoomMotion(({ gsap, reduced, narrow }) => {
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(['.qr-about-line', '.qr-about-quote', '.qr-about-philosophy'], { opacity: 1, y: 0 })
        return
      }

      gsap.from('.qr-about-quote', {
        opacity: 0, y: 18, duration: 0.9, ease: 'expo.out',
        scrollTrigger: { trigger: rootRef.current, start: 'top 75%' },
      })

      gsap.from('.qr-about-line', {
        opacity: 0, y: 16, duration: 0.9, ease: 'expo.out', stagger: 0.05,
        scrollTrigger: { trigger: '.qr-about-body', start: 'top 80%' },
      })

      gsap.from('.qr-about-philosophy', {
        opacity: 0, y: 14, duration: 0.9, ease: 'expo.out',
        scrollTrigger: { trigger: '.qr-about-philosophy', start: 'top 85%' },
      })

      gsap.from('.qr-cred-row', {
        opacity: 0, y: 12, duration: 0.7, ease: 'expo.out', stagger: 0.08,
        scrollTrigger: { trigger: '.qr-about-creds', start: 'top 85%' },
      })

      // Photo scrubs scale 1.0 → 1.08, tied to scroll (moves only while you do).
      if (!narrow && photoRef.current) {
        gsap.fromTo(photoRef.current.querySelector('img'),
          { scale: 1.0 },
          { scale: 1.08, ease: 'none',
            scrollTrigger: { trigger: photoRef.current, start: 'top bottom', end: 'bottom top', scrub: true } })
      }
    }, rootRef)
    return () => ctx.revert()
  })

  return (
    <section id="about" ref={rootRef} className="qr-daylight qr-section">
      <style>{`
        .qr-about-grid { max-width: 1140px; margin: 0 auto; padding: 0 clamp(20px,5vw,56px);
          display: grid; grid-template-columns: 1.15fr 0.85fr; gap: clamp(32px, 6vw, 80px); align-items: start; }
        @media (max-width: 860px) { .qr-about-grid { grid-template-columns: 1fr; gap: 36px; } }

        .qr-about-quote { font-family: 'Spectral', serif; font-weight: 300; font-size: clamp(28px, 4vw, 44px);
          line-height: 1.18; letter-spacing: -0.02em; color: var(--qr-charcoal); margin: 14px 0 28px; }
        .qr-about-body p { font-size: 18px; line-height: 1.72; color: rgba(46,42,38,0.86); margin: 0 0 18px; }
        .qr-about-philosophy { font-family: 'Spectral', serif; font-style: italic; font-size: 19px;
          color: var(--qr-moss); margin-top: 26px; padding-left: 16px; border-left: 2px solid rgba(92,107,82,0.4); }

        .qr-about-photo { position: relative; border-radius: 16px; overflow: hidden; aspect-ratio: 4/5;
          background: var(--qr-stone-warm); }
        .qr-about-photo img { width: 100%; height: 100%; object-fit: cover; object-position: center 20%; display: block;
          transition: filter 500ms var(--qr-calm-out); }
        .qr-about-photo:hover img { filter: saturate(1.06) brightness(1.02); }

        .qr-about-creds { margin-top: 40px; display: flex; flex-wrap: wrap; gap: 8px 0; align-items: center; }
        .qr-cred-row { position: relative; font-size: 13px; color: rgba(46,42,38,0.7); padding: 4px 0; cursor: default; }
        .qr-cred-row:not(:last-child)::after { content: '·'; margin: 0 12px; color: var(--qr-moss); }
        .qr-cred-tip { position: absolute; left: 0; top: calc(100% + 8px); width: 240px; z-index: 5;
          background: rgba(242,238,228,0.85); backdrop-filter: blur(12px); border: 1px solid rgba(46,42,38,0.08);
          border-radius: 10px; padding: 11px 14px; font-size: 12px; line-height: 1.5; color: var(--qr-charcoal);
          opacity: 0; transform: translateY(4px); pointer-events: none;
          transition: opacity 250ms var(--qr-calm-out), transform 250ms var(--qr-calm-out); }
        .qr-cred-row:hover .qr-cred-tip { opacity: 1; transform: translateY(0); }
      `}</style>

      {/* faint Window echo */}
      <div className="qr-window qr-window--static" style={{ left: '-10%', top: '20%', opacity: 0.07 }} />

      <div className="qr-about-grid">
        <div>
          <span className="qr-eyebrow">Who's in the room</span>
          <p className="qr-about-quote">
            {therapist.tagline?.trim() || 'Therapy works best when it stops feeling like a transaction and starts feeling like a relationship.'}
          </p>
          <div className="qr-about-body">
            {bioParas.map((p, i) => (
              <p key={i} className="qr-about-line">{p}</p>
            ))}
          </div>
          <p className="qr-about-philosophy">
            {therapist.approach_text?.trim() || 'No pressure, no performance — just two people, working honestly, one session at a time.'}
          </p>

          <div className="qr-about-creds qr-mono">
            {creds.map((c, i) => (
              <span key={i} className="qr-cred-row">
                {c.label}
                <span className="qr-cred-tip">{c.detail}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="qr-about-photo" ref={photoRef}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={resolveImage(therapist.image)} alt={therapist.name} />
        </div>
      </div>
    </section>
  )
}
