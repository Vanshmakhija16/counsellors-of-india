'use client'

import { useEffect, useState, type RefObject } from 'react'
import type { TherapistProfile } from '../templateUtils'
import { resolveImage } from '../templateUtils'
import { ArrowDownRight, MapPin } from 'lucide-react'

interface HeroProps {
  therapist: TherapistProfile
  heroLoaded: boolean
  heroRef: RefObject<HTMLElement | null>
}

function useNowInIST() {
  const [now, setNow] = useState<string>('')
  useEffect(() => {
    const tick = () => {
      setNow(
        new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: 'Asia/Kolkata',
        })
      )
    }
    tick()
    const id = window.setInterval(tick, 30 * 1000)
    return () => window.clearInterval(id)
  }, [])
  return now
}

const TITLE_PREFIXES = ['dr', 'dr.', 'mr', 'mr.', 'mrs', 'mrs.', 'ms', 'ms.', 'prof', 'prof.', 'miss']

export default function Hero({ therapist, heroLoaded, heroRef }: HeroProps) {
  const fullName = therapist.name ?? 'Practice'
  const allParts = fullName.split(' ').filter(Boolean)

  // Strip a leading honorific so it doesn't dominate the display headline.
  const hasTitle =
    allParts.length > 1 && TITLE_PREFIXES.includes(allParts[0].toLowerCase())
  const title = hasTitle ? allParts[0] : ''
  const nameParts = hasTitle ? allParts.slice(1) : allParts

  const firstName = nameParts[0] ?? ''
  const lastName = nameParts.slice(1).join(' ')
  const now = useNowInIST()

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
      className="relative overflow-hidden pt-40 pb-20 px-6 lg:px-12 lg:pt-48 lg:pb-28 min-h-[100vh] flex items-center"
      style={{
        background:
          'radial-gradient(ellipse 70% 55% at 18% 8%, rgba(201,163,90,0.13) 0%, transparent 55%), radial-gradient(ellipse 55% 45% at 92% 88%, rgba(201,138,138,0.07) 0%, transparent 60%), var(--ink-0)',
      }}
    >
      <div className="ct2-grain" />

      {/* Faint background type — sets the editorial tone */}
      <div
        aria-hidden
        className="ct2-serif-soft hidden lg:block pointer-events-none select-none absolute"
        style={{
          right: '-2vw',
          top: '12%',
          fontSize: '38vw',
          lineHeight: 0.85,
          color: 'var(--bone)',
          opacity: 0.025,
          letterSpacing: '-0.06em',
        }}
      >
        {firstName[0] ?? 'T'}
      </div>

      <div
        className={`relative z-10 mx-auto max-w-[1300px] w-full transition-opacity duration-700 ${
          heroLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* TOP META BAR — three colums of cinematic credits */}
        {/* <div
          className="grid grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-6 pb-10 lg:pb-16"
          style={{ borderBottom: '1px solid var(--ink-3)' }}
        >
          <div className="flex items-center gap-3">
            <span
              className="ct2-pulse"
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: 'var(--gold)',
                boxShadow: '0 0 12px rgba(201,163,90,0.7)',
              }}
            />
            <span className="ct2-mono" style={{ fontSize: 11, letterSpacing: '0.18em', color: 'var(--bone)' }}>
              NOW BOOKING · 2026
            </span>
          </div>

          <div className="flex items-center gap-2 lg:justify-center">
            <MapPin size={11} style={{ color: 'var(--mute)' }} />
            <span className="ct2-mono" style={{ fontSize: 11, letterSpacing: '0.16em', color: 'var(--mute)' }}>
              {(therapist.location ?? 'INDIA').toUpperCase()} · {now || '—'} IST
            </span>
          </div>

          <div className="col-span-2 lg:col-span-1 lg:text-right">
            <span className="ct2-mono" style={{ fontSize: 11, letterSpacing: '0.18em', color: 'var(--mute)' }}>
              ◇ {therapist.credentials ? therapist.credentials.toUpperCase() : 'PSYCHOTHERAPY PRACTICE'}
            </span>
          </div>
        </div> */}

        {/* MAIN GRID — display headline + right rail */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_0.9fr] gap-12 lg:gap-20 mt-0 lg:mt-0">
          {/* LEFT — headline */}
          <div>
            <h1
              className="ct2-serif"
              style={{
                fontSize: 'clamp(56px, 10vw, 168px)',
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
                    animationDelay: '0s',
                    fontSize: 'clamp(18px, 1.8vw, 26px)',
                    color: 'var(--mute)',
                    letterSpacing: '0.02em',
                    marginBottom: '0.4em',
                    lineHeight: 1,
                  }}
                >
                  {title}
                </span>
              )}
              <span
                className="ct2-word  inline"
                style={{ animationDelay: '0.05s' }}
              >
                {firstName}
              </span>
              {lastName && (
                <span
                  className="ct2-word  ct2-serif-soft inline"
                  style={{
                    color: 'var(--gold)',
                    animationDelay: '0.25s',
                    fontSize: '0.92em',
                    marginLeft: '0.3em',
                  }}
                >
                  {lastName}
                </span>
              )}
            </h1>

            {/* Tagline + CTA — stacked: tagline on top, buttons below in one row */}
            <div className="mt-6 lg:mt-8 flex flex-col gap-6 items-start">
              <p
                className="ct2-serif-soft"
                style={{
                  fontSize: 'clamp(22px, 2.6vw, 32px)',
                  lineHeight: 1.4,
                  color: 'var(--bone)',
                  maxWidth: '32ch',
                }}
              >
                {therapist.tagline?.trim() ||
                  'A quiet, deliberate space for difficult feelings without performance, without shortcuts.'}
              </p>

              <div className="flex flex-row flex-wrap gap-3">
                <button onClick={scrollToBook} className="ct2-btn-primary">
                  Reserve a session
                  <ArrowDownRight size={16} />
                </button>
                <button onClick={scrollToAbout} className="ct2-btn-ghost">
                  About the practice
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT RAIL — portrait + index card stack */}
          <aside className="flex flex-col gap-5 lg:-mt-12">



            {/* Portrait — smaller, framed */}
            {(
              <div
                className="relative overflow-hidden"
                style={{
                  borderRadius: 4,
                  border: '1px solid var(--ink-3)',
                  aspectRatio: '4 / 3.5',
                  background: 'var(--ink-2)',
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
            )}


          </aside>
        </div>

        {/* Scroll cue */}
        <div className="hidden lg:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2">
          <span
            className="ct2-mono"
            style={{ fontSize: 9, letterSpacing: '0.32em', color: 'var(--mute)' }}
          >
            SCROLL
          </span>
          <div
            style={{
              width: 1,
              height: 28,
              background: 'var(--ink-3)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              className="ct2-scroll-dot"
              style={{
                position: 'absolute',
                top: 0,
                left: -1.5,
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: 'var(--gold)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Marquee strip stays — anchor it to the bottom */}
      {therapist.specialties && therapist.specialties.length > 0 && (
        <div
          className="absolute left-0 right-0 bottom-0 z-10 overflow-hidden"
          style={{
            borderTop: '1px solid var(--ink-3)',
            background: 'rgba(11,13,14,0.7)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div className="ct2-marquee-track py-4">
            {[...therapist.specialties, ...therapist.specialties, ...therapist.specialties].map((s, i) => (
              <span
                key={i}
                className="ct2-serif"
                style={{
                  fontSize: 22,
                  color: i % 2 === 0 ? 'var(--bone)' : 'var(--mute)',
                  fontStyle: i % 3 === 0 ? 'italic' : 'normal',
                }}
              >
                {s}
                <span style={{ color: 'var(--gold)', marginLeft: 20 }}>—</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

