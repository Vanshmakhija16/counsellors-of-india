'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check, MapPin } from 'lucide-react'

// Accent colors for the guide. Defaults are India's original saffron values,
// so any call site that doesn't pass `colors` renders exactly what it did
// before. Other tenants (e.g. America) pass their own brand colors.
export interface OnboardingStepsColors {
  brand: string   // dots, rail line, active step, buttons
  hover: string   // button hover
  label: string   // "Stop n of 7" label
}

const DEFAULT_COLORS: OnboardingStepsColors = {
  brand: '#FF9933',
  hover: '#E07A12',
  label: '#B4600F',
}

const STEPS = [
  {
    n: 1,
    label: 'Create Account',
    title: 'Create your account',
    body: ['Sign up using your email address and verify your account.', 'Your dashboard is now ready.'],
  },
  {
    n: 2,
    label: 'Complete Profile',
    title: 'Complete your professional profile',
    intro: 'Add the information your clients want to know.',
    list: [
      'Professional photograph',
      'Qualifications',
      'Registration details',
      'Areas of expertise',
      'Languages',
      'Consultation modes',
      'Session fee',
      'Professional bio',
    ],
    body: ['A complete profile helps build trust and improves discoverability.'],
  },
  {
    n: 3,
    label: 'Choose Template',
    title: 'Choose your website template',
    body: [
      'Select a professionally designed template that reflects your practice.',
      'No coding. No design experience. Just pick the one that feels like you.',
    ],
  },
  {
    n: 4,
    label: 'Personalize',
    title: 'Personalize your website',
    intro: 'Customize your website with:',
    list: ['About Me', 'Services', 'Specialisations', 'Therapy Approach', 'FAQs', 'Contact Information'],
    body: ['Everything can be updated anytime.'],
  },
  {
    n: 5,
    label: 'Set Availability',
    title: 'Set your availability',
    body: [
      'Choose your consultation schedule. Clients will only be able to book during the time slots you make available.',
    ],
    highlight: {
      t: 'Enable online bookings',
      d: 'Allow clients to book appointments directly through your website. Appointments are confirmed instantly and appear in your dashboard automatically.',
    },
  },
  {
    n: 6,
    label: 'Connect Payments',
    title: 'Connect payments',
    body: [
      'Accept payments securely before every session through integrated online payment options.',
      'No reminders. No payment follow-ups. Just a seamless booking experience.',
    ],
  },
  {
    n: 7,
    label: 'Publish Website',
    title: 'Publish your website',
    body: [
      "Preview your website. Once you're happy, publish it and start sharing your personal link with clients.",
      'Your practice is now live.',
    ],
  },
]

function StepBody({ s }: { s: (typeof STEPS)[number] }) {
  return (
    <>
      <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--ob-label)]">
        <MapPin size={13} /> Stop {s.n} of {STEPS.length}
      </div>
      <h3
        className="mb-5 text-[22px] leading-snug text-[#1F1C18] sm:text-[26px]"
        style={{ fontFamily: 'var(--font-jakarta)' }}
      >
        {s.title}
      </h3>

      {s.intro && <p className="mb-2.5 text-[14px] font-medium text-[#1F1C18]">{s.intro}</p>}

      {s.list && (
        <ul className="mb-4 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
          {s.list.map(item => (
            <li key={item} className="flex items-center gap-2 text-[14px] text-[#4A453D]">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--ob-brand)]" />
              {item}
            </li>
          ))}
        </ul>
      )}

      {s.body.map((p, bi) => (
        <p key={bi} className="mb-2 text-[14.5px] leading-relaxed text-[#6E685F] last:mb-0">
          {p}
        </p>
      ))}

      {s.highlight && (
        <div className="mt-5 rounded-xl border border-[#ECE5D9] bg-[#FAF7F2] p-4">
          <div className="mb-1 text-[14px] font-semibold text-[#1F1C18]">{s.highlight.t}</div>
          <p className="text-[13.5px] leading-relaxed text-[#6E685F]">{s.highlight.d}</p>
        </div>
      )}
    </>
  )
}

