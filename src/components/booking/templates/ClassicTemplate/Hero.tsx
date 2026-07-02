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

  const yearsBadge =
    (therapist.experience ?? 0) > 0 ? `EST. ${new Date().getFullYear() - (therapist.experience ?? 0)}` : null

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
      className={`relative overflow-hidden bg-[#efe7d6] px-6 lg:px-12 flex items-center transition-all duration-1000 ${
        heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{ minHeight: '610px', height: 'clamp(560px, 85vh, 800px)', paddingTop: '5rem' }}
    >
      <div className="relative z-10 mx-auto w-full px-8 max-w-[1180px]">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">

          <div
            className="order-2 text-center sm:text-left lg:order-1"
            style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
          >
            <h1
              className="font-light leading-[0.92] tracking-[-0.04em] text-[#1f1b16]"
              style={{
                fontFamily: 'var(--font-fraunces), serif',
                fontSize: 'clamp(28px, 7vw, 96px)',
              }}
            >
              <EditableText field="name" placeholder="Your full name">
                {() => (
                  <>
                    <span className="block whitespace-nowrap">
                      {namePrefix && <span className="text-[#b46b50]">{namePrefix} </span>}
                      {nameLead}
                    </span>
                    {nameSurname && <span className="block whitespace-nowrap">{nameSurname}</span>}
                  </>
                )}
              </EditableText>
            </h1>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 sm:justify-start">
              <span className="text-[12px] font-semibold uppercase tracking-[0.26em] text-[#1f1b16]">
                <EditableText field="credentials" placeholder="Psychotherapy Practice" className="text-[12px]">
                  {(v) => v || 'Psychotherapy Practice'}
                </EditableText>
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

            {(tagline || editMode) && (
              <p
                className="mx-auto mt-5 max-w-[480px] text-[clamp(16px,2.5vw,19px)] leading-[1.5] text-[#4d433a] sm:mx-0"
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

            {nextDay && nextDay.slots.length > 0 && (
              <p className="mt-3 flex items-center justify-center whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.2em] text-[#6f6555] sm:justify-start">
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

            {metaItems.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center justify-start gap-x-4 gap-y-2 text-left text-[15px] font-semibold text-[#b46b50]">
                {metaItems.map((item, i) => (
                  <span key={i} className="flex items-center gap-x-4">
                    {i > 0 && <span className="h-[3px] w-[3px] rounded-full bg-[#b46b50]" />}
                    {item}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-7 gap-y-4 sm:justify-start">
              <button
                onClick={scrollToContact}
                className="group flex h-[52px] items-center gap-3 rounded-full bg-[#1f1b16] px-9 text-[12.5px] font-semibold tracking-[0.03em] text-[#efe7d6] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#000] hover:shadow-[0_18px_36px_-12px_rgba(31,27,22,0.5)]"
              >
                Begin the conversation
                <span className="text-[15px] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
              </button>
              <button
                onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-[12.5px] font-semibold tracking-[0.03em] text-[#4d433a] underline-offset-[6px] transition-colors duration-300 hover:text-[#b46b50] hover:underline"
              >
                Read the philosophy
              </button>
            </div>
          </div>

          {/* RIGHT — circular portrait */}
          <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
            <div className="relative">
              <div
                className="pointer-events-none absolute -inset-4 hidden lg:block"
                style={{ border: '1px solid rgba(26,26,24,0.10)', borderRadius: '9999px' }}
              />
              <div
                className="relative overflow-hidden bg-[#d8c9b0] shadow-[0_30px_80px_-30px_rgba(26,26,24,0.35)]"
                style={{
                  borderRadius: '9999px',
                  width: 'clamp(260px, 30vw, 400px)',
                  height: 'clamp(260px, 30vw, 400px)',
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

        </div>
      </div>
    </section>
  )
}
