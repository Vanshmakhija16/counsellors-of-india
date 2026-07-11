'use client'

import { Leaf } from 'lucide-react'
import type { TherapistProfile } from '../templateUtils'

interface NavbarProps {
  therapist: TherapistProfile
  scrollTo: (id: string) => void
}

const LINKS: [string, string][] = [
  ['Home', 'home'],
  ['About', 'about'],
  ['Services', 'services'],
  ['Appointments', 'book-form'],
  ['Contact', 'contact'],
]

export default function Navbar({ therapist, scrollTo }: NavbarProps) {
  return (
    <nav className="ct7-nav">
      <style>{`
        .ct7-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 40;
          background: rgba(245,248,243,0.86);
          backdrop-filter: blur(14px);
          border-bottom: 1px solid rgba(20,32,26,0.06);
        }
        .ct7-nav-inner {
          max-width: 1240px; margin: 0 auto; padding: 0 clamp(20px, 5vw, 56px);
          height: 80px; display: flex; align-items: center; justify-content: space-between;
        }

        .ct7-nav-brand { display: flex; align-items: center; gap: 11px; }
        .ct7-nav-mark-icon {
          width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
          background: linear-gradient(145deg, #193826, #102A1C);
          display: flex; align-items: center; justify-content: center;
          color: var(--ct7-brass);
        }
        .ct7-nav-mark {
          font-family: 'Fraunces', Georgia, serif; font-weight: 500; font-size: 18px;
          color: var(--ct7-charcoal); letter-spacing: -0.01em;
        }
        .ct7-nav-mark em { font-style: italic; color: #2E6B45; }

        .ct7-nav-links {
          display: flex; align-items: center; gap: 2px;
          background: var(--ct7-bone-dim); padding: 5px; border-radius: 100px;
        }
        @media (max-width: 880px) { .ct7-nav-links { display: none; } }
        .ct7-nav-link {
          background: none; border: none; cursor: pointer;
          padding: 9px 16px; border-radius: 100px;
          font-family: 'Inter', system-ui, sans-serif; font-size: 13.5px; font-weight: 500;
          color: var(--ct7-moss);
          transition: color 200ms var(--ct7-ease-out), background 200ms var(--ct7-ease-out);
        }
        .ct7-nav-link:hover { color: var(--ct7-charcoal); background: rgba(255,255,255,0.7); }

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
            <button key={id} className="ct7-nav-link" onClick={() => scrollTo(id)}>
              {label}
            </button>
          ))}
        </div>

        <button className="ct7-nav-cta" onClick={() => scrollTo('book-form')}>
          Book Appointment
        </button>
      </div>
    </nav>
  )
}
