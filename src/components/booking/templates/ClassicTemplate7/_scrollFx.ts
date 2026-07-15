'use client'

import { useEffect, useRef } from 'react'

// ── Premium scroll & motion effects for The Atrium (classic7) ────────────
//
// Everything here is pure vanilla JS / CSS — no motion library dependency.
// Three effects:
//   1. Scroll progress bar (thin brass hairline pinned to top of viewport)
//   2. Magnetic CTA hover (elements with data-magnetic shift toward cursor)
//   3. Custom cursor (small brass dot + ring, spring-lagged, only on desktop)
//
// All effects check prefers-reduced-motion and bail immediately if set.
// The cursor effect also bails on touch devices (pointer: coarse).

export function useCt7ScrollFx() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    // ── 1. Scroll progress bar ─────────────────────────────────────────
    const bar = document.createElement('div')
    bar.id = 'ct7-progress'
    Object.assign(bar.style, {
      position: 'fixed', top: '0', left: '0', height: '2px', width: '0%',
      background: 'linear-gradient(90deg, #C6A76B, #D9BC85)',
      zIndex: '99999', pointerEvents: 'none',
      transition: 'width 80ms linear',
      boxShadow: '0 0 8px 1px rgba(198,167,107,0.5)',
    })
    document.body.appendChild(bar)

    function updateBar() {
      const h = document.documentElement
      const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100
      bar.style.width = `${Math.min(pct, 100)}%`
    }
    window.addEventListener('scroll', updateBar, { passive: true })

    // ── 2. Magnetic CTAs ───────────────────────────────────────────────
    const magnetics = document.querySelectorAll<HTMLElement>('[data-magnetic]')
    const magneticCleanups: (() => void)[] = []

    magnetics.forEach(el => {
      function onMove(e: MouseEvent) {
        const r = el.getBoundingClientRect()
        const cx = r.left + r.width  / 2
        const cy = r.top  + r.height / 2
        const dx = (e.clientX - cx) * 0.22
        const dy = (e.clientY - cy) * 0.22
        el.style.transform = `translate(${dx}px, ${dy}px)`
      }
      function onLeave() {
        el.style.transform = ''
      }
      el.addEventListener('mousemove', onMove)
      el.addEventListener('mouseleave', onLeave)
      magneticCleanups.push(() => {
        el.removeEventListener('mousemove', onMove)
        el.removeEventListener('mouseleave', onLeave)
        el.style.transform = ''
      })
    })

    // ── 3. Custom cursor ───────────────────────────────────────────────
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    let cursorDot: HTMLDivElement | null = null
    let cursorRing: HTMLDivElement | null = null
    let rafCursor = 0
    let mx = -100, my = -100  // start off-screen
    let rx = -100, ry = -100  // ring lags behind dot

    if (!isTouch) {
      document.body.style.cursor = 'none'

      cursorDot = document.createElement('div')
      cursorDot.id = 'ct7-cursor-dot'
      Object.assign(cursorDot.style, {
        position: 'fixed', pointerEvents: 'none', zIndex: '999999',
        width: '6px', height: '6px', borderRadius: '50%',
        background: '#C6A76B',
        transform: 'translate(-50%, -50%)',
        transition: 'opacity 300ms, width 250ms, height 250ms',
        top: '0', left: '0',
        boxShadow: '0 0 8px 2px rgba(198,167,107,0.4)',
      })
      document.body.appendChild(cursorDot)

      cursorRing = document.createElement('div')
      cursorRing.id = 'ct7-cursor-ring'
      Object.assign(cursorRing.style, {
        position: 'fixed', pointerEvents: 'none', zIndex: '999998',
        width: '36px', height: '36px', borderRadius: '50%',
        border: '1.5px solid rgba(198,167,107,0.55)',
        transform: 'translate(-50%, -50%)',
        top: '0', left: '0',
        transition: 'opacity 300ms, width 300ms, height 300ms, border-color 300ms',
      })
      document.body.appendChild(cursorRing)

      function animateCursor() {
        // dot snaps immediately
        cursorDot!.style.left = `${mx}px`
        cursorDot!.style.top  = `${my}px`
        // ring spring-lags
        rx += (mx - rx) * 0.12
        ry += (my - ry) * 0.12
        cursorRing!.style.left = `${rx}px`
        cursorRing!.style.top  = `${ry}px`
        rafCursor = requestAnimationFrame(animateCursor)
      }
      rafCursor = requestAnimationFrame(animateCursor)

      function onMouseMove(e: MouseEvent) {
        mx = e.clientX; my = e.clientY
      }
      document.addEventListener('mousemove', onMouseMove)

      // Expand ring on hoverable elements
      const hoverables = 'a, button, [data-magnetic], input, textarea, select, label'
      function onMouseEnterHoverable() {
        cursorRing!.style.width  = '52px'
        cursorRing!.style.height = '52px'
        cursorRing!.style.borderColor = 'rgba(198,167,107,0.85)'
        cursorDot!.style.width  = '4px'
        cursorDot!.style.height = '4px'
      }
      function onMouseLeaveHoverable() {
        cursorRing!.style.width  = '36px'
        cursorRing!.style.height = '36px'
        cursorRing!.style.borderColor = 'rgba(198,167,107,0.55)'
        cursorDot!.style.width  = '6px'
        cursorDot!.style.height = '6px'
      }

      // Delegate rather than attaching to every element
      document.addEventListener('mouseover', e => {
        if ((e.target as Element)?.closest(hoverables)) onMouseEnterHoverable()
        else onMouseLeaveHoverable()
      })
    }

    // ── Cleanup ────────────────────────────────────────────────────────
    return () => {
      window.removeEventListener('scroll', updateBar)
      bar.remove()
      magneticCleanups.forEach(fn => fn())
      if (!isTouch) {
        document.body.style.cursor = ''
        cancelAnimationFrame(rafCursor)
        cursorDot?.remove()
        cursorRing?.remove()
      }
    }
  }, [])
}
