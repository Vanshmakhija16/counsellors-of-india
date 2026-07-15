'use client'

import { useRef } from 'react'
import type { TherapistProfile } from '../templateUtils'
import { useCt7Reveal } from './_reveal'

interface ExpertiseProps { therapist: TherapistProfile }

interface FocusItem { label: string; blurb: string }

const DEFAULT_FOCUS: FocusItem[] = [
  { label: 'Anxiety & Stress',  blurb: 'For the worry that never quite switches off.' },
  { label: 'Relationships',     blurb: 'For the patterns that keep repeating with the people you love.' },
  { label: 'Grief & Loss',      blurb: 'For losses with and without a name.' },
  { label: 'Self-Esteem',       blurb: 'For rebuilding a kinder relationship with yourself.' },
  { label: 'Life Transitions',  blurb: 'For the in-between, when the old map no longer fits.' },
]

export default function Expertise({ therapist }: ExpertiseProps) {
  const rootRef = useRef<HTMLElement | null>(null)
  useCt7Reveal(rootRef)

  const items: FocusItem[] = therapist.specialties?.length
    ? therapist.specialties.slice(0, 6).map(s => ({ label: s, blurb: '' }))
    : DEFAULT_FOCUS

  return (
    <section id="expertise" ref={rootRef} className="ct7-section" style={{ background: 'var(--ct7-bone-dim)' }}>
      <style>{`
        .ct7-xp-inner { max-width: 1140px; margin: 0 auto; padding: 0 clamp(20px,5vw,56px); }
        .ct7-xp-list-row {
          display: grid; grid-template-columns: 60px 1fr auto; align-items: baseline;
          gap: clamp(14px, 3vw, 32px); padding: clamp(20px, 3vw, 28px) 0;
          border-top: 1px solid rgba(43,51,46,0.1);
        }
        .ct7-xp-list-row:last-child { border-bottom: 1px solid rgba(43,51,46,0.1); }
        .ct7-xp-list-num { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--ct7-brass); }
        .ct7-xp-list-label {
          font-family: 'Fraunces', Georgia, serif; font-weight: 500; font-size: clamp(18px, 2.4vw, 25px);
          color: var(--ct7-charcoal); margin: 0;
        }
        .ct7-xp-list-blurb {
          font-family: 'Inter', system-ui, sans-serif; font-size: 13.5px; color: rgba(43,51,46,0.58);
          text-align: right; max-width: 30ch; justify-self: end;
        }
        @media (max-width: 640px) {
          .ct7-xp-list-row { grid-template-columns: 36px 1fr; }
          .ct7-xp-list-blurb { display: none; }
        }
      `}</style>

      <div className="ct7-section-head">
        <span className="ct7-eyebrow ct7-reveal">What we can work on</span>
        <h2 className="ct7-section-title ct7-reveal-clip">No issue here is <em>the small one</em>.</h2>
      </div>

      <div className="ct7-xp-inner">
        {items.map((item, i) => (
          <div key={item.label} className="ct7-xp-list-row ct7-reveal">
            <span className="ct7-xp-list-num">{String(i + 1).padStart(2, '0')}</span>
            <h3 className="ct7-xp-list-label">{item.label}</h3>
            {item.blurb && <span className="ct7-xp-list-blurb">{item.blurb}</span>}
          </div>
        ))}
      </div>
    </section>
  )
}
