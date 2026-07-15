'use client'

import { useRef } from 'react'
import type { TherapistProfile } from '../templateUtils'
import { useCt7Reveal } from './_reveal'

interface AboutProps { therapist: TherapistProfile }

// Builds a small, dotted credentials line from whatever the profile offers —
// same fallback spirit as the other templates, kept local since Atrium
// doesn't (yet) read from profile_content.
function credentials(t: TherapistProfile): string[] {
  const out: string[] = []
  if (t.credentials?.trim()) out.push(t.credentials.trim())
  if (t.experience) out.push(`${t.experience} years in practice`)
  ;(t.certifications ?? []).slice(0, 2).forEach(c => out.push(c))
  if (out.length === 0) out.push('Licensed Clinical Psychologist')
  return out
}

export default function About({ therapist }: AboutProps) {
  const rootRef = useRef<HTMLElement | null>(null)
  useCt7Reveal(rootRef)

  const paras = (therapist.bio || '')
    .split(/\n+/).map(s => s.trim()).filter(Boolean)
  const bioParas = paras.length ? paras : [
    "I work with adults navigating anxiety, grief, relationship strain, and the quieter kind of exhaustion that builds up over years, not weeks.",
    "The work here is unhurried and collaborative — less about arriving at a fixed destination, more about understanding yourself with a little more clarity and a lot less judgement.",
  ]
  const creds = credentials(therapist)
  const firstName = therapist.name?.split(' ')[0]

  return (
    <section id="about" ref={rootRef} className="ct7-section" style={{ background: 'var(--ct7-bone)' }}>
      <style>{`
        .ct7-ab-wrap {
          max-width: 1140px; margin: 0 auto; padding: 0 clamp(20px,5vw,56px);
          display: grid; grid-template-columns: 1.3fr 0.7fr; gap: clamp(32px, 6vw, 72px);
          align-items: start;
        }
        @media (max-width: 860px) { .ct7-ab-wrap { grid-template-columns: 1fr; } }

        .ct7-ab-quote {
          font-family: 'Fraunces', Georgia, serif; font-weight: 500; font-style: italic;
          font-size: clamp(22px, 2.6vw, 30px); line-height: 1.32; color: var(--ct7-charcoal);
          margin: 14px 0 28px; max-width: 26ch;
        }
        .ct7-ab-body p {
          font-family: 'Inter', system-ui, sans-serif; font-size: 16px; line-height: 1.75;
          color: rgba(43,51,46,0.72); margin: 0 0 16px; max-width: 58ch;
        }
        .ct7-ab-creds { margin-top: 30px; display: flex; flex-wrap: wrap; gap: 6px 0; }
        .ct7-ab-cred {
          font-family: 'JetBrains Mono', monospace; font-size: 11px; text-transform: uppercase;
          letter-spacing: 0.06em; color: var(--ct7-moss);
        }
        .ct7-ab-cred:not(:last-child)::after { content: '·'; margin: 0 10px; color: var(--ct7-brass); }

        .ct7-ab-card {
          border-radius: 18px; overflow: hidden; position: relative;
          aspect-ratio: 4 / 5; background: linear-gradient(160deg, #3B4B43, #23302B);
          box-shadow: 0 30px 60px -20px rgba(0,0,0,0.22);
        }
        .ct7-ab-card img { width: 100%; height: 100%; object-fit: cover; display: block; filter: grayscale(0.08) contrast(1.02); }
        .ct7-ab-card-tag {
          position: absolute; left: 14px; bottom: 14px; z-index: 2;
          background: rgba(35,48,43,0.88); backdrop-filter: blur(6px);
          padding: 8px 13px; border-radius: 100px;
          font-family: 'JetBrains Mono', monospace; font-size: 10.5px; letter-spacing: 0.06em;
          color: #F6F1E7; text-transform: uppercase;
        }
      `}</style>

      <div className="ct7-ab-wrap">
        <div className="ct7-ledger-row ct7-reveal" style={{ borderTop: 'none', paddingTop: 0 }}>
          <span className="ct7-ledger-num">01</span>
          <div className="ct7-ledger-body">
            <span className="ct7-eyebrow" style={{ color: 'var(--ct7-brass)' }}>Who's in the room</span>
            <p className="ct7-ab-quote">
              {therapist.tagline?.trim() || 'Therapy works best when it stops feeling like a transaction and starts feeling like a relationship.'}
            </p>
            <div className="ct7-ab-body">
              {bioParas.map((p, i) => <p key={i}>{p}</p>)}
            </div>
            <div className="ct7-ab-creds">
              {creds.map((c, i) => <span key={i} className="ct7-ab-cred">{c}</span>)}
            </div>
          </div>
        </div>

        <div className="ct7-ab-card ct7-reveal">
          {therapist.image && <img src={therapist.image} alt={therapist.name || 'Therapist portrait'} />}
          <span className="ct7-ab-card-tag">{firstName ? `— ${firstName}` : '— Practice'}</span>
        </div>
      </div>
    </section>
  )
}
