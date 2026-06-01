export type TemplateId = 'classic' | 'classic2' | 'classic3' | 'classic4' | 'classic5'
export type ColorId   = 'teal' | 'amber' | 'rose' | 'indigo' | 'slate' | 'sage'

export interface TemplateColor {
  id: ColorId
  name: string
  primary: string   // main brand color
  light: string     // tinted light bg
  dark: string      // darkened variant
  text: string      // text on primary
  hex: string       // same as primary, explicit alias
}

export interface SectionConfig {
  id: string; label: string; defaultEnabled: boolean
}

export interface Template {
  id: TemplateId
  name: string           // user-friendly display name
  tagline: string        // one-line description
  style: string          // mood descriptor shown in UI
  plan: 'starter' | 'growth' | 'clinic'  // minimum plan; all templates are on every paid plan
  thumbnail: string
  accent: string         // thumbnail preview accent color
  bg: string             // thumbnail preview bg
  sections: SectionConfig[]
}

export interface TherapistProfile {
  id?: string; name?: string; credentials?: string; bio?: string
  image?: string; location?: string; experience?: number; fee?: number
  specialties?: string[]; sessionDuration?: number; full_name?: string
  title?: string; photo_url?: string; city?: string; languages?: string[]
  fee_per_session?: number; session_duration_mins?: number
  template_id?: TemplateId; color_id?: ColorId
  hidden_sections?: string[]; profile_content?: Record<string, unknown>
  plan?: string
}

// All plans are paid now (no free tier). Any active paid plan unlocks
// every template.
export const PAID_PLANS = new Set(['starter', 'growth', 'clinic'])

export function isPaid(plan: string | null | undefined): boolean {
  return !!plan && PAID_PLANS.has(plan)
}

export function canUseTemplate(_template: Template, therapistPlan: string): boolean {
  // Every template is available on every paid plan.
  return PAID_PLANS.has(therapistPlan)
}

// ─── Colors ──────────────────────────────────────────────────────────────────
export const COLORS: TemplateColor[] = [
  { id: 'teal',   name: 'Ocean',   hex: '#0D9488', primary: '#0D9488', light: '#F0FDFA', dark: '#0F766E', text: '#FFFFFF' },
  { id: 'amber',  name: 'Amber',   hex: '#D97706', primary: '#D97706', light: '#FFFBEB', dark: '#B45309', text: '#FFFFFF' },
  { id: 'rose',   name: 'Blush',   hex: '#E11D48', primary: '#E11D48', light: '#FFF1F2', dark: '#BE123C', text: '#FFFFFF' },
  { id: 'indigo', name: 'Indigo',  hex: '#4F46E5', primary: '#4F46E5', light: '#EEF2FF', dark: '#4338CA', text: '#FFFFFF' },
  { id: 'slate',  name: 'Slate',   hex: '#475569', primary: '#475569', light: '#F8FAFC', dark: '#334155', text: '#FFFFFF' },
  { id: 'sage',   name: 'Sage',    hex: '#65A30D', primary: '#65A30D', light: '#F7FEE7', dark: '#4D7C0F', text: '#FFFFFF' },
]

