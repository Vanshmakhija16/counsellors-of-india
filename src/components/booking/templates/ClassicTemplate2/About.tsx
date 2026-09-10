'use client'

import type { TherapistProfile } from '../templateUtils'

interface AboutProps {
  therapist: TherapistProfile
}

export default function About({ therapist }: AboutProps) {
  return (
    <section
      id="about"
      className="px-6 lg:px-10 pt-14 lg:pt-20 pb-28 lg:pb-36"
      style={{ background: 'var(--ink-0)' }}
    >
      <div className="mx-auto max-w-[1000px] text-center">
        <div className="ct2-rise" style={{ marginBottom: 48 }}>
          <h2
            className="ct2-serif"
            style={{ fontSize: 'clamp(30px, 3.9vw, 46px)', lineHeight: 1.12, color: 'var(--bone)' }}
          >
            About me
          </h2>
        </div>

        <p
          className="ct2-rise mx-auto"
          style={{
            fontSize: 17,
            lineHeight: 1.75,
            color: 'var(--bone)',
            opacity: 0.92,
            marginTop: 28,
            textAlign: 'justify',
          }}
        >
          <span
            className="ct2-tagline-font"
            aria-hidden="true"
            style={{
              fontSize: '1.7em',
              color: 'var(--gold)',
              fontWeight: 700,
              lineHeight: 0,
              verticalAlign: '-0.32em',
              marginRight: 4,
            }}
          >
            &ldquo;
          </span>
          {therapist.bio ||
            "I work with adults navigating anxiety, burnout, grief, and the long aftermath of difficult early relationships. My approach is integrative — rooted in psychodynamic listening, with tools from CBT, ACT, and somatic work woven in when the moment asks for them."}
          <span
            className="ct2-tagline-font"
            aria-hidden="true"
            style={{
              fontSize: '1.7em',
              color: 'var(--gold)',
              fontWeight: 700,
              lineHeight: 0,
              verticalAlign: '-0.32em',
              marginLeft: 4,
            }}
          >
            &rdquo;
          </span>
        </p>
      </div>
    </section>
  )
}
