'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, ArrowDown } from 'lucide-react'
import type { TherapistProfile } from '../templateUtils'
import { resolveCT8Content, resolveImage, DEFAULT_PROFILE_IMAGE } from '../templateUtils'

// v6 — same dark, bold "developer portfolio" pass as before, now split
// into a two-column layout: photo on the left, the "Hii, I'm [Name]"
// identity block + copy + CTAs on the right (left-aligned), instead of
// everything centered with no photo at all.
export type Persona = 'student' | 'professional' | null

interface HeroProps {
  therapist: TherapistProfile
}

export default function Hero({ therapist }: HeroProps) {
  const ct8 = resolveCT8Content(therapist.profile_content?.classic8)
  const name = therapist.name || 'Your Name'
  const photo = resolveImage(therapist.image)
  const resumeUrl = ct8.hero.resumeUrl?.trim()

  // Auto-fit the name onto as few lines as possible. Bases are tuned
  // smaller than the old centered/full-width version since the name now
  // lives inside the right-hand column (roughly half the page width), not
  // the full page.
  //
  // isMac: macOS (Safari/Chrome) renders this font measurably wider than
  // Windows does for the same CSS -- there's no CSS-only way to target
  // "macOS" specifically (unlike Safari-vs-Chrome, which has @supports
  // hacks), so this is detected client-side via navigator and applied as
  // an extra shrink factor, leaving Windows sizing completely untouched.
  // Starts false (matches server-rendered HTML) and flips after mount --
  // avoids a hydration mismatch at the cost of one negligible reflow.
  const [isMac, setIsMac] = useState(false)
  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      setIsMac(/Macintosh|MacIntel/.test(navigator.userAgent) && !/iPhone|iPad|iPod/.test(navigator.userAgent))
    }
  }, [])

  const nameLen = Math.max(name.length, 1)
  const fitFactor = Math.min(1.35, Math.max(0.45, 7 / nameLen)) * (isMac ? 0.75 : 1)
  const nameFontSize = `clamp(${Math.round(40 * fitFactor)}px, ${(9.5 * fitFactor).toFixed(2)}vw, ${Math.round(104 * fitFactor)}px)`

  // Split into words so each word is its own non-breakable unit (wrapped
  // in white-space: nowrap below) -- this is what actually guarantees
  // "Vansh" can never split into "VAN" / "SH" the way it did on Mac's
  // renderer, regardless of exactly why that browser measured it
  // differently. The line CAN still wrap BETWEEN words (first/last name),
  // just never inside one.
  const nameWords = name.split(' ').filter(Boolean)

  const eyebrow = ct8.hero.eyebrowDefault

  function scrollToAbout() {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
  }
  function scrollToNext() {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="hero" className="ct8-hero-premium ct8-hero-dark">
      <div className="ct8-hero-dark-inner ct8-hero-dark-inner--split">
        <div className="ct8-hero-dark-grid">
          <div className="ct8-hero-photo-orbit">
            <span className="ct8-hero-photo-glow" aria-hidden="true" />
            <div className="ct8-hero-photo-ring-wrap">
              <div className="ct8-hero-dark-grid-photo">
                <img
                  src={photo}
                  alt={name}
                  onError={e => {
                    const img = e.currentTarget
                    if (img.src !== DEFAULT_PROFILE_IMAGE) img.src = DEFAULT_PROFILE_IMAGE
                  }}
                />
              </div>
            </div>
          </div>

          <div className="ct8-hero-dark-grid-content">
            <p className="ct8-hero-greeting-prefix">Hello,</p>

            <h1 className="ct8-hero-dark-name" style={{ fontSize: nameFontSize }}>
              <span className="ct8-name-word">
                <span className="ct8-name-letter" style={{ ['--i' as string]: 0 }}>I&rsquo;m</span>
              </span>{' '}
              {nameWords.map((word, wi) => (
                <span key={wi} className="ct8-name-word">
                  {word.split('').map((ch, ci) => (
                    <span key={ci} className="ct8-name-letter" style={{ ['--i' as string]: wi * 12 + ci + 1 }}>
                      {ch}
                    </span>
                  ))}
                </span>
              )).reduce((acc, el, i) => i === 0 ? [el] : [...acc, ' ', el], [] as React.ReactNode[])}
            </h1>

            <p className="ct8-hero-tagline">{eyebrow}</p>

            {therapist.city && <p className="ct8-hero-dark-eyebrow ct8-hero-dark-eyebrow--from">From {therapist.city}</p>}

            <div className="ct8-hero-dark-ctas">
              <a
                className="ct8-hero-pill-btn"
                href={resumeUrl || '#about'}
                target={resumeUrl ? '_blank' : undefined}
                rel={resumeUrl ? 'noopener noreferrer' : undefined}
                download={!!resumeUrl}
                onClick={e => { if (!resumeUrl) { e.preventDefault(); scrollToAbout() } }}
              >
                Download Resume <ArrowDown size={16} strokeWidth={2.4} />
              </a>
              <button className="ct8-hero-pill-btn ct8-hero-pill-btn--ghost" onClick={scrollToAbout}>
                About Me <ArrowRight size={16} strokeWidth={2.4} />
              </button>
            </div>
          </div>
        </div>

        <span className="ct8-hero-dark-divider" aria-hidden="true" />

        <button type="button" className="ct8-hero-dark-scroll" onClick={scrollToNext} aria-label="Scroll down">
          Scroll Down
          <ArrowDown size={13} strokeWidth={2.2} />
        </button>
      </div>



{/* 

      {therapist.specialties?.length ? (
        <div className="ct8-hero-marquee-wrap">
          <div className="ct8-hero-marquee-track">
            {[...therapist.specialties, ...therapist.specialties].map((item, i) => (
              <span key={i} className="ct8-hero-marquee-item">
                {item} <span aria-hidden="true">{'·'}</span>
              </span>
            ))}
          </div>
        </div>
      ) : null} */}
    </section>
  )
}
