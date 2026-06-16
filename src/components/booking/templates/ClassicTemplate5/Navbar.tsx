'use client'

import { useEffect, useRef, useState } from 'react'
import type { TherapistProfile } from '../templateUtils'
import { getInitials } from '../templateUtils'

interface NavProps {
  scrollTo: (id: string) => void
  therapist: TherapistProfile
}

const SECTIONS = [
  { id: 'home',         label: 'Home'         },
  { id: 'about',        label: 'About'        },
  { id: 'specialties',  label: 'Specialties'  },
  { id: 'testimonials', label: 'Reviews'      },
  { id: 'faq',          label: 'FAQ'          },
  { id: 'book',         label: 'Book'         },
]

export default function Navbar({ scrollTo, therapist }: NavProps) {
  const [activeId,  setActiveId]  = useState('home')
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const [progress,  setProgress]  = useState(0)

  const name = therapist.name ?? ''
  const initials = getInitials(name) || 'T'

  useEffect(() => {
    const onScroll = () => {
      const sy    = window.scrollY
      const total = document.documentElement.scrollHeight - window.innerHeight
      setProgress(total > 0 ? (sy / total) * 100 : 0)
      setScrolled(sy > 40)

      const mid = window.innerHeight * 0.45
      let current = 'home'
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id)
        if (el && el.getBoundingClientRect().top < mid) current = s.id
      }
      setActiveId(current)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* Scroll progress */}
      <div className="ct5-progress" style={{ width: `${progress}%` }} />

      <header className="ct5-nav" data-scrolled={scrolled}>
        <div className="ct5-nav-inner">

          {/* Logo */}
          <button
            className="ct5-nav-logo"
            onClick={() => { scrollTo('home'); setMenuOpen(false) }}
          >
            <div className="ct5-nav-monogram">{initials}</div>
            <div>
              <div className="ct5-nav-name">{name}</div>
              <div className="ct5-nav-cred">{therapist.credentials}</div>
            </div>
          </button>

          {/* Desktop links */}
          <nav className="ct5-nav-links">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                className={`ct5-nav-link ${activeId === s.id ? 'active' : ''}`}
                onClick={() => scrollTo(s.id)}
              >
                {s.label}
              </button>
            ))}
          </nav>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              className="ct5-nav-cta"
              onClick={() => { scrollTo('book'); setMenuOpen(false) }}
            >
              Book a Session
            </button>
            <button
              className="ct5-hamburger"
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Menu"
            >
              <span className={`ct5-ham-line ${menuOpen ? 'open' : ''}`} />
              <span className={`ct5-ham-line ${menuOpen ? 'open' : ''}`} />
              <span className={`ct5-ham-line ${menuOpen ? 'open' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <div className={`ct5-drawer ${menuOpen ? 'open' : ''}`}>
          <div className="ct5-drawer-inner">
            {SECTIONS.map((s, i) => (
              <button
                key={s.id}
                className={`ct5-drawer-link ${activeId === s.id ? 'active' : ''}`}
                onClick={() => { scrollTo(s.id); setMenuOpen(false) }}
              >
                <span className="ct5-drawer-num">0{i + 1}</span>
                {s.label}
              </button>
            ))}
            <button
              className="ct5-drawer-cta"
              onClick={() => { scrollTo('book'); setMenuOpen(false) }}
            >
              Book a Session →
            </button>
          </div>
        </div>
      </header>
    </>
  )
}
