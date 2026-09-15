'use client'

import { useEffect, useRef, useState } from 'react'
import { resolveTenantId, type TenantId } from '@/lib/tenants'

// Total time until the mark is fully drawn (last wordmark word lands at
// delay 1290 + duration 150). Kept as a constant so CoiPageGate below can
// wait for exactly this long before it's allowed to reveal real content.
const REVEAL_DURATION_MS = 1440

// Per-tenant loader identity: the three big letters, the small tagline
// under them, the three stacked wordmark words on the right, and the two
// accent colors (first two words + saffron/green waves use `primary`,
// last word uses `secondary`). India keeps its original saffron/green
// "INDIAN COUNSEL NETWORK" mark; only 'us' is overridden with a red/blue
// "AMERICAN COUNSEL NETWORK" mark. Every other tenant falls back to India's
// until it gets its own.
const LOADER_BY_TENANT: Record<TenantId, {
  letters: [string, string, string]
  tagline: string
  words: [string, string, string]
  primary: string
  secondary: string
}> = {
  in: { letters: ['C', 'O', 'I'], tagline: 'COUNSELLORS OF INDIA',   words: ['INDIAN',   'COUNSEL', 'NETWORK'], primary: '#F5941F', secondary: '#1E7A44' },
  us: { letters: ['C', 'O', 'A'], tagline: 'COUNSELLORS OF AMERICA', words: ['AMERICAN', 'COUNSEL', 'NETWORK'], primary: '#3C3B6E', secondary: '#B22234' },
  ca: { letters: ['C', 'O', 'I'], tagline: 'COUNSELLORS OF INDIA',   words: ['INDIAN',   'COUNSEL', 'NETWORK'], primary: '#F5941F', secondary: '#1E7A44' },
  uk: { letters: ['C', 'O', 'I'], tagline: 'COUNSELLORS OF INDIA',   words: ['INDIAN',   'COUNSEL', 'NETWORK'], primary: '#F5941F', secondary: '#1E7A44' },
  au: { letters: ['C', 'O', 'I'], tagline: 'COUNSELLORS OF INDIA',   words: ['INDIAN',   'COUNSEL', 'NETWORK'], primary: '#F5941F', secondary: '#1E7A44' },
}

function useLoaderIdentity() {
  const [tenantId] = useState<TenantId>(() => {
    if (typeof window === 'undefined') return 'in'
    return resolveTenantId(window.location.hostname)
  })
  return LOADER_BY_TENANT[tenantId]
}

/**
 * Brand loader — the animated "COI" mark (letters draw in, saffron/green
 * waves sweep behind them, then the "INDIAN COUNSEL NETWORK" wordmark
 * fades in).
 *
 * Timing note: the original standalone demo took ~3.5s to fully reveal
 * and then wiped itself and looped every 4.7s — great for a splash reel,
 * bad as an actual loading indicator, because real navigations/auth
 * checks usually resolve faster than that and the component gets
 * unmounted mid-draw (letters half-stroked, wordmark never appears).
 * Here the whole reveal is compressed to ~1.1s, it never resets/erases
 * itself, and once complete it holds with a subtle breathing pulse on
 * the two wave strokes so it still reads as "working" for longer waits.
 */
