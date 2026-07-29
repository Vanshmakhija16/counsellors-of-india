import type { Metadata } from 'next'
import Link from 'next/link'
import SiteNav from '@/components/layout/SiteNav'
import SiteFooter from '@/components/layout/SiteFooter'
import { ArrowUpRight, ArrowRight, Check, X } from 'lucide-react'
import { getCurrentTenant } from '@/lib/tenants/server'

export const metadata: Metadata = {
  title: 'Why Us',
  description:
    'See how a platform built for mental health professionals compares to piecing your practice together yourself.',
}

const ROWS = [
  ['Setup', 'Purchase a domain separately', 'Professional website ready from day one'],
  ['Learning curve', 'Learn how to build it yourself, or hire a developer', 'Guided setup in just a few minutes'],
  ['Cost', 'High upfront development costs', 'Affordable plans designed for therapists'],
  ['Tools', 'Website, bookings and payments need different tools', 'Everything managed in one platform'],
  ['Templates', 'Generic templates built for every industry', 'Templates created exclusively for mental health professionals'],
  ['Maintenance', 'Ongoing maintenance and plugin management', "We handle the technical side so you don't have to"],
]

const REASONS = [
  {
    n: '01',
    t: 'Save time & money',
    d: 'One platform instead of five separate bills, five separate logins, and five separate things that can break.',
  },
  {
    n: '02',
    t: 'Built for the profession',
    d: 'Not a generic template stretched to fit. Every layout, field and flow is designed around how therapists actually work.',
  },
  {
    n: '03',
    t: 'Focus on your clients',
    d: "We handle the tech, the hosting and the updates. You handle the practice, that's the part only you can do.",
  },
]

