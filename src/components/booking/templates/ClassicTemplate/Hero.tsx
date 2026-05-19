'use client'

import type { RefObject } from 'react'
import type { TherapistProfile } from '../templateUtils'
import { getAvailableDays } from '../templateUtils'

interface HeroProps {
  therapist: TherapistProfile
  heroLoaded: boolean
  heroRef: RefObject<HTMLElement | null>
}

/* ──────────────────────────────────────────────────────────────
   PALETTE (page-wide, 4 colors only)
   --ivory   #efe7d6   page background
   --ink     #1a1a18   text + dark surface
   --terra   #b46b50   single warm accent
   --mute    #6b6056   secondary text only
   ────────────────────────────────────────────────────────────── */

export default function Hero({ therapist, heroLoaded, heroRef }: HeroProps) {
  const availableDays = getAvailableDays(therapist.availability, therapist.sessionDuration)
  const nextDay = availableDays.find((d) => d.slots.length > 0) ?? availableDays[0]

  function scrollToContact() {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
  }

  const yearsBadge =
    (therapist.experience ?? 0) > 0 ? `EST. ${new Date().getFullYear() - (therapist.experience ?? 0)}` : null

  // Smart italic split — italicize only the most personal half of the tagline
  // so the italic does rhetorical work instead of being the default.
  const tagline = therapist.tagline?.trim() ?? ''
  const splitPoint = tagline.indexOf(' to ') > 0 ? tagline.indexOf(' to ') + 1 : Math.floor(tagline.length * 0.55)
  const taglineHead = tagline.slice(0, splitPoint)
  const taglineTail = tagline.slice(splitPoint)

  return (
    <section
      id="home"
      ref={heroRef}
      className={`relative overflow-hidden bg-[#efe7d6] pt-32 pb-28 px-6 lg:px-12 lg:pt-44 lg:pb-36 transition-all duration-1000 ${
        heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="relative z-10 mx-auto max-w-[1180px]">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">

          {/* ─────────── LEFT — editorial copy ─────────── */}
          <div className="order-2 lg:order-1">

            {/* eyebrow — short bar, true bullet, generous tracking */}
            <div className="flex items-center gap-3">
              <span className="h-[1.5px] w-6 bg-[#b46b50]" />
              <p
                className="text-[10.5px] font-medium uppercase text-[#b46b50]"
                style={{ letterSpacing: '0.34em', fontFamily: 'var(--font-dm-sans), sans-serif' }}
              >
                {therapist.credentials || 'Psychotherapy Practice'}
                {yearsBadge && (
                  <>
                    <span className="mx-2 opacity-60">•</span>
                    {yearsBadge}
                  </>
                )}
              </p>
            </div>

            {/* HEADLINE — monumental, single voice (Fraunces) */}
            <h1
              className="mt-14 text-[56px] leading-[0.96] tracking-[-0.025em] text-[#1a1a18] lg:text-[96px]"
              style={{ fontFamily: 'var(--font-fraunces), serif', fontWeight: 300 }}
            >
              {therapist.name}
            </h1>

            {/* TAGLINE — italic only on the second half (rhetorical italic) */}
            {tagline && (
              <p
                className="mt-8 max-w-[460px] text-[18px] leading-[1.55] text-[#3a3128] lg:text-[20px]"
                style={{ fontFamily: 'var(--font-fraunces), serif', fontWeight: 400 }}
              >
                {taglineHead}
                <em className="not-italic">
                  <span style={{ fontStyle: 'italic' }} className="text-[#b46b50]">
                    {taglineTail}
                  </span>
                </em>
              </p>
            )}

            {/* generous breathing room before action block */}
            <div className="mt-16 flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] text-[#6b6056]">
              {therapist.fee && (
                <span>
                  <span className="text-[#1a1a18]">₹{therapist.fee.toLocaleString('en-IN')}</span>
                  <span className="ml-1">/ {therapist.sessionDuration} min</span>
                </span>
              )}
              {therapist.location && (
                <>
                  <span className="h-[3px] w-[3px] rounded-full bg-[#b46b50]" />
                  <span>{therapist.location}</span>
                </>
              )}
              {therapist.languages && therapist.languages.length > 0 && (
                <>
                  <span className="h-[3px] w-[3px] rounded-full bg-[#b46b50]" />
                  <span>{therapist.languages.join(' · ')}</span>
                </>
              )}
            </div>

            {/* CTAs — mass + ghost, identical height, opposite weight, true ↗ arrow */}
            <div className="mt-10 flex flex-wrap items-center gap-7">
              <button
                onClick={scrollToContact}
                className="group flex h-[54px] items-center gap-3 rounded-full bg-[#1a1a18] px-8 text-[12px] font-medium text-[#efe7d6] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#000] hover:shadow-[0_16px_32px_-12px_rgba(26,26,24,0.45)]"
                style={{ letterSpacing: '0.02em', fontFamily: 'var(--font-dm-sans), sans-serif' }}
              >
                Begin the conversation
                <span className="text-[14px] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  ↗
                </span>
              </button>
              <button
                onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-[12px] font-medium text-[#1a1a18] underline-offset-[6px] transition-colors duration-300 hover:text-[#b46b50] hover:underline"
                style={{ letterSpacing: '0.02em', fontFamily: 'var(--font-dm-sans), sans-serif' }}
              >
                Read the philosophy
              </button>
            </div>

            {/* Next opening — quiet, well below CTAs */}
            {nextDay && nextDay.slots.length > 0 && (
              <p className="mt-12 text-[11px] uppercase text-[#6b6056]" style={{ letterSpacing: '0.22em' }}>
                <span className="relative mr-2 inline-flex h-1.5 w-1.5 translate-y-[1px]">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#b46b50] opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#b46b50]" />
                </span>
                Next opening · {nextDay.label.toLowerCase() === 'today' ? 'Today' : nextDay.label}
                {' · '}
                {nextDay.slots[0]}
              </p>
            )}
          </div>

          {/* ─────────── RIGHT — arch portrait (alcove shape) ─────────── */}
          <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
            <div className="relative">
              {/* outer arch ring — thin, even gap */}
              <div
                className="pointer-events-none absolute -inset-4 hidden lg:block"
                style={{
                  border: '1px solid rgba(26,26,24,0.10)',
                  borderRadius: '9999px 9999px 16px 16px',
                }}
              />

              {/* the arch portrait */}
              <div
                className="relative h-[440px] w-[320px] overflow-hidden bg-[#d8c9b0] shadow-[0_30px_80px_-30px_rgba(26,26,24,0.35)] lg:h-[560px] lg:w-[440px]"
                style={{
                  borderRadius: '9999px 9999px 12px 12px',
                }}
              >
                {therapist.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={therapist.image}
                    alt={therapist.name}
                    className="h-full w-full object-cover object-center"
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center text-[180px] text-[#1a1a18]/20"
                    style={{ fontFamily: 'var(--font-fraunces), serif' }}
                  >
                    {(therapist.name?.[0] ?? '?').toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
