'use client'

export interface ServiceItem {
  code: string
  title: string
  kind: string
  desc: string
  forWhom: string[]
}

const services: ServiceItem[] = [
  {
    code: '01',
    title: 'Individual psychotherapy',
    kind: 'One-to-one · weekly',
    desc:
      'Long-form work for adults navigating anxiety, depression, identity, and the residue of difficult early life — patient, reflective, and unhurried.',
    forWhom: ['Anxiety', 'Depression', 'Self-worth', 'Burnout'],
  },
  {
    code: '02',
    title: 'Trauma & EMDR',
    kind: 'Specialist · paced',
    desc:
      'Trauma-informed work using EMDR and somatic methods. We move only at the speed your nervous system allows — never the other way around.',
    forWhom: ['PTSD', 'EMDR', 'Somatic work', 'Recovery'],
  },
  {
    code: '03',
    title: 'Couple & relational',
    kind: 'Two-people work',
    desc:
      'Structured sessions for couple re-learning how to fight fairly, listen well, and choose each other again — even after rupture.',
    forWhom: ['Couple', 'Conflict', 'Attachment', 'Repair'],
  },
  {
    code: '04',
    title: 'Career & meaning',
    kind: 'Reflective work',
    desc:
      'Psychotherapy for professionals questioning purpose, identity, or the cost of their ambition. Clarity-focused, never prescriptive.',
    forWhom: ['Direction', 'Meaning', 'Mid-career', 'Transition'],
  },
]

export default function Services() {
  return (
    <section
      id="services"
      className="px-6 lg:px-10 py-28 lg:py-36"
      style={{ background: 'var(--ink-1)' }}
    >
      <div className="mx-auto max-w-[1240px]">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
          <div>
            <span className="ct2-eyebrow">— Services</span>
            {/* <h2
              className="ct2-serif mt-6"
              style={{
                fontSize: 'clamp(38px, 5vw, 64px)',
                lineHeight: 1.05,
                color: 'var(--bone)',
              }}
            >
              Four shapes of <em style={{ color: 'var(--gold)' }}>work</em>.
            </h2> */}
          </div>
          {/* <p style={{ color: 'var(--mute)', maxWidth: '40ch', lineHeight: 1.7 }}>
            Different presentations need different containers. Each modality below has its own tempo and structure.
          </p> */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px" style={{ background: 'var(--ink-3)' }}>
          {services.map((s) => (
            <article
              key={s.code}
              className="ct2-card p-8 lg:p-10 group"
              style={{ background: 'var(--ink-1)', borderRadius: 0, border: 'none' }}
            >
              <div className="flex items-start justify-between mb-6">
                <span
                  className="ct2-mono"
                  style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: '0.18em' }}
                >
                  ◇ {s.code}
                </span>
                <span
                  className="ct2-mono"
                  style={{ fontSize: 10, color: 'var(--mute)', letterSpacing: '0.16em' }}
                >
                  {s.kind.toUpperCase()}
                </span>
              </div>

              <h3
                className="ct2-serif"
                style={{
                  fontSize: 32,
                  lineHeight: 1.15,
                  color: 'var(--bone)',
                  marginBottom: 16,
                }}
              >
                {s.title}
              </h3>

              <p
                style={{
                  color: 'var(--bone)',
                  opacity: 0.78,
                  fontSize: 15,
                  lineHeight: 1.7,
                  maxWidth: '46ch',
                }}
              >
                {s.desc}
              </p>

              <div className="flex flex-wrap gap-2 mt-7">
                {s.forWhom.map((w) => (
                  <span
                    key={w}
                    style={{
                      padding: '5px 11px',
                      border: '1px solid var(--ink-3)',
                      color: 'var(--mute)',
                      fontSize: 11,
                      letterSpacing: '0.04em',
                    }}
                  >
                    {w}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
