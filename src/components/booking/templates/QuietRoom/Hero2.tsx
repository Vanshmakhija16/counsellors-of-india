'use client'

// ───────────────────────────────────────────────────────────────────────────
// "Next available slot" clock — a compact strip that sits directly under
// the main Hero. Not a second hero: no headline, no full-viewport height,
// just the wall clock + label + a single CTA, so it reads as a feature
// beneath the hero rather than a competing one.
// ───────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react'
import { ArrowDownRight, Clock } from 'lucide-react'
import type { TherapistProfile } from '../templateUtils'
import { getAvailableDays, slotToISO } from '../templateUtils'
import { useQuietRoomMotion, prefersReducedMotion } from './_motion'

interface Hero2Props {
  therapist: TherapistProfile
  scrollTo: (id: string) => void
}

// ── Next-available-slot resolution ────────────────────────────────────────
// Same source of truth Booking.tsx already uses (getAvailableDays), just
// collapsed to "the very first bookable slot".
interface NextSlot {
  dayLabel: string   // "Today" | "Tomorrow" | "Wed" ...
  slotLabel: string  // "4:30 PM"
  iso: string         // exact instant, used to drive the clock hands
}

function resolveNextSlot(therapist: TherapistProfile): NextSlot | null {
  const days = getAvailableDays(therapist.availability, therapist.sessionDuration, 14)
  const day = days[0]
  if (!day || day.slots.length === 0) return null
  const slotLabel = day.slots[0]
  return {
    dayLabel: day.label,
    slotLabel,
    iso: slotToISO(slotLabel, day.dateObj),
  }
}

// ── Clock hand angles ──────────────────────────────────────────────────────
// Hour hand includes the minutes contribution (so it doesn't snap on the
// hour); second hand is driven live by wall-clock time for the "this clock
// is alive" read, independent of the target slot.
function handAngles(target: Date, liveSeconds: number) {
  const h = target.getHours() % 12
  const m = target.getMinutes()
  const hourDeg   = h * 30 + m * 0.5
  const minuteDeg = m * 6
  const secondDeg = liveSeconds * 6
  return { hourDeg, minuteDeg, secondDeg }
}

