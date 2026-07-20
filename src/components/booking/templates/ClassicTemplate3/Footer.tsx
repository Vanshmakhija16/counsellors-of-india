'use client'

import type { TherapistProfile } from '../templateUtils'
import { resolveCT3Content } from '../templateUtils'

interface FooterProps {
  therapist: TherapistProfile
}

export default function Footer({ therapist }: FooterProps) {
  const year     = new Date().getFullYear()
  const fullName = therapist.name ?? 'Practice'

  const content     = resolveCT3Content(therapist.profile_content?.classic3)
  const footerLabel = content.footer.label?.trim() || therapist.name || 'About'
  const footerNote  = content.footer.note?.trim()

  return (
    <footer className="ct3-footer ct3-gold-rule-top">
      <div className="ct3-container">

        <div className="ct3-footer-grid">
          <div>
            <span className="ct3-footer-col-label">{footerLabel}</span>
            <p className="ct3-footer-col-text">
              {footerNote ? footerNote : (
                <>
                  {therapist.credentials || 'Psychotherapy practice'} based in {' '}
                  {therapist.location || 'India'} {'  '} {'  '}
                   {year}.
                </>
              )}
            </p>
          </div>

          <div>
            <span className="ct3-footer-col-label">Contact</span>
            {therapist.phone && (
              <a href={`tel:${therapist.phone}`} className="ct3-footer-link">{therapist.phone}</a>
            )}
            {therapist.email && (
              <a href={`mailto:${therapist.email}`} className="ct3-footer-link">{therapist.email}</a>
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
