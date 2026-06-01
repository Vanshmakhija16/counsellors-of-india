'use client'

import type { RefObject } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface ServiceItem {
  code: string
  title: string
  kind: string
  desc: string
  forWhom: string[]
  price?: number
}

interface ServicesProps {
  services: ServiceItem[]
  svcTrackRef: RefObject<HTMLDivElement | null>
  svcCanPrev: boolean
  svcCanNext: boolean
  scrollSvc: (dir: 1 | -1) => void
  defaultFee?: number
  onBookService?: (service: ServiceItem) => void
}

export default function Services({
  services, svcTrackRef, svcCanPrev, svcCanNext, scrollSvc, defaultFee, onBookService,
}: ServicesProps) {
  return (
    <section
      id="services"
      className="relative overflow-hidden bg-[#efe7d6] px-6 py-20 lg:px-12 lg:py-24"
      style={{ borderTop: '2px solid #c9b59a' }}
    >
      <div className="pointer-events-none absolute left-[-120px] top-[-80px] h-[320px] w-[320px] rounded-full bg-[#e8dfc8] blur-3xl opacity-60" />
      <div className="pointer-events-none absolute bottom-[-120px] right-[-100px] h-[280px] w-[280px] rounded-full bg-[#e8dfc8] blur-3xl opacity-50" />

      <div className="relative mx-auto max-w-[1180px]">

        {/* Header */}
        <div className="grid gap-10 border-b border-[#e8dfc8] pb-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.30em] text-[#b46b50]">
              Services
            </p>
            <h2
              className="mt-6 text-[34px] leading-[1.02] tracking-[-0.03em] text-[#1a1a18] lg:text-[44px]"
              style={{ fontFamily: 'var(--font-fraunces), serif' }}
            >
              A considered{' '}
              <span className="italic text-[#6b6056]">therapeutic practice.</span>
            </h2>
          </div>
          <div className="flex flex-col justify-end">
            <p className="max-w-[480px] text-[15px] leading-[1.85] text-[#6b6056]">
              Every engagement begins with a thoughtful conversation — creating space to understand
              what you're carrying and whether this practice feels aligned for your journey ahead.
            </p>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative mt-12">
          <button
            type="button" onClick={() => scrollSvc(-1)} disabled={!svcCanPrev}
            className={[
              'absolute left-0 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border transition-all duration-300 lg:flex',
              svcCanPrev
                ? 'border-[#e8dfc8] bg-[#efe7d6] text-[#1a1a18] hover:-translate-x-1 hover:border-[#b46b50]'
                : 'cursor-not-allowed border-[#e8dfc8] bg-[#efe7d6] text-[#6b6056]',
            ].join(' ')}
          >
            <ChevronLeft size={18} strokeWidth={1.5} />
          </button>
          <button
            type="button" onClick={() => scrollSvc(1)} disabled={!svcCanNext}
            className={[
              'absolute right-0 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border transition-all duration-300 lg:flex',
              svcCanNext
                ? 'border-[#e8dfc8] bg-[#efe7d6] text-[#1a1a18] hover:translate-x-1 hover:border-[#b46b50]'
                : 'cursor-not-allowed border-[#e8dfc8] bg-[#efe7d6] text-[#6b6056]',
            ].join(' ')}
          >
            <ChevronRight size={18} strokeWidth={1.5} />
          </button>

          <div
            ref={svcTrackRef}
            className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2 pt-2 no-scrollbar"
          >
            {services.map((s, i) => {
              const price = s.price ?? defaultFee
              return (
                <article
                  key={s.code}
                  className="group ct-svc-card relative flex min-w-[280px] max-w-[280px] flex-shrink-0 snap-start flex-col rounded-[24px] border border-[#e8dfc8] bg-[#f5ecd6] p-7 transition-all duration-500 hover:-translate-y-1 hover:border-[#b46b50] hover:shadow-[0_10px_30px_rgba(0,0,0,0.04)]"
                >
                  {/* Number */}
                  <span
                    className="text-[38px] leading-none text-[#e8dfc8] transition-all duration-500 group-hover:text-[#b46b50]"
                    style={{ fontFamily: 'var(--font-fraunces), serif' }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  {/* Text */}
                  <div className="mt-8 flex-1">
                    <h3
                      className="text-[19px] font-semibold leading-[1.1] tracking-[-0.03em] text-[#1a1a18]"
                      style={{ fontFamily: 'var(--font-fraunces), serif' }}
                    >
                      {s.title}
                    </h3>
                    <p className="mt-4 text-[14px] leading-[1.85] text-[#6b6056]">{s.desc}</p>
                  </div>

                  {/* Price + Book Now */}
                  <div className="mt-8 border-t border-[#e8dfc8] pt-5">
                    {price != null && (
                      <div className="mb-4 flex items-baseline gap-1.5">
                        <span
                          className="text-[22px] font-semibold leading-none tracking-tight text-[#1a1a18]"
                          style={{ fontFamily: 'var(--font-fraunces), serif' }}
                        >
                          ₹{price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[11px] uppercase tracking-[0.2em] text-[#6b6056]">
                          / session
                        </span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); onBookService?.(s) }}
                      className="w-full rounded-xl bg-[#1a1a18] py-3 text-[11px] font-bold uppercase tracking-[0.26em] text-[#f5ecd6] transition-all duration-200 hover:bg-[#b46b50] hover:shadow-md active:scale-[0.98]"
                    >
                      Book Now →
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
