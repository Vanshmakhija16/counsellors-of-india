'use client'

export default function Ticker() {
  const items = [
    'Evidence-Based Therapy',
    'Compassionate Care',
    'Online & In-Person',
    'Anxiety & Depression',
    'Relationships',
    'Trauma-Informed',
    'Confidential Sessions',
    'RCI Licensed',
    'Personalised Approach',
  ]

  const doubled = [...items, ...items]

  return (
    <div className="ct5-ticker">
      <div className="ct5-ticker-track">
        {doubled.map((item, i) => (
          <span key={i} className="ct5-ticker-item">
            {item}
            <span className="ct5-ticker-sep" />
          </span>
        ))}
      </div>
    </div>
  )
}
