import type { Metadata } from 'next'
import Link from 'next/link'
import SiteNav from '@/components/layout/SiteNav'
import SiteFooter from '@/components/layout/SiteFooter'
import { ArrowUpRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About — Counsellors of India',
  description:
    'Counsellors of India helps psychologists and therapists build a professional digital presence — website, bookings and payments in one place.',
}

const PRINCIPLES = [
  {
    n: '01',
    t: 'Built for one profession',
    d: 'We only serve mental health professionals. Not dentists, not lawyers. That focus shows in every feature we ship.',
  },
  {
    n: '02',
    t: 'Invisible complexity',
    d: 'The hard parts, availability logic, payment routing, mobile layouts, should be invisible. Simple on the surface, solid underneath.',
  },
  {
    n: '03',
    t: 'Honest defaults',
    d: 'No dark patterns. No upsell traps. If something costs money, we say so upfront. If a feature isn\'t ready, we don\'t ship it.',
  },
  {
    n: '04',
    t: 'The client matters too',
    d: 'The therapist is our customer. But their clients are who ultimately matter, so we design the booking experience for both.',
  },
]

const NUMBERS = [
  { n: '500+',  l: 'Therapists listed'   },
  { n: '10k+',  l: 'Sessions booked'    },
  { n: '6',     l: 'Template designs'   },
  { n: '< 5m',  l: 'To go live'         },
]

