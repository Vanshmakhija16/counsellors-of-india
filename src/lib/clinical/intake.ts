import { z } from 'zod'
import { createClient } from '@/lib/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

export type IntakeStatus = 'draft' | 'final'

export interface PatientIntake {
  id: string
  therapist_id: string
  patient_id: string
  version: number
  presenting_concern: string | null
  history: IntakeHistory | null
  family: IntakeFamily | null
  social: IntakeSocial | null
  risk: IntakeRisk | null
  status: IntakeStatus
  created_at: string
  updated_at: string
}

export type SubstanceFrequency =
  | 'never'
  | 'rarely'
  | 'social'
  | 'weekly'
  | 'daily'

export type FamilyStructure = 'nuclear' | 'joint' | 'extended' | 'other'

export type MaritalStatus =
  | 'single'
  | 'married'
  | 'separated'
  | 'divorced'
  | 'widowed'
  | 'live_in'
  | 'other'

export type MarriageType = 'arranged' | 'love' | 'na'

export type LivingWith =
  | 'alone'
  | 'parents'
  | 'spouse'
  | 'in_laws'
  | 'children'
  | 'roommates'
  | 'other'

export type EducationLevel =
  | 'below_10th'
  | 'class_10th'
  | 'class_12th'
  | 'graduate'
  | 'postgraduate'
  | 'doctoral'
  | 'other'

export type OccupationType =
  | 'student'
  | 'employed'
  | 'self_employed'
  | 'homemaker'
  | 'unemployed'
  | 'retired'

export interface IntakeHistory {
  previous_therapy: string | null
  psychiatric_history: string | null
  medical_history: string | null
  medications: string | null
  substance_use: string | null
  developmental: string | null
  // ─── Structured substance frequencies (optional) ─────────────────
  tobacco_frequency?: SubstanceFrequency | null
  alcohol_frequency?: SubstanceFrequency | null
  gutka_frequency?: SubstanceFrequency | null
}

export interface IntakeFamily {
  family_structure: string | null
  family_mental_health: string | null
  childhood: string | null
  relationships: string | null
  // ─── Structured fields (optional) ─────────────────────────────────
  family_structure_type?: FamilyStructure | null
  marital_status?: MaritalStatus | null
  marriage_type?: MarriageType | null
  living_with?: LivingWith[] | null
}

export interface IntakeSocial {
  living_situation: string | null
  occupation: string | null
  education: string | null
  support_network: string | null
  cultural_background: string | null
  stressors: string | null
  // ─── Structured fields (optional) ─────────────────────────────────
  highest_education?: EducationLevel | null
  occupation_type?: OccupationType | null
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

export type IntakeBodyFields = Pick<
  PatientIntake,
  'presenting_concern' | 'history' | 'family' | 'social' | 'risk'
>

// ─── Dropdown option lists (single source of truth for editor + read view) ───

export const FAMILY_STRUCTURE_OPTIONS: { value: FamilyStructure; label: string }[] = [
  { value: 'nuclear', label: 'Nuclear' },
  { value: 'joint', label: 'Joint' },
  { value: 'extended', label: 'Extended' },
  { value: 'other', label: 'Other' },
]

export const MARITAL_STATUS_OPTIONS: { value: MaritalStatus; label: string }[] = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'separated', label: 'Separated' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'live_in', label: 'Live-in' },
  { value: 'other', label: 'Other' },
]

export const MARRIAGE_TYPE_OPTIONS: { value: MarriageType; label: string }[] = [
  { value: 'arranged', label: 'Arranged' },
  { value: 'love', label: 'Love' },
  { value: 'na', label: 'Not applicable' },
]

export const LIVING_WITH_OPTIONS: { value: LivingWith; label: string }[] = [
  { value: 'alone', label: 'Alone' },
  { value: 'parents', label: 'Parents' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'in_laws', label: 'In-laws' },
  { value: 'children', label: 'Children' },
  { value: 'roommates', label: 'Roommates' },
  { value: 'other', label: 'Other' },
]