export default async function WhyUsPage() {
  const tenant = await getCurrentTenant()
  return (
    <div
      style={{
        background: '#F9F6F1',
        color: '#1C1814',
        fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
      }}
      className="flex min-h-screen flex-col"
    >
      <SiteNav tenant={{ brandName: tenant.brandName }} />

      {/* ─────────────────────────────────────────────────────
          HERO
          Same design tokens as /about (palette, type, hairline
          rules) but its own signature: the headline strikes
          through the old way inline, and the tools-you-replace
          strip IS the visual, not a fact column. No blobs.
          No gradient cards. No badges.
      ───────────────────────────────────────────────────── */}
      <section className="border-b" style={{ borderColor: '#DDD6CB' }}>
        <div className="mx-auto max-w-6xl px-6 pt-36 pb-20">

          <p
            className="mb-10 text-[11px] font-semibold uppercase tracking-[0.25em]"
            style={{ color: '#9C9388' }}
          >
            Why us
          </p>

          <h1
            className="text-[44px] font-bold leading-[1.1] tracking-[-0.03em] sm:text-[58px] lg:text-[72px] xl:text-[80px]"
            style={{ maxWidth: '18ch', color: '#1C1814' }}
          >
            Stop paying for{' '}
            <span style={{ color: '#FFB866', textDecoration: 'line-through', textDecorationColor: '#FFB866', textDecorationThickness: '2px' }}>
              five different tools.
            </span>
          </h1>

          <p
            className="mt-8 text-[18px] leading-[1.85]"
            style={{ color: '#4A4540', maxWidth: '50ch' }}
          >
            Domain, hosting, a website builder, a booking tool, a payment
            gateway — replaced by one platform, built only for mental
            health professionals.
          </p>

          <div className="my-12 h-px w-full" style={{ background: '#DDD6CB' }} />

          {/* signature strip — the actual swap, laid out as the hero's visual */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-3">
              {['Domain', 'Hosting', 'Website builder', 'Booking tool', 'Payment gateway'].map((tool, i, arr) => (
                <span key={tool} className="flex items-center gap-2.5">
                  <span
                    className="text-[14px] font-semibold"
                    style={{ color: '#C97A1F', textDecoration: 'line-through', textDecorationColor: '#FF9933' }}
                  >
                    {tool}
                  </span>
                  {i < arr.length - 1 && (
                    <span className="text-[13px] font-semibold" style={{ color: '#FF9933' }}>+</span>
                  )}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <ArrowRight size={16} strokeWidth={2.2} style={{ color: '#FF9933' }} />
              <span className="text-[15px] font-bold" style={{ color: '#1C1814' }}>
                One {tenant.brandName} account
              </span>
            </div>
          </div>

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
              href="/about"
              className="text-[15px] font-semibold transition-opacity hover:opacity-60"
              style={{ color: '#1C1814', textDecoration: 'underline', textDecorationColor: '#DDD6CB', textUnderlineOffset: '4px' }}
            >
              Our story
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────
          COMPARISON
          Signature move: a soft saffron "lane" runs continuously
          down the winning column — rounded top and bottom, one
          connected shape rather than a stack of boxes — so the
          eye always knows where the answer lives. Typographic
          asymmetry (bigger/bolder on the right, plainer on the
          left) does the rest. No card, no pill badge.
      ───────────────────────────────────────────────────── */}
      <section style={{ background: '#EDE8DF', borderBottom: '1px solid #DDD6CB' }}>
        <div className="mx-auto max-w-6xl px-6 py-24 lg:py-32">

          <div className="mb-16 flex items-end justify-between gap-8">
            <h2
              className="text-[32px] font-bold tracking-tight sm:text-[40px]"
              style={{ color: '#1C1814' }}
            >
              The comparison
            </h2>
            <p
              className="hidden max-w-xs text-right text-[13px] leading-relaxed sm:block"
              style={{ color: '#7A7268' }}
            >
              Same outcome, two different paths. Here's what changes when the platform is built for the job.
            </p>
          </div>

          {/* column labels — desktop only. The right cell starts the lane
              with a rounded top, matching the rows below it. */}
          <div
            className="hidden grid-cols-[140px_1fr_1.15fr] items-stretch gap-12 border-t sm:grid"
            style={{ borderColor: '#DDD6CB' }}
          >
            <span />
            <span className="self-center py-4 text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: '#8A7355' }}>
              Generic builders
            </span>
            <div
              className="flex items-center gap-2 rounded-t-2xl py-4 pl-8"
              style={{ background: 'rgba(255,153,51,0.08)' }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#FF9933' }} />
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: '#B4600F' }}>
                {tenant.brandName}
              </span>
            </div>
          </div>

          <div>
            {ROWS.map(([label, oldWay, ourWay], i) => {
              const isLast = i === ROWS.length - 1
              return (
                <div
                  key={label}
                  className="grid gap-3 sm:grid-cols-[140px_1fr_1.15fr] sm:items-stretch sm:gap-12"
                  style={{ borderBottom: isLast ? 'none' : '1px solid #DDD6CB' }}
                >
                  <div className="pt-6 text-[11px] font-semibold uppercase tracking-[0.1em] sm:pb-6" style={{ color: '#B4600F' }}>
                    {label}
                  </div>

                  <div className="flex items-start gap-2.5 pb-3 sm:pt-6 sm:pb-6">
                    <X size={14} strokeWidth={2.25} className="mt-[3px] shrink-0" style={{ color: '#C97A1F' }} />
                    <span className="text-[14.5px] leading-[1.7]" style={{ color: '#3A3530' }}>{oldWay}</span>
                  </div>

                  <div
                    className={`mb-3 flex items-start gap-3 rounded-xl px-4 py-3.5 sm:mb-0 sm:rounded-none sm:px-8 sm:py-6 ${isLast ? 'sm:rounded-b-2xl' : ''}`}
                    style={{ background: 'rgba(255,153,51,0.08)' }}
                  >
                    <Check size={15} strokeWidth={2.75} className="mt-[3px] shrink-0" style={{ color: '#FF9933' }} />
                    <span className="text-[15.5px] font-semibold leading-[1.7]" style={{ color: '#1C1814' }}>{ourWay}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* verdict — punctuates the table instead of letting it trail off */}
          <div className="mt-14 flex flex-col gap-2 border-t pt-8 sm:flex-row sm:items-baseline sm:gap-5" style={{ borderColor: '#DDD6CB' }}>
            <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: '#9C9388' }}>
              Net result
            </span>
            <p className="text-[18px] font-semibold leading-snug" style={{ color: '#1C1814' }}>
              One bill, one login, one platform built for the work you actually do.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────
          WHY IT MATTERS
          Numbered list, identical construction to the
          Principles table on /about, for full visual parity.
      ───────────────────────────────────────────────────── */}
      <section style={{ borderBottom: '1px solid #DDD6CB' }}>
        <div className="mx-auto max-w-6xl px-6 py-24">

          <div className="mb-16 flex items-end justify-between gap-8">
            <h2
              className="text-[32px] font-bold tracking-tight sm:text-[40px]"
              style={{ color: '#1C1814' }}
            >
              Why it matters
            </h2>
            <p
              className="hidden max-w-xs text-right text-[13px] leading-relaxed sm:block"
              style={{ color: '#7A7268' }}
            >
              Three reasons therapists choose to build here instead of somewhere generic.
            </p>
          </div>

          <div style={{ borderTop: '1px solid #DDD6CB' }}>
            {REASONS.map(({ n, t, d }) => (
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
                <p className="text-[16px] font-bold leading-snug" style={{ color: '#1C1814' }}>
                  {t}
                </p>
                <p className="text-[15px] leading-[1.8]" style={{ color: '#5A534C' }}>
                  {d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────
          CTA
          Plain closing statement, same construction as the
          Vision section on /about. No dark card, no glow.
      ───────────────────────────────────────────────────── */}
      <section>
        <div className="mx-auto max-w-6xl px-6 py-24 lg:py-32">
          <p
            className="mb-8 text-[11px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: '#9C9388' }}
          >
            Ready when you are
          </p>

          <p
            className="text-[32px] font-bold leading-[1.2] tracking-tight sm:text-[44px] lg:text-[52px]"
            style={{ color: '#1C1814', maxWidth: '20ch' }}
          >
            See what a {tenant.brandName} website looks like for your practice.
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

      <SiteFooter tenant={{ brandName: tenant.brandName, footerTagline: tenant.footerTagline }} />
    </div>
  )
}
