'use client'

import { ArrowUpRight } from 'lucide-react'

interface InsightItem {
  number: string
  category: string
  title: string
  excerpt: string
  readingTime: string
  date: string
}

const insights: InsightItem[] = [
  {
    number: '001',
    category: 'On anxiety',
    title: 'The anxiety underneath your productivity',
    excerpt:
      'When ambition is fuelled by avoidance, achievement starts to feel like relief instead of joy. A note on the difference.',
    readingTime: '6 min read',
    date: 'May 2026',
  },
  {
    number: '002',
    category: 'On grief',
    title: 'Grief without a vocabulary',
    excerpt:
      'Some losses don\'t arrive with a name — the friendship that quietly thinned, the version of yourself you outgrew. They are still grief.',
    readingTime: '8 min read',
    date: 'Apr 2026',
  },
  {
    number: '003',
    category: 'On relationships',
    title: 'Why repair matters more than rupture',
    excerpt:
      'Conflict isn\'t the threat to intimacy that we think it is. Unrepaired conflict is. A short piece on returning to each other.',
    readingTime: '5 min read',
    date: 'Mar 2026',
  },
]

export default function Insights() {
  return (
    <section
      id="insights"
      className="px-6 lg:px-10 py-28 lg:py-36"
      style={{ background: 'var(--ink-0)' }}
    >
      <div className="mx-auto max-w-[1080px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ background: 'var(--ink-3)' }}>
          {insights.map((it) => (
            <article
              key={it.number}
              className="group flex flex-col p-7 lg:p-9 cursor-pointer transition-colors"
              style={{ background: 'var(--ink-0)', minHeight: 360 }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ink-1)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--ink-0)')}
            >
              <div className="flex items-center justify-between mb-6">
                <span
                  className="ct2-mono"
                  style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: '0.18em' }}
                >
                  ⌗ {it.number}
                </span>
                <span
                  className="ct2-mono"
                  style={{ fontSize: 10, color: 'var(--mute)', letterSpacing: '0.14em' }}
                >
                  {it.category.toUpperCase()}
                </span>
              </div>

              <h3
                className="ct2-serif"
                style={{
                  fontSize: 26,
                  lineHeight: 1.2,
                  color: 'var(--bone)',
                  marginBottom: 16,
                  flexGrow: 0,
                }}
              >
                {it.title}
              </h3>

              <p
                style={{
                  color: 'var(--bone)',
                  opacity: 0.7,
                  fontSize: 14,
                  lineHeight: 1.7,
                  flexGrow: 1,
                }}
              >
                {it.excerpt}
              </p>

              <div
                className="flex items-center justify-between mt-8 pt-5"
                style={{ borderTop: '1px solid var(--ink-3)' }}
              >
                <span
                  className="ct2-mono"
                  style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--mute)' }}
                >
                  {it.date.toUpperCase()} · {it.readingTime.toUpperCase()}
                </span>
                <ArrowUpRight
                  size={18}
                  style={{ color: 'var(--gold)' }}
                  className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </div>
            </article>
          ))}
        </div>

        <div className="flex justify-center mt-14">
          <button className="ct2-btn-ghost">All writing →</button>
        </div>
      </div>
    </section>
  )
}
