'use client'

import type { TherapistProfile } from '../templateUtils'
import { getFirstName } from '../templateUtils'

interface FooterProps {
  therapist: TherapistProfile
  scrollTo: (id: string) => void
}

export default function Footer({ therapist, scrollTo }: FooterProps) {
  const firstName = getFirstName(therapist.name ?? '') || 'The Quiet Room'
  const year = new Date().getFullYear()

  return (
    <footer className="qr-dusk qr-ft">
      <style>{`
        .qr-ft { position: relative; padding: 64px clamp(20px,5vw,56px) 40px; }
        /* The room's lights settling for the night — a vignette dim into the footer. */
        .qr-ft::before { content: ''; position: absolute; top: -120px; left: 0; right: 0; height: 120px;
          background: linear-gradient(to bottom, transparent, var(--qr-ink)); pointer-events: none; }
        .qr-ft-inner { max-width: 1140px; margin: 0 auto; display: flex; flex-wrap: wrap;
          align-items: center; justify-content: space-between; gap: 24px; }
        .qr-ft-brand { font-family: 'Spectral', serif; font-weight: 300; font-size: 22px; color: var(--qr-paper); }
        .qr-ft-links { display: flex; gap: 26px; flex-wrap: wrap; }
        .qr-ft-link { background: none; border: none; cursor: pointer; color: rgba(242,238,228,0.7);
          font-family: 'IBM Plex Sans', sans-serif; font-size: 14px; padding: 0; transition: color 300ms var(--qr-calm-out); }
        .qr-ft-link:hover { color: var(--qr-honey); }
        .qr-ft-base { max-width: 1140px; margin: 40px auto 0; padding-top: 22px;
          border-top: 1px solid rgba(242,238,228,0.1); display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px; }
        .qr-ft-base span { font-size: 11px; color: rgba(242,238,228,0.42); }
      `}</style>

      <div className="qr-ft-inner">
        <div className="qr-ft-brand">{firstName}</div>
        <nav className="qr-ft-links">
          <button className="qr-ft-link" onClick={() => scrollTo('about')}>About</button>
          <button className="qr-ft-link" onClick={() => scrollTo('expertise')}>Focus</button>
          <button className="qr-ft-link" onClick={() => scrollTo('process')}>Process</button>
          <button className="qr-ft-link" onClick={() => scrollTo('faq')}>FAQ</button>
          <button className="qr-ft-link" onClick={() => scrollTo('book')}>Book</button>
        </nav>
      </div>

      <div className="qr-ft-base qr-mono">
        <span>&copy; {year} {therapist.name}</span>
        <span>Counsellors of India</span>
      </div>
    </footer>
  )
}
