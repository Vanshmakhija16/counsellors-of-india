'use client'

import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import type { TherapistProfile } from '../templateUtils'
import { getInitials, getFirstName } from '../templateUtils'

interface NavbarProps {
  scrolled: boolean
  scrollTo: (id: string) => void
  therapist: TherapistProfile
}

const NAV_LINKS = ['Home', 'About', 'Services', 'Explore'] as const

export default function Navbar({ scrolled, scrollTo, therapist }: NavbarProps) {
  const initials = getInitials(therapist.name ?? '')
  // Brand mark uses the FIRST name (after stripping an honorific like "Dr.")
  const firstName = getFirstName(therapist.name ?? '')

  // Sidebar is closed by default on every load.
  const [menuOpen, setMenuOpen] = useState(false)

  // Lock body scroll while the sidebar is open; restore on close/unmount.
  useEffect(() => {
    if (!menuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [menuOpen])

  // Close on Escape for keyboard / accessibility parity.
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const handleNav = (id: string) => {
    setMenuOpen(false)
    // Let the sidebar begin closing before we scroll, so layout is stable.
    setTimeout(() => scrollTo(id), 60)
  }

  return (
    <nav className={`ct-nav ${scrolled ? 'ct-nav--scrolled' : ''}`}>

      {/* LEFT — brand mark */}
      <button
        onClick={() => handleNav('home')}
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
            {firstName || therapist.name}
          </span>
          <span className="text-[8px] font-medium uppercase tracking-[0.30em] text-[#9a8067]">
            Practice
          </span>
        </span>
      </button>

      {/* CENTER — nav links (desktop only) */}
      <div className="ct-nav__links" style={{ justifySelf: 'center', gap: 32 }}>
        {NAV_LINKS.map((l) => (
          <button
            key={l}
            onClick={() => handleNav(l === 'Explore' ? 'carousel' : l.toLowerCase())}
            className="ct-nav__link"
          >
            {l}
          </button>
        ))}
      </div>

      {/* RIGHT — CTA (desktop) + hamburger (mobile) */}
      <div className="ct-nav__right">
        <button onClick={() => handleNav('contact')} className="ct-nav__cta">
          Contact
        </button>
        <button
          className="ct-nav__burger"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={menuOpen}
        >
          <Menu size={22} strokeWidth={1.6} />
        </button>
      </div>

      {/* MOBILE SIDEBAR + scrim — rendered always, toggled via class */}
      <div
        className={`ct-sidebar-scrim ${menuOpen ? 'ct-sidebar-scrim--open' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />
      <aside
        className={`ct-sidebar ${menuOpen ? 'ct-sidebar--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        <div className="ct-sidebar__head">
          <div className="flex items-center gap-3">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#b46b50] bg-[#1a1a18] text-[12px] font-semibold tracking-[0.04em] text-[#f3ece4]"
              style={{ fontFamily: 'var(--font-fraunces), serif' }}
            >
              {initials}
            </span>
            <span className="flex flex-col leading-tight">
              <span
                className="text-[15px] tracking-[-0.01em] text-[#1a1a18]"
                style={{ fontFamily: 'var(--font-fraunces), serif' }}
              >
                {firstName || therapist.name}
              </span>
              <span className="text-[8px] font-medium uppercase tracking-[0.30em] text-[#9a8067]">
                Practice
              </span>
            </span>
          </div>
          <button
            className="ct-sidebar__close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={22} strokeWidth={1.6} />
          </button>
        </div>

        <nav className="ct-sidebar__links">
          {NAV_LINKS.map((l, i) => (
            <button
              key={l}
              onClick={() => handleNav(l === 'Explore' ? 'carousel' : l.toLowerCase())}
              className="ct-sidebar__link"
              style={{ transitionDelay: menuOpen ? `${0.06 + i * 0.05}s` : '0s' }}
            >
              {l}
            </button>
          ))}
        </nav>

        <div className="ct-sidebar__foot">
          <button onClick={() => handleNav('contact')} className="ct-sidebar__cta">
            Contact
          </button>
        </div>
      </aside>

    </nav>
  )
}
