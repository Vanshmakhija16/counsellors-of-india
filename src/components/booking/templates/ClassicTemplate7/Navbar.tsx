'use client'

import { useEffect, useState } from 'react'
import { Leaf } from 'lucide-react'
import type { TherapistProfile } from '../templateUtils'

interface NavbarProps {
  therapist: TherapistProfile
  scrollTo: (id: string) => void
}

const LINKS: [string, string][] = [
  ['About', 'about'],
  ['Focus', 'expertise'],
  ['Process', 'process'],
  ['FAQ', 'faq'],
]

export default function Navbar({ therapist, scrollTo }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState<string>('')

  // Scroll-aware chrome: the bar stays nearly invisible at the very top of
  // the hero, then condenses (tighter height, firmer blur/shadow) once the
  // page has moved — so it doesn't compete with the loader hand-off.
  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 24) }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Active-section tracking: highlight whichever nav link matches the
  // section currently crossing the middle of the viewport.
  useEffect(() => {
    const ids = ['home', ...LINKS.map(([, id]) => id), 'booking']
    const sections = ids
      .map(id => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el)
    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActive(entry.target.id)
        })
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    )
    sections.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <nav className={`ct7-nav ${scrolled ? 'ct7-nav--scrolled' : ''}`}>
      <style>{`
        .ct7-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 40;
          background: rgba(245,248,243,0);
          backdrop-filter: blur(0px);
          border-bottom: 1px solid rgba(20,32,26,0);
          box-shadow: 0 8px 30px rgba(16,42,28,0);
          transition:
            background 420ms var(--ct7-ease-out),
            backdrop-filter 420ms var(--ct7-ease-out),
            border-color 420ms var(--ct7-ease-out),
            box-shadow 420ms var(--ct7-ease-out);
        }
        .ct7-nav--scrolled {
          background: rgba(245,248,243,0.88);
          backdrop-filter: blur(14px);
          border-bottom: 1px solid rgba(20,32,26,0.07);
          box-shadow: 0 8px 30px rgba(16,42,28,0.06);
        }
        .ct7-nav-inner {
          max-width: 1240px; margin: 0 auto; padding: 0 clamp(20px, 5vw, 56px);
          height: 80px; display: flex; align-items: center; justify-content: space-between;
          transition: height 420ms var(--ct7-ease-out);
        }
        .ct7-nav--scrolled .ct7-nav-inner { height: 68px; }

        .ct7-nav-brand { display: flex; align-items: center; gap: 11px; }
        .ct7-nav-mark-icon {
          width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
          background: linear-gradient(145deg, #32453D, #263630);
          display: flex; align-items: center; justify-content: center;
          color: var(--ct7-brass);
        }
        .ct7-nav-mark {
          font-family: 'Fraunces', Georgia, serif; font-weight: 500; font-size: 18px;
          color: var(--ct7-charcoal); letter-spacing: -0.01em;
        }
        .ct7-nav-mark em { font-style: italic; color: #8A9E8F; }

        .ct7-nav-links {
          display: flex; align-items: center; gap: 2px;
          background: var(--ct7-bone-dim); padding: 5px; border-radius: 100px;
        }
        @media (max-width: 880px) { .ct7-nav-links { display: none; } }
        .ct7-nav-link {
          position: relative;
          background: none; border: none; cursor: pointer;
          padding: 9px 16px; border-radius: 100px;
          font-family: 'Inter', system-ui, sans-serif; font-size: 13.5px; font-weight: 500;
          color: var(--ct7-moss);
          transition: color 200ms var(--ct7-ease-out), background 200ms var(--ct7-ease-out);
        }
        .ct7-nav-link:hover { color: var(--ct7-charcoal); background: rgba(255,255,255,0.7); }
        .ct7-nav-link--active { color: var(--ct7-charcoal); background: #fff; box-shadow: 0 4px 12px rgba(16,42,28,0.1); }
        .ct7-nav-link--active::after {
          content: '';
          position: absolute; left: 16px; right: 16px; bottom: 5px; height: 2px;
          background: var(--ct7-brass); border-radius: 2px;
        }

        .ct7-nav-cta {
          padding: 11px 22px;
          background: var(--ct7-ink); color: var(--ct7-brass);
          border: none; border-radius: 100px; cursor: pointer;
          font-family: 'Inter', system-ui, sans-serif; font-size: 13.5px; font-weight: 600;
          box-shadow: 0 8px 20px rgba(16,42,28,0.22);
          transition: transform 200ms var(--ct7-ease-out), box-shadow 200ms var(--ct7-ease-out);
        }
        .ct7-nav-cta:hover { transform: translateY(-1px); box-shadow: 0 10px 24px rgba(16,42,28,0.3); }
      `}</style>

      <div className="ct7-nav-inner">
        <div className="ct7-nav-brand">
          <span className="ct7-nav-mark-icon">
            <Leaf size={16} strokeWidth={2} />
          </span>
          <span className="ct7-nav-mark">
            {therapist.name ? <>{therapist.name.split(' ')[0]} <em>{therapist.name.split(' ').slice(1).join(' ') || 'Practice'}</em></> : <>The <em>Atrium</em></>}
          </span>
        </div>

        <div className="ct7-nav-links">
          {LINKS.map(([label, id]) => (
            <button
              key={id}
              className={`ct7-nav-link ${active === id ? 'ct7-nav-link--active' : ''}`}
              onClick={() => scrollTo(id)}
            >
              {label}
            </button>
          ))}
        </div>

        <button className="ct7-nav-cta" onClick={() => scrollTo('booking')} data-magnetic>
          Book Appointment
        </button>
      </div>
    </nav>
  )
}
