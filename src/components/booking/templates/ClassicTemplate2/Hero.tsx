'use client'

import type { RefObject } from 'react'
import type { TherapistProfile } from '../templateUtils'
import { resolveImage, getInitials } from '../templateUtils'
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
  const initials = getInitials(fullName)

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
      className="ct2-hero relative overflow-hidden px-6 lg:px-12 flex items-center"
      style={{
        paddingTop: 96,
        background:
          'radial-gradient(ellipse 70% 55% at 18% 8%, rgba(185,128,121,0.14) 0%, transparent 55%), radial-gradient(ellipse 55% 45% at 92% 88%, rgba(166,107,92,0.08) 0%, transparent 60%), var(--ink-0)',
      }}
    >
      <style>{`
        .ct2-hero { min-height: 680px; height: clamp(620px, 80vh, 860px); }
        @media (max-width: 1023px) {
          .ct2-hero { height: 100dvh; min-height: 100dvh; }
        }
        .ct2-hero-photo-mobile { width: 100%; max-width: 320px; }
        @media (max-width: 380px) {
          .ct2-hero-photo-mobile { max-width: 190px; }
          .ct2-hero-tagline { font-size: 32px !important; }
        }
        /* Foldable cover screens (e.g. Galaxy Z Fold) are narrower than an
           iPhone SE but much taller/narrower in aspect ratio — target them
           separately so they don't inherit the SE's smaller image. */
        @media (max-width: 380px) and (min-aspect-ratio: 2/1) {
          .ct2-hero-photo-mobile { max-width: 260px; }
        }
      `}</style>
      <div className="ct2-grain" />

      <div
        className={`relative z-10 mx-auto max-w-[1080px] w-full transition-opacity duration-700 ${
          heroLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_0.9fr] gap-10 lg:gap-8 items-center">
          {/* LEFT — quote + CTA */}
          <div className="order-2 lg:order-1 flex flex-col items-start text-left pl-4 lg:pl-0">
            <p
              className="ct2-tagline-font ct2-word ct2-hero-tagline"
              style={{
                fontSize: 'clamp(40px, 5.2vw, 70px)',
                lineHeight: 1.12,
                color: 'var(--bone)',
                letterSpacing: '-0.02em',
                fontWeight: 400,
                maxWidth: '16ch',
              }}
            >
              {therapist.tagline?.trim() ||
                'Healing begins when you feel safe to be yourself.'}
            </p>

            <div className="mt-9 flex flex-row flex-wrap gap-3 justify-start">
              <button
                onClick={scrollToBook}
                className="ct2-hero-cta"
              >
                Book appointment
              </button>
            </div>
          </div>

          {/* RIGHT — portrait, with a floating availability badge. Shown above the
              text on mobile (smaller), beside it on desktop (full size). */}
          <aside className="order-1 lg:order-2 flex flex-col items-center">
            <div className="relative lg:hidden -mt-10 ct2-hero-photo-mobile">
              <div
                className="relative"
                style={{
                  borderRadius: '48% 52% 55% 45% / 45% 48% 52% 55%',
                  aspectRatio: '1 / 1.08',
                  width: '100%',
                  padding: 5,
                  background: 'linear-gradient(135deg, rgba(185,128,121,0.35), rgba(166,107,92,0.08) 60%, transparent)',
                }}
              >
                <div
                  className="relative overflow-hidden w-full h-full"
                  style={{
                    borderRadius: '48% 52% 55% 45% / 45% 48% 52% 55%',
                    border: '1px solid var(--ink-3)',
                    background: 'var(--ink-2)',
                    boxShadow: '0 20px 40px -20px rgba(42,36,32,0.32)',
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
              </div>
            </div>

            <div className="hidden lg:block relative" style={{ width: '100%', maxWidth: 420 }}>
              <div
                className="relative"
                style={{
                  borderRadius: '48% 52% 55% 45% / 45% 48% 52% 55%',
                  aspectRatio: '1 / 1.08',
                  width: '100%',
                  padding: 6,
                  background: 'linear-gradient(135deg, rgba(185,128,121,0.35), rgba(166,107,92,0.08) 60%, transparent)',
                }}
              >
                <div
                  className="relative overflow-hidden w-full h-full"
                  style={{
                    borderRadius: '48% 52% 55% 45% / 45% 48% 52% 55%',
                    border: '1px solid var(--ink-3)',
                    background: 'var(--ink-2)',
                    boxShadow: '0 30px 60px -28px rgba(42,36,32,0.32)',
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
              </div>
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
            background: 'rgba(249,244,241,0.78)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {/* <div className="ct2-marquee-track py-3">
            {[...therapist.specialties, ...therapist.specialties, ...therapist.specialties].map((s, i) => (
              <span key={i} className="ct2-serif" style={{ fontSize: 18, color: i % 2 === 0 ? 'var(--bone)' : 'var(--mute)', fontStyle: i % 3 === 0 ? 'italic' : 'normal' }}>
                {s}<span style={{ color: 'var(--gold)', marginLeft: 20 }}>—</span>
              </span>
            ))}
          </div> */}
        </div>
      )}
    </section>
  )
}
