'use client'

import type { RefObject } from 'react'
import type { TherapistProfile } from '../templateUtils'
import { getAvailableDays, resolveImage } from '../templateUtils'
import EditableText from '../edit/EditableText'
import { useEditableTemplate } from '../edit/EditContext'

interface HeroProps {
  therapist: TherapistProfile
  heroLoaded: boolean
  heroRef: RefObject<HTMLElement | null>
}

export default function Hero({ therapist, heroLoaded, heroRef }: HeroProps) {
  const { editMode } = useEditableTemplate()
  const availableDays = getAvailableDays(therapist.availability, therapist.sessionDuration)
  const nextDay = availableDays.find((d) => d.slots.length > 0) ?? availableDays[0]

  function scrollToContact() {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
  }

  const rawNameParts = (therapist.name ?? '').trim().split(/\s+/).filter(Boolean)
  const hasHonorific = /^(dr|mr|mrs|ms|prof)\.?$/i.test(rawNameParts[0] ?? '')
  const namePrefix = hasHonorific ? rawNameParts[0] : ''
  const nameParts = hasHonorific ? rawNameParts.slice(1) : rawNameParts
  const nameSurname = nameParts.length > 1 ? nameParts[nameParts.length - 1] : ''
  const nameLead = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : nameParts[0] ?? ''

  const tagline = therapist.tagline?.trim() ?? ''
  const splitPoint = tagline.indexOf(' to ') > 0 ? tagline.indexOf(' to ') + 1 : Math.floor(tagline.length * 0.55)
  const taglineHead = tagline.slice(0, splitPoint)
  const taglineTail = tagline.slice(splitPoint)

  // Split credentials on | · or , — each segment rendered as its own pill
  // so a dangling dot can never appear at the start of a wrapped line.
  const credentialParts = (therapist.credentials || '')
    .split(/[|·,]/)
    .map(s => s.trim())
    .filter(Boolean)
  if (credentialParts.length === 0 && !editMode) credentialParts.push('Psychotherapy Practice')

  return (
    <section
      id="home"
      ref={heroRef}
      className={`relative overflow-hidden bg-[#efe7d6] transition-all duration-1000 pt-24 lg:pt-36 ${
        heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{ paddingBottom: '4.5rem' }}
    >
      <div className="relative z-10 mx-auto w-full px-8 sm:px-14 max-w-[1180px]">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">

          {/* ── RIGHT — circular portrait (shows first on mobile) ─── */}
          <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
            <div className="relative">
              {/* Subtle ring on desktop only */}
              <div
                className="pointer-events-none absolute -inset-4 hidden lg:block"
                style={{ border: '1px solid rgba(26,26,24,0.10)', borderRadius: '9999px' }}
              />
              <div
                className="relative overflow-hidden bg-[#d8c9b0] shadow-[0_30px_80px_-30px_rgba(26,26,24,0.35)]"
                style={{
                  borderRadius: '9999px',
                  /* FIX 7: wider on mobile — 80vw so the photo feels premium,
                     not a small thumbnail floating in a lot of dead space */
                  width: 'clamp(240px, 78vw, 400px)',
                  height: 'clamp(240px, 78vw, 400px)',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolveImage(therapist.image)}
                  alt={therapist.name}
                  className="h-full w-full object-cover"
                  style={{ objectPosition: 'center 25%' }}
                />
              </div>
            </div>
          </div>

          {/* ── LEFT — text content ──────────────────────────────── */}
          <div
            className="order-2 text-center lg:text-left lg:order-1"
            style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
          >

            {/* Name — single line on mobile, first name / surname stacked on desktop */}
            <h1
              className="font-light leading-[0.92] tracking-[-0.04em] text-[#1f1b16] whitespace-nowrap overflow-hidden text-ellipsis lg:whitespace-normal lg:overflow-visible"
              style={{
                fontFamily: 'var(--font-fraunces), serif',
                fontSize: 'clamp(22px, 6vw, 96px)',
              }}
            >
              <EditableText field="name" placeholder="Your full name">
                {() => (
                  <>
                    <span className="lg:block">
                      {namePrefix && <span className="text-[#b46b50]">{namePrefix} </span>}
                      {nameLead}
                      <span className="lg:hidden">{nameSurname ? ` ${nameSurname}` : ''}</span>
                    </span>
                    {nameSurname && <span className="hidden lg:block">{nameSurname}</span>}
                  </>
                )}
              </EditableText>
            </h1>

            {/* FIX 1 + 3: Credentials — each part is a self-contained inline-flex
                chip with its own leading dot, so wrapping never produces a
                dangling dot at the start of a new line. Reduced px to px-3. */}
            <div className="mt-4 flex flex-wrap justify-center lg:justify-start gap-x-0 gap-y-2">
              {credentialParts.map((part, i) => (
                <span key={i} className="inline-flex items-center gap-x-2 mr-3">
                  <span className="h-[5px] w-[5px] rounded-full bg-[#b46b50] opacity-60 shrink-0" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1f1b16]">
                    {part}
                  </span>
                </span>
              ))}
            </div>

            {/* Tagline */}
            {(tagline || editMode) && (
              <p
                className="mt-5 max-w-[480px] text-[clamp(15px,2.2vw,18px)] leading-[1.55] text-[#4d433a]"
                style={{ fontFamily: 'var(--font-fraunces), serif', fontWeight: 400 }}
              >
                <EditableText field="tagline" as="textarea" placeholder="A short line introducing your practice…">
                  {() => (
                    <>
                      {taglineHead}
                      <span style={{ fontStyle: 'italic' }} className="text-[#b46b50]">
                        {taglineTail}
                      </span>
                    </>
                  )}
                </EditableText>
              </p>
            )}

            {/* Next opening + meta info — grouped so every line shares the same left edge */}
            <div className="mt-5 flex flex-col items-center lg:items-start">
              <div className="flex flex-col items-start gap-y-1.5">
                {nextDay && nextDay.slots.length > 0 && (
                  <p className="flex items-center gap-x-2 text-[11px] font-medium uppercase tracking-[0.2em] text-[#6f6555]">
                    <span className="relative inline-flex h-1.5 w-1.5 shrink-0">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#b46b50] opacity-60" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#b46b50]" />
                    </span>
                    <span>Next opening</span>
                    <span className="text-[#6f6555] opacity-40">·</span>
                    <span className="text-[14px] font-semibold normal-case tracking-normal text-[#b46b50]">
                      {nextDay.label.toLowerCase() === 'today' ? 'Today' : nextDay.label}
                      {' · '}
                      {nextDay.slots[0]}
                    </span>
                  </p>
                )}

                {therapist.fee && (
                  <p className="text-[15px] font-semibold text-[#b46b50]">
                    ₹{therapist.fee.toLocaleString('en-IN')}
                    <span className="font-normal"> / {therapist.sessionDuration} min</span>
                  </p>
                )}
                {therapist.location && (
                  <p className="flex items-center gap-x-2 text-[13px] text-[#b46b50]">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#b46b50] opacity-60" />
                    {therapist.location}
                  </p>
                )}
                {therapist.languages && therapist.languages.length > 0 && (
                  <p className="flex items-center gap-x-2 text-[13px] text-[#b46b50]">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#b46b50] opacity-60" />
                    {therapist.languages.join(', ')}
                  </p>
                )}
              </div>
            </div>

            {/* FIX 4 + 6: Full-width CTA stacked on mobile, side by side on desktop */}
            <div className="mt-7 flex flex-col items-center lg:flex-row lg:items-center gap-y-5 lg:gap-x-6">
              <button
                onClick={scrollToContact}
                className="group flex w-full sm:w-auto h-[52px] items-center justify-center gap-3 rounded-full bg-[#1f1b16] px-9 text-[12.5px] font-semibold tracking-[0.03em] text-[#efe7d6] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#000] hover:shadow-[0_18px_36px_-12px_rgba(31,27,22,0.5)]"
              >
                Begin the conversation
                <span className="text-[15px] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
              </button>
              <button
                onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full lg:w-auto text-center text-[12.5px] font-semibold tracking-[0.03em] text-[#4d433a] underline-offset-[6px] transition-colors duration-300 hover:text-[#b46b50] hover:underline"
              >
                Read the philosophy
              </button>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
