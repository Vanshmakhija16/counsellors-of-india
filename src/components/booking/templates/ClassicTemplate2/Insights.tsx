'use client'

import { ArrowUpRight } from 'lucide-react'

export interface InsightItem {
  number: string
  category: string
  title: string
  excerpt: string
  readingTime: string
  date: string
}

interface Props {
  insights: InsightItem[]
}

// Insights v3 — a large "lead story" card for the first insight, with the
// rest laid out as smaller cards in a grid underneath. Same premium
// bordered-surface treatment as the Services cards (soft lift + glow on
// hover), just scaled up for the featured piece.
export default function Insights({ insights }: Props) {
  const [featured, ...rest] = insights

  return (
    <section
      id="insights"
      className="px-6 lg:px-10 py-28 lg:py-36"
      style={{ background: 'var(--ink-0)' }}
    >
      <div className="mx-auto max-w-[1080px]">
        <div className="text-center mb-16 ct2-rise">
          <h2
            className="ct2-serif"
            style={{ fontSize: 'clamp(30px, 3.9vw, 46px)', lineHeight: 1.12, color: 'var(--bone)' }}
          >
            Insights
          </h2>
        </div>

        {featured && (
          <article className="ct2-insight-featured ct2-rise mb-6 lg:mb-7">
            {/* <span className="ct2-insight-featured-tag">{featured.category.toUpperCase()}</span> */}
            <h3 className="ct2-serif ct2-insight-featured-title">{featured.title}</h3>
            <p className="ct2-insight-featured-excerpt">{featured.excerpt}</p>
            <div className="ct2-insight-featured-footer">
              <span className="ct2-insight-featured-meta">
                {featured.date.toUpperCase()} · {featured.readingTime.toUpperCase()}
              </span>
              <ArrowUpRight size={20} style={{ color: 'var(--gold)' }} />
            </div>
          </article>
        )}

        {rest.length > 0 && (
          <div className="ct2-insight-grid">
            {rest.map((it) => (
              <article key={it.number} className="ct2-insight-card group flex flex-col p-7 lg:p-8 cursor-pointer">
                <span
                  className="ct2-mono"
                  style={{ fontSize: 10, color: 'var(--gold)', letterSpacing: '0.16em', marginBottom: 14, display: 'block' }}
                >
                  {/* {it.category.toUpperCase()} */}
                </span>

                <h3 className="ct2-serif" style={{ fontSize: 22, lineHeight: 1.22, color: 'var(--bone)', marginBottom: 14 }}>
                  {it.title}
                </h3>

                <p style={{ color: 'var(--mute)', fontSize: 13.5, lineHeight: 1.7, flexGrow: 1 }}>
                  {it.excerpt}
                </p>

                <div
                  className="flex items-center justify-between mt-7 pt-4"
                  style={{ borderTop: '1px solid var(--ink-3)' }}
                >
                  <span className="ct2-mono" style={{ fontSize: 10, letterSpacing: '0.1em', color: 'var(--mute)' }}>
                    {it.date.toUpperCase()} · {it.readingTime.toUpperCase()}
                  </span>
                  <ArrowUpRight
                    size={16}
                    style={{ color: 'var(--gold)' }}
                    className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                  />
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="flex justify-center mt-14">
          {/* <button className="ct2-btn-ghost">All writing →</button> */}
        </div>
      </div>
    </section>
  )
}
