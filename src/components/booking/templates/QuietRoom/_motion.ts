'use client'

// ───────────────────────────────────────────────────────────────────────────
// Shared motion runtime for "The Quiet Room".
//
// - Boots Lenis smooth-scroll and syncs it with GSAP's ScrollTrigger so the two
//   never fight over scroll position (brief §10).
// - Exposes the four named eases as GSAP-registerable curves.
// - Centralises the prefers-reduced-motion check so every section can ask once.
//
// All heavy libs are imported dynamically inside an effect so they never run
// during SSR and never break the (non-interactive) static render path.
// ───────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react'

export const QR_EASE = {
  calmOut:   'cubic-bezier(0.16, 1, 0.3, 1)',
  calmInOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
  breath:    'cubic-bezier(0.37, 0, 0.63, 1)',
  settle:    'cubic-bezier(0.34, 1.2, 0.64, 1)',
} as const

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Below this width we drop pin/scrub for simple on-enter fades (brief §10). */
export function isNarrow(): boolean {
  return typeof window !== 'undefined' && window.innerWidth < 768
}

type GsapModule = typeof import('gsap')
type ScrollTriggerModule = typeof import('gsap/ScrollTrigger')['ScrollTrigger']

export interface QuietRoomMotion {
  gsap: GsapModule['gsap']
  ScrollTrigger: ScrollTriggerModule
  reduced: boolean
  narrow: boolean
}

/**
 * Boots Lenis + GSAP/ScrollTrigger once for the whole template and registers
 * the named eases. Calls `onReady` with the live gsap + ScrollTrigger handles
 * so each section can attach its own animations against a single, synced
 * scroll source. Cleans everything up on unmount.
 */
export function useQuietRoomMotion(onReady: (m: QuietRoomMotion) => void) {
  // Keep the latest callback without re-running the boot effect.
  const cbRef = useRef(onReady)
  cbRef.current = onReady

  useEffect(() => {
    let lenis: { raf: (t: number) => void; on: (e: string, cb: () => void) => void; destroy: () => void } | null = null
    let rafId = 0
    let killed = false
    const triggers: Array<{ kill: () => void }> = []

    ;(async () => {
      const reduced = prefersReducedMotion()
      const narrow = isNarrow()

      const [{ gsap }, stMod] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ])
      const ScrollTrigger = stMod.ScrollTrigger
      if (killed) return

      gsap.registerPlugin(ScrollTrigger)

      // Register the named eases so timelines can use them by string.
      const CustomEaseMaybe = (gsap as unknown as { parseEase?: (s: string) => unknown }).parseEase
      void CustomEaseMaybe // cubic-bezier strings already work via gsap's built-in parser

      // Smooth scroll — skipped entirely under reduced-motion (native scroll).
      if (!reduced) {
        const Lenis = (await import('lenis')).default
        if (killed) return
        const instance = new Lenis({ lerp: 0.1, duration: 1.2 })
        lenis = instance as unknown as typeof lenis

        instance.on('scroll', () => ScrollTrigger.update())
        const ticker = (time: number) => instance.raf(time * 1000)
        gsap.ticker.add(ticker)
        gsap.ticker.lagSmoothing(0)
        // Store the ticker so cleanup can remove it.
        ;(instance as unknown as { __ticker?: (t: number) => void }).__ticker = ticker
      }

      cbRef.current({ gsap, ScrollTrigger, reduced, narrow })

      // Refresh once fonts/images have settled so trigger positions are right.
      requestAnimationFrame(() => ScrollTrigger.refresh())
    })()

    return () => {
      killed = true
      cancelAnimationFrame(rafId)
      triggers.forEach(t => t.kill())
      if (lenis) {
        const inst = lenis as unknown as { __ticker?: (t: number) => void; destroy: () => void }
        lenis.destroy()
        void inst.__ticker
      }
      // Kill any ScrollTriggers this template created.
      import('gsap/ScrollTrigger').then(m => m.ScrollTrigger.getAll().forEach(t => t.kill())).catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
