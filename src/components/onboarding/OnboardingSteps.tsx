'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check, MapPin } from 'lucide-react'

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
      <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[#B4600F]">
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
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF9933]" />
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

export default function OnboardingSteps() {
  const [current, setCurrent] = useState(1)
  const [reducedMotion, setReducedMotion] = useState(false)
  const isFirst = current === 1
  const isLast = current === STEPS.length

  const wrapperRef = useRef<HTMLDivElement>(null)
  const rafId = useRef<number | null>(null)

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  // ── Pin-and-scrub: the wrapper below is tall (STEPS.length × 100vh). Its
  // inner panel is `position: sticky; top: X`, so as long as you're scrolling
  // through that tall region the panel stays visually locked on screen — the
  // "main page" doesn't move — while we read how far into that region the
  // window has scrolled and swap which step is shown. Once you scroll past
  // the wrapper (or back above it), it's ordinary page scroll again. No
  // preventDefault/wheel-hijacking needed — native scroll does the locking.
  useEffect(() => {
    if (reducedMotion) return

    function updateFromScroll() {
      const wrapper = wrapperRef.current
      if (!wrapper) return
      const total = wrapper.offsetHeight - window.innerHeight
      if (total <= 0) return
      const rectTop = wrapper.getBoundingClientRect().top
      const progress = Math.min(1, Math.max(0, -rectTop / total))
      const idx = Math.min(STEPS.length - 1, Math.floor(progress * STEPS.length))
      setCurrent(idx + 1)
    }

    function onScroll() {
      if (rafId.current) cancelAnimationFrame(rafId.current)
      rafId.current = requestAnimationFrame(updateFromScroll)
    }

    updateFromScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [reducedMotion])

  // Rail clicks / Back-Next: scroll the window to the middle of that step's
  // slice of the wrapper's scroll range, so the sticky panel lands on it.
  const go = useCallback(
    (n: number) => {
      const target = Math.min(STEPS.length, Math.max(1, n))

      if (reducedMotion) {
        setCurrent(target)
        return
      }

      const wrapper = wrapperRef.current
      if (!wrapper) return
      const total = wrapper.offsetHeight - window.innerHeight
      const wrapperTop = wrapper.getBoundingClientRect().top + window.scrollY
      const sliceProgress = (target - 0.5) / STEPS.length
      window.scrollTo({ top: wrapperTop + sliceProgress * total, behavior: 'smooth' })
    },
    [reducedMotion]
  )

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr] lg:items-start lg:gap-10">
        {/* ── VERTICAL RAIL ─────────────────────────────────────────── */}
        <div className="relative lg:sticky lg:top-28">
          {/* connecting line */}
          <div className="absolute left-5 top-5 bottom-5 w-px bg-[#E3D9C8]" />
          <div
            className="absolute left-5 top-5 w-px bg-[#FF9933] transition-all duration-500"
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
                          ? 'border-[#FF9933] bg-[#FF9933] text-white shadow-[0_0_0_5px_rgba(255,153,51,0.16)]'
                          : done
                          ? 'border-[#FF9933] bg-white text-[#FF9933]'
                          : 'border-[#E3D9C8] bg-white text-[#B7AC98] group-hover:border-[#FF9933]/50'
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

        {/* ── RIGHT COLUMN ─────────────────────────────────────────── */}
        {reducedMotion ? (
          // Reduced-motion fallback: no scroll-jack, just a normal stacked list.
          <div className="flex flex-col gap-6">
            {STEPS.map(s => (
              <div
                key={s.n}
                className="rounded-3xl border border-[#ECE5D9] bg-white p-8 shadow-[0_1px_2px_rgba(31,28,24,0.04),0_20px_50px_-24px_rgba(31,28,24,0.14)] sm:p-10"
              >
                <StepBody s={s} />
              </div>
            ))}
          </div>
        ) : (
          <div ref={wrapperRef} className="relative" style={{ height: `${STEPS.length * 100}vh` }}>
            <div className="sticky top-[12vh] h-[75vh] max-h-[640px] overflow-hidden rounded-3xl border border-[#ECE5D9] bg-white shadow-[0_1px_2px_rgba(31,28,24,0.04),0_20px_50px_-24px_rgba(31,28,24,0.14)]">
              <div className="relative h-full">
                {STEPS.map(s => (
                  <div
                    key={s.n}
                    aria-hidden={s.n !== current}
                    className="absolute inset-0 flex flex-col overflow-y-auto p-8 pb-24 transition-opacity duration-300 ease-out sm:p-10 sm:pb-28"
                    style={{
                      opacity: s.n === current ? 1 : 0,
                      pointerEvents: s.n === current ? 'auto' : 'none',
                    }}
                  >
                    <div className="flex-1">
                      <StepBody s={s} />
                    </div>
                    {s.n === STEPS.length && (
                      <p className="mt-4 text-[11px] text-[#B7AC98]">Keep scrolling to return to the page.</p>
                    )}
                  </div>
                ))}
              </div>

              {/* pinned fallback controls — scroll is primary, these are secondary */}
              <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between border-t border-[#ECE5D9] bg-white p-6 sm:px-10">
                <button
                  type="button"
                  onClick={() => go(current - 1)}
                  disabled={isFirst}
                  className="flex items-center gap-1.5 rounded-full border border-[#ECE5D9] bg-white px-5 py-2.5 text-[13.5px] font-semibold text-[#1F1C18] transition hover:border-[#FF9933]/40 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeft size={14} /> Previous stop
                </button>

                {isLast ? (
                  <Link
                    href="/signup"
                    className="flex items-center gap-1.5 rounded-full bg-[#FF9933] px-5 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-[#E07A12]"
                  >
                    Create your account <ArrowRight size={14} />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => go(current + 1)}
                    className="flex items-center gap-1.5 rounded-full bg-[#FF9933] px-5 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-[#E07A12]"
                  >
                    Next stop <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
