'use client'

import { useEffect, useState } from 'react'
import type { TherapistProfile } from '../templateUtils'

interface SideNavProps {
  scrollTo: (id: string) => void
  therapist: TherapistProfile
}

const SECTIONS = [
  { id: 'home',     label: 'Cover'    },
  { id: 'about',    label: 'Practice' },
  { id: 'services', label: 'Method'   },
  { id: 'insights', label: 'Writing'  },
  { id: 'faq',      label: 'FAQ'    },
  // { id: 'book',     label: 'Reserve'  },
]

export default function SideNav({ scrollTo, therapist }: SideNavProps) {
  const [activeId, setActiveId] = useState('home')
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40)
      const mid = window.innerHeight * 0.4
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
    .split(' ').filter(Boolean)
    .filter(p => !/^(dr|mr|mrs|ms|prof)\.?$/i.test(p))
    .map(p => p[0]).slice(0, 2).join('').toUpperCase() || 'CI'

  return (
    <>
      <header className="ct3-nav" data-scrolled={scrolled}>
        <div className="ct3-nav-inner">

          {/* Brand */}
          <button className="ct3-nav-brand" onClick={() => { scrollTo('home'); setMenuOpen(false) }}>
            <span className="ct3-nav-monogram">{initials}</span>
            {/* <span className="ct3-nav-label">Atelier · Issue 01</span> */}
          </button>

          {/* Desktop links */}
          <nav className="ct3-nav-links">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`ct3-nav-link ${activeId === s.id ? 'active' : ''}`}
              >
                {s.label}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="ct3-nav-actions">
            <button
              className="ct3-btn-primary ct3-nav-cta"
              onClick={() => { scrollTo('book'); setMenuOpen(false) }}
            >
              Reserve
            </button>
            <button
              className="ct3-hamburger"
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Toggle menu"
            >
              <span className={`ct3-ham-bar ${menuOpen ? 'open' : ''}`} />
              <span className={`ct3-ham-bar ${menuOpen ? 'open' : ''}`} />
              <span className={`ct3-ham-bar ${menuOpen ? 'open' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <div className={`ct3-drawer ${menuOpen ? 'open' : ''}`}>
          {SECTIONS.map((s, i) => (
            <button
              key={s.id}
              className={`ct3-drawer-link ${activeId === s.id ? 'active' : ''}`}
              onClick={() => { scrollTo(s.id); setMenuOpen(false) }}
            >
              <span className="ct3-drawer-num">0{i + 1}</span>
              {s.label}
            </button>
          ))}
        </div>
      </header>
    </>
  )
}
