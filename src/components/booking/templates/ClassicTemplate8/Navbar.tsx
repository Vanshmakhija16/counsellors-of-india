'use client'

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
  return (
    <nav className="ct8-nav">
      <span className="ct8-nav-name">{therapist.name || 'The Common Room'}</span>
      <div className="ct8-nav-links ct8-nav-links-desktop">
        {LINKS.map(l => (
          <button key={l.id} className="ct8-nav-link" onClick={() => scrollTo(l.id)}>
            {l.label}
          </button>
        ))}
        <button className="ct8-btn-primary" onClick={() => scrollTo('book')} style={{ padding: '9px 20px', fontSize: 13 }}>
          Book
        </button>
      </div>
    </nav>
  )
}
