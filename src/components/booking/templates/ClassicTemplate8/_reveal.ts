'use client'

import { useEffect } from 'react'

// Lightweight scroll reveal for CT8's new sections (Education, Research,
// Experience, Skills, Certifications, Recommendations) — mirrors the
// `.ct8-reveal` / `.ct8-reveal.visible` CSS pair already defined in
// styles.ts. Without this hook, anything marked `.ct8-reveal` stays at
// opacity:0 forever, since nothing else toggles the `visible` class.
export function useCt8Reveal(root: React.RefObject<HTMLElement | null>, deps: unknown[] = []) {
  useEffect(() => {
    const el = root.current
    if (!el) return

    const targets = Array.from(el.querySelectorAll<HTMLElement>('.ct8-reveal'))
    if (targets.length === 0) return

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      targets.forEach(t => t.classList.add('visible'))
      return
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    )

    targets.forEach(t => observer.observe(t))
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