export function CoiLoaderMark({
  className = '',
  onComplete,
}: {
  className?: string
  /** Fires once, ~1.44s after mount, when the full mark has finished drawing. */
  onComplete?: () => void
}) {
  const cRef            = useRef<SVGTextElement>(null)
  const oRef             = useRef<SVGTextElement>(null)
  const iRef             = useRef<SVGTextElement>(null)
  const waveSaffronRef   = useRef<SVGPathElement>(null)
  const waveGreenRef     = useRef<SVGPathElement>(null)
  const taglineRef       = useRef<HTMLDivElement>(null)
  const barSaffronRef    = useRef<HTMLDivElement>(null)
  const barGreenRef      = useRef<HTMLDivElement>(null)
  const wIndianRef       = useRef<HTMLSpanElement>(null)
  const wCounselRef      = useRef<HTMLSpanElement>(null)
  const wNetworkRef      = useRef<HTMLSpanElement>(null)
  const identity          = useLoaderIdentity()

  useEffect(() => {
    let cancelled = false

    function anim(
      el: Element,
      keyframes: Keyframe[],
      opts: KeyframeAnimationOptions,
    ) {
      return el.animate(keyframes, {
        fill: 'forwards',
        easing: 'cubic-bezier(.65,0,.35,1)',
        ...opts,
      })
    }

    if (cRef.current) cRef.current.style.fill = 'transparent'
    if (oRef.current) oRef.current.style.fill = 'transparent'
    if (iRef.current) iRef.current.style.fill = 'transparent'

    // 1. draw + fill C, O, I in black, staggered (compressed: ~0-590ms)
    ;([[cRef, 0], [oRef, 120], [iRef, 240]] as const).forEach(([ref, delay]) => {
      const el = ref.current
      if (!el) return
      anim(el, [{ strokeDashoffset: 620 }, { strokeDashoffset: 0 }], { duration: 350, delay })
      el.animate(
        [{ fill: 'transparent' }, { fill: 'var(--coi-ink)' }],
        { duration: 120, delay: delay + 350, fill: 'forwards' },
      )
    })

    // 2. saffron wave sweeps in behind the letters (~650-1000ms)
    if (waveSaffronRef.current) {
      anim(waveSaffronRef.current, [{ strokeDashoffset: 460 }, { strokeDashoffset: 0 }], { duration: 350, delay: 650 })
      anim(waveSaffronRef.current, [{ opacity: 0 }, { opacity: 0.55 }], { duration: 350, delay: 650 })
    }

    // 3. green wave sweeps in just after (~800-1150ms)
    if (waveGreenRef.current) {
      anim(waveGreenRef.current, [{ strokeDashoffset: 460 }, { strokeDashoffset: 0 }], { duration: 350, delay: 800 })
      anim(waveGreenRef.current, [{ opacity: 0 }, { opacity: 0.55 }], { duration: 350, delay: 800 })
    }

    // 4. tagline fades in (~1000-1200ms)
    if (taglineRef.current) {
      anim(taglineRef.current, [{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: 1000 })
    }

    // 5. the two staggered vertical bars draw in (~1000-1250ms)
    if (barSaffronRef.current) {
      anim(barSaffronRef.current, [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: 150, delay: 1000 })
    }
    if (barGreenRef.current) {
      anim(barGreenRef.current, [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: 150, delay: 1100 })
    }

    // 6. INDIAN / COUNSEL / NETWORK fade + slide in (~1150-1440ms, done)
    ;([[wIndianRef, 1150], [wCounselRef, 1220], [wNetworkRef, 1290]] as const).forEach(([ref, delay]) => {
      const el = ref.current
      if (!el) return
      anim(el, [
        { opacity: 0, transform: 'translateX(-6px)' },
        { opacity: 1, transform: 'translateX(0)' },
      ], { duration: 150, delay })
    })

    // 7. once fully drawn, hold — just a gentle breathing pulse on the
    // waves so a long wait doesn't look frozen. Never erases the mark.
    const pulseTimeout = setTimeout(() => {
      if (cancelled) return
      ;[waveSaffronRef.current, waveGreenRef.current].forEach(el => {
        if (!el) return
        el.animate(
          [{ opacity: 0.55 }, { opacity: 0.8 }, { opacity: 0.55 }],
          { duration: 1800, iterations: Infinity, easing: 'ease-in-out' },
        )
      })
    }, 1450)

    const completeTimeout = setTimeout(() => {
      if (!cancelled) onComplete?.()
    }, REVEAL_DURATION_MS)

    return () => {
      cancelled = true
      clearTimeout(pulseTimeout)
      clearTimeout(completeTimeout)
      const els = [
        cRef.current, oRef.current, iRef.current,
        waveSaffronRef.current, waveGreenRef.current, taglineRef.current,
        barSaffronRef.current, barGreenRef.current,
        wIndianRef.current, wCounselRef.current, wNetworkRef.current,
      ]
      els.forEach(el => el?.getAnimations().forEach(a => a.cancel()))
    }
  }, [])

  return (
    <div className={`coi-loader-stage ${className}`}>
      <style>{`
        .coi-loader-stage {
          --coi-ink: #111111;
          --coi-saffron: ${identity.primary};
          --coi-green: ${identity.secondary};
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 18px;
          max-width: 92vw;
        }
        .coi-loader-left { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; }
        .coi-loader-stage svg {
          width: clamp(150px, 40vw, 220px);
          height: auto;
          overflow: visible;
          display: block;
        }
        .coi-loader-letter {
          font-family: Georgia, 'Times New Roman', serif;
          font-weight: 700;
          font-size: 140px;
          fill: transparent;
          stroke: var(--coi-ink);
          stroke-width: 1.5;
          stroke-linejoin: round;
          stroke-dasharray: 620;
          stroke-dashoffset: 620;
        }
        .coi-loader-wave { fill: none; stroke-linecap: round; stroke-dasharray: 460; stroke-dashoffset: 460; opacity: 0; }
        .coi-loader-wave.saffron { stroke: var(--coi-saffron); stroke-width: 13; }
        .coi-loader-wave.green   { stroke: var(--coi-green);   stroke-width: 13; }
        .coi-loader-tagline {
          font-family: Georgia, serif;
          font-weight: 700;
          font-size: 12px;
          letter-spacing: 0.12em;
          color: var(--coi-green);
          opacity: 0;
          margin-top: 2px;
          white-space: nowrap;
        }
        .coi-loader-right { display: flex; align-items: center; gap: 12px; height: 68px; position: relative; flex-shrink: 0; }
        .coi-loader-bar { width: 3px; border-radius: 2px; transform: scaleY(0); }
        .coi-loader-bar.saffron { height: 46px; background: var(--coi-saffron); align-self: flex-start; transform-origin: top center; }
        .coi-loader-bar.green   { height: 46px; background: var(--coi-green); align-self: flex-end; margin-left: -6px; transform-origin: bottom center; }
        .coi-loader-words { display: flex; flex-direction: column; gap: 2px; font-family: Georgia, serif; font-weight: 700; font-size: 15px; letter-spacing: 0.02em; }
        .coi-loader-words span { opacity: 0; transform: translateX(-6px); display: block; }
        .coi-loader-w-indian, .coi-loader-w-counsel { color: var(--coi-saffron); }
        .coi-loader-w-network { color: var(--coi-green); }
      `}</style>

      <div className="coi-loader-left">
        <svg viewBox="0 0 300 190">
          <path ref={waveSaffronRef} className="coi-loader-wave saffron"
            d="M0,120 C 50,100 90,140 150,118 S 250,96 300,118" />
          <path ref={waveGreenRef} className="coi-loader-wave green"
            d="M0,140 C 50,122 90,158 150,138 S 250,118 300,138" />
          <text ref={cRef} x="0" y="130" className="coi-loader-letter">{identity.letters[0]}</text>
          <text ref={oRef} x="95" y="130" className="coi-loader-letter">{identity.letters[1]}</text>
          <text ref={iRef} x="215" y="130" className="coi-loader-letter">{identity.letters[2]}</text>
        </svg>
        <div ref={taglineRef} className="coi-loader-tagline">{identity.tagline}</div>
      </div>

      <div className="coi-loader-right">
        <div ref={barSaffronRef} className="coi-loader-bar saffron" />
        <div ref={barGreenRef} className="coi-loader-bar green" />
        <div className="coi-loader-words">
          <span ref={wIndianRef} className="coi-loader-w-indian">{identity.words[0]}</span>
          <span ref={wCounselRef} className="coi-loader-w-counsel">{identity.words[1]}</span>
          <span ref={wNetworkRef} className="coi-loader-w-network">{identity.words[2]}</span>
        </div>
      </div>
    </div>
  )
}

/** Full-screen white backdrop wrapper — drop-in replacement for any
 * "min-h-screen flex items-center justify-center" spinner screen. */
export default function CoiLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <CoiLoaderMark />
    </div>
  )
}

/**
 * Gate that always plays the FULL loader animation before showing real
 * content, no matter how fast the underlying data/auth check resolves.
 *
 * - `ready=false`: shows the loader. Animation plays from the start.
 * - `ready=true`: content is revealed only once the animation has also
 *   finished (`onComplete` fired) — if the animation is still mid-draw,
 *   it keeps playing to completion before switching to `children`.
 * - If the animation finishes before `ready` flips true, the loader just
 *   holds in its completed, breathing-pulse state until it does.
 *
 * Mount this once and keep it mounted across the ready-state transition
 * (don't put it behind its own conditional return) so the animation timer
 * isn't restarted partway through.
 */
export function CoiPageGate({
  ready,
  children,
}: {
  ready: boolean
  children: React.ReactNode
}) {
  const [animationDone, setAnimationDone] = useState(false)

  if (!ready || !animationDone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <CoiLoaderMark onComplete={() => setAnimationDone(true)} />
      </div>
    )
  }

  return <>{children}</>
}
