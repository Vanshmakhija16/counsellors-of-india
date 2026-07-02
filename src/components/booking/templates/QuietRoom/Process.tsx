'use client'

import { useEffect, useRef, useState } from 'react'
import { useQuietRoomMotion } from './_motion'

const STEPS = [
  { n: '01', t: 'Reach out',          d: "A short message or a form. No detail needed — just the decision to start." },
  { n: '02', t: 'First conversation', d: 'A 20-minute call to feel out fit. Honest, no obligation, no script.' },
  { n: '03', t: 'A plan, together',   d: 'We agree on rhythm and focus. The plan is yours; I just help shape it.' },
  { n: '04', t: 'Ongoing sessions',   d: '50 minutes, weekly or as suits — steady, confidential, unhurried.' },
  { n: '05', t: 'Reflection',         d: 'We revisit where things are every few months. You set the pace throughout.' },
]

// A winding vertical path; nodes sit alternately left/right of it.
const PATH = 'M120 30 C120 70 220 80 220 130 C220 185 70 195 70 250 C70 305 220 315 220 370 C220 425 120 435 120 480'
const NODES = [
  { x: 120, y: 30,  side: 'right' },
  { x: 220, y: 130, side: 'left'  },
  { x: 70,  y: 250, side: 'right' },
  { x: 220, y: 370, side: 'left'  },
  { x: 120, y: 480, side: 'right' },
]

