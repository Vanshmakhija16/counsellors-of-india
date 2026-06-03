'use client'

import { useState, useCallback } from 'react'
import { ChevronRight, ChevronLeft, Check, AlertTriangle, Save } from 'lucide-react'
import {
  updateIntake,
  finalizeIntake,
  hasRiskFlags,
  FAMILY_STRUCTURE_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  MARRIAGE_TYPE_OPTIONS,
  LIVING_WITH_OPTIONS,
  EDUCATION_OPTIONS,
  OCCUPATION_OPTIONS,
  SUBSTANCE_FREQUENCY_OPTIONS,
  type PatientIntake,
  type IntakeHistory,
  type IntakeFamily,
  type IntakeSocial,
  type IntakeRisk,
  type FamilyStructure,
  type MaritalStatus,
  type MarriageType,
  type LivingWith,
  type EducationLevel,
  type OccupationType,
  type SubstanceFrequency,
} from '@/lib/clinical/intake'

// ─── Types ────────────────────────────────────────────────────────────────────

interface IntakeStepperProps {
  /** The draft intake row to edit. Caller obtains it via getOrCreateDraftIntake. */
  intake: PatientIntake
  /** called after a successful finalize */
  onFinalized?: (intake: PatientIntake) => void
}

type SectionKey = 'presenting' | 'history' | 'family' | 'social' | 'risk'

const SECTIONS: { key: SectionKey; label: string; desc: string }[] = [
  { key: 'presenting', label: 'Presenting Concern', desc: "Chief complaint in the client's own words" },
  { key: 'history', label: 'History', desc: 'Previous therapy, medical, psychiatric, and developmental background' },
  { key: 'family', label: 'Family & Relationships', desc: 'Family structure, history of mental illness, childhood and current relationships' },
  { key: 'social', label: 'Social & Cultural', desc: 'Living situation, work/education, support network, stressors' },
  { key: 'risk', label: 'Risk Assessment', desc: 'Suicidal and homicidal ideation screening' },
]

// ─── Field helpers (shared design tokens) ─────────────────────────────────────

function SectionHeader({ label, desc }: { label: string; desc: string }) {
  return (
    <div className="mb-5">
      <h2
        className="text-lg font-semibold text-[#1c1c1e]"
        style={{ fontFamily: 'var(--font-fraunces), serif' }}
      >
        {label}
      </h2>
      <p className="text-xs text-[#6b7280] mt-0.5">{desc}</p>
    </div>
  )
}

function FieldLabel({ label, optional }: { label: string; optional?: boolean }) {
  return (
    <label className="block text-sm font-medium text-gray-600 mb-1.5">
      {label}
      {optional && <span className="ml-1 text-[10px] text-[#9ca3af] font-normal uppercase tracking-wide">(optional)</span>}
    </label>
  )
}

function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3,
  onBlur,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
  onBlur?: () => void
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a3b8b4] focus:border-transparent resize-y"
    />
  )
}

