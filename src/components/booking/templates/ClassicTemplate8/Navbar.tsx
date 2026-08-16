'use client'

import { useState } from 'react'
import { Menu, X, Calendar } from 'lucide-react'
import type { TherapistProfile } from '../templateUtils'

interface NavbarProps {
  therapist: TherapistProfile
  scrollTo: (id: string) => void
}

const LINKS = [
  { id: 'about',    label: 'About' },
  { id: 'services', label: 'Services' },
  { id: 'faq',      label: 'FAQ' },
]

export default function Navbar({ therapist, scrollTo }: NavbarProps) {
  const [open, setOpen] = useState(false)

  function handleNavClick(id: string) {
    setOpen(false)
    scrollTo(id)
  }

  return (
    <nav className="ct8-nav">
      <span className="ct8-nav-name">{therapist.name || 'The Common Room'}</span>

      <div className="ct8-nav-center">
        <div className="ct8-nav-links">
          {LINKS.map(l => (
            <button key={l.id} className="ct8-nav-link" onClick={() => handleNavClick(l.id)}>
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="ct8-nav-right">
        <button className="ct8-nav-cta" onClick={() => handleNavClick('book')}>
          <Calendar size={14} />
          <span className="ct8-nav-cta-label">Book Session</span>
        </button>

        <button
          type="button"
          className="ct8-nav-burger"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen(o => !o)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="ct8-nav-mobile-sheet" role="menu">
          {LINKS.map(l => (
            <button key={l.id} className="ct8-nav-mobile-link" role="menuitem" onClick={() => handleNavClick(l.id)}>
              {l.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  )
}