export default function Process() {
  const rootRef = useRef<HTMLElement | null>(null)
  const pathRef = useRef<SVGPathElement | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const [nodePositions, setNodePositions] = useState(NODES)
  const [pathD, setPathD] = useState(PATH)
  const [svgHeight, setSvgHeight] = useState(510)

  // Recompute node Y-positions from the actual rendered step block centers,
  // so dots always line up with their step regardless of text length/wrap.
  useEffect(() => {
    function recompute() {
      const wrap = wrapRef.current
      if (!wrap) return
      const steps = Array.from(wrap.querySelectorAll<HTMLElement>('.qr-pr-step'))
      if (steps.length === 0) return
      const wrapTop = wrap.getBoundingClientRect().top
      const positions = steps.map((step, i) => {
        const r = step.getBoundingClientRect()
        const centerY = r.top - wrapTop + r.height / 2
        return { x: NODES[i].x, y: centerY, side: NODES[i].side }
      })
      setNodePositions(positions)
      const last = steps[steps.length - 1]
      const lastBottom = last.getBoundingClientRect().bottom - wrapTop
      setSvgHeight(Math.max(lastBottom + 20, 510))

      // Rebuild a smooth path through the recomputed points.
      const pts = positions
      let d = `M${pts[0].x} ${pts[0].y}`
      for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1]
        const cur = pts[i]
        const midY = (prev.y + cur.y) / 2
        d += ` C${prev.x} ${midY} ${cur.x} ${midY} ${cur.x} ${cur.y}`
      }
      setPathD(d)
    }

    recompute()
    const id = window.setTimeout(() => {
      recompute()
      // The path geometry just changed — re-measure its length so the
      // scroll-driven draw-in animation uses accurate dash values, and
      // nudge ScrollTrigger to recalc trigger positions against the new
      // (possibly taller) section height.
      requestAnimationFrame(async () => {
        const path = pathRef.current
        if (path) {
          const len = path.getTotalLength()
          const { gsap } = await import('gsap')
          gsap.set(path, { strokeDasharray: len })
        }
        const { ScrollTrigger } = await import('gsap/ScrollTrigger')
        ScrollTrigger.refresh()
      })
    }, 150) // after fonts/layout settle
    window.addEventListener('resize', recompute)
    return () => { window.clearTimeout(id); window.removeEventListener('resize', recompute) }
  }, [])

  useQuietRoomMotion(({ gsap, ScrollTrigger, reduced, narrow }) => {
    const ctx = gsap.context(() => {
      const path = pathRef.current
      if (path) {
        // Re-measure after the path's `d` has settled to its final,
        // layout-accurate value (set by the recompute effect above).
        const len = path.getTotalLength()
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: reduced ? 0 : len })
      }

      if (reduced) {
        gsap.set(['.qr-pr-node', '.qr-pr-step'], { opacity: 1, scale: 1, y: 0 })
        return
      }

      // The thread draws in step with scroll; nodes settle when reached.
      if (path && !narrow) {
        gsap.to(path, {
          strokeDashoffset: 0, ease: 'none',
          scrollTrigger: { trigger: rootRef.current, start: 'top 60%', end: 'bottom bottom', scrub: true },
        })
      } else if (path) {
        gsap.to(path, { strokeDashoffset: 0, duration: 1.2, ease: 'power1.inOut',
          scrollTrigger: { trigger: rootRef.current, start: 'top 70%' } })
      }

      gsap.utils.toArray<HTMLElement>('.qr-pr-step').forEach((step, i) => {
        gsap.from(step, {
          opacity: 0, y: 18, scale: 0.96, duration: 0.5, ease: 'back.out(1.2)',
          scrollTrigger: { trigger: step, start: 'top 85%', once: true },
        })
        const node = rootRef.current?.querySelector(`.qr-pr-node[data-i="${i}"]`)
        if (node) {
          gsap.set(node, { opacity: 0, scale: 0.85, transformOrigin: 'center' })
          gsap.to(node, {
            opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.2)',
            scrollTrigger: { trigger: step, start: 'top 85%', once: true },
          })
        }
      })

      // The room dims toward dusk early in the section, then holds — avoids
      // washing out later steps over a long scrub range.
      gsap.to(rootRef.current, {
        backgroundColor: '#2A2330', color: '#F2EEE4', ease: 'none',
        scrollTrigger: { trigger: rootRef.current, start: 'top 80%', end: 'top 20%', scrub: true },
      })
      gsap.to('.qr-pr-step h3', {
        color: '#F2EEE4', ease: 'none',
        scrollTrigger: { trigger: rootRef.current, start: 'top 80%', end: 'top 20%', scrub: true },
      })

      ScrollTrigger.refresh()
    }, rootRef)
    return () => ctx.revert()
  })

  return (
    <section id="process" ref={rootRef} className="qr-section qr-process">
      <style>{`
        .qr-process { background: var(--qr-stone); transition: none; }
        .qr-pr-head { max-width: 1140px; margin: 0 auto 8px; padding: 0 clamp(20px,5vw,56px); }
        .qr-pr-title { font-family: 'Spectral', serif; font-weight: 300; font-size: clamp(30px,4.4vw,52px);
          letter-spacing: -0.02em; margin: 12px 0 0; }

        .qr-pr-wrap { position: relative; max-width: 760px; margin: 40px auto 0; padding: 0 24px; }
        .qr-pr-svg { position: absolute; left: 50%; top: 0; transform: translateX(-50%); width: 290px;
          z-index: 1; pointer-events: none; }
        .qr-pr-thread { fill: none; stroke: var(--qr-moss); stroke-width: 1.6; stroke-linecap: round; opacity: 0.85; }
        .qr-pr-node { fill: var(--qr-honey); }

        .qr-pr-steps { position: relative; z-index: 2; }
        .qr-pr-step { position: relative; width: 46%; padding: 14px 0; margin-bottom: 34px; }
        .qr-pr-step--right { margin-left: 54%; text-align: left; }
        .qr-pr-step--left  { margin-left: 0; text-align: right; }
        .qr-pr-step .qr-mono { font-size: 11px; color: var(--qr-honey); }
        .qr-pr-step h3 { font-family: 'Spectral', serif; font-weight: 400; font-size: 22px; color: var(--qr-charcoal);
          margin: 6px 0 6px; }
        .qr-pr-step p { font-size: 14px; line-height: 1.55; color: rgba(140,135,128,0.95); margin: 0; }

        @media (max-width: 700px) {
          .qr-pr-svg { display: none; }
          .qr-pr-step, .qr-pr-step--right, .qr-pr-step--left { width: 100%; margin-left: 0; text-align: left;
            border-left: 2px solid rgba(92,107,82,0.4); padding-left: 18px; }
        }
      `}</style>

      <div className="qr-window qr-window--static" style={{ right: '-8%', bottom: '8%', opacity: 0.08 }} />

      <div className="qr-pr-head">
        <span className="qr-eyebrow">How it unfolds</span>
        <h2 className="qr-pr-title">You won't be walking in blind.</h2>
      </div>

      <div className="qr-pr-wrap" ref={wrapRef} style={{ minHeight: svgHeight + 30 }}>
        <svg className="qr-pr-svg" viewBox={`0 0 290 ${svgHeight}`} style={{ height: svgHeight }} aria-hidden>
          <path ref={pathRef} className="qr-pr-thread" d={pathD} />
          {nodePositions.map((nd, i) => (
            <circle key={i} className="qr-pr-node" data-i={i} cx={nd.x} cy={nd.y} r={5} />
          ))}
        </svg>

        <div className="qr-pr-steps">
          {STEPS.map((s, i) => (
            <div key={s.n} className={`qr-pr-step qr-pr-step--${NODES[i].side}`}>
              <span className="qr-mono">{s.n}</span>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