// ─── Sections ─────────────────────────────────────────────────────────────────
export const TEMPLATE_SECTIONS: Record<TemplateId, SectionConfig[]> = {
  classic: [
    { id: 'hero',      label: 'Hero',             defaultEnabled: true },
    { id: 'about',     label: 'About Me',         defaultEnabled: true },
    { id: 'services',  label: 'Services',         defaultEnabled: true },
    { id: 'feedback',  label: 'Client Reviews',   defaultEnabled: true },
    { id: 'expertise', label: 'Expertise',        defaultEnabled: true },
    { id: 'carousel',  label: 'Insights',         defaultEnabled: true },
    { id: 'booking',   label: 'Book Session',     defaultEnabled: true },
    { id: 'footer',    label: 'Footer',           defaultEnabled: true },
  ],
  classic2: [
    { id: 'hero',     label: 'Hero',         defaultEnabled: true },
    { id: 'about',    label: 'About Me',     defaultEnabled: true },
    { id: 'services', label: 'Services',     defaultEnabled: true },
    { id: 'insights', label: 'Blog / Notes', defaultEnabled: true },
    { id: 'faq',      label: 'FAQ',         defaultEnabled: true },
    { id: 'booking',  label: 'Book Session', defaultEnabled: true },
    { id: 'footer',   label: 'Footer',      defaultEnabled: true },
  ],
  classic3: [
    { id: 'hero',     label: 'Hero',         defaultEnabled: true },
    { id: 'about',    label: 'About Me',     defaultEnabled: true },
    { id: 'services', label: 'Services',     defaultEnabled: true },
    { id: 'insights', label: 'Insights',     defaultEnabled: true },
    { id: 'faq',      label: 'FAQ',         defaultEnabled: true },
    { id: 'booking',  label: 'Book Session', defaultEnabled: true },
    { id: 'footer',   label: 'Footer',      defaultEnabled: true },
  ],
  classic4: [
    { id: 'hero',     label: 'Hero',          defaultEnabled: true },
    { id: 'ticker',   label: 'Tag Banner',    defaultEnabled: true },
    { id: 'about',    label: 'About Me',      defaultEnabled: true },
    { id: 'services', label: 'Services',      defaultEnabled: true },
    { id: 'insights', label: 'Testimonials',  defaultEnabled: true },
    { id: 'faq',      label: 'FAQ',          defaultEnabled: true },
    { id: 'booking',  label: 'Book Session',  defaultEnabled: true },
    { id: 'footer',   label: 'Footer',        defaultEnabled: true },
  ],
  classic5: [
    { id: 'hero',     label: 'Hero',         defaultEnabled: true },
    { id: 'ticker',   label: 'Tag Banner',   defaultEnabled: true },
    { id: 'about',    label: 'About Me',     defaultEnabled: true },
    { id: 'services', label: 'Services',     defaultEnabled: true },
    { id: 'insights', label: 'Testimonials', defaultEnabled: true },
    { id: 'faq',      label: 'FAQ',         defaultEnabled: true },
    { id: 'booking',  label: 'Book Session', defaultEnabled: true },
    { id: 'footer',   label: 'Footer',      defaultEnabled: true },
  ],
}

// ─── Templates ────────────────────────────────────────────────────────────────
export const TEMPLATES: Template[] = [
  {
    id: 'classic',
    name: 'Warm & Simple',
    tagline: 'Clean, trustworthy, works for everyone',
    style: 'Minimal · Light · Professional',
    plan: 'starter',
    thumbnail: 'classic',
    accent: '#b46b50',
    bg: '#f5efe7',
    sections: TEMPLATE_SECTIONS.classic,
  },
  {
    id: 'classic2',
    name: 'Dark & Bold',
    tagline: 'High-contrast editorial for a strong first impression',
    style: 'Dark · Editorial · Dramatic',
    plan: 'growth',
    thumbnail: 'classic2',
    accent: '#c9a35a',
    bg: '#0b0d0e',
    sections: TEMPLATE_SECTIONS.classic2,
  },
  {
    id: 'classic3',
    name: 'Elegant & Light',
    tagline: 'Warm paper tones with luxury magazine typography',
    style: 'Warm · Literary · Refined',
    plan: 'growth',
    thumbnail: 'classic3',
    accent: '#8b6f47',
    bg: '#f5f0e8',
    sections: TEMPLATE_SECTIONS.classic3,
  },
  {
    id: 'classic4',
    name: 'Premium Black',
    tagline: 'Ultra-luxury dark profile with gold accents',
    style: 'Dark · Luxury · High-end',
    plan: 'growth',
    thumbnail: 'classic4',
    accent: '#D4AF37',
    bg: '#080808',
    sections: TEMPLATE_SECTIONS.classic4,
  },
  {
    id: 'classic5',
    name: 'Calm & Natural',
    tagline: 'Earthy, warm tones that feel grounding and safe',
    style: 'Natural · Soft · Welcoming',
    plan: 'growth',
    thumbnail: 'classic5',
    accent: '#7a6652',
    bg: '#f9f5ef',
    sections: TEMPLATE_SECTIONS.classic5,
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────
export function getColor(id: ColorId): TemplateColor {
  return COLORS.find(c => c.id === id) ?? COLORS[0]
}

export function getTemplate(id: TemplateId): Template {
  return TEMPLATES.find(t => t.id === id) ?? TEMPLATES[0]
}
