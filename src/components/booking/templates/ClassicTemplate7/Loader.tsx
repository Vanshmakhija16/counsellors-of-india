'use client'

import { useEffect, useRef, useState } from 'react'

interface LoaderProps {
  onDone: () => void
  therapistName?: string
}

// Label shifts as the count climbs — a small narrative arc rather than a
// static "Loading..." that just sits there for 2.5 seconds.
const LABELS: [number, string][] = [
  [0, 'Arriving'],
  [30, 'Settling in'],
  [65, 'Almost there'],
  [96, 'Opening the room'],
]

function labelFor(n: number): string {
  let current = LABELS[0][1]
  for (const [threshold, label] of LABELS) {
    if (n >= threshold) current = label
  }
  return current
}

// Ease-in-out so the count doesn't tick at a robotic constant rate — it
// gathers pace through the middle and settles at the end, like a breath.
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

const SESSION_KEY = 'ct7-loader-seen'

export default function Loader({ onDone, therapistName }: LoaderProps) {
  const [count, setCount] = useState(0)
  const [opening, setOpening] = useState(false)
  const [mounted, setMounted] = useState(true)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const alreadySeen =
      typeof window !== 'undefined' && sessionStorage.getItem(SESSION_KEY) === '1'

    // Repeat page views in the same tab (e.g. navigating back from a booking
    // step) skip the ritual — it's a first-impression moment, not a chore.
    if (reduced || alreadySeen) {
      setCount(100)
      setOpening(true)
      const t = setTimeout(() => setMounted(false), reduced ? 0 : 500)
      return () => clearTimeout(t)
    }

    const duration = 2400
    let start: number | null = null

    function tick(ts: number) {
      if (start === null) start = ts
      const elapsed = ts - start
      const progress = Math.min(elapsed / duration, 1)
      setCount(Math.floor(easeInOutCubic(progress) * 100))

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setCount(100)
        sessionStorage.setItem(SESSION_KEY, '1')
        setTimeout(() => setOpening(true), 280)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  useEffect(() => {
    if (!opening) return
    const t = setTimeout(() => setMounted(false), 900)
    return () => clearTimeout(t)
  }, [opening])

  useEffect(() => {
    if (!mounted) onDone()
  }, [mounted, onDone])

  if (!mounted) return null

  return (
    <div className={`ct7-loader ${opening ? 'ct7-loader--opening' : ''}`} aria-hidden={!mounted}>
      <div className="ct7-loader-panel ct7-loader-panel--top" />
      <div className="ct7-loader-panel ct7-loader-panel--bottom" />

      <span className="ct7-loader-brand">Counsellors of India</span>

      <span className="ct7-loader-corner ct7-loader-corner--tl">+</span>
      <span className="ct7-loader-corner ct7-loader-corner--tr">+</span>
      <span className="ct7-loader-corner ct7-loader-corner--bl">+</span>
      <span className="ct7-loader-corner ct7-loader-corner--br">+</span>

      <div className="ct7-loader-center">
        <span className="ct7-loader-label">{labelFor(count)}</span>
        <span className="ct7-loader-count">{String(count).padStart(3, '0')}</span>
        <div className="ct7-loader-rule">
          <span className="ct7-loader-rule-fill" style={{ width: `${count}%` }} />
        </div>
        {therapistName?.trim() && <span className="ct7-loader-name">{therapistName}</span>}
      </div>
    </div>
  )
}
