'use client'

import type { RefObject } from 'react'
import { useEffect, useRef } from 'react'
import type { TherapistProfile } from '../templateUtils'
import { resolveImage } from '../templateUtils'

interface HeroProps {
  therapist: TherapistProfile
  loaded: boolean
  heroRef: RefObject<HTMLElement | null>
}

export default function Hero({ therapist, loaded, heroRef }: HeroProps) {
  const sectionRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (heroRef && 'current' in heroRef)
      (heroRef as React.MutableRefObject<HTMLElement | null>).current = sectionRef.current
  }, [heroRef])

  const name    = therapist.name ?? ''
  const cred    = therapist.credentials || 'Licensed Psychologist'
  const city    = therapist.city || 'India'
  const bio     = therapist.bio || 'Helping individuals navigate life complexities with compassion, evidence-based care, and a deeply human approach.'
  const exp     = therapist.experience ?? 8
  const reviews = therapist.totalReviews ?? 200
  const rating  = therapist.rating ?? 4.9

  // Split name: first word plain, rest in italic
  const nameParts = name.split(' ')
  const firstName = nameParts[0]
  const restName  = nameParts.slice(1).join(' ')

  function scrollToBook()  { document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' }) }
  function scrollToAbout() { document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }) }

  const delay = (n: number) => ({ animationDelay: `${n}s`, opacity: loaded ? undefined : 0 })

  return (
    <section id="home" ref={sectionRef} className="ct5-hero">

      {/* ── LEFT: Text panel ── */}
      <div className="ct5-hero-left">

        {/* Location tag */}
        <div
          className={loaded ? 'ct5-anim-slide-r' : ''}
          style={{ ...delay(0.05), marginBottom: '1.8rem' }}
        >
          <div className="ct5-hero-tag">
            <span className="ct5-hero-tag-dot" />
            <span className="ct5-hero-tag-text">
              Licensed Therapist &nbsp;·&nbsp; {city}
            </span>
          </div>
        </div>

        {/* Name — editorial split */}
        <h1
          className={`ct5-hero-name ${loaded ? 'ct5-anim-fade-up' : ''}`}
          style={delay(0.15)}
        >
          {firstName}
          {restName && (
            <>
              {' '}
              <em>{restName}</em>
            </>
          )}
        </h1>

        {/* Credential */}
        <p
          className={`ct5-hero-cred ${loaded ? 'ct5-anim-fade-up' : ''}`}
          style={delay(0.25)}
        >
          {cred}
        </p>

        {/* Divider */}
        <div
          className={`ct5-hero-divider ${loaded ? 'ct5-anim-fade-in' : ''}`}
          style={delay(0.35)}
        />

        {/* Bio */}
        <p
          className={`ct5-hero-bio ${loaded ? 'ct5-anim-fade-up' : ''}`}
          style={delay(0.4)}
        >
          {bio}
        </p>

        {/* CTAs */}
        <div
          className={`ct5-hero-ctas ${loaded ? 'ct5-anim-fade-up' : ''}`}
          style={delay(0.5)}
        >
          <button className="ct5-btn-primary" onClick={scrollToBook}>
            Book a Session &nbsp;→
          </button>
          <button className="ct5-btn-ghost" onClick={scrollToAbout}>
            About Me
          </button>
        </div>

        {/* Mobile stats */}
        <div
          className={`ct5-hero-stats-mobile ${loaded ? 'ct5-anim-fade-in' : ''}`}
          style={delay(0.65)}
        >
          {[
            { num: `${exp}+`,    lbl: 'Years Practice' },
            { num: `${reviews}+`, lbl: 'Sessions'       },
            { num: `${rating}`,  lbl: 'Rating'          },
          ].map((s, i) => (
            <div key={i} className="ct5-hero-stat-m">
              <span className="ct5-hero-stat-m-num">{s.num}</span>
              <span className="ct5-hero-stat-m-lbl">{s.lbl}</span>
            </div>
          ))}
        </div>

        {/* Scroll hint */}
        <div
          className={`ct5-scroll-hint ${loaded ? 'ct5-anim-fade-in' : ''}`}
          style={delay(0.8)}
        >
          <span className="ct5-scroll-hint-text">Scroll</span>
          <span className="ct5-scroll-line" />
        </div>
      </div>

      {/* ── RIGHT: Visual panel ── */}
      <div className="ct5-hero-right">

        <>
          <img
            src={resolveImage(therapist.image)}
            alt={name}
            className="ct5-hero-photo"
          />
          <div className="ct5-hero-photo-overlay" />
        </>

        {/* Floating stat cards — desktop only */}
        <div className="ct5-hero-stat-strip">
          {[
            { num: `${exp}+`,    lbl: 'Years in Practice'  },
            { num: `${reviews}+`, lbl: 'Sessions Completed' },
            { num: `${rating}`,  lbl: 'Client Rating'       },
          ].map((s, i) => (
            <div key={i} className="ct5-hero-stat-card">
              <span className="ct5-hero-stat-num">{s.num}</span>
              <span className="ct5-hero-stat-lbl">{s.lbl}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
