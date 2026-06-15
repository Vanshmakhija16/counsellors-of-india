'use client'

import type { TherapistProfile } from '../templateUtils'

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
  const initials = (therapist.name ?? '')
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header
      className="fixed top-0 inset-x-0 z-40 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(11,13,14,0.86)' : 'transparent',
        backdropFilter: scrolled ? 'blur(14px) saturate(140%)' : 'none',
        borderBottom: scrolled ? '1px solid var(--ink-3)' : '1px solid transparent',
      }}
    >
      <nav className="mx-auto max-w-[1080px] flex items-center justify-between px-6 lg:px-10 mt-4 h-16">
        <button
          onClick={() => scrollTo('home')}
          className="flex items-center gap-3 group"
        >
          <span
            className="ct2-mono"
            style={{
              width: 36,
              height: 36,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rounded-2xl var(--gold)',
              color: 'var(--gold)',
              fontSize: 12,
              letterSpacing: '0.06em',
            }}
          >
            {initials || 'TC'}
          </span>
          <span className="ct2-serif text-base" style={{ color: 'var(--bone)' }}>
            {therapist.name?.split(' ')[0] ?? 'Practice'}
          </span>
        </button>

        <div className="hidden md:flex items-center gap-9">
          {LINKS.map((l) => (
            <button
              key={l.id}
              onClick={() => scrollTo(l.id)}
              className="text-[12px] uppercase tracking-[0.18em] transition-colors"
              style={{ color: 'var(--mute)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--bone)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--mute)')}
            >
              {l.label}
            </button>
          ))}
        </div>

        <button onClick={() => scrollTo('book')} className="ct2-btn-primary hidden md:inline-flex">
          Reserve
        </button>
      </nav>
    </header>
  )
}
