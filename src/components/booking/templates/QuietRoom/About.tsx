'use client'

import { useEffect, useRef, useState } from 'react'
import { Clock, Calendar, IndianRupee, ArrowDownRight } from 'lucide-react'
import type { TherapistProfile } from '../templateUtils'
import { getAvailableDays, slotToISO } from '../templateUtils'
import { useQuietRoomMotion, prefersReducedMotion } from './_motion'

// Hands are driven by live wall-clock time, so it reads as an actual
// working clock rather than a static illustration.
function handAngles(now: Date) {
  const h = now.getHours() % 12
  const m = now.getMinutes()
  const s = now.getSeconds()
  const hourDeg   = h * 30 + m * 0.5
  const minuteDeg = m * 6 + s * 0.1
  const secondDeg = s * 6
  return { hourDeg, minuteDeg, secondDeg }
}

interface NextSlot {
  dayLabel: string
  slotLabel: string
  iso: string
}

function resolveNextSlot(therapist: TherapistProfile): NextSlot | null {
  const days = getAvailableDays(therapist.availability, therapist.sessionDuration, 14)
  const day = days[0]
  if (!day || day.slots.length === 0) return null
  const slotLabel = day.slots[0]
  return { dayLabel: day.label, slotLabel, iso: slotToISO(slotLabel, day.dateObj) }
}

interface AboutProps { therapist: TherapistProfile; scrollTo?: (id: string) => void }

// Build a small, dotted credentials line from whatever the profile offers.
function credentials(t: TherapistProfile): { label: string; detail: string }[] {
  const out: { label: string; detail: string }[] = []
  if (t.experience) out.push({ label: `${t.experience} years in practice`, detail: 'Working with adults across anxiety, grief, trauma and life transitions.' })
  ;(t.certifications ?? []).slice(0, 3).forEach(c =>
    out.push({ label: c, detail: 'A recognised qualification underpinning the work offered here.' }))
  if (out.length === 0) out.push({ label: 'Licensed Clinical Psychologist', detail: 'Registered and bound by professional standards of confidentiality and care.' })
  return out
}

