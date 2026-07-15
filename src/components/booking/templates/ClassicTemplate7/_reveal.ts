'use client'

import { useEffect } from 'react'

// ── Premium scroll reveal for The Atrium (classic7) ──────────────────────
//
// Two reveal variants driven by CSS classes:
//
//   .ct7-reveal        — upward fade-rise (used for blocks/cards)
//   .ct7-reveal-clip   — horizontal clip-path wipe left→right (used for
//                        ledger rows, section titles) — feels more editorial
//                        and distinctive than yet another fade-up
//
// Both use IntersectionObserver. Neither uses a motion library.
// Both check prefers-reduced-motion and instantly set visible if set.

export function useCt7Reveal(root: React.RefObject<HTMLElement | null>, deps: unknown[] = []) {
  useEffect(() => {
    const el = root.current
    if (!el) return

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    const fadeTargets = Array.from(el.querySelectorAll<HTMLElement>('.ct7-reveal'))
    const clipTargets = Array.from(el.querySelectorAll<HTMLElement>('.ct7-reveal-clip'))
    const allTargets  = [...fadeTargets, ...clipTargets]

    if (allTargets.length === 0) return

    if (reduced) {
      allTargets.forEach(t => {
        t.classList.add('ct7-reveal--in')
        t.style.clipPath = ''
      })
      return
    }

    // Stagger delay: up to 6 siblings, 70ms apart; resets at each new
    // IntersectionObserver entry batch (so sections don't bleed into each other)
    fadeTargets.forEach((t, i) => {
      t.style.setProperty('--ct7-d', `${Math.min(i, 6) * 70}ms`)
    })
    clipTargets.forEach((t, i) => {
      t.style.setProperty('--ct7-d', `${Math.min(i, 5) * 90}ms`)
    })

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('ct7-reveal--in')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    )

    allTargets.forEach(t => observer.observe(t))
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
