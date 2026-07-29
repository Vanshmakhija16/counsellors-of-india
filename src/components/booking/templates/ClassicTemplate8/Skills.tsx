'use client'

import type { TherapistProfile } from '../templateUtils'
import { resolveCT8Content } from '../templateUtils'

interface SkillsProps { therapist: TherapistProfile }

export default function Skills({ therapist }: SkillsProps) {
  const ct8 = resolveCT8Content(therapist.profile_content?.classic8)
  const { clinical, technical } = ct8.skills
  if (clinical.length === 0 && technical.length === 0) return null

  return (
    <section id="skills" className="ct8-section">
      <div className="ct8-container">
        <div className="ct8-section-head">
          <span className="ct8-eyebrow">Skills</span>
          <h2 className="ct8-heading ct8-section-title">Tools &amp; approaches</h2>
        </div>

        <div className="ct8-bento-grid ct8-bento-grid--pair">
          {clinical.length > 0 && (
            <div className="ct8-card ct8-bento-tile ct8-bento-tile--dark ct8-reveal">
              <span className="ct8-bento-label">Clinical &amp; Therapeutic</span>
              <div className="ct8-chip-wrap" style={{ marginTop: '0.9rem' }}>
                {clinical.map(s => <span key={s} className="ct8-chip">{s}</span>)}
              </div>
            </div>
          )}
          {technical.length > 0 && (
            <div className="ct8-card ct8-bento-tile ct8-reveal">
              <span className="ct8-bento-label">Research &amp; Technical</span>
              <div className="ct8-chip-wrap" style={{ marginTop: '0.9rem' }}>
                {technical.map(s => <span key={s} className="ct8-chip">{s}</span>)}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
