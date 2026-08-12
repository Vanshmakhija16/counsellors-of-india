'use client'

import { GraduationCap } from 'lucide-react'
import type { TherapistProfile } from '../templateUtils'
import { resolveImage, DEFAULT_PROFILE_IMAGE } from '../templateUtils'

interface AboutProps { therapist: TherapistProfile }

export default function About({ therapist }: AboutProps) {
  const name = therapist.name || 'Your Name'
  const photo = resolveImage(therapist.image)
  const bio =
    therapist.bio ||
    'I work with people at very different stages of life — some still in school or college, others deep into their careers — and I believe both deserve support that actually fits their reality, not a one-size-fits-all approach.'
  const education = (therapist.education || ['M.Phil Clinical Psychology', 'RCI Licensed Psychologist']).map(
    (e: unknown) =>
      typeof e === 'string'
        ? e
        : [(e as { degree?: string }).degree, (e as { institution?: string }).institution, (e as { year?: string | number }).year]
            .filter(Boolean)
            .join(' — ')
  )
  const certs = therapist.certifications || ['Cognitive Behavioral Therapy (CBT)', 'Mindfulness-Based Approaches']
  const langs = therapist.languages || ['English', 'Hindi']
  const exp = therapist.experience ?? 8
  const cred = therapist.credentials || 'Clinical Psychologist'

  return (
    <section id="about" className="ct8-section">
      <div className="ct8-container ct8-about-grid ct8-about-grid--with-photo">
        <div>
          <div className="ct8-about-photo-wrap">
            <img
              src={photo}
              alt={name}
              className="ct8-about-photo"
              onError={e => {
                // If the stored image URL is broken/unreachable, fall back to
                // the shared default profile image rather than showing a
                // broken-image icon on a public-facing page.
                const img = e.currentTarget
                if (img.src !== DEFAULT_PROFILE_IMAGE) img.src = DEFAULT_PROFILE_IMAGE
              }}
            />

          </div>

        </div>

        <div>
          <div className="ct8-section-head" style={{ margin: '0 0 1.6rem' }}>
            <span className="ct8-eyebrow">About Me</span>
            <h2 className="ct8-heading ct8-section-title">Support that meets you<br />where you actually are</h2>
          </div>
          <p className="ct8-about-body">{bio}</p>
          <div className="ct8-chip-wrap" style={{ marginBottom: '1.6rem' }}>
            {langs.map(l => (
              <span key={l} className="ct8-chip">{l}</span>
            ))}
          </div>

          {/* <div className="ct8-card ct8-cred-card">
            <span className="ct8-cred-title">Education & Credentials</span>
            {education.map((e, i) => (
              <div key={i} className="ct8-cred-item">
                <span className="ct8-cred-dot" />
                <span className="ct8-cred-text">{e}</span>
              </div>
            ))}
            {certs.length > 0 && (
              <>
                <div style={{ height: 1, background: 'var(--line)', margin: '1rem 0' }} />
                <span className="ct8-cred-title">Certifications</span>
                {certs.map((c, i) => (
                  <div key={i} className="ct8-cred-item">
                    <span className="ct8-cred-dot" />
                    <span className="ct8-cred-text">{c}</span>
                  </div>
                ))}
              </>
            )}
          </div> */}
        </div>
      </div>
    </section>
  )
}
