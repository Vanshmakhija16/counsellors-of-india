'use client'

import type { RefObject } from 'react'
import type { TherapistProfile } from '../templateUtils'
import { getAvailableDays, resolveImage } from '../templateUtils'

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

  // Split the name for a controlled two-line headline:
  //   • a leading honorific ("Dr.") is peeled off and kept in the accent colour
  //   • the remaining first name(s) sit on line 1, the surname on line 2 — both black
  // A single-word name stays on one line.
  const rawNameParts = (therapist.name ?? '').trim().split(/\s+/).filter(Boolean)
  const hasHonorific = /^(dr|mr|mrs|ms|prof)\.?$/i.test(rawNameParts[0] ?? '')
  const namePrefix = hasHonorific ? rawNameParts[0] : ''
  const nameParts = hasHonorific ? rawNameParts.slice(1) : rawNameParts
  const nameSurname = nameParts.length > 1 ? nameParts[nameParts.length - 1] : ''
  const nameLead = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : nameParts[0] ?? ''

  // Smart italic split — italicize only the most personal half of the tagline
  // so the italic does rhetorical work instead of being the default.
  const tagline = therapist.tagline?.trim() ?? ''
  const splitPoint = tagline.indexOf(' to ') > 0 ? tagline.indexOf(' to ') + 1 : Math.floor(tagline.length * 0.55)
  const taglineHead = tagline.slice(0, splitPoint)
  const taglineTail = tagline.slice(splitPoint)

  // Meta chips (fee · location · languages). Build as a list so the
  // bullet separators only appear BETWEEN present items — never a
  // stray leading dot, and never a literal "0" when fee is unset.
  const metaItems: React.ReactNode[] = []
  if (therapist.fee) {
    metaItems.push(
      <span key="fee">
        <span className="font-semibold">₹{therapist.fee.toLocaleString('en-IN')}</span>
        <span className="ml-1">/ {therapist.sessionDuration} min</span>
      </span>
    )
  }
  if (therapist.location) metaItems.push(<span key="loc">{therapist.location}</span>)
  if (therapist.languages && therapist.languages.length > 0) {
    metaItems.push(<span key="lang">{therapist.languages.join(', ')}</span>)
  }

  return (
    <section
      id="home"
      ref={heroRef}
      className={`relative overflow-hidden bg-[#efe7d6] px-6 pt-28 pb-16 lg:px-12 lg:pt-32 lg:pb-20 transition-all duration-1000 ${
        heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="relative z-10 mx-auto w-full px-8 max-w-[1180px]">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">

          {/* ─────────── LEFT — editorial copy ─────────── */}
          {/* Text hierarchy (3 clear steps, theme accent untouched):
               --ink   #1f1b16  loud   — the name
               --warm  #4d433a  medium — tagline / primary numbers
               --mute  #6f6555  quiet  — kicker, meta, supporting (AA 4.65:1 on ivory)
             font-sans = DM Sans applied once via the wrapper. */}
          <div
            className="order-2 text-center sm:text-left lg:order-1"
            style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
          >

            {/* HEADLINE — monumental, single voice (Fraunces).
               Controlled two-line break: lead name on line 1, surname on
               line 2. The honorific ("Dr.") keeps the accent colour, the
               name itself is black. clamp() prevents overflow on narrow phones. */}
            <h1
              className="font-light leading-[0.92] tracking-[-0.04em] text-[#1f1b16]"
              style={{
                fontFamily: 'var(--font-fraunces), serif',
                fontSize: 'clamp(34px, 12vw, 120px)',
              }}
            >
              <span className="block whitespace-nowrap">
                {namePrefix && <span className="text-[#b46b50]">{namePrefix} </span>}
                {nameLead}
              </span>
              {nameSurname && <span className="block whitespace-nowrap">{nameSurname}</span>}
            </h1>

            {/* kicker — practice line + EST badge, below the name */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 sm:justify-start lg:mt-6">
              <span className="text-[12px] font-semibold uppercase tracking-[0.26em] text-[#1f1b16]">
                {therapist.credentials || 'Psychotherapy Practice'}
              </span>
              {yearsBadge && (
                <>
                  <span className="h-[3px] w-[3px] rounded-full bg-[#6f6555]" />
                  <span className="text-[12px] font-medium uppercase tracking-[0.18em] text-[#6f6555]">
                    {yearsBadge}
                  </span>
                </>
              )}
            </div>

            {/* TAGLINE — italic only on the second half (rhetorical italic) */}
            {tagline && (
              <p
                className="mx-auto mt-7 max-w-[480px] text-[clamp(19px,5vw,21px)] leading-[1.5] text-[#4d433a] sm:mx-0 lg:mt-8"
                style={{ fontFamily: 'var(--font-fraunces), serif', fontWeight: 400 }}
              >
                {taglineHead}
                <span style={{ fontStyle: 'italic' }} className="text-[#b46b50]">
                  {taglineTail}
                </span>
              </p>
            )}

            {/* Next opening — quiet, sits just above the CTAs */}
            {nextDay && nextDay.slots.length > 0 && (
              <p className="mt-3 flex items-center justify-center whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.2em] text-[#6f6555] sm:justify-start lg:mt-3.5">
                <span className="relative mr-2.5 inline-flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#b46b50] opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#b46b50]" />
                </span>
                Next opening ·{' '}
                <span className="text-[15px] font-semibold normal-case tracking-normal text-[#b46b50]">
                  {nextDay.label.toLowerCase() === 'today' ? 'Today' : nextDay.label}
                  {' · '}
                  {nextDay.slots[0]}
                </span>
              </p>
            )}

            {/* meta row — bullets render only between present items */}
            {metaItems.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center justify-start gap-x-4 gap-y-2 text-left text-[15px] font-semibold text-[#b46b50] lg:mt-5">
                {metaItems.map((item, i) => (
                  <span key={i} className="flex items-center gap-x-4">
                    {i > 0 && <span className="h-[3px] w-[3px] rounded-full bg-[#b46b50]" />}
                    {item}
                  </span>
                ))}
              </div>
            )}

            {/* CTAs — mass + ghost, identical height, opposite weight, true ↗ arrow */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-7 gap-y-4 sm:justify-start lg:mt-7">
              <button
                onClick={scrollToContact}
                className="group flex h-[56px] items-center gap-3 rounded-full bg-[#1f1b16] px-9 text-[12.5px] font-semibold tracking-[0.03em] text-[#efe7d6] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#000] hover:shadow-[0_18px_36px_-12px_rgba(31,27,22,0.5)]"
              >
                Begin the conversation
                <span className="text-[15px] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  ↗
                </span>
              </button>
              <button
                onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-[12.5px] font-semibold tracking-[0.03em] text-[#4d433a] underline-offset-[6px] transition-colors duration-300 hover:text-[#b46b50] hover:underline"
              >
                Read the philosophy
              </button>
            </div>
          </div>

          {/* ─────────── RIGHT — arch portrait (alcove shape) ─────────── */}
          <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
            <div className="relative">
              {/* outer circle ring — thin, even gap */}
              <div
                className="pointer-events-none absolute -inset-4 hidden lg:block"
                style={{
                  border: '1px solid rgba(26,26,24,0.10)',
                  borderRadius: '9999px',
                }}
              />

              {/* the circular portrait */}
              <div
                className="relative h-[340px] w-[340px] overflow-hidden bg-[#d8c9b0] shadow-[0_30px_80px_-30px_rgba(26,26,24,0.35)] lg:h-[440px] lg:w-[440px]"
                style={{
                  borderRadius: '9999px',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolveImage(therapist.image)}
                  alt={therapist.name}
                  className="h-full w-full object-cover object-center"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
