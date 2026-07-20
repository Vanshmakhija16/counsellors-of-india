'use client'

import { useEffect, type RefObject } from 'react'

// ── Premium scroll-scrubbed hero image (The Atrium — classic7) ───────────
//
// The hero portrait starts at full size on load. As the visitor scrolls
// through the hero's own height, the image smoothly scales down (100% →
// ~78%), lifts slightly upward, gains a touch more corner radius, and its
// shadow deepens — reading as the image settling back into the page,
// Apple/Linear/Stripe-style. Everything is driven directly off scroll
// position (scrubbed, not time-based animation) via a single rAF-throttled
// listener, using only `transform` (translate3d + scale) for the part that
// needs to be silky, so the browser can composite it on the GPU.
//
// Honors prefers-reduced-motion (bails to a static frame) and re-measures
// on resize so it stays correct across desktop/tablet/mobile.

const MIN_SCALE = 0.8          // image ends around 80% size
const MAX_TRANSLATE_Y = -26    // px, subtle upward drift
const MIN_RADIUS = 20          // px, matches the frame's resting border-radius
const MAX_RADIUS = 34          // px, softens further as it "settles"
const SHADOW_MIN_OPACITY = 0.28
const SHADOW_MAX_OPACITY = 0.5

function easeOutQuad(t: number) {
  return 1 - (1 - t) * (1 - t)
}

export function useCt7HeroScale(
  frameRef: RefObject<HTMLElement | null>,
  heroRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const frame = frameRef.current
    const hero = heroRef.current
    if (!frame || !hero) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    frame.style.willChange = 'transform, border-radius, box-shadow'
    frame.style.transformOrigin = 'center center'
    frame.style.backfaceVisibility = 'hidden'

    let heroHeight = hero.offsetHeight
    let ticking = false

    function paint() {
      ticking = false
      const rect = hero!.getBoundingClientRect()
      // 0 while hero top is at/above the viewport top on load,
      // climbs to 1 once the visitor has scrolled one hero-height.
      const scrolledPast = Math.min(Math.max(-rect.top, 0), heroHeight)
      const progress = heroHeight > 0 ? scrolledPast / heroHeight : 0
      const eased = easeOutQuad(progress)

      const scale = 1 - eased * (1 - MIN_SCALE)
      const translateY = eased * MAX_TRANSLATE_Y
      const radius = MIN_RADIUS + eased * (MAX_RADIUS - MIN_RADIUS)
      const shadowOpacity = SHADOW_MIN_OPACITY + eased * (SHADOW_MAX_OPACITY - SHADOW_MIN_OPACITY)
      const shadowBlur = 60 + eased * 60
      const shadowY = 30 + eased * 40

      frame.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale})`
      frame.style.borderRadius = `${radius}px`
      frame.style.boxShadow = `0 ${shadowY}px ${shadowBlur}px rgba(10,16,13,${shadowOpacity})`
    }

    function onScroll() {
      if (ticking) return
      ticking = true
      requestAnimationFrame(paint)
    }

    function onResize() {
      heroHeight = hero!.offsetHeight
      onScroll()
    }

    paint()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      frame.style.willChange = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
