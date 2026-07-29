'use client'

import type { TherapistProfile } from '../templateUtils'

interface FooterProps { therapist: TherapistProfile }

const NAV_LINKS = [
  { id: 'hero',     label: 'Home' },
  { id: 'about',    label: 'About' },
  { id: 'services', label: 'Services' },
  { id: 'faq',      label: 'FAQ' },
]

export default function Footer({ therapist }: FooterProps) {
  const year = new Date().getFullYear()
  const name = therapist.name || 'Therapist'

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <footer className="ct8-footer">
      <div className="ct8-footer-inner">
        <div className="ct8-footer-top">
          <div>
            <h3 className="ct8-heading ct8-footer-name">{name}</h3>
            <p className="ct8-footer-tagline">
              {therapist.credentials || 'Licensed Clinical Psychologist'}
              <br />
              {therapist.city || 'India'}
            </p>
          </div>

          <div>
            <span className="ct8-footer-col-title">Navigate</span>
            {NAV_LINKS.map(l => (
              <button key={l.id} className="ct8-footer-link" onClick={() => scrollTo(l.id)}>
                {l.label}
              </button>
            ))}
          </div>

          <div>
            <span className="ct8-footer-col-title">Get in Touch</span>
            <button className="ct8-footer-link" onClick={() => scrollTo('book')}>Book a Session</button>
            {therapist.phone && (
              <a href={`tel:${therapist.phone}`} className="ct8-footer-link" style={{ textDecoration: 'none' }}>
                {therapist.phone}
              </a>
            )}
            {therapist.email && (
              <a href={`mailto:${therapist.email}`} className="ct8-footer-link" style={{ textDecoration: 'none' }}>
                {therapist.email}
              </a>
            )}
          </div>
        </div>

        <div className="ct8-footer-bottom">
          <span className="ct8-footer-copy">© {year} {name} · Counsellors of India. All rights reserved.</span>
        </div>
      </div>
    </footer>
  )
}
