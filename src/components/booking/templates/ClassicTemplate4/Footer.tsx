'use client'

import type { TherapistProfile } from '../templateUtils'

interface FooterProps { therapist: TherapistProfile }

export default function Footer({ therapist }: FooterProps) {
  const year = new Date().getFullYear()
  const name = therapist.name ?? 'Therapist'

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return ( 
    <footer className="ct4-footer">
      {/* Gold rule */}
      <div style={{ maxWidth: 1200, margin: '0 auto 2rem' }}>
        <div
          style={{
            height: '0.5px',
            background: 'linear-gradient(90deg, transparent, var(--gold-muted), transparent)',
            marginBottom: '2rem',
          }}
        />
      </div>

      <div className="ct4-footer-inner">
        {/* Brand */}
        <div>
          <div className="ct4-footer-brand">{name}</div>
          <div className="ct4-footer-copy" style={{ marginTop: '0.4rem' }}>
             Clinical Psychologist · {therapist.city || 'USA'}
          </div>
        </div>

        {/* Links */}
        <nav className="ct4-footer-links">
          {[
            { id: 'home',     label: 'Home'    },
            { id: 'about',   label: 'About' },
            { id: 'services',label: 'Services'   },
            { id: 'book',    label: 'Book'  },
          ].map(l => (
            <button key={l.id} className="ct4-footer-link" onClick={() => scrollTo(l.id)}>
              {l.label}
            </button>
          ))}
        </nav>

        {/* Copyright */}
        {/* <div className="ct4-footer-copy">
          © {year} Counsellors of India
        </div> */}
      </div>
    </footer>
  )
}
