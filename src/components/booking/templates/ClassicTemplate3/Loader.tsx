'use client'

// ───────────────────────────────────────────────────────────────────────────
// Template 3 loader — "The Breath". A soft sage ring expands and contracts
// like a slow inhale/exhale while it fills, on the same airy sage/peach/
// ivory palette as the rest of "Serene Light". Calm and wellness-forward —
// deliberately unhurried, unlike CT1's stark countdown or CT7's dark ritual.
// ───────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react'

interface LoaderProps {
  onDone: () => void
  therapistName?: string
}

const SESSION_KEY = 'ct3-loader-seen'
const DURATION_MS = 2400 // fixed
const HOLD_MS = 600     // pause once the ring completes so the name is easy to read

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

const RADIUS = 52
const CIRC = 2 * Math.PI * RADIUS

export default function Loader({ onDone, therapistName }: LoaderProps) {
  const [progress, setProgress] = useState(0)
  const [opening, setOpening] = useState(false)
  const [mounted, setMounted] = useState(true)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const alreadySeen =
      typeof window !== 'undefined' && sessionStorage.getItem(SESSION_KEY) === '1'

    if (reduced || alreadySeen) {
      setProgress(100)
      setOpening(true)
      const t = setTimeout(() => setMounted(false), reduced ? 0 : 900)
      return () => clearTimeout(t)
    }

    let start: number | null = null
    function tick(ts: number) {
      if (start === null) start = ts
      const elapsed = ts - start
      const p = Math.min(elapsed / DURATION_MS, 1)
      setProgress(Math.floor(easeInOutCubic(p) * 100))
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setProgress(100)
        sessionStorage.setItem(SESSION_KEY, '1')
        setTimeout(() => setOpening(true), HOLD_MS)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
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
    <div className={`ct3-loader ${opening ? 'ct3-loader--opening' : ''}`} aria-hidden={!mounted}>
      <div className="ct3-loader-panel ct3-loader-panel--top" />
      <div className="ct3-loader-panel ct3-loader-panel--bottom" />

      <div className="ct3-loader-inner">
        <div className="ct3-loader-ring-wrap">
          <svg className="ct3-loader-ring" viewBox="0 0 120 120" aria-hidden="true">
            <circle className="ct3-loader-ring-track" cx="60" cy="60" r={RADIUS} />
            <circle
              className="ct3-loader-ring-fill"
              cx="60" cy="60" r={RADIUS}
              style={{
                strokeDasharray: CIRC,
                strokeDashoffset: CIRC - (CIRC * progress) / 100,
              }}
            />
          </svg>
          <span className="ct3-loader-pct">{progress}</span>
        </div>
        <span className="ct3-loader-eyebrow">Serene &middot; Loading</span>
        {therapistName?.trim() && <span className="ct3-loader-name">{therapistName}</span>}
      </div>
    </div>
  )
}
