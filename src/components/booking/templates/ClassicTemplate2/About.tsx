'use client'

import { useState } from 'react'
import type { TherapistProfile } from '../templateUtils'

interface AboutProps {
  therapist: TherapistProfile
}

export default function About({ therapist }: AboutProps) {
  const [expanded, setExpanded] = useState(false)
  const stats = [
    { value: therapist.experience ? `${therapist.experience}+` : 'Yrs', label: 'Years in practice' },
    { value: therapist.languages?.length ? String(therapist.languages.length) : '—', label: 'Languages' },
    { value: therapist.specialties?.length ? `${therapist.specialties.length}` : '—', label: 'Specialisms' },
    { value: therapist.sessionDuration ? `${therapist.sessionDuration}m` : '50m', label: 'Session length' },
  ]

  return (
    <section
      id="about"
      className="px-6 lg:px-10 py-28 lg:py-36"
      style={{ background: 'var(--ink-0)' }}
    >
      <div className="mx-auto max-w-[1240px]">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-14 lg:gap-24">
          {/* Left column — section header */}
          <div>
            <span className="ct2-eyebrow">— On the practice</span>
            <h2
              className="ct2-serif mt-6"
              style={{
                fontSize: 'clamp(38px, 5vw, 64px)',
                lineHeight: 1.05,
                color: 'var(--bone)',
              }}
            >
              A measured, <em style={{ color: 'var(--gold)' }}>relational</em>{' '}
              way of working.
            </h2>
          </div>

          {/* Right column — narrative + stats */}
          <div>
            <p
              style={{
                fontSize: 17,
                lineHeight: 1.75,
                color: 'var(--bone)',
                opacity: 0.92,
                maxWidth: '58ch',
              }}
            >
              {therapist.bio ||
                "I work with adults navigating anxiety, burnout, grief, and the long aftermath of difficult early relationships. My approach is integrative — rooted in psychodynamic listening, with tools from CBT, ACT, and somatic work woven in when the moment asks for them."}
            </p>

            {therapist.approach_text && (
              <p
                style={{
                  fontSize: 16,
                  lineHeight: 1.75,
                  color: 'var(--mute)',
                  marginTop: 20,
                  maxWidth: '58ch',
                }}
              >
                {therapist.approach_text}
              </p>
            )}

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px mt-12" style={{ background: 'var(--ink-3)' }}>
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="p-5"
                  style={{ background: 'var(--ink-0)' }}
                >
                  <div
                    className="ct2-serif"
                    style={{ fontSize: 36, color: 'var(--gold)', lineHeight: 1, fontStyle: 'italic' }}
                  >
                    {s.value}
                  </div>
                  <div
                    className="ct2-mono mt-2"
                    style={{ fontSize: 10, letterSpacing: '0.16em', color: 'var(--mute)' }}
                  >
                    {s.label.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>

            {/* Languages */}
            {therapist.languages && therapist.languages.length > 0 && (
              <div className="mt-12">
                <div className="ct2-eyebrow mb-4">Languages</div>
                <div className="flex flex-wrap gap-2">
                  {therapist.languages.map((l) => (
                    <span
                      key={l}
                      className="ct2-mono"
                      style={{
                        padding: '6px 12px',
                        border: '1px solid var(--ink-3)',
                        color: 'var(--bone)',
                        fontSize: 11,
                        letterSpacing: '0.08em',
                      }}
                    >
                      {l.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
