'use client'

import { useState } from 'react'
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
      'Preview your website. Once you\u2019re happy, publish it and start sharing your personal link with clients.',
      'Your practice is now live.',
    ],
  },
]

export default function OnboardingSteps() {
  const [current, setCurrent] = useState(1)
  const step = STEPS.find(s => s.n === current)!
  const isFirst = current === 1
  const isLast = current === STEPS.length

  function go(n: number) {
    setCurrent(Math.min(STEPS.length, Math.max(1, n)))
  }

  return (
    <div className="mx-auto max-w-5xl px-6">
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

        {/* ── DESTINATION CARD for the current stop ───────────────────── */}
        <div
          key={current}
          className="relative flex min-h-[420px] flex-col rounded-3xl border border-[#ECE5D9] bg-white p-8 shadow-[0_1px_2px_rgba(31,28,24,0.04),0_20px_50px_-24px_rgba(31,28,24,0.14)] animate-[stopfade_.4s_ease] sm:min-h-[460px] sm:p-10"
        >
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[#B4600F]">
              <MapPin size={13} /> Stop {step.n} of {STEPS.length}
            </div>
            <h3
              className="mb-5 text-[22px] leading-snug text-[#1F1C18] sm:text-[26px]"
              style={{ fontFamily: 'var(--font-jakarta)' }}
            >
              {step.title}
            </h3>

            {step.intro && <p className="mb-2.5 text-[14px] font-medium text-[#1F1C18]">{step.intro}</p>}

            {step.list && (
              <ul className="mb-4 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                {step.list.map(item => (
                  <li key={item} className="flex items-center gap-2 text-[14px] text-[#4A453D]">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF9933]" />
                    {item}
                  </li>
                ))}
              </ul>
            )}

            {step.body.map((p, i) => (
              <p key={i} className="mb-2 text-[14.5px] leading-relaxed text-[#6E685F] last:mb-0">
                {p}
              </p>
            ))}

            {step.highlight && (
              <div className="mt-5 rounded-xl border border-[#ECE5D9] bg-[#FAF7F2] p-4">
                <div className="mb-1 text-[14px] font-semibold text-[#1F1C18]">{step.highlight.t}</div>
                <p className="text-[13.5px] leading-relaxed text-[#6E685F]">{step.highlight.d}</p>
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-[#ECE5D9] pt-6">
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

      <style jsx>{`
        @keyframes stopfade {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
