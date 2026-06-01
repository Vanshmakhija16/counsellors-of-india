// ──────────────────────────────────────────────────────────────────────────
// Demo session — client-side "Try Demo" state.
//
// The whole "Try with my details" flow runs without auth or DB. A user's
// entered details live here as a DemoProfile in localStorage, completely
// independent of which template is selected — so switching template/color
// never loses or re-asks for their data.
//
// At "Claim", the signup page reads this and pre-populates the real profile.
// ──────────────────────────────────────────────────────────────────────────

import type { TemplateId, ColorId, TherapistProfile } from '@/lib/template'
import { SAMPLE_THERAPIST } from '@/components/booking/templates/templateUtils'

const STORAGE_KEY = 'coi_demo_v1'

/**
 * The user-editable subset of a therapist profile. Deliberately a loose
 * subset of TherapistProfile so the handoff to a real account at signup is a
 * near-direct copy. Anything left blank falls back to SAMPLE_THERAPIST when
 * rendered, so a half-filled demo never breaks a template.
 *
 * The demo persists in localStorage indefinitely — there is no time limit on
 * previewing; conversion happens via the "Claim this site" CTA, not expiry.
 */
export interface DemoProfile {
  full_name?: string
  title?: string          // credentials line
  city?: string
  bio?: string
  tagline?: string
  fee?: number
  specialties?: string[]
  photo_url?: string      // data URL (object URL) for the optional photo
  template_id: TemplateId
  color_id: ColorId
  /** Whether the user has actually typed anything (vs. pure sample data). */
  touched?: boolean
}

export function emptyDemo(): DemoProfile {
  return {
    template_id: 'classic',
    color_id: 'teal',
    touched: false,
  }
}

/** Read the current demo from localStorage, or a fresh one if none exists. */
export function loadDemo(): DemoProfile {
  if (typeof window === 'undefined') return emptyDemo()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyDemo()
    const parsed = JSON.parse(raw) as Partial<DemoProfile>
    return { ...emptyDemo(), ...parsed }
  } catch {
    return emptyDemo()
  }
}

/** Merge a partial update into the stored demo and persist it. Returns the merged demo. */
export function saveDemo(patch: Partial<DemoProfile>): DemoProfile {
  const current = loadDemo()
  // Any field-level edit (not just a template/color switch) marks it touched.
  const touchedFields = Object.keys(patch).filter(
    k => k !== 'template_id' && k !== 'color_id' && k !== 'touched',
  )
  const next: DemoProfile = {
    ...current,
    ...patch,
    touched: current.touched || touchedFields.length > 0,
  }
  if (typeof window !== 'undefined') {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
  }
  return next
}

export function clearDemo() {
  if (typeof window === 'undefined') return
  try { window.localStorage.removeItem(STORAGE_KEY) } catch {}
}

/**
 * Map a DemoProfile onto the loose TherapistProfile shape the templates
 * consume. Blank fields are simply omitted so the renderer's own
 * SAMPLE_THERAPIST fallback (see TemplateCanvas) fills the gaps.
 */
export function demoToProfile(demo: DemoProfile): TherapistProfile {
  return {
    full_name:        demo.full_name || undefined,
    title:            demo.title || undefined,
    city:             demo.city || undefined,
    bio:              demo.bio || undefined,
    photo_url:        demo.photo_url || undefined,
    fee_per_session:  typeof demo.fee === 'number' ? demo.fee : undefined,
    specialties:      demo.specialties?.length ? demo.specialties : undefined,
    template_id:      demo.template_id,
    color_id:         demo.color_id,
    plan:             'pro', // demo previews show every template fully populated
  }
}

/** Sensible placeholder text for the quick-fill form, drawn from the sample. */
export const DEMO_PLACEHOLDERS = {
  full_name:  SAMPLE_THERAPIST.name,
  title:      SAMPLE_THERAPIST.credentials,
  city:       SAMPLE_THERAPIST.city ?? 'Mumbai',
  bio:        SAMPLE_THERAPIST.bio,
  fee:        SAMPLE_THERAPIST.fee,
}
