'use client'

import { useRef, useState } from 'react'
import { useCt7Reveal } from './_reveal'

const ITEMS = [
  { q: 'What if I don\u2019t know what to say?', a: 'That\u2019s completely normal \u2014 most people don\u2019t. There\u2019s no script and no wrong way to begin. We start wherever you are, even if that\u2019s "I\u2019m not sure why I\u2019m here."' },
  { q: 'Do you offer a first consultation?', a: 'Yes \u2014 a short introductory call, with no obligation to continue. It\u2019s a chance for both of us to feel out whether we\u2019re the right fit.' },
  { q: 'Online or in person?', a: 'Both are available. Many clients prefer the flexibility of online sessions; others value the containment of an in-person room. We\u2019ll choose what suits the work.' },
  { q: 'How long do people usually stay in therapy?', a: 'It varies. Some come for a focused handful of sessions around one theme; others stay for longer, deeper work. We revisit this together every few months.' },
  { q: 'Is everything I say confidential?', a: 'Yes, within standard clinical limits (risk of serious harm, or legal requirement). I\u2019ll explain exactly what that means at our first session.' },
]

export default function FAQ() {
  const rootRef = useRef<HTMLElement | null>(null)
  const [open, setOpen] = useState<number | null>(0)
  useCt7Reveal(rootRef)

  return (
    <section id="faq" ref={rootRef} className="ct7-section" style={{ background: 'var(--ct7-bone-dim)' }}>
      <style>{`
        .ct7-faq-q {
          width: 100%; background: none; border: none; cursor: pointer; text-align: left;
          display: flex; align-items: center; justify-content: space-between; gap: 20px;
          font-family: 'Fraunces', Georgia, serif; font-weight: 500; font-size: clamp(17px, 2vw, 20px);
          color: var(--ct7-charcoal); padding: 0;
        }
        .ct7-faq-ind {
          flex-shrink: 0; width: 14px; height: 14px; position: relative; color: var(--ct7-brass);
          transition: transform 400ms var(--ct7-ease-inout);
        }
        .ct7-faq-ind::before, .ct7-faq-ind::after { content: ''; position: absolute; background: currentColor; border-radius: 1px; }
        .ct7-faq-ind::before { left: 0; top: 6px; width: 14px; height: 2px; }
        .ct7-faq-ind::after  { left: 6px; top: 0; width: 2px; height: 14px; transition: opacity 400ms var(--ct7-ease-inout); }
        .ct7-faq-ind--open { transform: rotate(180deg); }
        .ct7-faq-ind--open::after { opacity: 0; }
        .ct7-faq-a {
          overflow: hidden; max-height: 0; transition: max-height 420ms var(--ct7-ease-inout);
        }
        .ct7-faq-a--open { max-height: 240px; }
        .ct7-faq-a-inner {
          padding-top: 14px; font-family: 'Inter', system-ui, sans-serif; font-size: 15px; line-height: 1.65;
          color: rgba(43,51,46,0.68); max-width: 60ch;
        }

        .ct7-faq-layout {
          position: relative; max-width: 1180px; margin: 0 auto; padding: 0 clamp(20px,5vw,56px);
          display: grid; grid-template-columns: 0.85fr 1.4fr; gap: clamp(28px, 5vw, 64px); align-items: start;
        }
        @media (max-width: 900px) { .ct7-faq-layout { grid-template-columns: 1fr; } }

        .ct7-faq-side { position: sticky; top: 120px; }
        @media (max-width: 900px) { .ct7-faq-side { position: static; margin-bottom: 8px; } }
        .ct7-faq-side-word {
          font-family: 'Fraunces', Georgia, serif; font-weight: 500; font-style: italic; letter-spacing: -0.01em;
          font-size: clamp(48px, 7vw, 88px); line-height: 0.96; color: var(--ct7-charcoal); margin: 12px 0 0;
        }
        .ct7-faq-side-word em { font-style: italic; color: var(--ct7-brass); }
        .ct7-faq-side-sub {
          font-family: 'Inter', system-ui, sans-serif; font-size: 14.5px; line-height: 1.6;
          color: rgba(43,51,46,0.6); margin: 18px 0 0; max-width: 34ch;
        }
      `}</style>

      <div className="ct7-faq-layout">
        <div className="ct7-faq-side">
          <span className="ct7-eyebrow ct7-reveal">Before you begin</span>
          <h2 className="ct7-faq-side-word ct7-reveal-clip">FAQs</h2>
          <p className="ct7-faq-side-sub ct7-reveal">Questions people usually carry into that first message — answered before you have to ask.</p>
        </div>

        <div className="ct7-faq-list">
          {ITEMS.map((item, i) => {
            const isOpen = open === i
            return (
              <div key={i} className="ct7-ledger-row ct7-reveal">
                <span className="ct7-ledger-num">{String(i + 1).padStart(2, '0')}</span>
                <div className="ct7-ledger-body">
                  <button className="ct7-faq-q" onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen}>
                    {item.q}
                    <span className={`ct7-faq-ind ${isOpen ? 'ct7-faq-ind--open' : ''}`} aria-hidden />
                  </button>
                  <div className={`ct7-faq-a ${isOpen ? 'ct7-faq-a--open' : ''}`}>
                    <p className="ct7-faq-a-inner">{item.a}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
