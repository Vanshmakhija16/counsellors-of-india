'use client'

export interface ServiceItem {
  code: string
  title: string
  kind: string
  desc: string
  forWhom: string[]
  price?: string
  duration_mins?: number
}

interface Props {
  services: ServiceItem[]
  defaultDurationMins?: number
}

function scrollToBooking() {
  document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' })
}

export default function Services({ services, defaultDurationMins }: Props) {
  return (
    <section
      id="services"
      className="px-6 lg:px-10 py-28 lg:py-36"
      style={{ background: 'var(--ink-1)' }}
    >
      <div className="mx-auto max-w-[1080px]">
        <div className="text-center mb-16 ct2-rise">
          <h2
            className="ct2-serif"
            style={{ fontSize: 'clamp(30px, 3.9vw, 46px)', lineHeight: 1.12, color: 'var(--bone)' }}
          >
            Services
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-[1080px] mx-auto">
          {services.map((s, i) => (
            <article key={s.code} className="ct2-service-card ct2-rise" style={{ animationDelay: `${i * 70}ms` }}>
              <h3 className="ct2-serif ct2-service-title">{s.title}</h3>
              <p className="ct2-service-desc">{s.desc}</p>

              <div className="ct2-service-footer">
                <div className="flex items-baseline justify-between">
                  <div>
                    {s.price ? (
                      <span className="ct2-serif ct2-service-price">{s.price}</span>
                    ) : (
                      <span className="ct2-mono ct2-service-contact"> PRICING</span>
                    )}
                    <div className="ct2-mono ct2-service-duration">
                      {(s.duration_mins ?? defaultDurationMins ?? 50)} MIN SESSION
                    </div>
                  </div>
                  <button type="button" className="ct2-service-cta" onClick={scrollToBooking}>
                    Book →
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