export default function About({ therapist, scrollTo }: AboutProps) {
  const rootRef = useRef<HTMLElement | null>(null)
  const photoRef = useRef<HTMLDivElement | null>(null)
  const creds = credentials(therapist)

  const [nextSlot] = useState<NextSlot | null>(() => resolveNextSlot(therapist))
  const [now, setNow] = useState(() => new Date())
  const [reducedClock, setReducedClock] = useState(false)

  // Tick the clock once a second so it shows the real, current time
  // (skipped under reduced motion — the face holds at mount time).
  useEffect(() => {
    const isReduced = prefersReducedMotion()
    setReducedClock(isReduced)
    if (isReduced) return
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const { hourDeg, minuteDeg, secondDeg } = handAngles(now)

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

      // Clock face gently scales 1.0 → 1.05, tied to scroll (moves only while you do).
      if (!narrow && photoRef.current) {
        gsap.fromTo(photoRef.current,
          { scale: 1.0 },
          { scale: 1.05, ease: 'none',
            scrollTrigger: { trigger: photoRef.current, start: 'top bottom', end: 'bottom top', scrub: true } })
      }
    }, rootRef)
    return () => ctx.revert()
  })

  return (
    <section id="about" ref={rootRef} className="qr-daylight qr-section">
      <style>{`
        .qr-about-grid { max-width: 1140px; margin: 0 auto; padding: 0 clamp(20px,5vw,56px);
          display: grid; grid-template-columns: 1.15fr 0.85fr; gap: clamp(32px, 6vw, 80px); align-items: stretch;
          height: clamp(520px, 68vh, 680px); }
        @media (max-width: 860px) {
          .qr-about-grid { grid-template-columns: 1fr; gap: 36px; height: auto; align-items: start; }
        }

        /* The page itself never scrolls for this section — only the bio text
           scrolls, inside its own fixed-height pane. The clock sits still in
           the right column the whole time. */
        .qr-about-scrollpane {
          height: 100%;
          overflow-y: auto;
          overflow-x: hidden;
          padding-right: 18px;
          scrollbar-width: thin;
          scrollbar-color: rgba(46,42,38,0.18) transparent;
          mask-image: linear-gradient(to bottom, transparent 0, black 24px, black calc(100% - 24px), transparent 100%);
        }
        .qr-about-scrollpane::-webkit-scrollbar { width: 5px; }
        .qr-about-scrollpane::-webkit-scrollbar-thumb { background: rgba(46,42,38,0.18); border-radius: 4px; }
        .qr-about-scrollpane::-webkit-scrollbar-track { background: transparent; }
        @media (max-width: 860px) {
          .qr-about-scrollpane { height: auto; overflow: visible; padding-right: 0; mask-image: none; }
        }

        .qr-about-sticky {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        @media (max-width: 860px) {
          .qr-about-sticky { height: auto; }
        }

        .qr-about-quote { font-family: 'Spectral', serif; font-weight: 300; font-size: clamp(28px, 4vw, 44px);
          line-height: 1.18; letter-spacing: -0.02em; color: var(--qr-charcoal); margin: 14px 0 28px; }
        .qr-about-body p { font-size: 18px; line-height: 1.72; color: rgba(46,42,38,0.86); margin: 0 0 18px; }
        .qr-about-philosophy { font-family: 'Spectral', serif; font-style: italic; font-size: 19px;
          color: var(--qr-moss); margin-top: 26px; padding-left: 16px; border-left: 2px solid rgba(92,107,82,0.4); }

        .qr-about-photo { position: relative; border-radius: 50%; overflow: hidden; aspect-ratio: 1/1;
          background: radial-gradient(circle at 38% 32%, rgba(242,238,228,0.99), rgba(242,238,228,0.94) 70%);
          box-shadow: 0 0 0 1px rgba(242,238,228,0.12), 0 30px 70px -20px rgba(199,154,61,0.35), inset 0 0 26px rgba(46,42,38,0.05); }

        .qr-about-clock-tick { position: absolute; left: 50%; top: 5%; width: 1.5px; height: 7px;
          background: rgba(46,42,38,0.28); transform-origin: 50% 1000%; }
        .qr-about-clock-tick.major { height: 11px; width: 2.5px; background: var(--qr-honey); opacity: 0.95; }
        .qr-about-clock-hand { position: absolute; left: 50%; bottom: 50%; transform-origin: 50% 100%; border-radius: 4px; }
        .qr-about-clock-hand.hour   { width: 5px; height: 25%; margin-left: -2.5px; background: var(--qr-charcoal); }
        .qr-about-clock-hand.minute { width: 3.5px; height: 36%; margin-left: -1.75px; background: var(--qr-charcoal); opacity: 0.85; }
        .qr-about-clock-hand.second { width: 1.5px; height: 40%; margin-left: -0.75px; background: var(--qr-fig); }
        .qr-about-clock-pin { position: absolute; left: 50%; top: 50%; width: 9px; height: 9px;
          margin: -4.5px 0 0 -4.5px; border-radius: 50%; background: var(--qr-honey); z-index: 3; }

        .qr-about-clock-kicker {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--qr-honey);
          margin-bottom: 22px;
        }
        .qr-about-clock-time {
          font-family: 'Spectral', serif; font-weight: 300;
          font-size: clamp(22px, 2.2vw, 26px); line-height: 1.15;
          color: var(--qr-charcoal); margin: 22px 0 0; text-align: center;
        }
        .qr-about-clock-time em { font-style: italic; color: var(--qr-fig); }
        .qr-about-clock-none { font-size: 14px; color: rgba(46,42,38,0.6); margin: 22px 0 0; line-height: 1.5; text-align: center; }

        .qr-about-clock-meta {
          display: flex; align-items: center; justify-content: center; gap: 18px; flex-wrap: wrap;
          margin-top: 14px;
        }
        .qr-about-clock-meta-item {
          display: flex; align-items: center; gap: 6px;
          font-family: 'IBM Plex Sans', sans-serif; font-size: 12.5px; color: rgba(46,42,38,0.66);
        }
        .qr-about-clock-meta-item svg { color: var(--qr-fig); flex-shrink: 0; }

        .qr-about-clock-cta {
          display: inline-flex; align-items: center; gap: 8px;
          margin: 22px auto 0; padding: 13px 24px; border-radius: 12px;
          border: none;
          background: var(--qr-fig); color: var(--qr-paper, #fff); cursor: pointer;
          font-family: 'IBM Plex Sans', sans-serif; font-size: 13.5px; font-weight: 500;
          transition: transform 350ms var(--qr-calm-out), box-shadow 350ms var(--qr-calm-out);
        }
        .qr-about-clock-cta:hover { transform: translateY(-2px); box-shadow: 0 14px 30px -10px rgba(139,79,82,0.5); }
        .qr-about-clock-wrap { display: flex; flex-direction: column; align-items: center; margin-top: 48px; max-width: 280px; margin-left: auto; margin-right: auto; }

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
        <div className="qr-about-scrollpane">
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
            {therapist.approach_text?.trim() || 'No pressure, no performance just two people, working honestly, one session at a time.'}
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

        <div className="qr-about-sticky">
          <div className="qr-about-clock-wrap">
            <div className="qr-about-clock-kicker"><Clock size={11} /> Next available</div>

            <div
              className="qr-about-photo"
              ref={photoRef}
              role="img"
              aria-label={therapist.name ? `Clock, ${therapist.name}'s practice` : 'Clock'}
              style={{ width: '100%' }}
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className={`qr-about-clock-tick ${i % 3 === 0 ? 'major' : ''}`}
                  style={{ transform: `rotate(${i * 30}deg)` }}
                />
              ))}
              <div className="qr-about-clock-hand hour"   style={{ transform: `rotate(${hourDeg}deg)` }} />
              <div className="qr-about-clock-hand minute" style={{ transform: `rotate(${minuteDeg}deg)` }} />
              {!reducedClock && (
                <div className="qr-about-clock-hand second" style={{ transform: `rotate(${secondDeg}deg)` }} />
              )}
              <div className="qr-about-clock-pin" />
            </div>

            {nextSlot ? (
              <p className="qr-about-clock-time">{nextSlot.dayLabel}, <em>{nextSlot.slotLabel}</em></p>
            ) : (
              <p className="qr-about-clock-none">Reach out to check availability</p>
            )}

            <div className="qr-about-clock-meta">
              <span className="qr-about-clock-meta-item">
                <Calendar size={13} />
                {therapist.sessionDuration ? `${therapist.sessionDuration} min` : '50 min'}
              </span>
              <span className="qr-about-clock-meta-item">
                <IndianRupee size={13} />
                {therapist.fee ? `₹${therapist.fee}` : 'Contact for pricing'}
              </span>
            </div>

            <button className="qr-about-clock-cta" onClick={() => scrollTo?.('book')}>
              <span>Reserve this slot</span>
              <ArrowDownRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
