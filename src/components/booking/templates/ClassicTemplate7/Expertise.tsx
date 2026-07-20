'use client'

import { useRef, useState, useEffect } from 'react'
import {
  Brain, Users, CloudDrizzle, Heart, Compass, Sparkles,
  Clock, ArrowUpRight, ArrowLeft, ArrowRight,
} from 'lucide-react'
import type { TherapistProfile } from '../templateUtils'
import { useCt7Reveal } from './_reveal'

interface ExpertiseProps {
  therapist: TherapistProfile
  scrollTo?: (id: string) => void
}

interface FocusItem { label: string; blurb: string }

const DEFAULT_FOCUS: FocusItem[] = [
  { label: 'Anxiety & Stress',  blurb: 'For the worry that never quite switches off — cognitive, somatic, and mindfulness-based tools to break the cycle.' },
  { label: 'Relationships',     blurb: 'For the patterns that keep repeating with the people you love — communication, conflict, and rebuilding trust.' },
  { label: 'Grief & Loss',      blurb: 'For losses with and without a name — compassionate, unhurried support at your own pace.' },
  { label: 'Self-Esteem',       blurb: 'For rebuilding a kinder relationship with yourself, free from self-criticism and comparison.' },
  { label: 'Life Transitions',  blurb: 'For the in-between, when the old map no longer fits and clarity feels far away.' },
  { label: 'Trauma & EMDR',     blurb: 'For what still lives in the body, processed gently and only at the speed you allow.' },
]

// Loose keyword → icon mapping so custom specialties still get a sensible glyph
const ICON_RULES: [RegExp, typeof Brain][] = [
  [/anxi|stress|burnout|overwhelm/i, Brain],
  [/relationship|couple|partner|marriage/i, Users],
  [/grief|loss|bereave/i, CloudDrizzle],
  [/self.?esteem|identity|confidence/i, Heart],
  [/transition|career|direction|purpose/i, Compass],
]
function iconFor(label: string) {
  return ICON_RULES.find(([re]) => re.test(label))?.[1] ?? Sparkles
}

