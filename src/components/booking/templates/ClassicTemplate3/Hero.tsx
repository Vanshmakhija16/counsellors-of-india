// 'use client'

// import { useEffect, useRef, useState, type RefObject } from 'react'
// import type { TherapistProfile } from '../templateUtils'

// interface HeroProps {
//   therapist: TherapistProfile
//   heroLoaded: boolean
//   heroRef: RefObject<HTMLElement | null>
// }

// const HONORIFICS = /^(dr\.?|mr\.?|ms\.?|mrs\.?|prof\.?)\s+/i
// function getFirstName(name: string) {
//   return name.replace(HONORIFICS, '').trim().split(/\s+/)[0] ?? name
// }

// function useScrollY() {
//   const [y, setY] = useState(0)
//   useEffect(() => {
//     const fn = () => setY(window.scrollY)
//     window.addEventListener('scroll', fn, { passive: true })
//     return () => window.removeEventListener('scroll', fn)
//   }, [])
//   return y
// }

// export default function Hero({ therapist, heroLoaded, heroRef }: HeroProps) {
//   const sectionRef = useRef<HTMLElement | null>(null)
//   const scrollY = useScrollY()

//   useEffect(() => {
//     if (heroRef && 'current' in heroRef)
//       (heroRef as React.MutableRefObject<HTMLElement | null>).current = sectionRef.current
//   }, [heroRef])

//   const firstName = getFirstName(therapist.name ?? '')
//   const photo     = therapist.image?.trim() || ''
//   const initials  = (therapist.name ?? '')
//     .split(' ').filter(Boolean).filter(w => !/^(dr|mr|mrs|ms|prof)\.?$/i.test(w))
//     .map(w => w[0].toUpperCase()).slice(0, 2).join('') || '?'

//   const scrollProgress = typeof window !== 'undefined'
//     ? Math.min(100, (scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight)) * 100)
//     : 0

//   function scrollToBook() {
//     document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' })
//   }
//   function scrollToAbout() {
//     document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
//   }

//   return (
//     <section id="home" ref={sectionRef} className="ct3-hero">

//       {/* ── Scroll progress ── */}
//       <div className="ct3-progress" style={{ width: `${scrollProgress}%` }} />

//       {/* ══ LEFT — Photo ══ */}
//       <div className={`ct3-hero-photo ${heroLoaded ? 'ct3-fade-in' : 'opacity-0'}`}>
//         {photo ? (
//           <img src={photo} alt={therapist.name} />
//         ) : (
//           <div className="ct3-hero-initials">
//             <span className="ct3-hero-initials-text">{initials}</span>
//           </div>
//         )}

//         {/* Floating credential badge */}
//         <div className="ct3-hero-badge">
//           <span className="ct3-hero-badge-label">Verified Practitioner</span>
//           <span className="ct3-hero-badge-text">
//             {therapist.credentials || 'Licensed Psychologist'}{therapist.city ? ` · ${therapist.city}` : ''}
//           </span>
//         </div>

//         {/* Bottom-left — availability signal */}
//         <div style={{
//           position: 'absolute', bottom: '2rem', left: '2rem', zIndex: 3,
//           background: 'var(--warm-white)', border: '1px solid var(--rule-strong)',
//           padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8,
//           boxShadow: '0 2px 16px rgba(26,23,20,0.06)',
//         }}>
//           <span style={{
//             width: 7, height: 7, borderRadius: '50%',
//             background: '#4CAF50', display: 'inline-block', flexShrink: 0,
//             boxShadow: '0 0 0 3px rgba(76,175,80,0.2)',
//           }} />
//           <span style={{
//             fontFamily: "'DM Mono', monospace",
//             fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase',
//             color: 'var(--ink-2)',
//           }}>Accepting clients</span>
//         </div>
//       </div>

//       {/* ══ RIGHT — Text column ══ */}
//       <div className={`ct3-hero-text ${heroLoaded ? 'ct3-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.08s' }}>

//         {/* Folio watermark */}
//         {/* <div className="ct3-hero-folio ct3-mono">
//           {therapist.name}
//         </div> */}