export const EDUCATION_OPTIONS: { value: EducationLevel; label: string }[] = [
  { value: 'below_10th', label: 'Below 10th' },
  { value: 'class_10th', label: '10th pass' },
  { value: 'class_12th', label: '12th pass' },
  { value: 'graduate', label: 'Graduate' },
  { value: 'postgraduate', label: 'Postgraduate' },
  { value: 'doctoral', label: 'Doctoral' },
  { value: 'other', label: 'Other' },
]

export const OCCUPATION_OPTIONS: { value: OccupationType; label: string }[] = [
  { value: 'student', label: 'Student' },
  { value: 'employed', label: 'Employed' },
  { value: 'self_employed', label: 'Self-employed' },
  { value: 'homemaker', label: 'Homemaker' },
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'retired', label: 'Retired' },
]

export const SUBSTANCE_FREQUENCY_OPTIONS: { value: SubstanceFrequency; label: string }[] = [
  { value: 'never', label: 'Never' },
  { value: 'rarely', label: 'Rarely' },
  { value: 'social', label: 'Social' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'daily', label: 'Daily' },
]

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

const substanceFreq = z
  .enum(['never', 'rarely', 'social', 'weekly', 'daily'])
  .nullish()
  .transform((v) => v ?? null)

const familyStructureEnum = z
  .enum(['nuclear', 'joint', 'extended', 'other'])
  .nullish()
  .transform((v) => v ?? null)

const maritalEnum = z
  .enum(['single', 'married', 'separated', 'divorced', 'widowed', 'live_in', 'other'])
  .nullish()
  .transform((v) => v ?? null)

const marriageTypeEnum = z
  .enum(['arranged', 'love', 'na'])
  .nullish()
  .transform((v) => v ?? null)

const livingWithArr = z
  .array(z.enum(['alone', 'parents', 'spouse', 'in_laws', 'children', 'roommates', 'other']))
  .nullish()
  .transform((v) => v ?? null)

const educationEnum = z
  .enum(['below_10th', 'class_10th', 'class_12th', 'graduate', 'postgraduate', 'doctoral', 'other'])
  .nullish()
  .transform((v) => v ?? null)

const occupationEnum = z
  .enum(['student', 'employed', 'self_employed', 'homemaker', 'unemployed', 'retired'])
  .nullish()
  .transform((v) => v ?? null)

export const historySchema = z.object({
  history: z.object({
    previous_therapy: optText,
    psychiatric_history: optText,
    medical_history: optText,
    medications: optText,
    substance_use: optText,
    developmental: optText,
    tobacco_frequency: substanceFreq,
    alcohol_frequency: substanceFreq,
    gutka_frequency: substanceFreq,
  }),
})

