'use client'

import type { TherapistProfile } from '../templateUtils'
import { resolveCT4Content } from '../templateUtils'

interface TickerProps { therapist: TherapistProfile }

export default function Ticker({ therapist }: TickerProps) {
  const ct4 = resolveCT4Content(therapist.profile_content?.classic4)
  const items = ct4.ticker.items
  const repeated = [...items, ...items]

  return (
    <div className="ct4-ticker">
      <div className="ct4-ticker-belt">
        {repeated.map((item, i) => (
          <span key={i} className="ct4-ticker-item">
            {item}
            {i < repeated.length - 1 && <span className="ct4-ticker-dot" />}
          </span>
        ))}
      </div>
    </div>
  )
}
