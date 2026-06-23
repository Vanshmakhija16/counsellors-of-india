'use client'

import type { TherapistProfile } from '../templateUtils'

interface FooterProps { therapist: TherapistProfile }

export default function Footer({ therapist }: FooterProps) {
  const year = new Date().getFullYear()
  const name = therapist.name ?? 'Therapist'

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const NAV_LINKS = [
    { id: 'home',         label: 'Home'        },
    { id: 'about',        label: 'About'       },
    { id: 'specialties',  label: 'Specialties' },
    { id: 'testimonials', label: 'Reviews'     },
    { id: 'faq',          label: 'FAQ'         },
  ]

  const QUICK_LINKS = [
    { id: 'book',         label: 'Book a Session'  },
    { id: 'about',        label: 'My Approach'     },
    { id: 'specialties',  label: 'What I Treat'    },
  ]

  return (
    <footer className="ct5-footer">
      <div className="ct5-footer-inner">

        <div className="ct5-footer-top">

          {/* Brand column */}
          <div>
            <h3 className="ct5-footer-name">{name}</h3>
            <p className="ct5-footer-tagline">
              {therapist.credentials || 'Licensed Clinical Psychologist'}<br />
              {therapist.city || 'India'}
            </p>
            {/* <div style={{ marginTop: '1.5rem' }}>
              <div className="ct5-footer-badge">
                <span style={{ fontSize: 8 }}>🌿</span>
                Counsellors of India
              </div>
            </div> */}
          </div>

          {/* Navigation */}
          <div>
            <span className="ct5-footer-col-title">Navigate</span>
            {NAV_LINKS.map(l => (
              <button key={l.id} className="ct5-footer-link" onClick={() => scrollTo(l.id)}>
                {l.label}
              </button>
            ))}
          </div>

          {/* Quick actions */}
          <div>
            <span className="ct5-footer-col-title">Quick Access</span>
            {QUICK_LINKS.map(l => (
              <button key={l.id} className="ct5-footer-link" onClick={() => scrollTo(l.id)}>
                {l.label}
              </button>
            ))}
            {therapist.phone && (
              <a href={`tel:${therapist.phone}`} className="ct5-footer-link"
                style={{ textDecoration: 'none', display: 'block' }}>
                {therapist.phone}
              </a>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="ct5-footer-bottom">
          <span className="ct5-footer-copy">
            © {year} {name} · Counsellors of India. All rights reserved.
          </span>
          {/* <span className="ct5-footer-copy" style={{ opacity: 0.4 }}>
            Confidential · Evidence-Based · RCI Licensed
          </span> */}
        </div>
      </div>
    </footer>
  )
}
