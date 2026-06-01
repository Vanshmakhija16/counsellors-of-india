'use client'

import { useEffect, useState } from 'react'
import type { TherapistProfile } from '../templateUtils'

interface NavProps {
  scrollTo: (id: string) => void
  therapist: TherapistProfile
}

const SECTIONS = [
  { id: 'home',      label: 'Home'      },
  { id: 'about',    label: 'About'   },
  { id: 'services', label: 'Services'     },
  { id: 'insights', label: 'Feedbacks'      },
  { id: 'book',     label: 'Book'    },
  { id: 'faq',      label: 'FAQ'  },
]


export default function Navbar({ scrollTo, therapist }: NavProps) {
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

  const initials = (therapist.name ?? '')
    .split(' ')
    .filter(p => !/^(dr|mr|mrs|ms|prof|miss)\.?$/i.test(p))
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'CI'

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
