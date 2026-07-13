import type { Metadata } from 'next'
import Link from 'next/link'
import SiteNav from '@/components/layout/SiteNav'
import SiteFooter from '@/components/layout/SiteFooter'
import { X, ArrowRight, Clock, Palette, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Why Us',
  description:
    'A smarter way to build your online practice — see how Counsellors of India compares to generic website builders.',
}

// Scattered "old way" — the tools a therapist normally has to stitch together.
const OLD_WAY_TAGS = [
  { label: 'Domain', rotate: -6 },
  { label: 'Hosting', rotate: 4 },
  { label: 'Website builder', rotate: -3 },
  { label: 'Booking tool', rotate: 5 },
  { label: 'Payment gateway', rotate: -5 },
  { label: 'Plugin updates', rotate: 3 },
]

const REASONS = [
  { icon: Clock, t: 'Save time & money', d: 'One platform instead of five separate bills and logins.' },
  { icon: Palette, t: 'Built for the profession', d: 'Not a generic template, designed for therapists.' },
  { icon: Sparkles, t: 'Focus on your clients', d: 'We handle the tech. You handle the practice.' },
]

const ROWS = [
  ['Setup', 'Purchase a domain separately', 'Professional website ready from day one'],
  ['Learning curve', 'Learn how to build it yourself, or hire a developer', 'Guided setup in just a few minutes'],
  ['Cost', 'High upfront development costs', 'Affordable plans designed for therapists'],
  ['Tools', 'Website, bookings and payments need different tools', 'Everything managed in one platform'],
  ['Templates', 'Generic templates built for every industry', 'Templates created exclusively for mental health professionals'],
  ['Maintenance', 'Ongoing maintenance and plugin management', "We handle the technical side so you don't have to"],
]

