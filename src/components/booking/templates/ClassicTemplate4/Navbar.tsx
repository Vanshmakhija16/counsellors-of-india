'use client'

import { useEffect, useState } from 'react'
import type { TherapistProfile } from '../templateUtils'
import { getInitials } from '../templateUtils'

interface NavProps {
  scrollTo: (id: string) => void
  therapist: TherapistProfile
  theme: 'dark' | 'light'
  onToggleTheme: () => void
}

const SECTIONS = [
  { id: 'home',      label: 'Home'      },
  { id: 'about',    label: 'About'   },
  { id: 'services', label: 'Services'     },
  { id: 'insights', label: 'Feedbacks'      },
  { id: 'book',     label: 'Book'    },
  { id: 'faq',      label: 'FAQ'  },
]


export default function Navbar({ scrollTo, therapist, theme, onToggleTheme }: NavProps) {
  const [activeId, setActiveId] = useState('home')
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [progress, setProgress] = useState(0)
  const name= therapist.name ?? ''


  useEffect(() => {
    const onScroll = () => {
      const sy = window.scrollY
      const total = document.documentElement.scrollHeight - window.innerHeight
      setProgress(total > 0 ? (sy / total) * 100 : 0)
      setScrolled(sy > 40)

      const mid = window.innerHeight / 2
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

  const initials = getInitials(therapist.name ?? '') || 'CI'

  return (
    <>
      {/* Progress bar */}
      <div
        className="ct4-progress"
        style={{ width: `${progress}%` }}
      />

      {/* Navbar */}
      <header className="ct4-nav fixed top-0 inset-x-0 z-50" data-scrolled={scrolled}>
        <div className="ct4-nav-inner">

          {/* Logo */}
          <button
            className="ct4-nav-logo"
            onClick={() => { scrollTo('home'); setMenuOpen(false) }}
          >
            <div className="ct4-nav-emblem">
              <span className="ct4-nav-emblem-text">{name}</span>
            </div>
            {/* <span className="ct4-nav-wordmark">{name} </span> */}
          </button>

          {/* Desktop nav links */}
          <nav className="ct4-nav-links">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                className={`ct4-nav-link ${activeId === s.id ? 'active' : ''}`}
                onClick={() => scrollTo(s.id)}
              >
                {s.label}
              </button>
            ))}
          </nav>

          {/* Right actions */}
          <div className="ct4-nav-actions">
            {/* Theme toggle (dark ↔ light) */}
            <button
              className="ct4-theme-toggle"
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              title={theme === 'dark' ? 'Light theme' : 'Dark theme'}
            >
              {theme === 'dark' ? (
                /* Sun — click to go light */
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
              ) : (
                /* Moon — click to go dark */
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            <button
              className="ct4-nav-cta"
              onClick={() => { scrollTo('book'); setMenuOpen(false) }}
            >
              Book a Session
            </button>
            <button
              className="ct4-hamburger"
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Menu"
            >
              <span className={`ct4-ham-line ${menuOpen ? 'open' : ''}`} />
              <span className={`ct4-ham-line ${menuOpen ? 'open' : ''}`} />
              <span className={`ct4-ham-line ${menuOpen ? 'open' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <div className={`ct4-drawer ${menuOpen ? 'open' : ''}`}>
          <div className="ct4-drawer-inner">
            {SECTIONS.map((s, i) => (
              <button
                key={s.id}
                className={`ct4-drawer-item ${activeId === s.id ? 'active' : ''}`}
                onClick={() => { scrollTo(s.id); setMenuOpen(false) }}
              >
                <span className="ct4-drawer-num">0{i + 1}</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </header>
    </>
  )
}
