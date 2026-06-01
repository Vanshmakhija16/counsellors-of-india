'use client'

import type { TherapistProfile } from '../templateUtils'

interface FooterProps {
  therapist: TherapistProfile
}

export default function Footer({ therapist }: FooterProps) {
  const year     = new Date().getFullYear()
  const fullName = therapist.name ?? 'Practice'

  return (
    <footer className="ct3-footer ct3-gold-rule-top">
      <div className="ct3-container">

        {/* Big colophon name */}
        <div className="ct3-footer-name">{fullName}.</div>

        <div className="ct3-footer-grid">
          <div>
            <span className="ct3-footer-col-label">Colophon</span>
            <p className="ct3-footer-col-text">
              {therapist.credentials || 'Psychotherapy practice'} based in {' '}
              {therapist.location || 'India'} {'  '} {'  '}
               {year}.
            </p>
          </div>

          <div>
            <span className="ct3-footer-col-label">Contact</span>
            {therapist.phone && (
              <a href={`tel:${therapist.phone}`} className="ct3-footer-link">{therapist.phone}</a>
            )}
            {therapist.whatsapp && (
              <a href={`https://wa.me/${therapist.whatsapp.replace(/\D/g, '')}`}
                className="ct3-footer-link" target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            )}
            {therapist.location && (
              <p className="ct3-footer-col-text" style={{ marginTop: 4 }}>
                {therapist.location}
              </p>
            )}
          </div>

          <div>
            <span className="ct3-footer-col-label">Elsewhere</span>
            {therapist.instagram && (
              <a href={therapist.instagram} className="ct3-footer-link" target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
            )}
            {therapist.linkedin && (
              <a href={therapist.linkedin} className="ct3-footer-link" target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
            )}
            {therapist.website && (
              <a href={therapist.website} className="ct3-footer-link" target="_blank" rel="noopener noreferrer">
                Website
              </a>
            )}
          </div>
        </div>

        <div className="ct3-footer-bottom">
          <p className="ct3-footer-copy">
            © {year} · {fullName.toUpperCase()} · COUNSELLORS OF INDIA
          </p>
          {/* <p className="ct3-footer-tag">ATELIER BLANC · CT3</p> */}
        </div>
      </div>
    </footer>
  )
}
