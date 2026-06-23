'use client'

import { useRef } from 'react'
import type { TherapistProfile } from '../templateUtils'
import { useQuietRoomMotion } from './_motion'

interface ExpertiseProps { therapist: TherapistProfile }

// A handful of intentionally simple, slightly-imperfect line icons. Each path
// gets a dash length so GSAP can "sketch" it on first scroll-enter.
const ICONS: Record<string, string> = {
  default: 'M14 30 Q24 14 34 30',                                   // a gentle hill
  anxiety: 'M10 24 Q16 12 22 24 T34 24',                            // a settling wave
  relationships: 'M14 28 C14 18 24 18 24 26 C24 18 34 18 34 28',    // two arcs meeting
  trauma: 'M12 14 L24 30 L36 14 M24 30 L24 12',                     // an anchor/cross of paths
  grief: 'M24 12 C16 16 14 26 24 34 C34 26 32 16 24 12',            // a soft leaf
  esteem: 'M24 12 L27 22 L37 22 L29 28 L32 38 L24 32 L16 38 L19 28 L11 22 L21 22 Z', // open star
  transitions: 'M12 30 Q24 12 36 30 M30 24 L36 30 L30 36',         // an arc with an arrow
}

function iconFor(label: string): string {
  const k = label.toLowerCase()
  if (k.includes('anx') || k.includes('stress') || k.includes('panic')) return ICONS.anxiety
  if (k.includes('relat') || k.includes('coupl')) return ICONS.relationships
  if (k.includes('trauma') || k.includes('ptsd') || k.includes('emdr')) return ICONS.trauma
  if (k.includes('grief') || k.includes('loss')) return ICONS.grief
  if (k.includes('esteem') || k.includes('confidence') || k.includes('self')) return ICONS.esteem
  if (k.includes('transit') || k.includes('change') || k.includes('career')) return ICONS.transitions
  return ICONS.default
}

// One quiet supporting line per concern (kept deliberately non-clinical).
const BLURBS = [
  'For the worry that never quite switches off.',
  'For the patterns that keep repeating with the people you love.',
  'For what still lives in the body, processed gently and at your pace.',
  'For losses with and without a name.',
  'For rebuilding a kinder relationship with yourself.',
  'For the in-between, when the old map no longer fits.',
]

export default function Expertise({ therapist }: ExpertiseProps) {
  const rootRef = useRef<HTMLElement | null>(null)
  const items = (therapist.specialties?.length ? therapist.specialties : [
    'Anxiety & Stress', 'Relationships', 'Trauma & EMDR', 'Grief', 'Self-Esteem', 'Life Transitions',
  ]).slice(0, 8)

  useQuietRoomMotion(({ gsap, reduced }) => {
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set('.qr-xp-card', { opacity: 1, y: 0 })
        gsap.set('.qr-xp-icon path', { strokeDashoffset: 0 })
        return
      }

      gsap.from('.qr-xp-card', {
        opacity: 0, y: 24, duration: 0.65, ease: 'expo.out', stagger: 0.08,
        scrollTrigger: { trigger: rootRef.current, start: 'top 75%' },
      })

      // Sketch each icon's strokes once when it enters.
      gsap.utils.toArray<SVGPathElement>('.qr-xp-icon path').forEach(path => {
        const len = path.getTotalLength()
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len })
        gsap.to(path, {
          strokeDashoffset: 0, duration: 0.8, ease: 'power1.inOut',
          scrollTrigger: { trigger: path.closest('.qr-xp-card'), start: 'top 85%', once: true },
        })
      })
    }, rootRef)
    return () => ctx.revert()
  })

  return (
    <section id="expertise" ref={rootRef} className="qr-daylight qr-section">
      <style>{`
        .qr-xp-head { max-width: 1140px; margin: 0 auto 48px; padding: 0 clamp(20px,5vw,56px); }
        .qr-xp-title { font-family: 'Spectral', serif; font-weight: 300; font-size: clamp(30px,4.4vw,52px);
          letter-spacing: -0.02em; color: var(--qr-charcoal); margin: 12px 0 0; }
        .qr-xp-grid { max-width: 1140px; margin: 0 auto; padding: 0 clamp(20px,5vw,56px);
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
        @media (max-width: 860px) { .qr-xp-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 520px) { .qr-xp-grid { grid-template-columns: 1fr; } }

        .qr-xp-card { background: var(--qr-paper); border-radius: 16px; padding: 28px 24px;
          border: 1px solid rgba(46,42,38,0.06); cursor: default;
          transition: transform 350ms var(--qr-calm-out), box-shadow 350ms var(--qr-calm-out), background 350ms var(--qr-calm-out); }
        .qr-xp-card:hover { transform: translateY(-4px); background: var(--qr-stone-warm);
          box-shadow: 0 18px 40px -24px rgba(46,42,38,0.4); }
        .qr-xp-icon { width: 48px; height: 44px; margin-bottom: 18px; display: block; }
        .qr-xp-icon path { fill: none; stroke: var(--qr-charcoal); stroke-width: 1.6;
          stroke-linecap: round; stroke-linejoin: round; transition: stroke 350ms var(--qr-calm-out); }
        .qr-xp-card:hover .qr-xp-icon path { stroke: var(--qr-moss); }
        .qr-xp-card h3 { font-family: 'Spectral', serif; font-weight: 400; font-size: 21px;
          color: var(--qr-charcoal); margin: 0 0 6px; }
        .qr-xp-card p { font-size: 14px; line-height: 1.55; color: rgba(46,42,38,0.62); margin: 0; }
      `}</style>

      <div className="qr-xp-head">
        <span className="qr-eyebrow">What we can work on</span>
        <h2 className="qr-xp-title">No issue here is the small one.</h2>
      </div>

      <div className="qr-xp-grid">
        {items.map((label, i) => (
          <article key={label} className="qr-xp-card">
            <svg className="qr-xp-icon" viewBox="0 0 48 44" aria-hidden>
              <path d={iconFor(label)} />
            </svg>
            <h3>{label}</h3>
            <p>{BLURBS[i % BLURBS.length]}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
