'use client'

import { useState } from 'react'
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react'

export interface FeedbackItem {
  id: string
  client_name: string
  client_role: string | null
  rating: number
  text: string
  created_at: string
}

interface FeedbackProps {
  feedbacks: FeedbackItem[]
}

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={
            n <= rating
              ? 'fill-[#b46b50] text-[#b46b50]'
              : 'fill-transparent text-[#b46b50]'
          }
        />
      ))}
    </span>
  )
}

export default function Feedback({ feedbacks }: FeedbackProps) {
  const [active, setActive] = useState(0)

  if (!feedbacks || feedbacks.length === 0) return null

  const total = feedbacks.length
  const avg = feedbacks.reduce((s, f) => s + f.rating, 0) / total
  const featured = feedbacks[active]
  const others = feedbacks.filter((_, i) => i !== active).slice(0, 3)

  function go(dir: 1 | -1) {
    setActive((i) => (i + dir + total) % total)
  }

  return (
    <section
      id="feedback"
      className="relative overflow-hidden bg-[#1a1a18] px-6 py-20 lg:px-12 lg:py-24"
      style={{ borderTop: '3px solid #b46b50' }}
    >
      {/* warm atmospheric wash */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(160,122,74,0.10),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_80%,rgba(45,74,62,0.06),transparent_45%)]" />

      <div className="relative z-10 mx-auto max-w-[1180px]">
        {/* Section header */}
        <div className="grid items-end gap-10 border-b border-[#b46b50] pb-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-[#b46b50]" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#b46b50]">
                05 — Client Voices
              </p>
            </div>

            <h2
              className="mt-6 text-[36px] leading-[1.02] tracking-[-0.03em] text-[#f3ece4] lg:text-[52px]"
              style={{ fontFamily: 'var(--font-fraunces), serif' }}
            >
              In their own{' '}
              <span className="italic text-[#b46b50]">words.</span>
            </h2>
          </div>

          {/* Aggregate stat */}
          <div className="flex flex-col items-start gap-3 lg:items-end">
            <div className="flex items-baseline gap-2">
              <span
                className="text-[40px] leading-none tracking-[-0.02em] text-[#1a1a18] lg:text-[48px]"
                style={{ fontFamily: 'var(--font-fraunces), serif' }}
              >
                {avg.toFixed(1)}
              </span>
              <StarRow rating={Math.round(avg)} size={18} />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#b46b50]">
              Based on {total} session{total === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        {/* Featured testimonial — large editorial card */}
        <article className="relative mt-12 overflow-hidden rounded-[24px] border border-[#b46b50]/40 bg-[#252520] p-8 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.4)] lg:p-14">
          {/* large quote glyph */}
          <Quote
            size={64}
            className="absolute -left-2 -top-2 text-[#b46b50]/15 lg:-left-4 lg:-top-4 lg:h-[100px] lg:w-[100px]"
            strokeWidth={1}
          />

          <div className="relative">
            <StarRow rating={featured.rating} size={18} />

            <blockquote
              className="mt-5 max-w-[820px] text-[20px] italic leading-[1.55] text-[#f3ece4] lg:text-[28px] lg:leading-[1.5]"
              style={{ fontFamily: 'var(--font-fraunces), serif' }}
            >
              &ldquo;{featured.text}&rdquo;
            </blockquote>

            <div className="mt-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-[14px] font-semibold tracking-[0.02em] text-[#f3ece4]">
                  {featured.client_name}
                </p>
                {featured.client_role && (
                  <p className="mt-1 text-[11px] uppercase tracking-[0.28em] text-[#b46b50]">
                    {featured.client_role}
                  </p>
                )}
              </div>

              {total > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    aria-label="Previous testimonial"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#b46b50] bg-white/60 text-[#1a1a18] transition hover:-translate-x-0.5 hover:border-[#b46b50] hover:bg-white"
                  >
                    <ChevronLeft size={16} strokeWidth={1.5} />
                  </button>
                  <span className="min-w-[44px] text-center text-[11px] font-semibold uppercase tracking-[0.20em] text-[#b46b50]">
                    {String(active + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
                  </span>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    aria-label="Next testimonial"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#b46b50] bg-white/60 text-[#1a1a18] transition hover:translate-x-0.5 hover:border-[#b46b50] hover:bg-white"
                  >
                    <ChevronRight size={16} strokeWidth={1.5} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </article>

        {/* Smaller cards underneath */}
        {others.length > 0 && (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((f, i) => {
              // figure out original index so click jumps correctly
              const origIdx = feedbacks.findIndex((x) => x.id === f.id)
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActive(origIdx)}
                  className="group relative overflow-hidden rounded-[18px] border border-[#2a2a28] bg-[#252520] p-6 text-left transition-all duration-500 hover:-translate-y-1 hover:border-[#b46b50] hover:shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
                >
                  <div className="flex items-start justify-between">
                    <StarRow rating={f.rating} size={12} />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#b46b50]">
                      {String(i + 2).padStart(2, '0')}
                    </span>
                  </div>

                  <p
                    className="mt-4 line-clamp-4 text-[15px] leading-[1.55] italic text-[#8b8074]"
                    style={{ fontFamily: 'var(--font-fraunces), serif' }}
                  >
                    &ldquo;{f.text}&rdquo;
                  </p>

                  <div className="mt-4 flex items-center justify-between border-t border-[#2a2a28] pt-3">
                    <div>
                      <p className="text-[12.5px] font-semibold text-[#f3ece4]">
                        {f.client_name}
                      </p>
                      {f.client_role && (
                        <p className="mt-0.5 text-[10px] uppercase tracking-[0.20em] text-[#b46b50]">
                          {f.client_role}
                        </p>
                      )}
                    </div>
                    <span className="text-[16px] text-[#b46b50] opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                      →
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
