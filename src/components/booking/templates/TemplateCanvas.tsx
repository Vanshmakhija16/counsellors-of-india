'use client'

// ──────────────────────────────────────────────────────────────────────────
// TemplateCanvas — the single source of truth for rendering a full template
// from a loose TherapistProfile + brand color.
//
// Extracted from LivePreview so the dashboard preview, the /try demo, and any
// future surface all render through one path and can never drift apart.
// ──────────────────────────────────────────────────────────────────────────

import { TherapistProfile, getColor } from '@/lib/template'
import ClassicTemplate from '@/components/booking/templates/ClassicTemplate'
import ClassicTemplate2 from '@/components/booking/templates/ClassicTemplate2'
import ClassicTemplate3 from '@/components/booking/templates/ClassicTemplate3'
import ClassicTemplate4 from '@/components/booking/templates/ClassicTemplate4'
import ClassicTemplate5 from '@/components/booking/templates/ClassicTemplate5'
import ClassicTemplate6 from '@/components/booking/templates/ClassicTemplate6'
import {
  TherapistProfile as TemplateTherapist,
  SAMPLE_THERAPIST,
  getInitials,
} from '@/components/booking/templates/templateUtils'

/** Map the loose public TherapistProfile onto the template-internal shape,
 *  filling any gaps from SAMPLE_THERAPIST so a half-filled profile never
 *  breaks a template. */
export function toTemplateTherapist(p: TherapistProfile): TemplateTherapist {
  // Initials skip honorifics: "Mr Shweta Jain" → "SJ".
  const initials = getInitials(p.full_name ?? '')
  return {
    ...SAMPLE_THERAPIST,
    name: p.full_name ?? SAMPLE_THERAPIST.name,
    initials: initials || SAMPLE_THERAPIST.initials,
    credentials: p.title ?? SAMPLE_THERAPIST.credentials,
    city: p.city ?? SAMPLE_THERAPIST.city,
    bio: p.bio ?? SAMPLE_THERAPIST.bio,
    fee: p.fee_per_session ?? SAMPLE_THERAPIST.fee,
    sessionDuration: p.session_duration_mins ?? SAMPLE_THERAPIST.sessionDuration,
    specialties: p.specialties ?? SAMPLE_THERAPIST.specialties,
    languages: p.languages ?? SAMPLE_THERAPIST.languages,
    image: p.photo_url ?? (p as { image?: string }).image ?? SAMPLE_THERAPIST.image,
    profile_content: (p as { profile_content?: Record<string, unknown> }).profile_content ?? {},
  }
}

function renderTemplate(profile: TherapistProfile) {
  const hidden = profile.hidden_sections ?? []
  const t = toTemplateTherapist(profile)
  switch (profile.template_id ?? 'classic') {
    case 'classic2': return <ClassicTemplate2 therapist={t} hiddenSections={hidden} />
    case 'classic3': return <ClassicTemplate3 therapist={t} hiddenSections={hidden} />
    case 'classic4': return <ClassicTemplate4 therapist={t} hiddenSections={hidden} />
    case 'classic5': return <ClassicTemplate5 therapist={t} hiddenSections={hidden} />
    case 'classic6': return <ClassicTemplate6 therapist={t} hiddenSections={hidden} />
    default:         return <ClassicTemplate therapist={t} feedbacks={[]} hiddenSections={hidden} />
  }
}

interface Props {
  profile: TherapistProfile
  className?: string
  style?: React.CSSProperties
}

/** Renders the full template for `profile`, injecting the brand color as the
 *  CSS variables the templates read. */
export default function TemplateCanvas({ profile, className, style }: Props) {
  const color = getColor(profile.color_id ?? 'teal')

  const brandVars = `
    --brand: ${color.primary};
    --brand-light: ${color.light};
    --brand-dark: ${color.dark};
    --warm-accent: ${color.primary};
    --teal: ${color.primary};
    --teal-mid: ${color.primary};
  `

  return (
    <div
      className={className}
      style={{
        ['--warm-accent' as string]: color.primary,
        ['--teal' as string]: color.primary,
        ['--brand' as string]: color.primary,
        ...style,
      }}
    >
      <style>{`:root { ${brandVars} }`}</style>
      {renderTemplate(profile)}
    </div>
  )
}
