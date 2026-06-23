'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { TherapistProfile, Review } from '../templateUtils'

interface TProps { therapist: TherapistProfile }

const FALLBACK: Review[] = [
  { name: 'A. M.', rating: 5, text: 'I came in feeling completely lost. Six months later I have language for my feelings, tools for hard days, and a relationship with myself I never thought possible.' },
  { name: 'R. V.', rating: 5, text: 'I was nervous about therapy. Somehow it never once felt like being assessed — just like being genuinely heard, week after week.' },
  { name: 'S. P.', rating: 5, text: 'Unhurried, honest, and kind. I never felt rushed toward an answer I wasn’t ready for.' },
]

const AUTO_MS = 7000

export default function Testimonials({ therapist }: TProps) {
  const reviews = therapist.reviews?.length ? therapist.reviews : FALLBACK
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const windowRef = useRef<HTMLDivElement | null>(null)

  // Auto-advance, paused on hover so re-reading is respected.
  useEffect(() => {
    if (paused || reviews.length < 2) return
    const id = window.setTimeout(() => setI(p => (p + 1) % reviews.length), AUTO_MS)
    return () => window.clearTimeout(id)
  }, [i, paused, reviews.length])

  // Gentle Window drift (CSS-keyframe-free, lightweight rAF loop).
  useEffect(() => {
    const el = windowRef.current
    if (!el) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const start = performance.now()
    const tick = (t: number) => {
      const s = (t - start) / 1000
      const x = Math.sin(s / 9) * 6
      const y = Math.cos(s / 11) * 5
      const sc = 1 + (Math.sin(s / 13) + 1) * 0.03
      el.style.transform = `translate(${x}px, ${y}px) scale(${sc})`
      el.style.opacity = String(0.12 + (Math.sin(s / 10) + 1) * 0.04)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const active = reviews[i]

  return (
    <section
      id="testimonials"
      className="qr-dusk qr-section qr-tm"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <style>{`
        .qr-tm { position: relative; overflow: hidden; }
        .qr-tm-inner { position: relative; z-index: 2; max-width: 880px; margin: 0 auto; padding: 0 clamp(20px,5vw,56px);
          text-align: center; min-height: 320px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .qr-tm-mark { font-family: 'Spectral', serif; font-size: 64px; line-height: 0; color: var(--qr-honey);
          opacity: 0.55; margin-bottom: 18px; }
        .qr-tm-quote { font-family: 'Spectral', serif; font-style: italic; font-weight: 300;
          font-size: clamp(24px, 3.4vw, 38px); line-height: 1.4; color: var(--qr-paper); letter-spacing: -0.01em; }
        .qr-tm-attr { margin-top: 26px; font-size: 11px; color: rgba(242,238,228,0.55); }
        .qr-tm-dots { display: flex; gap: 10px; justify-content: center; margin-top: 38px; }
        .qr-tm-dot { width: 7px; height: 7px; border-radius: 50%; border: none; cursor: pointer; padding: 0;
          background: rgba(242,238,228,0.28); transition: transform 200ms var(--qr-calm-out), background 200ms var(--qr-calm-out); }
        .qr-tm-dot:hover { transform: scale(1.3); }
        .qr-tm-dot--on { background: var(--qr-honey); transform: scale(1.2); }
      `}</style>

      <div ref={windowRef} className="qr-window" style={{ left: '50%', top: '30%', marginLeft: '-30vw', opacity: 0.14 }} />

      <div className="qr-tm-inner">
        <div className="qr-tm-mark qr-display">&ldquo;</div>
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="qr-tm-quote">{active.text}</p>
            <p className="qr-tm-attr qr-mono">— {active.name}</p>
          </motion.div>
        </AnimatePresence>

        {reviews.length > 1 && (
          <div className="qr-tm-dots">
            {reviews.map((_, idx) => (
              <button
                key={idx}
                aria-label={`Testimonial ${idx + 1}`}
                className={`qr-tm-dot ${idx === i ? 'qr-tm-dot--on' : ''}`}
                onClick={() => setI(idx)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
