'use client'

import type { TherapistProfile } from '../templateUtils'

interface NavbarProps {
  scrolled: boolean
  scrollTo: (id: string) => void
  therapist: TherapistProfile
}

function getInitials(name: string): string {
  if (!name) return '·'
  const parts = name.replace(/^Dr\.?\s+/i, '').trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

export default function Navbar({ scrolled, scrollTo, therapist }: NavbarProps) {
  const initials = getInitials(therapist.name ?? '')
  const lastName = (therapist.name ?? '').replace(/^Dr\.?\s+/i, '').split(/\s+/).slice(-1)[0] ?? ''

  return (
    <nav className={`ct-nav ${scrolled ? 'ct-nav--scrolled' : ''}`}>

      {/* LEFT — brand mark */}
      <button
        onClick={() => scrollTo('home')}
        className="flex items-center gap-3 transition-opacity hover:opacity-80"
        style={{ justifySelf: 'start' }}
        aria-label="Home"
      >
        <span
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#b46b50] bg-[#1a1a18] text-[12px] font-semibold tracking-[0.04em] text-[#f3ece4]"
          style={{ fontFamily: 'var(--font-fraunces), serif' }}
        >
          {initials}
        </span>
        <span className="hidden flex-col leading-tight sm:flex">
          <span
            className="text-[15px] tracking-[-0.01em] text-[#1a1a18]"
            style={{ fontFamily: 'var(--font-fraunces), serif' }}
          >
            {lastName || therapist.name}
          </span>
          <span className="text-[8px] font-medium uppercase tracking-[0.30em] text-[#9a8067]">
            Practice
          </span>
        </span>
      </button>

      {/* CENTER — nav links */}
      <div
        className="ct-nav__links"
        style={{ justifySelf: 'center', gap: 32 }}
      >
        {['Home', 'About', 'Services', 'Carousel'].map((l) => (
          <button
            key={l}
            onClick={() => scrollTo(l === 'Carousel' ? 'carousel' : l.toLowerCase())}
            className="ct-nav__link"
          >
            {l}
          </button>
        ))}
      </div>

      {/* RIGHT — CTA */}
      <div className="ct-nav__right">
        <button onClick={() => scrollTo('contact')} className="ct-nav__cta">
          Contact
        </button>
      </div>

    </nav>
  )
}