export default function WhyUsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FFFCF8]">
      <SiteNav />

      {/* Fold 1 — Hero + signature visual, nothing else competing for attention */}
      <section className="relative flex min-h-[86vh] flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-16">
        <div className="pointer-events-none absolute -top-32 left-[-8%] h-[440px] w-[440px] rounded-full bg-[#FF9933] opacity-[0.08] blur-[110px]" />
        <div className="pointer-events-none absolute -bottom-32 right-[-10%] h-[360px] w-[360px] rounded-full bg-[#456554] opacity-[0.06] blur-[100px]" />

        <div className="relative mx-auto max-w-3xl text-center">
          <h1
            className="text-4xl leading-[1.12] text-[#1F1C18] sm:text-5xl"
            style={{ fontFamily: "'Fraunces','Instrument Serif',serif" }}
          >
            Five tools. One platform.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-[#6E685F]">
            See how a purpose-built platform for mental health professionals compares to piecing it together yourself.
          </p>
        </div>

        <div className="relative mx-auto mt-14 flex max-w-3xl flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-5">
          <div className="flex max-w-[260px] flex-wrap justify-center gap-2.5 sm:max-w-[220px]">
            {OLD_WAY_TAGS.map((tag) => (
              <span
                key={tag.label}
                style={{ transform: `rotate(${tag.rotate}deg)` }}
                className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-[#D8CFC0] bg-white px-3 py-1.5 text-[11.5px] font-medium text-[#9C948A] line-through decoration-[#C9BFAF]"
              >
                <X size={11} className="shrink-0 text-[#C9BFAF]" />
                {tag.label}
              </span>
            ))}
          </div>

          <ArrowRight size={20} className="shrink-0 rotate-90 text-[#C9BFAF] sm:rotate-0" />

          <span className="inline-flex items-center gap-2 rounded-full bg-[#1F1C18] px-5 py-2.5 text-[14px] font-semibold text-white shadow-[0_16px_36px_-16px_rgba(255,153,51,0.5)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF9933]" />
            Counsellors of India
          </span>
        </div>
      </section>

      {/* Comparison — editorial, typography-led, with a quiet interactive touch.
          Desktop: 3-column grid with a hover accent bar per row.
          Mobile: stacked labelled pairs instead of a cramped 3-col grid. */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 text-center text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#B9AF9F]">
            The comparison
          </div>

          <div className="relative rounded-2xl border border-[#ECE5D9] bg-white px-6 shadow-[0_1px_2px_rgba(31,28,24,0.03),0_24px_60px_-32px_rgba(31,28,24,0.14)] sm:px-14">
            <div className="pointer-events-none absolute right-12 top-14 bottom-14 hidden w-px bg-gradient-to-b from-transparent via-[#FF9933]/40 to-transparent sm:block" />

            {/* Column labels — desktop only */}
            <div className="hidden grid-cols-[0.55fr_1fr_1.15fr] gap-10 border-b border-[#E9E1D2] py-6 sm:grid">
              <div />
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#B9AF9F]">
                Generic Builders
              </div>
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#B4600F]">
                Counsellors of India
              </div>
            </div>

            {/* Rows — desktop: 3-col with hover accent; mobile: stacked pairs */}
            {ROWS.map((row, i) => (
              <div
                key={row[0]}
                className={`group relative -mx-6 px-6 transition-colors hover:bg-[#FDFBF7] sm:-mx-14 sm:px-14 ${i !== ROWS.length - 1 ? 'border-b border-[#F1EBE0]' : ''}`}
              >
                <span className="pointer-events-none absolute left-0 top-5 bottom-5 hidden w-[3px] rounded-full bg-[#FF9933] opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:block" />

                {/* Desktop row */}
                <div className="hidden grid-cols-[0.55fr_1fr_1.15fr] items-start gap-10 py-7 sm:grid">
                  <div className="pt-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#C2B9AB]">
                    {row[0]}
                  </div>
                  <div className="text-[13.5px] leading-relaxed text-[#ACA398]">{row[1]}</div>
                  <div
                    className="text-[17px] leading-snug text-[#1F1C18]"
                    style={{ fontFamily: "'Fraunces','Instrument Serif',serif" }}
                  >
                    {row[2]}
                  </div>
                </div>

                {/* Mobile row — stacked, clearly labelled */}
                <div className="space-y-3 py-6 sm:hidden">
                  <div className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#C2B9AB]">
                    {row[0]}
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-[3px] w-[52px] shrink-0 text-[9.5px] font-semibold uppercase tracking-wide text-[#B9AF9F]">
                      Generic
                    </span>
                    <span className="text-[13px] leading-relaxed text-[#ACA398]">{row[1]}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-[3px] w-[52px] shrink-0 text-[9.5px] font-semibold uppercase tracking-wide text-[#B4600F]">
                      COI
                    </span>
                    <span
                      className="text-[15.5px] leading-snug text-[#1F1C18]"
                      style={{ fontFamily: "'Fraunces','Instrument Serif',serif" }}
                    >
                      {row[2]}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why it matters — three distinct elevated tiles (not divided cells like
          the table above), with a soft ambient glow and a hover-lift so each
          point feels like its own premium moment rather than a repeat of the
          comparison card. */}
      <section className="relative overflow-hidden px-6 pb-24">
        <div className="pointer-events-none absolute left-1/2 top-8 h-[320px] w-[640px] -translate-x-1/2 rounded-full bg-[#FF9933] opacity-[0.05] blur-[100px]" />

        <div className="relative mx-auto max-w-5xl">
          <div className="mb-10 text-center text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#B9AF9F]">
            Why it matters
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {REASONS.map(({ icon: Icon, t, d }, i) => (
              <div
                key={t}
                className="group relative flex flex-col items-start gap-4 rounded-[22px] border border-[#ECE5D9] bg-white p-8 shadow-[0_1px_2px_rgba(31,28,24,0.03),0_16px_40px_-24px_rgba(31,28,24,0.12)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#F0D9B8] hover:shadow-[0_24px_48px_-20px_rgba(255,153,51,0.28)]"
              >
                <span className="absolute right-6 top-6 text-[26px] font-light leading-none text-[#F1EBE0]" style={{ fontFamily: "'Fraunces','Instrument Serif',serif" }}>
                  0{i + 1}
                </span>

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#FF9933]/15 to-[#FF9933]/5 text-[#B4600F] ring-1 ring-[#FF9933]/15 transition-colors duration-300 group-hover:from-[#FF9933]/25 group-hover:to-[#FF9933]/10">
                  <Icon size={19} strokeWidth={1.7} />
                </div>

                <div
                  className="text-[19px] leading-snug text-[#1F1C18]"
                  style={{ fontFamily: "'Fraunces','Instrument Serif',serif" }}
                >
                  {t}
                </div>
                <p className="text-[13.5px] leading-relaxed text-[#6E685F]">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — the closing moment. Same dark card language as the rest of the
          site, but with ambient glow (echoing the hero), an eyebrow for pacing,
          a bigger headline, and reassurance copy under the button. */}
      <section className="px-6 pb-24">
        <div className="relative mx-auto max-w-3xl overflow-hidden rounded-[32px] bg-[#1F1C18] p-10 text-center shadow-[0_32px_80px_-28px_rgba(31,28,24,0.55)] sm:p-16">
          <div className="pointer-events-none absolute -top-24 left-[-10%] h-[300px] w-[300px] rounded-full bg-[#FF9933] opacity-[0.16] blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-28 right-[-12%] h-[280px] w-[280px] rounded-full bg-[#456554] opacity-[0.18] blur-[100px]" />

          <div className="relative">
            <div className="mb-5 inline-flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#FFB866]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF9933]" />
              Ready when you are
            </div>

            <p
              className="mx-auto max-w-lg text-[26px] leading-[1.25] text-white sm:text-[32px]"
              style={{ fontFamily: "'Fraunces','Instrument Serif',serif" }}
            >
              See what a Counsellors of India website looks like for your practice.
            </p>

            <Link
              href="/signup"
              className="group mt-8 inline-flex items-center gap-2 rounded-full bg-[#FF9933] px-7 py-3.5 text-[14.5px] font-semibold text-white shadow-[0_16px_32px_-12px_rgba(255,153,51,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#E07A12] hover:shadow-[0_20px_40px_-12px_rgba(255,153,51,0.6)]"
            >
              List your practice
              <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>

            <p className="mt-4 text-[12.5px] text-white/45">Free to list. No credit card required.</p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
