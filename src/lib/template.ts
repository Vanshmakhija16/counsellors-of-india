export type TemplateId = 'classic' | 'modern' | 'warm' | 'premium'

export type ColorId = 'teal' | 'amber' | 'rose' | 'indigo' | 'slate' | 'sage'

export interface TemplateColor {
  id: ColorId
  name: string
  primary: string
  light: string
  dark: string
  text: string
}

export interface Template {
  id: TemplateId
  name: string
  description: string
  plan: 'free' | 'growth'
  thumbnail: string
}

// export interface TherapistProfile {
//   full_name: string
//   title?: string
//   bio?: string
//   photo_url?: string
//   city?: string
//   specialties?: string[]
//   languages?: string[]
//   fee_per_session?: number
//   session_duration_mins?: number
//   template_id?: TemplateId
//   color_id?: ColorId
//   image: string 
// }


export interface TherapistProfile {
  id?: string

  // Existing fields
  name?: string
  credentials?: string
  bio?: string
  image?: string
  location?: string
  experience?: number
  fee?: number
  specialties?: string[]
  sessionDuration?: number

  // Required by AppearancePage
  full_name?: string
  title?: string
  photo_url?: string
  city?: string
  languages?: string[]
  fee_per_session?: number
  session_duration_mins?: number
  template_id?: TemplateId
  color_id?: ColorId
}

// ─── Colors ───────────────────────────────────────────
export const COLORS: TemplateColor[] = [
  {
    id: 'teal',
    name: 'Teal',
    primary: '#0D9488',
    light: '#F0FDFA',
    dark: '#0F766E',
    text: '#FFFFFF',
  },
  {
    id: 'amber',
    name: 'Amber',
    primary: '#D97706',
    light: '#FFFBEB',
    dark: '#B45309',
    text: '#FFFFFF',
  },
  {
    id: 'rose',
    name: 'Rose',
    primary: '#E11D48',
    light: '#FFF1F2',
    dark: '#BE123C',
    text: '#FFFFFF',
  },
  {
    id: 'indigo',
    name: 'Indigo',
    primary: '#4F46E5',
    light: '#EEF2FF',
    dark: '#4338CA',
    text: '#FFFFFF',
  },
  {
    id: 'slate',
    name: 'Slate',
    primary: '#475569',
    light: '#F8FAFC',
    dark: '#334155',
    text: '#FFFFFF',
  },
  {
    id: 'sage',
    name: 'Sage',
    primary: '#65A30D',
    light: '#F7FEE7',
    dark: '#4D7C0F',
    text: '#FFFFFF',
  },
]

// ─── Templates ────────────────────────────────────────
export const TEMPLATES: Template[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Clean and minimal. Trusted by professionals.',
    plan: 'free',
    thumbnail: 'classic',
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Bold header, card-based. Makes a strong impression.',
    plan: 'growth',
    thumbnail: 'modern',
  },
  {
    id: 'warm',
    name: 'Warm',
    description: 'Soft and friendly. Approachable and caring.',
    plan: 'growth',
    thumbnail: 'warm',
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Dark hero, luxury feel. For senior practitioners.',
    plan: 'growth',
    thumbnail: 'premium',
  },
]

// ─── Helper ───────────────────────────────────────────
export function getColor(id: ColorId): TemplateColor {
  return COLORS.find(c => c.id === id) ?? COLORS[0]
}

export function getTemplate(id: TemplateId): Template {
  return TEMPLATES.find(t => t.id === id) ?? TEMPLATES[0]
}