export default function Hero2({ therapist, scrollTo }: Hero2Props) {
  const rootRef = useRef<HTMLElement | null>(null)

  const [nextSlot] = useState<NextSlot | null>(() => resolveNextSlot(therapist))
  const [liveSeconds, setLiveSeconds] = useState(() => new Date().getSeconds())
  const [reduced, setReduced] = useState(false)

  // Tick the second hand once a second (skipped entirely under reduced motion —
  // the clock face still shows the correct static target time).
  useEffect(() => {
    const isReduced = prefersReducedMotion()
    setReduced(isReduced)
    if (isReduced) return
    const id = setInterval(() => setLiveSeconds(new Date().getSeconds()), 1000)
    return () => clearInterval(id)
  }, [])

  useQuietRoomMotion(({ gsap, reduced: motionReduced }) => {
    const ctx = gsap.context(() => {
      if (motionReduced) {
        gsap.set('.qr-ns-clock, .qr-ns-copy', { opacity: 1, y: 0, scale: 1 })
        return
      }
      gsap.fromTo('.qr-ns-clock',
        { scale: 0.92, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.9, ease: 'expo.out',
          scrollTrigger: { trigger: rootRef.current, start: 'top 80%' } })
      gsap.fromTo('.qr-ns-copy',
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', delay: 0.1,
          scrollTrigger: { trigger: rootRef.current, start: 'top 80%' } })
    }, rootRef)
    return () => ctx.revert()
  })

  const target = nextSlot ? new Date(nextSlot.iso) : null
  const { hourDeg, minuteDeg, secondDeg } = target
    ? handAngles(target, liveSeconds)
    : { hourDeg: 0, minuteDeg: 0, secondDeg: 0 }

  return (
    <section id="next-slot" ref={rootRef} className="qr-daylight qr-ns">
      <style>{`
        .qr-ns { padding: 64px clamp(20px, 5vw, 56px); }
        .qr-ns-inner { max-width: 1140px; margin: 0 auto;
          display: flex; align-items: center; justify-content: center; gap: clamp(28px, 5vw, 56px);
          flex-wrap: wrap; text-align: left; }

        .qr-ns-clock { opacity: 0; flex-shrink: 0; }
        .qr-clock-face {
          position: relative; width: 132px; height: 132px; border-radius: 50%;
          background: var(--qr-paper);
          border: 1px solid rgba(46,42,38,0.1);
          box-shadow: inset 0 0 18px rgba(46,42,38,0.06), 0 14px 32px -10px rgba(46,42,38,0.18);
        }
        .qr-clock-tick {
          position: absolute; left: 50%; top: 6%; width: 1.5px; height: 6px;
          background: rgba(46,42,38,0.3); transform-origin: 50% 1050%;
        }
        .qr-clock-tick.major { height: 9px; width: 2px; background: var(--qr-honey); opacity: 0.9; }
        .qr-clock-hand { position: absolute; left: 50%; bottom: 50%; transform-origin: 50% 100%;
          border-radius: 4px; }
        .qr-clock-hand.hour   { width: 4px; height: 24%; margin-left: -2px; background: var(--qr-charcoal); }
        .qr-clock-hand.minute { width: 3px; height: 34%; margin-left: -1.5px; background: var(--qr-charcoal); opacity: 0.85; }
        .qr-clock-hand.second { width: 1.5px; height: 38%; margin-left: -0.75px; background: var(--qr-fig); }
        .qr-clock-pin { position: absolute; left: 50%; top: 50%; width: 8px; height: 8px;
          margin: -4px 0 0 -4px; border-radius: 50%; background: var(--qr-honey); z-index: 3; }

        .qr-ns-copy { opacity: 0; }
        .qr-ns-kicker { display: flex; align-items: center; gap: 8px;
          font-family: 'IBM Plex Mono', monospace; text-transform: uppercase; letter-spacing: 0.08em;
          font-size: 11px; color: var(--qr-moss); margin-bottom: 8px; }
        .qr-ns-time { font-family: 'Spectral', serif; font-weight: 400; font-size: clamp(26px, 3vw, 34px);
          color: var(--qr-charcoal); margin: 0 0 14px; }
        .qr-ns-time span { color: var(--qr-fig); font-style: italic; }
        .qr-ns-none { font-size: 16px; color: rgba(46,42,38,0.6); margin: 0 0 14px; }

        @media (max-width: 640px) { .qr-ns-inner { justify-content: center; text-align: center; } }
      `}</style>

      <div className="qr-ns-inner">
        <div className="qr-ns-clock qr-mono">
          <div className="qr-clock-face" role="img" aria-label={
            nextSlot ? `Clock showing next available slot: ${nextSlot.dayLabel}, ${nextSlot.slotLabel}` : 'Clock'
          }>
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className={`qr-clock-tick ${i % 3 === 0 ? 'major' : ''}`}
                style={{ transform: `rotate(${i * 30}deg)` }}
              />
            ))}
            <div className="qr-clock-hand hour"   style={{ transform: `rotate(${hourDeg}deg)` }} />
            <div className="qr-clock-hand minute" style={{ transform: `rotate(${minuteDeg}deg)` }} />
            {!reduced && (
              <div className="qr-clock-hand second" style={{ transform: `rotate(${secondDeg}deg)` }} />
            )}
            <div className="qr-clock-pin" />
          </div>
        </div>

        <div className="qr-ns-copy">
          <div className="qr-ns-kicker"><Clock size={12} /> Next available</div>
          {nextSlot ? (
            <p className="qr-ns-time">{nextSlot.dayLabel}, <span>{nextSlot.slotLabel}</span></p>
          ) : (
            <p className="qr-ns-none">Reach out to check availability</p>
          )}
          <button className="qr-cta" onClick={() => scrollTo('book')}>
            Book this slot <ArrowDownRight size={16} />
          </button>
        </div>
      </div>
    </section>
  )
}
