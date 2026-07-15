'use client'

import type { TherapistProfile } from '../templateUtils'
import { getFirstName } from '../templateUtils'

interface FooterProps {
  therapist: TherapistProfile
  scrollTo: (id: string) => void
}

export default function Footer({ therapist, scrollTo }: FooterProps) {
  const firstName = getFirstName(therapist.name ?? '') || 'The Atrium'
  const year = new Date().getFullYear()

  return (
    <footer className="ct7-ft" style={{ background: 'var(--ct7-ink)' }}>
      <style>{`
        .ct7-ft { position: relative; padding: 56px clamp(20px,5vw,56px) 32px; }
        .ct7-ft-corner { position: absolute; font-family: 'JetBrains Mono', monospace; font-size: 13px; color: var(--ct7-brass); opacity: 0.5; }
        .ct7-ft-corner--tl { top: 20px; left: 20px; }
        .ct7-ft-corner--tr { top: 20px; right: 20px; }
        .ct7-ft-inner {
          max-width: 1140px; margin: 0 auto; display: flex; flex-wrap: wrap;
          align-items: center; justify-content: space-between; gap: 24px;
        }
        .ct7-ft-brand { font-family: 'Fraunces', Georgia, serif; font-weight: 500; font-size: 21px; color: #F6F1E7; }
        .ct7-ft-links { display: flex; gap: 24px; flex-wrap: wrap; }
        .ct7-ft-link {
          background: none; border: none; cursor: pointer; color: rgba(246,241,231,0.7);
          font-family: 'Inter', system-ui, sans-serif; font-size: 13.5px; padding: 0;
          transition: color 250ms var(--ct7-ease-out);
        }
        .ct7-ft-link:hover { color: var(--ct7-brass); }
        .ct7-ft-base {
          max-width: 1140px; margin: 36px auto 0; padding-top: 20px;
          border-top: 1px solid rgba(246,241,231,0.1);
          display: flex; flex-wrap: wrap; justify-content: space-between; gap: 10px;
        }
        .ct7-ft-base span {
          font-family: 'JetBrains Mono', monospace; font-size: 10.5px; letter-spacing: 0.04em;
          color: rgba(246,241,231,0.4); flex-shrink: 0;
        }
        @media (max-width: 480px) { .ct7-ft-base { flex-direction: column; align-items: flex-start; gap: 6px; } }
      `}</style>

      <span className="ct7-ft-corner ct7-ft-corner--tl">+</span>
      <span className="ct7-ft-corner ct7-ft-corner--tr">+</span>

      <div className="ct7-ft-inner">
        <div className="ct7-ft-brand">{firstName}</div>
        <nav className="ct7-ft-links">
          <button className="ct7-ft-link" onClick={() => scrollTo('about')}>About</button>
          <button className="ct7-ft-link" onClick={() => scrollTo('expertise')}>Focus</button>
          <button className="ct7-ft-link" onClick={() => scrollTo('process')}>Process</button>
          <button className="ct7-ft-link" onClick={() => scrollTo('faq')}>FAQ</button>
          <button className="ct7-ft-link" onClick={() => scrollTo('booking')}>Book</button>
        </nav>
      </div>

      <div className="ct7-ft-base">
        <span>&copy; {year} {therapist.name}</span>
        <span>Counsellors of India</span>
      </div>
    </footer>
  )
}