export default function AboutPage() {
  return (
    <div
      style={{
        background: '#F9F6F1',
        color: '#1C1814',
        fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
      }}
      className="flex min-h-screen flex-col"
    >
      <SiteNav />

      {/* ─────────────────────────────────────────────────────
          HERO
          Full-width newspaper-style masthead.
          One strong left-aligned H1, a thin rule, then
          a two-column paragraph + meta block below.
          No blobs. No gradient cards. No badges.
      ───────────────────────────────────────────────────── */}
      <section className="border-b" style={{ borderColor: '#DDD6CB' }}>
        <div className="mx-auto max-w-6xl px-6 pt-36 pb-20">

          {/* pre-label */}
          <p
            className="mb-10 text-[11px] font-semibold uppercase tracking-[0.25em]"
            style={{ color: '#9C9388' }}
          >
            About us
          </p>

          {/* large headline — intentionally ragged, not centered */}
          <h1
            className="text-[48px] font-bold leading-[1.05] tracking-[-0.03em] sm:text-[64px] lg:text-[80px] xl:text-[96px]"
            style={{ maxWidth: '14ch', color: '#1C1814' }}
          >
            We build the digital home for therapists.
          </h1>

          {/* thin divider */}
          <div className="my-12 h-px w-full" style={{ background: '#DDD6CB' }} />

          {/* two-col: body copy left, facts right */}
          <div className="grid gap-12 sm:grid-cols-[1fr_260px] lg:grid-cols-[1fr_320px]">

            {/* left — single punchy paragraph */}
            <div>
              <p
                className="text-[18px] leading-[1.85]"
                style={{ color: '#4A4540', maxWidth: '52ch' }}
              >
                Mental health professionals deserve more than a social media bio.
                We give them a full professional presence, a beautiful website,
                smart bookings, and integrated payments, in one place, with no
                technical knowledge required.
              </p>

              {/* CTA row — understated */}
              <div className="mt-10 flex flex-wrap items-center gap-8">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 text-[15px] font-semibold transition-opacity hover:opacity-60"
                  style={{ color: '#FF9933' }}
                >
                  List your practice
                  <ArrowUpRight size={15} strokeWidth={2.2} />
                </Link>
                <Link
                  href="/why-us"
                  className="text-[15px] font-semibold transition-opacity hover:opacity-60"
                  style={{ color: '#1C1814', textDecoration: 'underline', textDecorationColor: '#DDD6CB', textUnderlineOffset: '4px' }}
                >
                  Why us?
                </Link>
              </div>
            </div>

            {/* right — fact column, no cards, just labels + values */}
            <div className="divide-y" style={{ borderColor: '#DDD6CB', borderTop: '1px solid #DDD6CB' }}>
              {[
                { label: 'Founded',            value: '2026, Jaipur'                  },
                { label: 'Focus',              value: 'Mental health professionals'   },
                { label: 'Average setup time', value: 'Under 10 minutes'               },
              ].map(row => (
                <div key={row.label} className="flex items-baseline justify-between gap-4 py-3.5">
                  <span className="text-[12px] font-medium" style={{ color: '#9C9388' }}>{row.label}</span>
                  <span className="text-[13px] font-semibold" style={{ color: '#1C1814' }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────
          STORY
          Warm off-white section, full bleed.
          Two columns: left is the narrative, right is a
          large pull-quote — no card, just big type.
      ───────────────────────────────────────────────────── */}
      <section style={{ background: '#EDE8DF', borderBottom: '1px solid #DDD6CB' }}>
        <div className="mx-auto max-w-6xl px-6 py-24 lg:py-32">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">

            {/* narrative */}
            <div>
              <p
                className="mb-8 text-[11px] font-semibold uppercase tracking-[0.2em]"
                style={{ color: '#9C9388' }}
              >
                The problem we saw
              </p>
              <div className="space-y-6 text-[16px] leading-[1.9]" style={{ color: '#3A3530' }}>
                <p>
                  Across India, thousands of qualified psychologists were managing
                  their entire practice through WhatsApp, sending appointment
                  reminders manually, collecting fees via UPI screenshots, and hoping
                  clients remembered the session time.
                </p>
                <p>
                  Not because they didn't want to do better. But because every tool
                  available either cost too much, required a developer, or was built
                  for a different profession entirely.
                </p>
                <p>
                  So we built Counsellors of India. A platform where any therapist
                  can be live with a professional booking page in under five minutes.
                  No code. No designer. No monthly agency retainer.
                </p>
              </div>
            </div>

            {/* pull quote — large, no box, no card */}
            <div className="flex flex-col justify-center">
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-8"
                style={{ color: '#9C9388' }}
              >
                What we believe
              </p>

              {/* the quote itself — large serif-weight display text */}
              <p
                className="text-[28px] leading-[1.3] font-bold tracking-tight"
                style={{ color: '#1C1814', maxWidth: '18ch' }}
              >
                "We're not building websites. We're building trust."
              </p>

              <div className="mt-10 h-px w-16" style={{ background: '#B5AA9E' }} />

              {/* belief list — plain, no icons, no checkmarks */}
              <ul className="mt-8 space-y-4">
                {[
                  'A WhatsApp bio is not a professional presence.',
                  'Technology should reduce admin, not create it.',
                  'Simple and beautiful are not opposites.',
                  'Every therapist deserves to look as good as the best clinic in the city.',
                ].map((b, i) => (
                  <li
                    key={i}
                    className="text-[15px] leading-[1.7]"
                    style={{ color: '#4A4540', paddingLeft: '1.2em', textIndent: '-1.2em' }}
                  >
                    <span aria-hidden="true" style={{ color: '#1C1814' }}>•</span>{'  '}{b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────
          NUMBERS — horizontal strip
          Stark, no boxes, just big numbers with labels.
          Editorial, not infographic.
      ───────────────────────────────────────────────────── */}
      {/* <section style={{ borderBottom: '1px solid #DDD6CB' }}>
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
            {NUMBERS.map(({ n, l }) => (
              <div key={l}>
                <p
                  className="text-[44px] font-bold leading-none tracking-tight sm:text-[52px]"
                  style={{ color: '#FF9933' }}
                >
                  {n}
                </p>
                <p
                  className="mt-2 text-[13px] font-medium"
                  style={{ color: '#7A7268' }}
                >
                  {l}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* ─────────────────────────────────────────────────────
          PRINCIPLES
          Numbered list, three-column grid row per item.
          This is a table, not a card grid.
          Inspired by how design agencies present process.
      ───────────────────────────────────────────────────── */}
      <section style={{ borderBottom: '1px solid #DDD6CB' }}>
        <div className="mx-auto max-w-6xl px-6 py-24">

          <div className="mb-16 flex items-end justify-between gap-8">
            <h2
              className="text-[32px] font-bold tracking-tight sm:text-[40px]"
              style={{ color: '#1C1814' }}
            >
              How we work
            </h2>
            <p
              className="hidden max-w-xs text-right text-[13px] leading-relaxed sm:block"
              style={{ color: '#7A7268' }}
            >
              Four principles that guide every product decision we make from design to support.
            </p>
          </div>

          <div style={{ borderTop: '1px solid #DDD6CB' }}>
            {PRINCIPLES.map(({ n, t, d }) => (
              <div
                key={n}
                className="grid gap-6 py-10 sm:grid-cols-[48px_1fr_2fr] sm:items-start sm:gap-12"
                style={{ borderBottom: '1px solid #DDD6CB' }}
              >
                <span
                  className="text-[12px] font-semibold tabular-nums"
                  style={{ color: '#C0B8AE', paddingTop: '3px' }}
                >
                  {n}
                </span>
                <p
                  className="text-[16px] font-bold leading-snug"
                  style={{ color: '#1C1814' }}
                >
                  {t}
                </p>
                <p
                  className="text-[15px] leading-[1.8]"
                  style={{ color: '#5A534C' }}
                >
                  {d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────
          VISION
          Plain. Left-aligned. Large type.
          No card, no gradient. Just a statement and a CTA.
      ───────────────────────────────────────────────────── */}
      <section>
        <div className="mx-auto max-w-6xl px-6 py-24 lg:py-32">
          <p
            className="mb-8 text-[11px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: '#9C9388' }}
          >
            Where we're going
          </p>

          <p
            className="text-[32px] font-bold leading-[1.2] tracking-tight sm:text-[44px] lg:text-[52px]"
            style={{ color: '#1C1814', maxWidth: '20ch' }}
          >
            Every therapist in India, professional, visible, and bookable online.
          </p>

          <p
            className="mt-8 text-[16px] leading-[1.85]"
            style={{ color: '#5A534C', maxWidth: '52ch' }}
          >
            We'll keep building. New templates, better booking flows, smarter
            availability tools, everything a growing practice needs, without the
            complexity it doesn't.
          </p>

          <div
            className="mt-12 flex flex-wrap items-center gap-10 pt-12"
            style={{ borderTop: '1px solid #DDD6CB' }}
          >
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 text-[15px] font-semibold transition-opacity hover:opacity-60"
              style={{ color: '#FF9933' }}
            >
              List your practice
              <ArrowUpRight size={15} strokeWidth={2.2} />
            </Link>

          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