export const familySchema = z.object({
  family: z.object({
    family_structure: optText,
    family_mental_health: optText,
    childhood: optText,
    relationships: optText,
    family_structure_type: familyStructureEnum,
    marital_status: maritalEnum,
    marriage_type: marriageTypeEnum,
    living_with: livingWithArr,
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
    highest_education: educationEnum,
    occupation_type: occupationEnum,
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

/** Shallow-pick the body fields (used when prefilling a new intake from an older one). */
export function copyIntakeBody(src: PatientIntake): IntakeBodyFields {
  return {
    presenting_concern: src.presenting_concern,
    history: src.history,
    family: src.family,
    social: src.social,
    risk: src.risk,
  }
}

// ─── Data access (client-side) ────────────────────────────────────────────────

function client() {
  return createClient()
}

/**
 * Latest intake for this patient (any status). Returns null if none yet.
 * For history-aware UI use `listIntakes` instead.
 */
export async function getIntake(patientId: string): Promise<PatientIntake | null> {
  const { data, error } = await client()
    .from('patient_intakes')
    .select('*')
    .eq('patient_id', patientId)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return (data as PatientIntake) ?? null
}

/** All intakes for a patient, newest version first. */
export async function listIntakes(patientId: string): Promise<PatientIntake[]> {
  const { data, error } = await client()
    .from('patient_intakes')
    .select('*')
    .eq('patient_id', patientId)
    .order('version', { ascending: false })
  if (error) throw error
  return (data ?? []) as PatientIntake[]
}

export async function getIntakeById(intakeId: string): Promise<PatientIntake | null> {
  const { data, error } = await client()
    .from('patient_intakes')
    .select('*')
    .eq('id', intakeId)
    .maybeSingle()
  if (error) throw error
  return (data as PatientIntake) ?? null
}

/**
 * Returns an editable draft for this patient.
 * - If a draft intake already exists, returns it.
 * - Otherwise creates a new draft at version = max(version) + 1, optionally
 *   prefilled from the most recent **final** intake.
 */
export async function getOrCreateDraftIntake(
  patientId: string,
  options: { prefillFromLatest?: boolean } = {}
): Promise<PatientIntake> {
  const supabase = client()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Not authenticated')

  // 1. Existing draft? Return it.
  const { data: draftRow, error: draftErr } = await supabase
    .from('patient_intakes')
    .select('*')
    .eq('patient_id', patientId)
    .eq('status', 'draft')
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (draftErr) throw draftErr
  if (draftRow) return draftRow as PatientIntake

  // 2. Compute next version (max+1) and optionally prefill from latest final.
  const { data: latestRow, error: latestErr } = await supabase
    .from('patient_intakes')
    .select('*')
    .eq('patient_id', patientId)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (latestErr) throw latestErr

  const nextVersion = latestRow ? (latestRow as PatientIntake).version + 1 : 1
  const prefill =
    options.prefillFromLatest && latestRow
      ? copyIntakeBody(latestRow as PatientIntake)
      : {
          presenting_concern: null,
          history: null,
          family: null,
          social: null,
          risk: null,
        }

  const { data: created, error: insertErr } = await supabase
    .from('patient_intakes')
    .insert({
      therapist_id: session.user.id,
      patient_id: patientId,
      version: nextVersion,
      status: 'draft',
      ...prefill,
    })
    .select('*')
    .single()

  // Race recovery: a parallel call (StrictMode double-effect, double-click,
  // tab refocus) may have inserted the same (patient_id, version) one tick
  // earlier. Postgres unique-index violation is code '23505'. In that case
  // re-read whatever draft now exists and return it instead of erroring.
  if (insertErr) {
    if ((insertErr as { code?: string }).code === '23505') {
      const { data: existing, error: reReadErr } = await supabase
        .from('patient_intakes')
        .select('*')
        .eq('patient_id', patientId)
        .eq('status', 'draft')
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (reReadErr) throw reReadErr
      if (existing) return existing as PatientIntake
    }
    throw insertErr
  }
  return created as PatientIntake
}

/** Delete a specific intake (any version, draft or final). */
export async function deleteIntake(intakeId: string): Promise<void> {
  const { error } = await client().from('patient_intakes').delete().eq('id', intakeId)
  if (error) throw error
}

/** Update fields on an existing intake (typically a draft). */
export async function updateIntake(
  intakeId: string,
  partial: Partial<IntakeBodyFields>
): Promise<PatientIntake> {
  const { data, error } = await client()
    .from('patient_intakes')
    .update(partial)
    .eq('id', intakeId)
    .select('*')
    .single()
  if (error) throw error
  return data as PatientIntake
}

/** Flip a draft intake to status = 'final'. */
export async function finalizeIntake(intakeId: string): Promise<PatientIntake> {
  const { data, error } = await client()
    .from('patient_intakes')
    .update({ status: 'final' })
    .eq('id', intakeId)
    .select('*')
    .single()
  if (error) throw error
  return data as PatientIntake
}

// Server-only read (`getIntakeServer`) lives in `./intake.server.ts`.
