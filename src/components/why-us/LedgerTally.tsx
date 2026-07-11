'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Counts up to `target` once scrolled into view, styled inline as part of
 * a heading. Respects prefers-reduced-motion by jumping straight to the
 * final value instead of animating.
 */
export default function LedgerTally({ target }: { target: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [n, setN] = useState(target)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setN(0)
    if (reduce) {
      setN(target)
      return
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        const start = performance.now()
        const duration = 900
        function tick(now: number) {
          const p = Math.min(1, (now - start) / duration)
          setN(Math.round(p * target))
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.4 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [target])

  return (
    <span ref={ref} className="tabular-nums text-[#FF9933]">
      {n}
    </span>
  )
}
