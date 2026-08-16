'use client'

import { BadgeCheck, Star, Users, Award } from 'lucide-react'
import type { TherapistProfile } from '../templateUtils'
import { resolveImage } from '../templateUtils'

interface AboutProps { therapist: TherapistProfile }

export default function About({ therapist }: AboutProps) {
  const bio =
    therapist.bio ||
    'I work with people at very different stages of life — some still in school or college, others deep into their careers — and I believe both deserve support that actually fits their reality, not a one-size-fits-all approach.'
  const langs = therapist.languages || ['English', 'Hindi']
  const photoSrc = resolveImage(therapist.image)
  const credentialLabel = therapist.credentials?.trim() || 'Licensed Practitioner'

  const stats = [
    therapist.experience ? { icon: <Award size={17} strokeWidth={2.2} />, num: `${therapist.experience}+`, lbl: therapist.experience === 1 ? 'Year Exp.' : 'Years Exp.' } : null,
    therapist.rating ? { icon: <Star size={17} strokeWidth={2.2} />, num: therapist.rating.toFixed(1), lbl: 'Rating' } : null,
    therapist.totalReviews ? { icon: <Users size={17} strokeWidth={2.2} />, num: `${therapist.totalReviews}+`, lbl: 'Sessions' } : null,
  ].filter(Boolean) as { icon: React.ReactNode; num: string; lbl: string }[]

  const creds = [
    therapist.credentials?.trim(),
    ...(therapist.certifications ?? []).slice(0, 3),
  ].filter(Boolean) as string[]

  return (
    <section id="about" className="ct8-section" style={{ background: '#FFFFFF' }}>
      <div className="ct8-container ct8-about-grid ct8-about-grid--with-photo">
        <div>
          <div className="ct8-about-photo-orbit">
            <span className="ct8-about-photo-glow" aria-hidden="true" />
            <span className="ct8-about-photo-ring" aria-hidden="true" />
            <div className="ct8-about-photo-wrap">
              <img className="ct8-about-photo" src={photoSrc} alt={therapist.name || 'Therapist portrait'} />
            </div>
            <span className="ct8-about-photo-badge">
              <span className="ct8-about-photo-badge-icon"><BadgeCheck size={14} strokeWidth={2.4} /></span>
              {credentialLabel}
            </span>
          </div>
        </div>

        <div>
          <div className="ct8-section-head" style={{ margin: '0 0 1.5rem' }}>
            <span className="ct8-eyebrow">About Me</span>
          </div>

          <div className="ct8-about-quote-wrap">
            <span className="ct8-about-quote-mark" aria-hidden="true">&ldquo;</span>
            <p className="ct8-about-body ct8-about-body--lead">{bio}</p>
          </div>

          {stats.length > 0 && (
            <div className="ct8-stat-row" style={{ gridTemplateColumns: `repeat(${stats.length}, 1fr)` }}>
              {stats.map(s => (
                <div key={s.lbl} className="ct8-card ct8-stat-box">
                  <div className="ct8-stat-box-icon">{s.icon}</div>
                  <div className="ct8-stat-box-num">{s.num}</div>
                  <div className="ct8-stat-box-lbl">{s.lbl}</div>
                </div>
              ))}
            </div>
          )}

          {creds.length > 0 && (
            <div className="ct8-card ct8-cred-card">
              <span className="ct8-cred-title">Credentials</span>
              {creds.map((c, i) => (
                <div key={i} className="ct8-cred-item">
                  <span className="ct8-cred-dot" />
                  <span className="ct8-cred-text">{c}</span>
                </div>
              ))}
            </div>
          )}

          <div className="ct8-chip-wrap" style={{ marginTop: '1.4rem' }}>
            {langs.map(l => (
              <span key={l} className="ct8-chip">{l}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
