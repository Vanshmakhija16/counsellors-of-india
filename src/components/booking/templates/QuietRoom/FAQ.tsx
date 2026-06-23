'use client'

import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { TherapistProfile } from '../templateUtils'
import { useQuietRoomMotion } from './_motion'

interface FAQProps { therapist: TherapistProfile }

interface QA { q: string; a: string }

const DEFAULT_FAQ: QA[] = [
  { q: 'What if I don’t know what to say?', a: 'That’s completely normal — most people don’t. There’s no script and no wrong way to begin. We start wherever you are, even if that’s “I’m not sure why I’m here.”' },
  { q: 'Do you offer a first consultation?', a: 'Yes — a short introductory call, with no obligation to continue. It’s simply a chance for both of us to feel out whether we’re the right fit.' },
  { q: 'Online or in person?', a: 'Both are available. Many clients prefer the flexibility of online sessions; others value the containment of an in-person room. We’ll choose what suits the work.' },
  { q: 'How long do people usually stay in therapy?', a: 'It varies. Some come for a focused handful of sessions around one theme; others stay for longer, deeper work. We revisit this together every few months — you set the pace.' },
  { q: 'Is everything I say confidential?', a: 'Yes, within the standard clinical limits (risk of serious harm, or legal requirement). I’ll explain exactly what that means at our first session.' },
]

export default function FAQ({ therapist }: FAQProps) {
  const rootRef = useRef<HTMLElement | null>(null)
  const [open, setOpen] = useState<number | null>(0)

  const content = (therapist.profile_content as { classic6?: { faq?: QA[] } } | undefined)?.classic6?.faq
  const items = content?.length ? content : DEFAULT_FAQ

  useQuietRoomMotion(({ gsap, reduced }) => {
    const ctx = gsap.context(() => {
      if (reduced) { gsap.set('.qr-faq-row', { opacity: 1, y: 0 }); return }
      gsap.from('.qr-faq-row', {
        opacity: 0, y: 14, duration: 0.6, ease: 'expo.out', stagger: 0.06,
        scrollTrigger: { trigger: rootRef.current, start: 'top 78%' },
      })
    }, rootRef)
    return () => ctx.revert()
  })

  return (
    <section id="faq" ref={rootRef} className="qr-daylight qr-section">
      <style>{`
        .qr-faq-wrap { max-width: 760px; margin: 0 auto; padding: 0 clamp(20px,5vw,56px); }
        .qr-faq-title { font-family: 'Spectral', serif; font-weight: 300; font-size: clamp(30px,4.4vw,52px);
          letter-spacing: -0.02em; margin: 12px 0 36px; color: var(--qr-charcoal); }
        .qr-faq-row { border-top: 1px solid rgba(46,42,38,0.12); }
        .qr-faq-row:last-child { border-bottom: 1px solid rgba(46,42,38,0.12); }
        .qr-faq-q { width: 100%; background: none; border: none; cursor: pointer; text-align: left;
          display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 22px 8px;
          font-family: 'Spectral', serif; font-weight: 400; font-size: 20px; color: var(--qr-charcoal);
          transition: background 300ms var(--qr-calm-out); border-radius: 8px; }
        .qr-faq-q:hover { background: var(--qr-stone-warm); }
        .qr-faq-ind { flex-shrink: 0; width: 14px; height: 14px; position: relative; color: var(--qr-moss);
          transition: transform 450ms var(--qr-calm-inout); }
        .qr-faq-ind::before, .qr-faq-ind::after { content: ''; position: absolute; background: currentColor; border-radius: 1px; }
        .qr-faq-ind::before { left: 0; top: 6px; width: 14px; height: 2px; }
        .qr-faq-ind::after  { left: 6px; top: 0; width: 2px; height: 14px; transition: opacity 450ms var(--qr-calm-inout); }
        .qr-faq-ind--open { transform: rotate(180deg); }
        .qr-faq-ind--open::after { opacity: 0; }
        .qr-faq-a { overflow: hidden; }
        .qr-faq-a-inner { padding: 2px 8px 24px; font-size: 16px; line-height: 1.65; color: rgba(46,42,38,0.74); max-width: 60ch; }
      `}</style>

      <div className="qr-faq-wrap">
        <span className="qr-eyebrow">Before you begin</span>
        <h2 className="qr-faq-title">The questions people usually carry.</h2>

        {items.map((item, idx) => {
          const isOpen = open === idx
          return (
            <div key={idx} className="qr-faq-row">
              <button className="qr-faq-q" onClick={() => setOpen(isOpen ? null : idx)} aria-expanded={isOpen}>
                {item.q}
                <span className={`qr-faq-ind ${isOpen ? 'qr-faq-ind--open' : ''}`} aria-hidden />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    className="qr-faq-a"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.45, ease: [0.65, 0, 0.35, 1] }}
                  >
                    <motion.p
                      className="qr-faq-a-inner"
                      initial={{ y: 8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 0, opacity: 0 }}
                      transition={{ duration: 0.35, delay: 0.1 }}
                    >
                      {item.a}
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </section>
  )
}
