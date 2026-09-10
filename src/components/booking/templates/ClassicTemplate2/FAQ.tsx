'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export interface FAQItem {
  q: string
  a: string
}

interface Props {
  faqs: FAQItem[]
}

export default function FAQ({ faqs }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section
      id="faq"
      className="px-6 lg:px-10 py-28 lg:py-36"
      style={{ background: 'var(--ink-1)' }}
    >
      <div className="mx-auto max-w-[820px]">
        {/* Centered section title — replaces the old two-column layout's
            left sticky header ("Things people ask first." + supporting
            paragraph, both removed) with a single simple heading. */}
        <div className="text-center" style={{ marginBottom: 56 }}>
          <h2
            className="ct2-serif"
            style={{
              fontSize: 'clamp(34px, 4.4vw, 52px)',
              lineHeight: 1.05,
              color: 'var(--bone)',
            }}
          >
            Common Questions
          </h2>
        </div>

        {/* Accordion — questions only, full width now that the sidebar is gone */}
        <div>
            {faqs.map((item, i) => {
              const open = openIndex === i
              return (
                <div
                  key={i}
                  style={{
                    borderTop: i === 0 ? '1px solid var(--ink-3)' : 'none',
                    borderBottom: '1px solid var(--ink-3)',
                  }}
                >
                  <button
                    onClick={() => setOpenIndex(open ? null : i)}
                    className="w-full flex items-center justify-between gap-6 py-6 text-left transition-colors"
                    style={{ color: open ? 'var(--gold)' : 'var(--bone)' }}
                  >
                    <span
                      className="ct2-serif"
                      style={{ fontSize: 'clamp(18px, 2.2vw, 24px)', lineHeight: 1.35 }}
                    >
                      {item.q}
                    </span>
                    <ChevronDown
                      size={20}
                      className={`ct2-chevron ${open ? 'open' : ''}`}
                      style={{ color: open ? 'var(--gold)' : 'var(--mute)', flexShrink: 0 }}
                    />
                  </button>

                  <div
                    style={{
                      maxHeight: open ? 400 : 0,
                      overflow: 'hidden',
                      transition: 'max-height 0.35s ease, opacity 0.3s ease',
                      opacity: open ? 1 : 0,
                    }}
                  >
                    <p
                      style={{
                        color: 'var(--bone)',
                        opacity: 0.78,
                        fontSize: 15,
                        lineHeight: 1.75,
                        paddingLeft: 0,
                        paddingRight: 24,
                        paddingBottom: 28,
                        maxWidth: '62ch',
                      }}
                    >
                      {item.a}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
      </div>
    </section>
  )
}
