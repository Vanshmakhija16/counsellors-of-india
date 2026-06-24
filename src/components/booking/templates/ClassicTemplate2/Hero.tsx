'use client'

import { useEffect, useState, type RefObject } from 'react'
import type { TherapistProfile } from '../templateUtils'
import { resolveImage } from '../templateUtils'
import { ArrowDownRight } from 'lucide-react'

interface HeroProps {
  therapist: TherapistProfile
  heroLoaded: boolean
  heroRef: RefObject<HTMLElement | null>
}

const TITLE_PREFIXES = ['dr', 'dr.', 'mr', 'mr.', 'mrs', 'mrs.', 'ms', 'ms.', 'prof', 'prof.', 'miss']

export default function Hero({ therapist, heroLoaded, heroRef }: HeroProps) {
  const fullName = therapist.name ?? 'Practice'
  const allParts = fullName.split(' ').filter(Boolean)

  const hasTitle = allParts.length > 1 && TITLE_PREFIXES.includes(allParts[0].toLowerCase())
  const title = hasTitle ? allParts[0] : ''
  const nameParts = hasTitle ? allParts.slice(1) : allParts
  const firstName = nameParts[0] ?? ''
  const lastName = nameParts.slice(1).join(' ')

  function scrollToBook() {
    document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' })
  }
  function scrollToAbout() {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      id="home"
      ref={heroRef}
      className="relative overflow-hidden px-6 lg:px-12 flex items-center"
      style={{
        minHeight: '560px',
        height: 'clamp(560px, 75vh, 800px)',
        background:
          'radial-gradient(ellipse 70% 55% at 18% 8%, rgba(201,163,90,0.13) 0%, transparent 55%), radial-gradient(ellipse 55% 45% at 92% 88%, rgba(201,138,138,0.07) 0%, transparent 60%), var(--ink-0)',
      }}
    >
      <div className="ct2-grain" />

      {/* Faint bg letter */}
      <div
        aria-hidden
        className="ct2-serif-soft hidden lg:block pointer-events-none select-none absolute"
        style={{
          right: '-2vw', top: '12%',
          fontSize: '38vw', lineHeight: 0.85,
          color: 'var(--bone)', opacity: 0.025, letterSpacing: '-0.06em',
        }}
      >
        {firstName[0] ?? 'T'}
      </div>

      <div
        className={`relative z-10 mx-auto max-w-[1080px] w-full transition-opacity duration-700 ${
          heroLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_0.9fr] gap-8 lg:gap-16 items-center">
          {/* LEFT — headline */}
          <div>
            <h1
              className="ct2-serif"
              style={{
                fontSize: 'clamp(36px, 7vw, 110px)',
                lineHeight: 0.92,
                color: 'var(--bone)',
                letterSpacing: '-0.035em',
                fontWeight: 350,
              }}
            >
              {title && (
                <span
                  className="ct2-word ct2-serif-soft block"
                  style={{
                    fontSize: 'clamp(14px, 1.4vw, 22px)',
                    color: 'var(--mute)', letterSpacing: '0.02em',
                    marginBottom: '0.4em', lineHeight: 1,
                  }}
                >
                  {title}
                </span>
              )}
              <span className="ct2-word inline" style={{ animationDelay: '0.05s' }}>{firstName}</span>
              {lastName && (
                <span
                  className="ct2-word ct2-serif-soft inline"
                  style={{ color: 'var(--gold)', fontSize: '0.92em', marginLeft: '0.3em' }}
                >
                  {lastName}
                </span>
              )}
            </h1>

            <div className="mt-5 lg:mt-6 flex flex-col gap-4 items-start">
              <p
                className="ct2-serif-soft"
                style={{
                  fontSize: 'clamp(16px, 1.8vw, 24px)',
                  lineHeight: 1.4, color: 'var(--bone)', maxWidth: '32ch',
                }}
              >
                {therapist.tagline?.trim() ||
                  'A quiet, deliberate space for difficult feelings without performance, without shortcuts.'}
              </p>
              <div className="flex flex-row flex-wrap gap-3">
                <button onClick={scrollToBook} className="ct2-btn-primary">
                  Reserve a session <ArrowDownRight size={16} />
                </button>
                <button onClick={scrollToAbout} className="ct2-btn-ghost">
                  About the practice
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT — portrait */}
          <aside className="hidden lg:flex flex-col">
            <div
              className="relative overflow-hidden"
              style={{
                borderRadius: 4,
                border: '1px solid var(--ink-3)',
                aspectRatio: '4 / 3.5',
                background: 'var(--ink-2)',
                maxHeight: '55vh',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveImage(therapist.image)}
                alt={fullName}
                className="w-full h-full object-cover"
                style={{ filter: 'grayscale(0.2) contrast(1.06)', objectPosition: 'center 15%' }}
              />
            </div>
          </aside>
        </div>
      </div>

      {/* Marquee strip pinned to bottom */}
      {therapist.specialties && therapist.specialties.length > 0 && (
        <div
          className="absolute left-0 right-0 bottom-0 z-10 overflow-hidden"
          style={{
            borderTop: '1px solid var(--ink-3)',
            background: 'rgba(11,13,14,0.7)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div className="ct2-marquee-track py-3">
            {[...therapist.specialties, ...therapist.specialties, ...therapist.specialties].map((s, i) => (
              <span key={i} className="ct2-serif" style={{ fontSize: 18, color: i % 2 === 0 ? 'var(--bone)' : 'var(--mute)', fontStyle: i % 3 === 0 ? 'italic' : 'normal' }}>
                {s}<span style={{ color: 'var(--gold)', marginLeft: 20 }}>—</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
