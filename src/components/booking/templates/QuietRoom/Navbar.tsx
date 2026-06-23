'use client'

import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import type { TherapistProfile } from '../templateUtils'
import { getInitials, getFirstName } from '../templateUtils'

interface NavProps {
  scrollTo: (id: string) => void
  therapist: TherapistProfile
}

const LINKS = [
  { id: 'about',        label: 'About'    },
  { id: 'expertise',    label: 'Focus'    },
  { id: 'process',      label: 'Process'  },
  { id: 'testimonials', label: 'Voices'   },
  { id: 'readings',     label: 'Readings' },
]

export default function Navbar({ scrollTo, therapist }: NavProps) {
  const initials  = getInitials(therapist.name ?? '')
  const firstName = getFirstName(therapist.name ?? '') || 'Practice'

  const [scrolled, setScrolled] = useState(false)
  // Whether the nav currently sits over a dusk (dark) section, so it can flip
  // its text/colors to stay legible as the room's light changes.
  const [overDusk, setOverDusk] = useState(true)   // hero is dusk
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24)
      // Sample the section sitting under the navbar's midline.
      const probe = document.elementsFromPoint(window.innerWidth / 2, 40)
      const duskEl = probe.find(el => el.classList?.contains('qr-dusk') || el.closest?.('.qr-dusk'))
      setOverDusk(Boolean(duskEl))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (menuOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [menuOpen])

  const ink = overDusk ? '#F2EEE4' : '#2E2A26'

  return (
    <>
      <style>{`
        .qr-nav { position: fixed; top: 0; inset-inline: 0; z-index: 50;
          display: flex; align-items: center; justify-content: space-between;
          padding: 22px clamp(20px, 5vw, 56px);
          transition: background 700ms var(--qr-calm-inout), padding 500ms var(--qr-calm-inout),
            backdrop-filter 700ms var(--qr-calm-inout); }
        .qr-nav--scrolled { padding-top: 14px; padding-bottom: 14px;
          backdrop-filter: blur(10px); }
        .qr-nav--scrolled.qr-nav--dusk  { background: rgba(42, 35, 48, 0.6); }
        .qr-nav--scrolled.qr-nav--light { background: rgba(232, 226, 214, 0.65); }

        .qr-brand { display: flex; align-items: center; gap: 12px; cursor: pointer; }
        .qr-brand-mark { width: 36px; height: 36px; border-radius: 9px;
          display: grid; place-items: center; font-family: 'Spectral', serif; font-style: italic;
          font-size: 15px; border: 1px solid currentColor; opacity: 0.92; }
        .qr-brand-name { font-family: 'Spectral', serif; font-weight: 300; font-size: 19px; letter-spacing: 0.01em; }

        .qr-nav-links { display: flex; align-items: center; gap: 30px; }
        @media (max-width: 860px) { .qr-nav-links--desktop { display: none; } }
        .qr-nav-link { background: none; border: none; cursor: pointer; color: inherit;
          font-family: 'IBM Plex Sans', sans-serif; font-size: 14px; position: relative; padding: 4px 0; opacity: 0.82; }
        .qr-nav-link:hover { opacity: 1; }
        .qr-nav-link::after { content: ''; position: absolute; left: 0; bottom: -2px; height: 1px; width: 100%;
          background: currentColor; transform: scaleX(0); transform-origin: left;
          transition: transform 300ms var(--qr-calm-inout); }
        .qr-nav-link:hover::after { transform: scaleX(1); }

        .qr-nav-cta { font-family: 'IBM Plex Sans', sans-serif; font-size: 14px; font-weight: 500;
          padding: 10px 20px; border-radius: 10px; background: var(--qr-fig); color: var(--qr-paper);
          border: none; cursor: pointer; transition: box-shadow 600ms var(--qr-calm-out); }
        .qr-nav-cta:hover { box-shadow: inset 0 1px 14px rgba(255,255,255,0.2); }

        .qr-burger { display: none; background: none; border: none; cursor: pointer; color: inherit; }
        @media (max-width: 860px) { .qr-burger { display: inline-flex; } .qr-nav-cta--desktop { display: none; } }

        .qr-drawer { position: fixed; inset: 0; z-index: 60; background: var(--qr-ink); color: var(--qr-paper);
          display: flex; flex-direction: column; justify-content: center; gap: 8px; padding: 40px;
          transform: translateX(100%); transition: transform 500ms var(--qr-calm-out); }
        .qr-drawer--open { transform: translateX(0); }
        .qr-drawer button { background: none; border: none; color: inherit; cursor: pointer; text-align: left;
          font-family: 'Spectral', serif; font-weight: 300; font-size: 30px; padding: 12px 0; }
        .qr-drawer-close { position: absolute; top: 26px; right: 26px; }
      `}</style>

      <nav
        className={`qr-nav ${scrolled ? 'qr-nav--scrolled' : ''} ${overDusk ? 'qr-nav--dusk' : 'qr-nav--light'}`}
        style={{ color: ink }}
      >
        <div className="qr-brand" onClick={() => scrollTo('home')}>
          <span className="qr-brand-mark">{initials}</span>
          <span className="qr-brand-name">{firstName}</span>
        </div>

        <div className="qr-nav-links qr-nav-links--desktop">
          {LINKS.map(l => (
            <button key={l.id} className="qr-nav-link" onClick={() => scrollTo(l.id)}>{l.label}</button>
          ))}
          <button className="qr-nav-cta qr-nav-cta--desktop" onClick={() => scrollTo('book')}>Book a session</button>
        </div>

        <button className="qr-burger" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
          <Menu size={22} />
        </button>
      </nav>

      <div className={`qr-drawer ${menuOpen ? 'qr-drawer--open' : ''}`}>
        <button className="qr-drawer-close" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
          <X size={24} />
        </button>
        {LINKS.map(l => (
          <button key={l.id} onClick={() => { setMenuOpen(false); scrollTo(l.id) }}>{l.label}</button>
        ))}
        <button onClick={() => { setMenuOpen(false); scrollTo('book') }} style={{ color: 'var(--qr-honey)' }}>
          Book a session
        </button>
      </div>
    </>
  )
}
