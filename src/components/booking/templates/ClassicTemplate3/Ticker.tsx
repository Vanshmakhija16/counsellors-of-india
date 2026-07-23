'use client'

import type { TherapistProfile } from '../templateUtils'
import { resolveCT3Content } from '../templateUtils'

interface TickerProps { therapist: TherapistProfile }

export default function Ticker({ therapist }: TickerProps) {
  const ct3 = resolveCT3Content(therapist.profile_content?.classic3)
  const items = ct3.ticker.items
  if (items.length === 0) return null
  const repeated = [...items, ...items, ...items, ...items]

  return (
    <div id="ticker" className="ct3-ticker-wrap">
      <div className="ct3-ticker-belt">
        {repeated.map((item, i) => (
          <span key={i} className="ct3-ticker-item">
            {item}
            <span className="ct3-ticker-dot" />
          </span>
        ))}
      </div>
    </div>
  )
}
