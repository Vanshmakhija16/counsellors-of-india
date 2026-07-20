'use client'

// ───────────────────────────────────────────────────────────────────────────
// Quiet Room loader — "Arrival". No countdown, no percentage — just a quiet
// line of introduction on the same dusk (ink) background and soft window-glow
// motif the rest of the template already uses, ending on the therapist's name
// in the honey accent. On exit, two ink panels (top/bottom) physically slide
// apart — the same doorway mechanic Template 7 uses — instead of the whole
// screen simply fading away, so the hero is genuinely revealed through the
// opening gap rather than just appearing after a dissolve.
// ───────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react'

interface LoaderProps {
  onDone: () => void
  therapistName?: string
}

const DURATION_MS = 2400 // fixed — how long the line + name sit on screen
const HOLD_MS = 500      // extra pause once the name has fully arrived

export default function Loader({ onDone, therapistName }: LoaderProps) {
  const [opening, setOpening] = useState(false)
  const [mounted, setMounted] = useState(true)
  const name = therapistName?.trim() || 'your practitioner'

  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Reduced-motion users still skip straight to the reveal; everyone else
    // sees the full arrival animation every time (no session-based skip).
    if (reduced) {
      setOpening(true)
      const t = setTimeout(() => setMounted(false), 0)
      return () => clearTimeout(t)
    }

    const t1 = setTimeout(() => setOpening(true), DURATION_MS + HOLD_MS)
    return () => clearTimeout(t1)
  }, [])

  useEffect(() => {
    if (!opening) return
    const t = setTimeout(() => setMounted(false), 950)
    return () => clearTimeout(t)
  }, [opening])

  useEffect(() => {
    if (!mounted) onDone()
  }, [mounted, onDone])

  if (!mounted) return null

  return (
    <div className={`qr-loader ${opening ? 'qr-loader--opening' : ''}`} aria-hidden={!mounted}>
      <div className="qr-loader-panel qr-loader-panel--top" />
      <div className="qr-loader-panel qr-loader-panel--bottom" />

      <div className="qr-loader-window" />

      <div className="qr-loader-center">
        <span className="qr-loader-eyebrow">Arriving</span>
        <p className="qr-loader-line">You&rsquo;re about to meet</p>
        <p className="qr-loader-name">{name}</p>
        <span
          className="qr-loader-rule"
          style={{ animationDuration: `${DURATION_MS}ms` }}
        />
      </div>
    </div>
  )
}