//         {/* Eyebrow */}
//         {/* <div
//           className={`ct3-eyebrow ${heroLoaded ? 'ct3-slide-left' : 'opacity-0'}`}
//           style={{ animationDelay: '0.18s', marginBottom: '1.2rem' }}
//         >
//           Welcome
//         </div> */}

//         {/* Hi, I am Firstname */}
//         <h1
//           className={`ct3-hero-name ${heroLoaded ? 'ct3-fade-up' : 'opacity-0'}`}
//           style={{ animationDelay: '0.26s' }}
//         >
//           Hi, I am <em>{firstName}</em>
//         </h1>

//         {/* Credential */}
//         <p
//           className={`ct3-hero-cred ${heroLoaded ? 'ct3-fade-up' : 'opacity-0'}`}
//           style={{ animationDelay: '0.38s', marginTop: '0.5rem' }}
//         >
//           {therapist.credentials || 'Psychologist & Therapist'}
//         </p>

//         {/* Gold ornament */}
//         <div
//           className={`ct3-hero-ornament ${heroLoaded ? 'ct3-draw' : 'opacity-0'}`}
//           style={{ animationDelay: '0.45s' }}
//         >
//           <div className="ct3-hero-orn-line" />
//           <div className="ct3-hero-orn-diamond" />
//           <div className="ct3-hero-orn-line" />
//         </div>

//         {/* Tagline */}
//         {therapist.tagline && (
//           <p
//             className={`ct3-hero-tagline ${heroLoaded ? 'ct3-fade-up' : 'opacity-0'}`}
//             style={{ animationDelay: '0.5s', marginBottom: '1rem' }}
//           >
//             {therapist.tagline}
//           </p>
//         )}

//         {/* Bio */}
//         {therapist.bio && (
//           <p
//             className={`ct3-hero-bio ${heroLoaded ? 'ct3-fade-up' : 'opacity-0'}`}
//             style={{ animationDelay: '0.6s', marginTop: therapist.tagline ? 0 : '0.5rem' }}
//           >
//             {therapist.bio}
//           </p>
//         )}

//         {/* CTAs */}
//         <div
//           className={heroLoaded ? 'ct3-fade-up' : 'opacity-0'}
//           style={{ animationDelay: '0.72s', marginTop: '2rem', display: 'flex', gap: 12, flexWrap: 'wrap' }}
//         >
//           <button className="ct3-btn-primary" onClick={scrollToBook}>
//             Book a session &nbsp;↗
//           </button>
//           <button className="ct3-btn-ghost" onClick={scrollToAbout}>
//             Learn more
//           </button>
//         </div>

//         {/* Stats row */}
//         {(therapist.experience || therapist.totalReviews || therapist.fee) && (
//           <div
//             className={`ct3-hero-stats ${heroLoaded ? 'ct3-fade-up' : 'opacity-0'}`}
//             style={{ animationDelay: '0.82s' }}
//           >
//             {therapist.experience && (
//               <div className="ct3-hero-stat">
//                 <span className="ct3-hero-stat-num">{therapist.experience}+</span>
//                 <span className="ct3-hero-stat-label">Years practice</span>
//               </div>
//             )}
//             {therapist.totalReviews && (
//               <div className="ct3-hero-stat">
//                 <span className="ct3-hero-stat-num">{therapist.totalReviews}+</span>
//                 <span className="ct3-hero-stat-label">Sessions completed</span>
//               </div>
//             )}
//             {therapist.fee && (
//               <div className="ct3-hero-stat">
//                 <span className="ct3-hero-stat-num">₹{therapist.fee.toLocaleString()}</span>
//                 <span className="ct3-hero-stat-label">Per session</span>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </section>
//   )
// }

'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'
import type { TherapistProfile } from '../templateUtils'
import { resolveImage, getInitials } from '../templateUtils'

interface HeroProps {
  therapist: TherapistProfile
  heroLoaded: boolean
  heroRef: RefObject<HTMLElement | null>
}

const HONORIFICS = /^(dr\.?|mr\.?|ms\.?|mrs\.?|prof\.?)\s+/i

