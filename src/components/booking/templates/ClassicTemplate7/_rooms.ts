'use client'

import { useEffect } from 'react'

// ── "Rooms" — the spatial journey system for The Atrium ──────────────────
//
// The loader already opens like double doors onto the hero. This hook
// extends that ritual through the rest of the site: as the visitor scrolls
// into each major section, two ink panels sweep in from top and bottom to
// meet at centre — briefly showing the room's number and name — then part
// again to reveal what's next. Scrolling reads as moving from room to room
// through the practice, not paging through a website.
//
// Deliberately NOT scroll-jacking: nothing pins, nothing hijacks scroll
// physics or wheel events. It's a threshold-triggered overlay layered on
// top of completely native scroll, so it stays safe with the booking form,
// keyboards, screen readers, and mobile scroll momentum.
//
// A secondary vertical "room rail" on the right edge doubles as a quiet
// you-are-here index — click any dot to jump straight to that room.

interface RoomDef { id: string; index: string; label: string; dark?: boolean }

const ROOMS: RoomDef[] = [
  { id: 'about',        index: '01', label: 'The Practitioner' },
  { id: 'expertise',    index: '02', label: 'The Focus' },
  { id: 'process',      index: '03', label: 'The Process' },
  { id: 'testimonials', index: '04', label: 'The Register', dark: true },
  { id: 'booking',      index: '05', label: 'The Booking',  dark: true },
]

function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const y = el.getBoundingClientRect().top + window.scrollY - 12
  window.scrollTo({ top: y, behavior: 'smooth' })
}

export function useCt7Rooms() {
  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    const sections = ROOMS
      .map(r => ({ ...r, el: document.getElementById(r.id) }))
      .filter((r): r is RoomDef & { el: HTMLElement } => !!r.el)
    if (sections.length === 0) return

    // ── Room rail (built regardless of reduced-motion — it's just a nav) ──
    const rail = document.createElement('div')
    rail.className = 'ct7-rail'
    rail.setAttribute('aria-label', 'Section navigation')
    sections.forEach(r => {
      const dot = document.createElement('button')
      dot.className = 'ct7-rail-dot'
      dot.dataset.room = r.id
      dot.setAttribute('aria-label', r.label)
      dot.innerHTML = `<span class="ct7-rail-dot-num">${r.index} \u2014 ${r.label}</span>`
      dot.addEventListener('click', () => scrollToId(r.id))
      rail.appendChild(dot)
    })
    document.body.appendChild(rail)
    const railDots = Array.from(rail.querySelectorAll<HTMLButtonElement>('.ct7-rail-dot'))

    // ── Door overlay (skipped entirely under reduced-motion) ──────────────
    let doors: HTMLDivElement | null = null
    let numEl: HTMLElement | null = null
    let nameEl: HTMLElement | null = null
    if (!reduced) {
      doors = document.createElement('div')
      doors.className = 'ct7-doors'
      doors.dataset.state = 'idle'
      doors.innerHTML = `
        <div class="ct7-doors-panel ct7-doors-panel--top"></div>
        <div class="ct7-doors-panel ct7-doors-panel--bottom"></div>
        <div class="ct7-doors-label">
          <span class="ct7-doors-num"></span>
          <span class="ct7-doors-name"></span>
        </div>
      `
      document.body.appendChild(doors)
      numEl = doors.querySelector('.ct7-doors-num')
      nameEl = doors.querySelector('.ct7-doors-name')
    }

    let lastY = window.scrollY
    let animating = false
    const timers: number[] = []
    function after(ms: number, fn: () => void) { timers.push(window.setTimeout(fn, ms)) }

    const observer = new IntersectionObserver(
      entries => {
        const goingDown = window.scrollY > lastY
        lastY = window.scrollY

        entries.forEach(entry => {
          if (!entry.isIntersecting) return
          const room = sections.find(r => r.el === entry.target)
          if (!room) return

          // Rail active-state tracks both scroll directions.
          railDots.forEach(d => d.classList.toggle('ct7-rail-dot--active', d.dataset.room === room.id))
          rail.classList.toggle('ct7-rail--dark', !!room.dark)

          // Door wipe only fires going forward, and only one at a time.
          if (!doors || !goingDown || animating) return
          animating = true
          if (numEl) numEl.textContent = room.index
          if (nameEl) nameEl.textContent = room.label
          doors.dataset.state = 'closing'

          after(480, () => {
            doors!.dataset.state = 'hold'
            after(200, () => {
              doors!.dataset.state = 'opening'
              after(560, () => {
                doors!.dataset.state = 'idle'
                animating = false
              })
            })
          })
        })
      },
      { threshold: 0, rootMargin: '-46% 0px -46% 0px' },
    )

    sections.forEach(r => observer.observe(r.el))

    return () => {
      observer.disconnect()
      timers.forEach(t => window.clearTimeout(t))
      rail.remove()
      doors?.remove()
    }
  }, [])
}
