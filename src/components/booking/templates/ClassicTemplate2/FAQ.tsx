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
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section
      id="faq"
      className="px-6 lg:px-10 py-28 lg:py-36"
      style={{ background: 'var(--ink-1)' }}
    >
      <div className="mx-auto max-w-[1080px]">
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.4fr] gap-14 lg:gap-24">
          {/* Left — sticky header */}
          <div>
            <div className="lg:sticky lg:top-28">
              <span className="ct2-eyebrow">— Frequently asked</span>
              <h2
                className="ct2-serif mt-6"
                style={{
                  fontSize: 'clamp(38px, 5vw, 64px)',
                  lineHeight: 1.05,
                  color: 'var(--bone)',
                }}
              >
                Things people <em style={{ color: 'var(--gold)' }}>ask first</em>.
              </h2>
              <p
                style={{
                  color: 'var(--mute)',
                  marginTop: 24,
                  lineHeight: 1.7,
                  maxWidth: '36ch',
                }}
              >
                If something is on your mind that isn&apos;t answered here, a short message is welcome — there is no
                obligation in either direction.
              </p>
            </div>
          </div>

          {/* Right — accordion */}
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
                    <span className="flex items-baseline gap-5">
                      <span
                        className="ct2-mono"
                        style={{
                          fontSize: 11,
                          color: 'var(--mute)',
                          letterSpacing: '0.18em',
                          width: 28,
                          flexShrink: 0,
                        }}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span
                        className="ct2-serif"
                        style={{ fontSize: 'clamp(18px, 2.2vw, 24px)', lineHeight: 1.35 }}
                      >
                        {item.q}
                      </span>
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
                        paddingLeft: 53,
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
      </div>
    </section>
  )
}