function getFirstName(name: string) {
  return name.replace(HONORIFICS, '').trim().split(/\s+/)[0] ?? name
}

function useScrollY() {
  const [y, setY] = useState(0)

  useEffect(() => {
    const fn = () => setY(window.scrollY)

    window.addEventListener('scroll', fn, { passive: true })

    return () => window.removeEventListener('scroll', fn)
  }, [])

  return y
}

export default function Hero({
  therapist,
  heroLoaded,
  heroRef,
}: HeroProps) {
  const sectionRef = useRef<HTMLElement | null>(null)

  const scrollY = useScrollY()

  useEffect(() => {
    if (heroRef && 'current' in heroRef) {
      ;(
        heroRef as React.MutableRefObject<HTMLElement | null>
      ).current = sectionRef.current
    }
  }, [heroRef])

  const firstName = getFirstName(therapist.name ?? '')

  const photo = resolveImage(therapist.image)

  const initials = getInitials(therapist.name ?? '') || '?'

  const scrollProgress =
    typeof window !== 'undefined'
      ? Math.min(
          100,
          (scrollY /
            Math.max(
              1,
              document.body.scrollHeight - window.innerHeight
            )) *
            100
        )
      : 0

  function scrollToBook() {
    document
      .getElementById('book')
      ?.scrollIntoView({ behavior: 'smooth' })
  }

  function scrollToAbout() {
    document
      .getElementById('about')
      ?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      id="home"
      ref={sectionRef}
      className="ct3-hero"
    >
      {/* progress */}
      <div
        className="ct3-progress"
        style={{
          width: `${scrollProgress}%`,
        }}
      />

      {/* LEFT */}
      <div
        className={`ct3-hero-photo-wrap ${
          heroLoaded ? 'ct3-fade-in' : 'opacity-0'
        }`}
      >
        <div className="ct3-hero-glow" />

        <div className="ct3-hero-photo-card">
          {photo ? (
            <img
              src={photo}
              alt={therapist.name}
              className="ct3-hero-photo"
            />
          ) : (
            <div className="ct3-hero-initials">
              <span>{initials}</span>
            </div>
          )}
{/* 
          <div className="ct3-floating-card">
            <div className="ct3-floating-dot" />

            <div>
              <span className="ct3-floating-label">
                Available for sessions
              </span>

              <p className="ct3-floating-text">
                Online • In-person
              </p>
            </div>
          </div> */}
        </div>
      </div>

      {/* RIGHT */}
      <div
        className={`ct3-hero-content ${
          heroLoaded ? 'ct3-fade-up' : 'opacity-0'
        }`}
      >
        <div className="ct3-eyebrow">
          THERAPIST • WELLNESS • CARE
        </div>

        <h1 className="ct3-hero-title">
          Helping you feel
          <br />
          <em>safe, heard,</em>
          <br />
          and understood.
        </h1>

        <p className="ct3-hero-subtitle">
          Hi, I’m {firstName}.{' '}
          {therapist.credentials ||
            'Licensed Therapist'}{' '}
          focused on creating calm, clarity,
          and emotional resilience through
          thoughtful therapy sessions.
        </p>

        <div className="ct3-hero-meta">
          <div className="ct3-meta-card">
            <span className="ct3-meta-number">
              {therapist.experience || 8}+
            </span>

            <span className="ct3-meta-label">
              Years Experience
            </span>
          </div>

          <div className="ct3-meta-card">
            <span className="ct3-meta-number">
              {therapist.totalReviews || 500}+
            </span>

            <span className="ct3-meta-label">
              Sessions
            </span>
          </div>

          <div className="ct3-meta-card">
            <span className="ct3-meta-number">
              ₹
              {therapist.fee?.toLocaleString() ||
                '2,000'}
            </span>

            <span className="ct3-meta-label">
              Per Session
            </span>
          </div>
        </div>

        {/* <div className="ct3-hero-actions">
          <button
            className="ct3-btn-primary"
            onClick={scrollToBook}
          >
            Book Session
          </button>

          <button
            className="ct3-btn-secondary"
            onClick={scrollToAbout}
          >
            Learn More
          </button>
        </div> */}
      </div>
    </section>
  )
}