function Select<T extends string>({
  value,
  onChange,
  options,
  onBlur,
  placeholder = '— Select —',
}: {
  value: T | null | undefined
  onChange: (v: T | null) => void
  options: { value: T; label: string }[]
  onBlur?: () => void
  placeholder?: string
}) {
  return (
    <select
      value={value ?? ''}
      onChange={(e) => {
        const next = e.target.value
        onChange(next === '' ? null : (next as T))
      }}
      onBlur={onBlur}
      className="w-full h-11 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#a3b8b4] focus:border-transparent"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

function MultiSelect<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T[] | null | undefined
  onChange: (v: T[]) => void
  options: { value: T; label: string }[]
}) {
  const selected = new Set(value ?? [])
  function toggle(v: T) {
    const next = new Set(selected)
    if (next.has(v)) next.delete(v)
    else next.add(v)
    onChange(Array.from(next))
  }
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const on = selected.has(opt.value)
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={`h-8 px-3 rounded-full text-xs font-medium border transition ${
              on
                ? 'bg-[#d4e4e1] text-[#2d4a47] border-[#b8ceca]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

function YesNoRow({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#f0ebe6] last:border-0">
      <span className="text-sm text-gray-700">{label}</span>
      <div className="flex gap-2">
        {[true, false].map((opt) => (
          <button
            key={String(opt)}
            type="button"
            onClick={() => onChange(opt)}
            className={`h-8 w-16 rounded-lg text-xs font-semibold transition ${
              value === opt
                ? opt
                  ? 'bg-red-100 text-red-700 border border-red-300'
                  : 'bg-[#d4e4e1] text-[#2d4a47] border border-[#b8ceca]'
                : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            {opt ? 'Yes' : 'No'}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Step pane components ─────────────────────────────────────────────────────

function PresentingPane({
  value,
  onChange,
  onBlur,
}: {
  value: string
  onChange: (v: string) => void
  onBlur: () => void
}) {
  return (
    <div>
      <SectionHeader
        label="Presenting Concern"
        desc="Capture the chief complaint in the client's own words — unfiltered, no leading suggestions."
      />

      <FieldLabel label='Chief complaint — "What brings you here today?"' />
      <Textarea
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={[
          "Capture the client's own words. Then add:",
          '',
          '• Duration — less than a week / 1–4 weeks / 1–6 months / 6–12 months / more than a year',
          '• Onset — acute trigger (loss, change, event) or gradual build-up',
          '• Impact on daily life — work/study, relationships, sleep, appetite, energy',
          '• Physical / somatic complaints — headache, body pain, fatigue, palpitations (often the first language of distress in Indian clients)',
          '• What they have tried so far — self-help, prayer, family advice, medication, other therapy, traditional healer',
          '• What they hope to get from therapy — symptom relief, insight, coping skills, relationship help, life direction',
        ].join('\n')}
        rows={12}
      />
      <p className="text-[11px] text-[#9ca3af] mt-2">{value.length}/4000 characters</p>
    </div>
  )
}

function HistoryPane({
  value,
  onChange,
  onBlur,
}: {
  value: IntakeHistory
  onChange: (v: IntakeHistory) => void
  onBlur: () => void
}) {
  function upd<K extends keyof IntakeHistory>(key: K, val: IntakeHistory[K]) {
    onChange({ ...value, [key]: val })
  }
  return (
    <div>
      <SectionHeader
        label="Mental & Medical History"
        desc="Past therapy, prior diagnoses, faith-based recourse, chronic conditions, current medications, sleep/appetite, and substance use."
      />

      {/* ─── Substance frequencies (quick capture) ──────────────────── */}
      <div className="mb-6 rounded-xl border border-[#e8e4df] bg-[#fdf8f6] p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6b7280] mb-3">
          Substance use frequency
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <FieldLabel label="Tobacco / smoking" optional />
            <Select<SubstanceFrequency>
              value={value.tobacco_frequency ?? null}
              onChange={(v) => {
                upd('tobacco_frequency', v)
                onBlur()
              }}
              options={SUBSTANCE_FREQUENCY_OPTIONS}
            />
          </div>
          <div>
            <FieldLabel label="Alcohol" optional />
            <Select<SubstanceFrequency>
              value={value.alcohol_frequency ?? null}
              onChange={(v) => {
                upd('alcohol_frequency', v)
                onBlur()
              }}
              options={SUBSTANCE_FREQUENCY_OPTIONS}
            />
          </div>
          <div>
            <FieldLabel label="Gutka / pan masala" optional />
            <Select<SubstanceFrequency>
              value={value.gutka_frequency ?? null}
              onChange={(v) => {
                upd('gutka_frequency', v)
                onBlur()
              }}
              options={SUBSTANCE_FREQUENCY_OPTIONS}
            />
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {[
          {
            key: 'previous_therapy' as const,
            label: 'Previous therapy / counselling',
            placeholder:
              'Yes / No. If yes: who they saw (psychiatrist, psychologist, counsellor), when, how long, what helped or did not help.',
          },
          {
            key: 'psychiatric_history' as const,
            label: 'Prior psychiatric history & faith-based recourse',
            placeholder:
              'Past diagnoses (depression, anxiety, OCD, bipolar, etc.). Any hospitalisations or crisis-centre visits.\n\nFaith healer / astrologer / temple visits for this concern — non-judgmental. Often the first recourse in India and useful for understanding the client’s model of their own distress.',
          },
          {
            key: 'medical_history' as const,
            label: 'Chronic medical conditions',
            placeholder:
              'Diabetes, thyroid, PCOS, hypertension, epilepsy, chronic pain — many carry psychiatric comorbidity. Recent surgeries or significant illness.\n\nFamily psychiatric history: known conditions in first-degree relatives (relation + condition).',
          },
          {
            key: 'medications' as const,
            label: 'Current medications',
            placeholder:
              'List both psychiatric and non-psychiatric: name, dose, prescribing doctor, compliance.\n\nRecent physical health changes — weight loss/gain, fatigue, hormonal shifts.',
          },
          {
            key: 'substance_use' as const,
            label: 'Substance use',
            placeholder:
              'Tobacco / smoking — Never · Occasionally · Daily (type + quantity)\nAlcohol — Never · Rarely · Social · Weekly · Daily (approx units/week)\nGutka / pan masala — yes/no\nCannabis, prescription misuse, others — free text\n\nDoes the client feel their use is a problem? Yes / No / Unsure.',
          },
          {
            key: 'developmental' as const,
            label: 'Sleep, appetite & developmental notes',
            placeholder:
              'Sleep baseline — approx hours, trouble falling asleep, staying asleep, early waking.\nAppetite / eating — changes, weight concern.\nDevelopmental / early history if relevant — birth complications, milestones, early adversity.',
          },
        ].map(({ key, label, placeholder }) => (
          <div key={key}>
            <FieldLabel label={label} optional />
            <Textarea
              value={value[key] ?? ''}
              onChange={(v) => upd(key, v)}
              onBlur={onBlur}
              placeholder={placeholder}
              rows={2}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function FamilyPane({
  value,
  onChange,
  onBlur,
}: {
  value: IntakeFamily
  onChange: (v: IntakeFamily) => void
  onBlur: () => void
}) {
  function upd<K extends keyof IntakeFamily>(key: K, val: IntakeFamily[K]) {
    onChange({ ...value, [key]: val })
  }
  const isMarried = value.marital_status === 'married'
  return (
    <div>
      <SectionHeader
        label="Family & Relationships"
        desc="In India, distress is often expressed through failing family roles. Capture structure and pressures up front."
      />

      {/* ─── Quick facts ───────────────────────────────────────── */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel label="Family structure" optional />
          <Select<FamilyStructure>
            value={value.family_structure_type ?? null}
            onChange={(v) => {
              upd('family_structure_type', v)
              onBlur()
            }}
            options={FAMILY_STRUCTURE_OPTIONS}
          />
        </div>
        <div>
          <FieldLabel label="Marital status" optional />
          <Select<MaritalStatus>
            value={value.marital_status ?? null}
            onChange={(v) => {
              upd('marital_status', v)
              // Clear marriage_type if no longer married
              if (v !== 'married' && value.marriage_type) {
                upd('marriage_type', null)
              }
              onBlur()
            }}
            options={MARITAL_STATUS_OPTIONS}
          />
        </div>
        {isMarried && (
          <div>
            <FieldLabel label="Marriage type" optional />
            <Select<MarriageType>
              value={value.marriage_type ?? null}
              onChange={(v) => {
                upd('marriage_type', v)
                onBlur()
              }}
              options={MARRIAGE_TYPE_OPTIONS}
            />
          </div>
        )}
        <div className={isMarried ? '' : 'sm:col-span-2'}>
          <FieldLabel label="Living with (pick all that apply)" optional />
          <MultiSelect<LivingWith>
            value={value.living_with ?? null}
            onChange={(v) => {
              upd('living_with', v.length === 0 ? null : v)
              onBlur()
            }}
            options={LIVING_WITH_OPTIONS}
          />
        </div>
      </div>

      <div className="space-y-5">
        {[
          {
            key: 'family_structure' as const,
            label: 'Family structure',
            placeholder:
              'Nuclear / Joint / Extended — note the type. Then list members: parents, siblings, spouse, children, in-laws — living or deceased.\n\nIndian family dynamics drive many presentations; capture quality of relationships briefly.',
          },
          {
            key: 'family_mental_health' as const,
            label: 'Marital / relationship status & children',
            placeholder:
              'Status — Single · Married · Separated · Divorced · Widowed · Live-in · Other.\nIf married — arranged / love marriage (optional, but useful for couple presenting with conflict).\nChildren — number and ages if relevant.',
          },
          {
            key: 'childhood' as const,
            label: 'Living with',
            placeholder:
              'Who does the client live with? Alone · Parents · Spouse · In-laws · Roommates · Other (multi-select OK).\n\nKey for safety planning and for understanding who is in the room around them.',
          },
          {
            key: 'relationships' as const,
            label: 'Family pressures & support quality',
            placeholder:
              'Conflicts, expectations, financial dependence, intergenerational tension. Who supports them, who isolates them.\n\nUseful prompts: not earning enough, not married on time, no children yet, caregiving load, in-law dynamics.',
          },
        ].map(({ key, label, placeholder }) => (
          <div key={key}>
            <FieldLabel label={label} optional />
            <Textarea
              value={value[key] ?? ''}
              onChange={(v) => upd(key, v)}
              onBlur={onBlur}
              placeholder={placeholder}
              rows={2}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function SocialPane({
  value,
  onChange,
  onBlur,
}: {
  value: IntakeSocial
  onChange: (v: IntakeSocial) => void
  onBlur: () => void
}) {
  function upd<K extends keyof IntakeSocial>(key: K, val: IntakeSocial[K]) {
    onChange({ ...value, [key]: val })
  }
  return (
    <div>
      <SectionHeader
        label="Education, Work & Cultural Context"
        desc="Education, occupation, income, academic/work pressure, support and culture."
      />

      {/* ─── Quick facts ───────────────────────────────────────── */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel label="Highest education" optional />
          <Select<EducationLevel>
            value={value.highest_education ?? null}
            onChange={(v) => {
              upd('highest_education', v)
              onBlur()
            }}
            options={EDUCATION_OPTIONS}
          />
        </div>
        <div>
          <FieldLabel label="Occupation status" optional />
          <Select<OccupationType>
            value={value.occupation_type ?? null}
            onChange={(v) => {
              upd('occupation_type', v)
              onBlur()
            }}
            options={OCCUPATION_OPTIONS}
          />
        </div>
      </div>

      <div className="space-y-5">
        {[
          {
            key: 'education' as const,
            label: 'Highest education',
            placeholder:
              'Below 10th · 10th · 12th · Graduate · Postgraduate · Doctoral · Other.\nNote subject/stream if relevant (engineering, medical, commerce, arts).',
          },
          {
            key: 'occupation' as const,
            label: 'Occupation & work context',
            placeholder:
              'Student · Employed · Self-employed · Homemaker · Unemployed · Retired.\n\nIf employed/self-employed — current role, industry, job security, hours.\nIf student — institution, year, exam pressure (NEET, JEE, board, university).',
          },
          {
            key: 'living_situation' as const,
            label: 'Monthly income / financial stress',
            placeholder:
              'Approx household income bracket. Note dependence on family, debts, or recent financial shocks.\n\nFinancial stress is a major driver in Indian urban contexts — capture even if the client downplays it.',
          },
          {
            key: 'stressors' as const,
            label: 'Academic / work pressure (rate 1–10)',
            placeholder:
              'Self-reported pressure: 1 = none, 10 = crushing. Especially important for students 15–25.\n\nList the top 2–3 specific stressors driving the rating (exams, manager, performance review, family expectations, layoffs, deadlines).',
          },
          {
            key: 'support_network' as const,
            label: 'Support network',
            placeholder:
              'Close friends, peer group, mentors, community ties, religious affiliation.\nWho can they call at 11 pm? Who knows they are seeking therapy?',
          },
          {
            key: 'cultural_background' as const,
            label: 'Cultural, religious & language context',
            placeholder:
              'Language(s) preferred for therapy. Religion / spiritual practice if relevant. Caste, region, migration status if it shapes the presentation.\n\nNote any cultural framing the client uses for their distress.',
          },
        ].map(({ key, label, placeholder }) => (
          <div key={key}>
            <FieldLabel label={label} optional />
            <Textarea
              value={value[key] ?? ''}
              onChange={(v) => upd(key, v)}
              onBlur={onBlur}
              placeholder={placeholder}
              rows={2}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function RiskPane({
  value,
  onChange,
  onBlur,
}: {
  value: IntakeRisk
  onChange: (v: IntakeRisk) => void
  onBlur: () => void
}) {
  function upd(key: keyof IntakeRisk, val: boolean | string) {
    onChange({ ...value, [key]: val })
  }
  const flagged = hasRiskFlags(value)

  return (
    <div>
      <SectionHeader
        label="Risk Assessment"
        desc="Suicidal and homicidal ideation — complete for every intake"
      />

      {flagged && (
        <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <AlertTriangle size={16} className="text-red-600 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700 font-medium">
            One or more positive risk indicators flagged. Ensure a safety plan is in place before concluding this session.
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#e8e4df] overflow-hidden mb-5">
        <div className="px-5 py-3 bg-[#fdf8f6] border-b border-[#e8e4df]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280]">Suicidal Ideation (SI)</p>
        </div>
        <div className="px-5 py-1">
          <YesNoRow label="SI present — passive or active thoughts?" value={value.si_present} onChange={(v) => upd('si_present', v)} />
          <YesNoRow label="Plan — has the client described a plan?" value={value.si_plan} onChange={(v) => upd('si_plan', v)} />
          <YesNoRow label="Means — access to lethal means?" value={value.si_means} onChange={(v) => upd('si_means', v)} />
          <YesNoRow label="History — prior attempts or self-harm?" value={value.si_history} onChange={(v) => upd('si_history', v)} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#e8e4df] overflow-hidden mb-5">
        <div className="px-5 py-3 bg-[#fdf8f6] border-b border-[#e8e4df]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280]">Homicidal Ideation (HI)</p>
        </div>
        <div className="px-5 py-1">
          <YesNoRow label="HI present — thoughts of harming others?" value={value.hi_present} onChange={(v) => upd('hi_present', v)} />
          <YesNoRow label="Plan — specific plan toward a target?" value={value.hi_plan} onChange={(v) => upd('hi_plan', v)} />
          <YesNoRow label="Means — access to weapons or other means?" value={value.hi_means} onChange={(v) => upd('hi_means', v)} />
        </div>
      </div>

      <div>
        <FieldLabel label="Risk notes & safety plan" optional />
        <Textarea
          value={value.risk_notes ?? ''}
          onChange={(v) => upd('risk_notes', v)}
          onBlur={onBlur}
          placeholder="Document the safety plan, protective factors, follow-up actions, and any duty-to-warn considerations…"
          rows={4}
        />
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

const defaultHistory: IntakeHistory = {
  previous_therapy: null,
  psychiatric_history: null,
  medical_history: null,
  medications: null,
  substance_use: null,
  developmental: null,
}
const defaultFamily: IntakeFamily = {
  family_structure: null,
  family_mental_health: null,
  childhood: null,
  relationships: null,
}
const defaultSocial: IntakeSocial = {
  living_situation: null,
  occupation: null,
  education: null,
  support_network: null,
  cultural_background: null,
  stressors: null,
}
const defaultRisk: IntakeRisk = {
  si_present: false,
  si_plan: false,
  si_means: false,
  si_history: false,
  hi_present: false,
  hi_plan: false,
  hi_means: false,
  risk_notes: null,
}

export default function IntakeStepper({ intake, onFinalized }: IntakeStepperProps) {
  const intakeId = intake.id

  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [finalizing, setFinalizing] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const [presenting, setPresenting] = useState(intake.presenting_concern ?? '')
  const [history, setHistory] = useState<IntakeHistory>(intake.history ?? defaultHistory)
  const [family, setFamily] = useState<IntakeFamily>(intake.family ?? defaultFamily)
  const [social, setSocial] = useState<IntakeSocial>(intake.social ?? defaultSocial)
  const [risk, setRisk] = useState<IntakeRisk>(intake.risk ?? defaultRisk)

  const buildPayload = useCallback(() => ({
    presenting_concern: presenting.trim() || null,
    history,
    family,
    social,
    risk,
  }), [presenting, history, family, social, risk])

  const autoSave = useCallback(async () => {
    setSaving(true)
    setSaveError(null)
    try {
      await updateIntake(intakeId, buildPayload())
      setLastSaved(new Date())
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : 'Auto-save failed')
    } finally {
      setSaving(false)
    }
  }, [intakeId, buildPayload])

  async function handleFinalize() {
    setFinalizing(true)
    setSaveError(null)
    try {
      await updateIntake(intakeId, buildPayload())
      const result = await finalizeIntake(intakeId)
      onFinalized?.(result)
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : 'Failed to finalize')
    } finally {
      setFinalizing(false)
    }
  }

  const canFinalize =
    step === SECTIONS.length - 1 && presenting.trim().length > 0

  return (
    <div className="grid lg:grid-cols-[220px_1fr] gap-6">
      {/* Sidebar nav */}
      <nav className="hidden lg:block">
        <ul className="space-y-1">
          {SECTIONS.map((s, i) => (
            <li key={s.key}>
              <button
                type="button"
                onClick={() => setStep(i)}
                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                  i === step
                    ? 'bg-[#d4e4e1] text-[#2d4a47] font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center shrink-0 ${
                    i < step
                      ? 'bg-[#2d4a47] text-white'
                      : i === step
                      ? 'bg-white border-2 border-[#2d4a47] text-[#2d4a47]'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {i < step ? <Check size={10} strokeWidth={3} /> : i + 1}
                </span>
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main pane */}
      <div>
        <div className="bg-white rounded-xl border border-[#e8e4df] p-6">
          {/* Mobile step indicator */}
          <p className="text-xs text-[#6b7280] mb-4 lg:hidden">
            Step {step + 1} of {SECTIONS.length} — {SECTIONS[step].label}
          </p>

          {step === 0 && (
            <PresentingPane value={presenting} onChange={setPresenting} onBlur={autoSave} />
          )}
          {step === 1 && (
            <HistoryPane value={history} onChange={setHistory} onBlur={autoSave} />
          )}
          {step === 2 && (
            <FamilyPane value={family} onChange={setFamily} onBlur={autoSave} />
          )}
          {step === 3 && (
            <SocialPane value={social} onChange={setSocial} onBlur={autoSave} />
          )}
          {step === 4 && (
            <RiskPane value={risk} onChange={setRisk} onBlur={autoSave} />
          )}

          {saveError && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">
              {saveError}
            </div>
          )}

          {/* Footer nav */}
          <div className="mt-6 pt-4 border-t border-[#e8e4df] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={step === 0}
                onClick={() => setStep((s) => s - 1)}
                className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={15} /> Previous
              </button>
              {/* Manual save */}
              <button
                type="button"
                onClick={autoSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
              >
                <Save size={13} /> {saving ? 'Saving…' : 'Save draft'}
              </button>
            </div>

            <div className="flex items-center gap-3">
              {lastSaved && !saving && (
                <span className="text-[11px] text-[#9ca3af]">
                  Saved {lastSaved.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}

              {step < SECTIONS.length - 1 ? (
                <button
                  type="button"
                  onClick={() => { autoSave(); setStep((s) => s + 1) }}
                  className="inline-flex items-center gap-1.5 h-10 px-5 rounded-lg bg-[#354744] text-white text-sm font-medium hover:bg-[#1a2f2d] transition"
                >
                  Next <ChevronRight size={15} />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!canFinalize || finalizing}
                  onClick={handleFinalize}
                  className="inline-flex items-center gap-1.5 h-10 px-5 rounded-lg bg-[#354744] text-white text-sm font-medium hover:bg-[#1a2f2d] disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <Check size={14} /> {finalizing ? 'Finalising…' : 'Finalise intake'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
