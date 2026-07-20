'use client'

// ───────────────────────────────────────────────────────────────────────────
// Template 1 loader — "The Quiet Arrival". Borrows QuietRoom's core idea
// (a warm, name-led arrival instead of a raw ticking count) but reworked in
// Template 1's own bark/terracotta/serif language and kept mechanically
// different:
//   - An eyebrow label shifts through real load stages ("Preparing" →
//     "Almost ready" → "One more moment" → "Ready"), driven by the SAME
//     readiness signal as before (hero image decode → `ready`), not a fixed
//     clock like QuietRoom's arrival.
//   - The therapist's name arrives as the headline in place of a digit
//     count — but the terracotta rule beneath it still fills with real
//     progress (0→100%), so there's still a visible, honest loading signal,
//     just no numbers.
//   - Exit is the same doorway mechanic as before: two bark panels slide
//     apart to reveal the hero already sitting behind them.
// Kept from the previous version: MIN/MAX floor+ceiling so it's neither too
// fast to read nor able to hang forever, per-therapist session skip,
// tap/click-to-skip, reduced-motion + Safari-private-mode guards.
// ───────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react'

interface LoaderProps {
  onDone: () => void
  therapistName?: string
  /** Stable id/slug used to scope the "already seen" flag per therapist. */
  therapistId?: string
  /** Flips true once real content (e.g. hero image) is actually ready. */
  ready?: boolean
}

const MIN_MS = 900        // floor — the name needs to actually be readable
const MAX_MS = 2200       // ceiling — finishes even if `ready` never comes
const FINISH_MS = 250     // quick final stretch once ready
const HOLD_MS = 600       // pause once the name is fully visible, before opening

// Eyebrow copy shifts as real progress climbs — distinct wording from the
// other templates' loaders so this doesn't read as a reskin of either.
const LABELS: [number, string][] = [
  [0, 'Preparing'],
  [30, 'Almost ready'],
  [65, 'One more moment'],
  [96, 'Ready'],
]

function labelFor(n: number): string {
  let current = LABELS[0][1]
  for (const [threshold, label] of LABELS) {
    if (n >= threshold) current = label
  }
  return current
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function safeSessionGet(key: string): string | null {
  try {
    return sessionStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSessionSet(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value)
  } catch {
    // Storage disabled/blocked (e.g. Safari private mode) — just skip the
    // "seen it already" optimization for this visit rather than throwing.
  }
}

export default function Loader({ onDone, therapistName, therapistId, ready = true }: LoaderProps) {
  const [opening, setOpening] = useState(false)
  const [mounted, setMounted] = useState(true)
  const labelRef = useRef<HTMLSpanElement | null>(null)
  const ruleRef = useRef<HTMLSpanElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const readyRef = useRef(ready)
  const skipRef = useRef(false)
  const sessionKey = `ct1-loader-seen-${therapistId ?? 'default'}`

  useEffect(() => { readyRef.current = ready }, [ready])

  useEffect(() => {
    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const alreadySeen = safeSessionGet(sessionKey) === '1'

    // Repeat views in the same tab for THIS therapist skip the ritual —
    // it's a first-impression moment, not a chore on every navigation.
    if (reducedMotion || alreadySeen) {
      setOpening(true)
      exitTimeoutRef.current = setTimeout(() => setMounted(false), reducedMotion ? 0 : 550)
      return () => {
        if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current)
      }
    }

    let start: number | null = null
    let finishStart: number | null = null
    let phase: 'loading' | 'finishing' = 'loading'

    function paint(progress: number) {
      if (labelRef.current) {
        labelRef.current.textContent = labelFor(progress)
      }
      if (ruleRef.current) {
        ruleRef.current.style.width = `${progress}%`
      }
    }

    function tick(ts: number) {
      if (start === null) start = ts
      const elapsed = ts - start

      if (phase === 'loading') {
        // Ease toward 90% while we wait for real content — never claims
        // 100% until we actually know it's ready. Capped by MAX_MS so a
        // readiness signal that never arrives can't hang the page forever.
        const t = Math.min(elapsed / MAX_MS, 1)
        const progress = easeOutCubic(t) * 90
        paint(progress)

        const canFinish = elapsed >= MIN_MS && (readyRef.current || skipRef.current)
        const mustFinish = elapsed >= MAX_MS
        if (canFinish || mustFinish) {
          phase = 'finishing'
          finishStart = ts
        }
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      // phase === 'finishing' — quick final stretch from ~90% to 100%
      const fElapsed = ts - (finishStart ?? ts)
      const ft = skipRef.current ? 1 : Math.min(fElapsed / FINISH_MS, 1)
      const progress = 90 + ft * 10
      paint(progress)

      if (ft >= 1) {
        safeSessionSet(sessionKey, '1')
        holdTimeoutRef.current = setTimeout(() => setOpening(true), skipRef.current ? 0 : HOLD_MS)
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionKey])

  useEffect(() => {
    if (!opening) return
    exitTimeoutRef.current = setTimeout(() => setMounted(false), 950)
    return () => {
      if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current)
    }
  }, [opening])

  useEffect(() => {
    if (!mounted) onDone()
  }, [mounted, onDone])

  function handleSkip() {
    if (skipRef.current) return
    skipRef.current = true
  }

  if (!mounted) return null

  return (
    <div
      className={`ct-loader ${opening ? 'ct-loader--opening' : ''}`}
      onClick={handleSkip}
      role="button"
      tabIndex={0}
      aria-label="Skip loading"
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSkip() }}
    >
      {/* Single static announcement for assistive tech — not the shifting label. */}
      <span role="status" aria-live="polite" className="sr-only">Loading profile</span>

      <div className="ct-loader-panel ct-loader-panel--top" />
      <div className="ct-loader-panel ct-loader-panel--bottom" />

      <div className="ct-loader-inner" aria-hidden="true">
        <span className="ct-loader-tag" ref={labelRef}>Preparing</span>
        <p className="ct-loader-line">A quiet space, just for you</p>
        {therapistName?.trim() && <span className="ct-loader-headline">{therapistName}</span>}
        <div className="ct-loader-rule">
          <span className="ct-loader-rule-fill" ref={ruleRef} style={{ width: '0%' }} />
        </div>
      </div>
    </div>
  )
}