export default function OnboardingSteps({ colors = DEFAULT_COLORS }: { colors?: OnboardingStepsColors } = {}) {
  const [current, setCurrent] = useState(1)
  const [reducedMotion, setReducedMotion] = useState(false)
  const isFirst = current === 1
  const isLast = current === STEPS.length

  const scrollerRef = useRef<HTMLDivElement>(null)
  const rafId = useRef<number | null>(null)

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [])

  // ── The white box is its own scroll container. Scrolling with the mouse
  // wheel / trackpad / touch while the pointer is over it moves between
  // steps INSIDE the box (each step snaps into place) — the page behind it
  // does not move. Once you reach the first/last step, any further scroll
  // naturally continues on the page (normal scroll chaining), so nothing is
  // ever trapped. No wheel-hijacking or scroll-locking involved.
  const onScroll = useCallback(() => {
    if (rafId.current) cancelAnimationFrame(rafId.current)
    rafId.current = requestAnimationFrame(() => {
      const el = scrollerRef.current
      if (!el) return
      const kids = Array.from(el.children) as HTMLElement[]
      let best = 0
      let bestDist = Infinity
      kids.forEach((kid, i) => {
        const dist = Math.abs(kid.offsetTop - el.scrollTop)
        if (dist < bestDist) {
          bestDist = dist
          best = i
        }
      })
      setCurrent(best + 1)
    })
  }, [])

  // Rail clicks / Previous-Next: scroll the box (not the page) to that step.
  const go = useCallback(
    (n: number) => {
      const el = scrollerRef.current
      if (!el) return
      const target = Math.min(STEPS.length, Math.max(1, n))
      const kid = el.children[target - 1] as HTMLElement | undefined
      if (!kid) return
      el.scrollTo({ top: kid.offsetTop, behavior: reducedMotion ? 'auto' : 'smooth' })
    },
    [reducedMotion]
  )

  return (
    <div
      className="mx-auto max-w-5xl px-6 py-16"
      style={{
        ['--ob-brand' as string]: colors.brand,
        ['--ob-hover' as string]: colors.hover,
        ['--ob-label' as string]: colors.label,
      } as React.CSSProperties}
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr] lg:items-start lg:gap-10">
        {/* ── VERTICAL RAIL ─────────────────────────────────────────── */}
        <div className="relative">
          {/* connecting line */}
          <div className="absolute left-5 top-5 bottom-5 w-px bg-[#E3D9C8]" />
          <div
            className="absolute left-5 top-5 w-px bg-[color:var(--ob-brand)] transition-all duration-500"
            style={{
              height:
                STEPS.length > 1 ? `calc((100% - 2.5rem) * ${(current - 1) / (STEPS.length - 1)})` : '0px',
            }}
          />

          <ol className="relative flex flex-col gap-1">
            {STEPS.map(s => {
              const done = s.n < current
              const active = s.n === current
              return (
                <li key={s.n}>
                  <button
                    type="button"
                    onClick={() => go(s.n)}
                    className={`group flex w-full items-center gap-4 rounded-2xl px-2 py-2.5 text-left transition-colors ${
                      active
                        ? 'bg-white shadow-[0_1px_2px_rgba(31,28,24,0.04),0_12px_28px_-16px_rgba(31,28,24,0.18)]'
                        : 'hover:bg-white/60'
                    }`}
                  >
                    <span
                      className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-[13px] font-bold transition-all duration-300 ${
                        active
                          ? 'border-[color:var(--ob-brand)] bg-[color:var(--ob-brand)] text-white shadow-[0_0_0_5px_color-mix(in_srgb,var(--ob-brand)_16%,transparent)]'
                          : done
                          ? 'border-[color:var(--ob-brand)] bg-white text-[color:var(--ob-brand)]'
                          : 'border-[#E3D9C8] bg-white text-[#B7AC98] group-hover:border-[color:color-mix(in_srgb,var(--ob-brand)_50%,transparent)]'
                      }`}
                    >
                      {done ? <Check size={16} /> : s.n}
                    </span>
                    <span className="flex flex-col">
                      <span
                        className={`text-[13.5px] font-semibold leading-tight ${
                          active ? 'text-[#1F1C18]' : done ? 'text-[#6E685F]' : 'text-[#A89F94]'
                        }`}
                      >
                        {s.label}
                      </span>
                      <span className="text-[11px] text-[#B7AC98]">
                        Step {s.n} of {STEPS.length}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
        </div>

        {/* ── RIGHT COLUMN: the scrollable box ───────────────────────── */}
        <div className="flex h-[75vh] max-h-[640px] min-h-[420px] flex-col overflow-hidden rounded-3xl border border-[#ECE5D9] bg-white shadow-[0_1px_2px_rgba(31,28,24,0.04),0_20px_50px_-24px_rgba(31,28,24,0.14)]">
          <div
            ref={scrollerRef}
            onScroll={onScroll}
            tabIndex={0}
            role="region"
            aria-label="Onboarding steps. Scroll to move between steps."
            className="relative min-h-0 flex-1 snap-y snap-mandatory overflow-y-auto outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {STEPS.map(s => (
              <div key={s.n} className="flex min-h-full snap-start snap-always flex-col p-8 sm:p-10">
                <div className="flex-1">
                  <StepBody s={s} />
                </div>
                {s.n === STEPS.length && (
                  <p className="mt-4 text-[11px] text-[#B7AC98]">Keep scrolling to return to the page.</p>
                )}
              </div>
            ))}
          </div>

          {/* controls — scrolling inside the box is primary, these are secondary */}
          <div className="z-10 flex shrink-0 items-center justify-between border-t border-[#ECE5D9] bg-white p-6 sm:px-10">
            <button
              type="button"
              onClick={() => go(current - 1)}
              disabled={isFirst}
              className="flex items-center gap-1.5 rounded-full border border-[#ECE5D9] bg-white px-5 py-2.5 text-[13.5px] font-semibold text-[#1F1C18] transition hover:border-[color:color-mix(in_srgb,var(--ob-brand)_40%,transparent)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft size={14} /> Previous stop
            </button>

            {isLast ? (
              <Link
                href="/signup"
                className="flex items-center gap-1.5 rounded-full bg-[color:var(--ob-brand)] px-5 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-[color:var(--ob-hover)]"
              >
                Create your account <ArrowRight size={14} />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => go(current + 1)}
                className="flex items-center gap-1.5 rounded-full bg-[color:var(--ob-brand)] px-5 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-[color:var(--ob-hover)]"
              >
                Next stop <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
