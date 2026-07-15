'use client'

import { useRef } from 'react'
import { useCt7Reveal } from './_reveal'

const STEPS = [
  { t: 'Reach out',          d: 'A short message or a booking request \u2014 no detail needed yet, just the decision to start.' },
  { t: 'First conversation', d: 'A short introductory call to feel out fit. Honest, unhurried, no obligation to continue.' },
  { t: 'A plan, together',   d: 'We agree on rhythm and focus. The plan stays yours \u2014 I just help shape it.' },
  { t: 'Ongoing sessions',   d: 'Regular, confidential sessions at a pace that suits the work, not a fixed formula.' },
  { t: 'Reflection',         d: 'We revisit where things stand every few months. You set the pace throughout.' },
]

export default function Process() {
  const rootRef = useRef<HTMLElement | null>(null)
  useCt7Reveal(rootRef)

  return (
    <section id="process" ref={rootRef} className="ct7-section" style={{ background: 'var(--ct7-bone)' }}>
      <div className="ct7-section-head">
        <span className="ct7-eyebrow ct7-reveal">How it unfolds</span>
        <h2 className="ct7-section-title ct7-reveal-clip">You won't be walking in <em>blind</em>.</h2>
      </div>

      <div className="ct7-wrap-narrow">
        {STEPS.map((s, i) => (
          <div key={s.t} className="ct7-ledger-row ct7-reveal">
            <span className="ct7-ledger-num">{String(i + 1).padStart(2, '0')}</span>
            <div className="ct7-ledger-body">
              <h3 className="ct7-ledger-title">{s.t}</h3>
              <p className="ct7-ledger-text">{s.d}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
