import { z } from 'zod'
import { createClient } from '@/lib/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

export type IntakeStatus = 'draft' | 'final'

export interface PatientIntake {
  id: string
  therapist_id: string
  patient_id: string
  presenting_concern: string | null
  history: IntakeHistory | null
  family: IntakeFamily | null
  social: IntakeSocial | null
  risk: IntakeRisk | null
  status: IntakeStatus
  created_at: string
  updated_at: string
}

export interface IntakeHistory {
  previous_therapy: string | null
  psychiatric_history: string | null
  medical_history: string | null
  medications: string | null
  substance_use: string | null
  developmental: string | null
}

export interface IntakeFamily {
  family_structure: string | null
  family_mental_health: string | null
  childhood: string | null
  relationships: string | null
}

export interface IntakeSocial {
  living_situation: string | null
  occupation: string | null
  education: string | null
  support_network: string | null
  cultural_background: string | null
  stressors: string | null
}

export interface IntakeRisk {
  si_present: boolean
  si_plan: boolean
  si_means: boolean
  si_history: boolean
  hi_present: boolean
  hi_plan: boolean
  hi_means: boolean
  risk_notes: string | null
}

// ─── Zod schemas ──────────────────────────────────────────────────────────────

const optText = z
  .string()
  .trim()
  .max(2000)
  .nullish()
  .transform((v) => (v && v.length > 0 ? v : null))

export const presentingConcernSchema = z.object({
  presenting_concern: z
    .string()
    .trim()
    .min(1, 'Please describe the presenting concern')
    .max(4000),
})

export const historySchema = z.object({
  history: z.object({
    previous_therapy: optText,
    psychiatric_history: optText,
    medical_history: optText,
    medications: optText,
    substance_use: optText,
    developmental: optText,
  }),
})

export const familySchema = z.object({
  family: z.object({
    family_structure: optText,
    family_mental_health: optText,
    childhood: optText,
    relationships: optText,
  }),
})

export const socialSchema = z.object({
  social: z.object({
    living_situation: optText,
    occupation: optText,
    education: optText,
    support_network: optText,
    cultural_background: optText,
    stressors: optText,
  }),
})

export const riskSchema = z.object({
  risk: z.object({
    si_present: z.boolean(),
    si_plan: z.boolean(),
    si_means: z.boolean(),
    si_history: z.boolean(),
    hi_present: z.boolean(),
    hi_plan: z.boolean(),
    hi_means: z.boolean(),
    risk_notes: optText,
  }),
})

export type PresentingConcernInput = z.input<typeof presentingConcernSchema>
export type HistoryInput = z.input<typeof historySchema>
export type FamilyInput = z.input<typeof familySchema>
export type SocialInput = z.input<typeof socialSchema>
export type RiskInput = z.input<typeof riskSchema>

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns true if the risk block has any positive flags */
export function hasRiskFlags(risk: IntakeRisk | null | undefined): boolean {
  if (!risk) return false
  return (
    risk.si_present ||
    risk.si_plan ||
    risk.si_means ||
    risk.si_history ||
    risk.hi_present ||
    risk.hi_plan ||
    risk.hi_means
  )
}

/** Compute which sections have substantive data */
export function intakeCompletionFlags(intake: PatientIntake | null): {
  presenting: boolean
  history: boolean
  family: boolean
  social: boolean
  risk: boolean
} {
  if (!intake)
    return { presenting: false, history: false, family: false, social: false, risk: false }
  const h = intake.history
  const f = intake.family
  const s = intake.social
  const r = intake.risk
  return {
    presenting: !!intake.presenting_concern,
    history: !!h && Object.values(h).some((v) => v && v.length > 0),
    family: !!f && Object.values(f).some((v) => v && v.length > 0),
    social: !!s && Object.values(s).some((v) => v && v.length > 0),
    risk: r !== null,
  }
}

// ─── Data access (client-side) ────────────────────────────────────────────────

function client() {
  return createClient()
}

export async function getIntake(patientId: string): Promise<PatientIntake | null> {
  const { data, error } = await client()
    .from('patient_intakes')
    .select('*')
    .eq('patient_id', patientId)
    .maybeSingle()
  if (error) throw error
  return (data as PatientIntake) ?? null
}

export async function upsertIntake(
  patientId: string,
  partial: Partial<
    Pick<PatientIntake, 'presenting_concern' | 'history' | 'family' | 'social' | 'risk'>
  >
): Promise<PatientIntake> {
  const supabase = client()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('patient_intakes')
    .upsert(
      { ...partial, patient_id: patientId, therapist_id: session.user.id },
      { onConflict: 'patient_id' }
    )
    .select('*')
    .single()
  if (error) throw error
  return data as PatientIntake
}

export async function finalizeIntake(patientId: string): Promise<PatientIntake> {
  const { data, error } = await client()
    .from('patient_intakes')
    .update({ status: 'final' })
    .eq('patient_id', patientId)
    .select('*')
    .single()
  if (error) throw error
  return data as PatientIntake
}

// Server-only read (`getIntakeServer`) lives in `./intake.server.ts`.