export default function Expertise({ therapist, scrollTo }: ExpertiseProps) {
  const rootRef = useRef<HTMLElement | null>(null)
  useCt7Reveal(rootRef)

  const trackRef = useRef<HTMLDivElement | null>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(true)

  const items: FocusItem[] = therapist.specialties?.length
    ? therapist.specialties.slice(0, 8).map(s => ({ label: s, blurb: '' }))
    : DEFAULT_FOCUS

  const priceLabel = therapist.fee
    ? `₹${new Intl.NumberFormat('en-IN').format(therapist.fee)}`
    : null
  const durationLabel = therapist.sessionDuration ? `${therapist.sessionDuration} min` : null

  function updateArrows() {
    const el = trackRef.current
    if (!el) return
    setCanPrev(el.scrollLeft > 4)
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }

  useEffect(() => {
    updateArrows()
    const el = trackRef.current
    if (!el) return
    el.addEventListener('scroll', updateArrows, { passive: true })
    window.addEventListener('resize', updateArrows)
    return () => {
      el.removeEventListener('scroll', updateArrows)
      window.removeEventListener('resize', updateArrows)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length])

  function scrollByCard(dir: 1 | -1) {
    const el = trackRef.current
    if (!el) return
    const card = el.querySelector<HTMLElement>('.ct7-svc-card')
    const step = (card?.offsetWidth ?? 280) + 20
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  return (
    <section id="expertise" ref={rootRef} className="ct7-section" style={{ background: 'var(--ct7-bone-dim)' }}>
      <style>{`
        .ct7-svc-head-row {
          max-width: 1180px; margin: 0 auto clamp(28px, 4vw, 44px); padding: 0 clamp(20px,5vw,56px);
          display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; flex-wrap: wrap;
        }
        .ct7-svc-arrows { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
        .ct7-svc-arrow-btn {
          width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0;
          border: 1px solid rgba(43,51,46,0.18); background: transparent;
          display: flex; align-items: center; justify-content: center; color: var(--ct7-charcoal); cursor: pointer;
          transition: background 260ms var(--ct7-ease-out), border-color 260ms var(--ct7-ease-out), color 260ms var(--ct7-ease-out), transform 200ms var(--ct7-ease-out);
        }
        .ct7-svc-arrow-btn:hover:not(:disabled) { background: var(--ct7-brass); border-color: var(--ct7-brass); color: var(--ct7-ink); transform: translateY(-2px); }
        .ct7-svc-arrow-btn:disabled { opacity: 0.28; cursor: default; }

        /* ── One-row horizontal carousel ── */
        .ct7-svc-track {
          display: flex; gap: clamp(16px, 2vw, 22px); overflow-x: auto; scroll-snap-type: x proximity;
          padding: 4px clamp(20px,5vw,56px) 18px; margin: 0 auto; max-width: 1180px;
          scrollbar-width: none;
        }
        .ct7-svc-track::-webkit-scrollbar { display: none; }

        .ct7-svc-card {
          scroll-snap-align: start; flex: 0 0 auto;
          width: clamp(200px, 22vw, 250px);
          min-height: 400px;
          background: var(--ct7-bone);
          border: 1px solid rgba(43,51,46,0.08);
          border-radius: 22px;
          padding: 22px 20px 20px;
          display: flex; flex-direction: column;
          transition: transform 320ms var(--ct7-ease-out), box-shadow 320ms var(--ct7-ease-out), border-color 320ms var(--ct7-ease-out);
        }
        .ct7-svc-card:hover { transform: translateY(-6px); box-shadow: 0 26px 50px rgba(20,28,24,0.14); border-color: rgba(198,167,107,0.35); }

        .ct7-svc-card-pill {
          display: inline-flex; align-items: center; gap: 7px; align-self: flex-start;
          background: #fff; border: 1px solid rgba(43,51,46,0.1); border-radius: 100px;
          padding: 7px 13px 7px 10px;
          font-family: 'Inter', system-ui, sans-serif; font-size: 12px; font-weight: 700; color: var(--ct7-charcoal);
        }
        .ct7-svc-card-pill-icon {
          width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0;
          background: rgba(198,167,107,0.16); color: var(--ct7-brass);
          display: flex; align-items: center; justify-content: center;
        }

        .ct7-svc-card-title {
          font-family: 'Fraunces', Georgia, serif; font-weight: 500; letter-spacing: -0.01em;
          font-size: clamp(19px, 2vw, 22px); line-height: 1.18; color: var(--ct7-charcoal);
          margin: 16px 0 0;
        }

        .ct7-svc-card-visual {
          flex: 1; display: flex; align-items: center; justify-content: center; position: relative;
          margin: 18px 0;
        }
        .ct7-svc-card-visual-ring {
          width: 92px; height: 92px; border-radius: 50%;
          background: radial-gradient(120% 120% at 30% 20%, rgba(198,167,107,0.14) 0%, transparent 60%), var(--ct7-ink);
          display: flex; align-items: center; justify-content: center; color: #D9BC85;
          box-shadow: 0 18px 34px rgba(20,28,24,0.16);
        }
        .ct7-svc-card-ghost-num {
          position: absolute; z-index: -1; font-family: 'JetBrains Mono', monospace; font-weight: 500;
          font-size: 120px; line-height: 1; color: rgba(43,51,46,0.05);
        }

        .ct7-svc-card-cta {
          display: inline-flex; align-items: center; gap: 6px; align-self: flex-start;
          background: #fff; border: 1px solid rgba(43,51,46,0.12); border-radius: 100px;
          padding: 9px 8px 9px 15px; cursor: pointer;
          font-family: 'Inter', system-ui, sans-serif; font-size: 12.5px; font-weight: 700; color: var(--ct7-charcoal);
          transition: background 240ms var(--ct7-ease-out), border-color 240ms var(--ct7-ease-out);
        }
        .ct7-svc-card-cta:hover { background: var(--ct7-ink); border-color: var(--ct7-ink); color: #F6F1E7; }
        .ct7-svc-card-cta-arrow {
          width: 22px; height: 22px; border-radius: 50%; background: rgba(43,51,46,0.06);
          display: flex; align-items: center; justify-content: center;
        }
        .ct7-svc-card-cta:hover .ct7-svc-card-cta-arrow { background: rgba(246,241,231,0.16); }

        .ct7-svc-card-meta {
          margin-top: 14px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
          font-family: 'Inter', system-ui, sans-serif; font-size: 11.5px; color: rgba(43,51,46,0.5);
        }
        .ct7-svc-card-meta b { color: var(--ct7-brass); }
      `}</style>

      <div className="ct7-section-head" style={{ marginBottom: 24 }}>
        <span className="ct7-eyebrow ct7-reveal">What we can work on</span>
        <h2 className="ct7-section-title ct7-reveal-clip">No issue here is <em>the small one</em>.</h2>
      </div>

      <div className="ct7-svc-head-row">
        <span />
        <div className="ct7-svc-arrows">
          <button className="ct7-svc-arrow-btn" onClick={() => scrollByCard(-1)} disabled={!canPrev} aria-label="Previous">
            <ArrowLeft size={17} strokeWidth={2} />
          </button>
          <button className="ct7-svc-arrow-btn" onClick={() => scrollByCard(1)} disabled={!canNext} aria-label="Next">
            <ArrowRight size={17} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="ct7-svc-track" ref={trackRef}>
        {items.map((item, i) => {
          const Icon = iconFor(item.label)
          return (
            <div
              key={item.label}
              className="ct7-svc-card ct7-reveal"
              style={{ '--ct7-d': `${Math.min(i, 6) * 70}ms` } as React.CSSProperties}
            >
              <span className="ct7-svc-card-pill">
                <span className="ct7-svc-card-pill-icon"><Icon size={11} strokeWidth={2.2} /></span>
                {item.label.length > 18 ? item.label.slice(0, 16) + '…' : item.label}
              </span>

              <h3 className="ct7-svc-card-title">{item.label}</h3>

              <div className="ct7-svc-card-visual">
                <span className="ct7-svc-card-ghost-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="ct7-svc-card-visual-ring"><Icon size={30} strokeWidth={1.6} /></span>
              </div>

              {scrollTo && (
                <button className="ct7-svc-card-cta" onClick={() => scrollTo('booking')}>
                  About {item.label.split(' ')[0]}
                  <span className="ct7-svc-card-cta-arrow"><ArrowUpRight size={12} strokeWidth={2.4} /></span>
                </button>
              )}

              {(priceLabel || durationLabel) && (
                <div className="ct7-svc-card-meta">
                  {priceLabel && <b>{priceLabel}</b>}
                  {priceLabel && durationLabel && <span>&middot;</span>}
                  {durationLabel && <span><Clock size={11} style={{ verticalAlign: -1 }} /> {durationLabel}</span>}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
