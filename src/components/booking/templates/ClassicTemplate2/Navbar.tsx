'use client'

import type { TherapistProfile } from '../templateUtils'
import { getInitials } from '../templateUtils'

interface NavbarProps {
  scrolled: boolean
  scrollTo: (id: string) => void
  therapist: TherapistProfile
}

const LINKS = [
  { id: 'about', label: 'Practice' },
  { id: 'services', label: 'Services' },
  { id: 'insights', label: 'Insights' },
  { id: 'faq', label: 'FAQ' },
  { id: 'book', label: 'Book' },
]

export default function Navbar({ scrolled, scrollTo, therapist }: NavbarProps) {
  const initials = getInitials(therapist.name ?? '')

  return (
    <header
      className="absolute top-0 inset-x-0 z-40 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(249,244,241,0.88)' : 'transparent',
        backdropFilter: scrolled ? 'blur(14px) saturate(140%)' : 'none',
        borderBottom: scrolled ? '1px solid var(--ink-3)' : '1px solid transparent',
      }}
    >
      {/* Padding lives on this full-width wrapper (px-6 lg:px-12), matching
          Hero's section padding exactly, with the max-w-[1080px] content
          nested inside carrying zero padding of its own — same nesting
          Hero uses, so the name lines up with the tagline's left edge at
          any viewport width instead of just approximately matching it. */}
      <div className="px-6 lg:px-12">
        <nav className="mx-auto max-w-[1080px] flex items-center justify-between mt-4 h-16">
          <button
            onClick={() => scrollTo('home')}
            className="flex items-center gap-3 group"
          >

            <span className="ct2-nav-font text-[12.5px] font-medium uppercase tracking-[0.14em]" style={{ color: 'var(--bone)' }}>
              {therapist.name?.split(' ')[0] ?? 'Practice'}
            </span>
          </button>

          <div className="flex items-center gap-9 ml-auto">
            <div className="hidden md:flex items-center gap-9">
              {LINKS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => scrollTo(l.id)}
                  className="ct2-nav-font text-[12.5px] font-medium uppercase tracking-[0.14em] transition-colors"
                  style={{ color: 'var(--bone)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--bone)')}
                >
                  {l.label}
                </button>
              ))}
            </div>

            <button onClick={() => scrollTo('book')} className="ct2-btn-primary hidden md:inline-flex">
              Reserve
            </button>
          </div>
        </nav>
      </div>
    </header>
  )
}
