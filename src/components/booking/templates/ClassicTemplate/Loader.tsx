'use client'

// ───────────────────────────────────────────────────────────────────────────
// Template 1 loader — a plain, high-contrast counting screen. Deep bark
// background (guaranteed visible against the light page, unlike a pale
// panel that can blend into an equally pale page), a big serif count
// climbing 0 → 100 over a FIXED duration, and a thin terracotta progress
// rule underneath. Every class used here is defined right alongside it in
// styles.ts — no dependency on classes from an older design.
// ───────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react'

interface LoaderProps {
  onDone: () => void
  therapistName?: string
}

const SESSION_KEY = 'ct1-loader-seen'
const DURATION_MS = 2200 // fixed — always this long to count down
const HOLD_MS = 700      // extra pause at 0 before the page is revealed

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export default function Loader({ onDone, therapistName }: LoaderProps) {
  const [count, setCount] = useState(100)
  const [exiting, setExiting] = useState(false)
  const [mounted, setMounted] = useState(true)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const alreadySeen =
      typeof window !== 'undefined' && sessionStorage.getItem(SESSION_KEY) === '1'

    // Repeat views in the same tab (e.g. bouncing back from the booking
    // step) skip the ritual — it's a first-impression moment, not a chore.
    if (reduced || alreadySeen) {
      setCount(0)
      setExiting(true)
      const t = setTimeout(() => setMounted(false), reduced ? 0 : 400)
      return () => clearTimeout(t)
    }

    let start: number | null = null
    function tick(ts: number) {
      if (start === null) start = ts
      const elapsed = ts - start
      const p = Math.min(elapsed / DURATION_MS, 1)
      setCount(100 - Math.floor(easeInOutCubic(p) * 100))
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setCount(0)
        sessionStorage.setItem(SESSION_KEY, '1')
        // Hold the page on "000" for a beat before revealing — the count
        // finishing isn't itself the cue to leave, it's a moment to sit with.
        setTimeout(() => setExiting(true), HOLD_MS)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  useEffect(() => {
    if (!exiting) return
    const t = setTimeout(() => setMounted(false), 550)
    return () => clearTimeout(t)
  }, [exiting])

  useEffect(() => {
    if (!mounted) onDone()
  }, [mounted, onDone])

  if (!mounted) return null

  return (
    <div className={`ct-loader ${exiting ? 'ct-loader--exit' : ''}`} aria-hidden={!mounted}>
      <div className="ct-loader-inner">
        <span className="ct-loader-tag">Loading</span>
        <span className="ct-loader-count">{String(count).padStart(3, '0')}</span>
        <div className="ct-loader-rule">
          <span className="ct-loader-rule-fill" style={{ width: `${100 - count}%` }} />
        </div>
        {therapistName?.trim() && <span className="ct-loader-name">{therapistName}</span>}
      </div>
    </div>
  )
}
