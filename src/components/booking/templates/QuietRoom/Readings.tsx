'use client'

import { useRef } from 'react'
import type { TherapistProfile } from '../templateUtils'
import { useQuietRoomMotion } from './_motion'

interface ReadingsProps { therapist: TherapistProfile }

interface Reading { category: string; title: string; excerpt: string; read: string }

// A small library of thoughtful pieces, themed off the practitioner's focus.
const LIBRARY: Reading[] = [
  { category: 'On anxiety', title: 'The anxiety underneath your productivity', excerpt: 'When ambition is fuelled by avoidance, achievement starts to feel like relief instead of joy.', read: '6 min' },
  { category: 'On grief', title: 'Grief without a vocabulary', excerpt: 'Some losses don’t arrive with a name — the friendship that quietly thinned, the self you outgrew.', read: '8 min' },
  { category: 'On relationships', title: 'Why repair matters more than rupture', excerpt: 'Conflict isn’t the threat to closeness we think it is. Unrepaired conflict is.', read: '5 min' },
  { category: 'On rest', title: 'Rest is not a reward', excerpt: 'You don’t have to earn the right to stop. A short note on permission.', read: '4 min' },
  { category: 'On beginnings', title: 'What the first session is actually like', excerpt: 'Demystifying the thing most people quietly dread before they walk in.', read: '7 min' },
]

export default function Readings({ therapist }: ReadingsProps) {
  const rootRef = useRef<HTMLElement | null>(null)
  void therapist // reserved for future per-practitioner posts

  const [featured, ...rest] = LIBRARY

  useQuietRoomMotion(({ gsap, reduced }) => {
    const ctx = gsap.context(() => {
      if (reduced) { gsap.set('.qr-rd-card', { opacity: 1, y: 0 }); return }
      gsap.from('.qr-rd-card', {
        opacity: 0, y: 30, duration: 0.65, ease: 'expo.out', stagger: 0.07,
        scrollTrigger: { trigger: rootRef.current, start: 'top 75%' },
      })
    }, rootRef)
    return () => ctx.revert()
  })

  return (
    <section id="readings" ref={rootRef} className="qr-daylight qr-section">
      <style>{`
        .qr-rd-wrap { max-width: 1140px; margin: 0 auto; padding: 0 clamp(20px,5vw,56px); }
        .qr-rd-title { font-family: 'Spectral', serif; font-weight: 300; font-size: clamp(30px,4.4vw,52px);
          letter-spacing: -0.02em; margin: 12px 0 40px; color: var(--qr-charcoal); }

        .qr-rd-feature { display: grid; grid-template-columns: 1.1fr 1fr; gap: 36px; align-items: center;
          margin-bottom: 44px; }
        @media (max-width: 760px) { .qr-rd-feature { grid-template-columns: 1fr; gap: 22px; } }
        .qr-rd-thumb { border-radius: 16px; overflow: hidden; aspect-ratio: 16/10; background: var(--qr-stone-warm);
          position: relative; }
        .qr-rd-thumb-glow { position: absolute; inset: 0;
          background: radial-gradient(120% 120% at 30% 20%, rgba(199,154,61,0.35), rgba(139,79,82,0.18) 55%, var(--qr-stone-warm) 100%);
          filter: saturate(0.8) brightness(0.96); transition: filter 600ms var(--qr-calm-out); }
        .qr-rd-card:hover .qr-rd-thumb-glow { filter: saturate(1.1) brightness(1.02); }

        .qr-rd-cat { display: inline-block; position: relative; overflow: hidden; font-family: 'IBM Plex Mono', monospace;
          text-transform: uppercase; letter-spacing: 0.08em; font-size: 10px; color: var(--qr-moss);
          padding: 5px 10px; border: 1px solid rgba(92,107,82,0.4); border-radius: 999px; margin-bottom: 14px; }
        .qr-rd-cat::before { content: ''; position: absolute; inset: 0; background: var(--qr-honey);
          transform: scaleX(0); transform-origin: left; transition: transform 250ms var(--qr-calm-out); z-index: -1; }
        .qr-rd-card:hover .qr-rd-cat { color: var(--qr-ink); border-color: var(--qr-honey); }
        .qr-rd-card:hover .qr-rd-cat::before { transform: scaleX(1); }

        .qr-rd-h3 { font-family: 'Spectral', serif; font-weight: 400; color: var(--qr-charcoal); margin: 0 0 8px;
          position: relative; display: inline-block; }
        .qr-rd-h3::after { content: ''; position: absolute; left: 0; bottom: -2px; height: 1px; width: 100%;
          background: currentColor; transform: scaleX(0); transform-origin: left; transition: transform 300ms var(--qr-calm-inout); }
        .qr-rd-card:hover .qr-rd-h3::after { transform: scaleX(1); }
        .qr-rd-excerpt { font-size: 15px; line-height: 1.6; color: rgba(46,42,38,0.66); margin: 0 0 12px; }
        .qr-rd-read { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--qr-honey); }

        .qr-rd-feature .qr-rd-h3 { font-size: clamp(24px, 3vw, 34px); }

        .qr-rd-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        @media (max-width: 860px) { .qr-rd-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .qr-rd-grid { grid-template-columns: 1fr; } }
        .qr-rd-card { cursor: pointer; transition: transform 600ms var(--qr-calm-out); }
        .qr-rd-grid .qr-rd-card:hover { transform: translateY(-4px); }
        .qr-rd-grid .qr-rd-thumb { aspect-ratio: 16/11; margin-bottom: 16px; }
        .qr-rd-grid .qr-rd-h3 { font-size: 19px; }
      `}</style>

      <div className="qr-rd-wrap">
        <span className="qr-eyebrow">Readings</span>
        <h2 className="qr-rd-title">A few things worth sitting with.</h2>

        {/* Featured */}
        <article className="qr-rd-card qr-rd-feature">
          <div className="qr-rd-thumb"><div className="qr-rd-thumb-glow" /></div>
          <div>
            <span className="qr-rd-cat">{featured.category}</span>
            <h3 className="qr-rd-h3">{featured.title}</h3>
            <p className="qr-rd-excerpt">{featured.excerpt}</p>
            <span className="qr-rd-read">{featured.read} read</span>
          </div>
        </article>

        {/* Grid */}
        <div className="qr-rd-grid">
          {rest.map((r) => (
            <article key={r.title} className="qr-rd-card">
              <div className="qr-rd-thumb"><div className="qr-rd-thumb-glow" /></div>
              <span className="qr-rd-cat">{r.category}</span>
              <h3 className="qr-rd-h3">{r.title}</h3>
              <p className="qr-rd-excerpt">{r.excerpt}</p>
              <span className="qr-rd-read">{r.read} read</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
