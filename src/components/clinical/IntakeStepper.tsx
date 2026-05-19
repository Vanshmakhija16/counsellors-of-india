'use client'

import { useState, useCallback } from 'react'
import { ChevronRight, ChevronLeft, Check, AlertTriangle, Save } from 'lucide-react'
import {
  upsertIntake,
  finalizeIntake,
  hasRiskFlags,
  type PatientIntake,
  type IntakeHistory,
  type IntakeFamily,
  type IntakeSocial,
  type IntakeRisk,
} from '@/lib/clinical/intake'

// ─── Types ────────────────────────────────────────────────────────────────────

interface IntakeStepperProps {
  patientId: string
  initial: PatientIntake | null
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
        desc="Capture the chief complaint in the client's own words"
      />
      <FieldLabel label="What brings the client in today?" />
      <Textarea
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder="Describe the primary reason for seeking therapy, including onset, duration, and impact on daily functioning…"
        rows={8}
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
  function upd(key: keyof IntakeHistory, val: string) {
    onChange({ ...value, [key]: val })
  }
  return (
    <div>
      <SectionHeader
        label="History"
        desc="Previous therapy, medical, psychiatric, and developmental background"
      />
      <div className="space-y-5">
        {[
          { key: 'previous_therapy' as const, label: 'Previous therapy / counselling', placeholder: 'Types of therapy, approximate dates, outcomes…' },
          { key: 'psychiatric_history' as const, label: 'Psychiatric history', placeholder: 'Diagnoses, hospitalisations, medications history…' },
          { key: 'medical_history' as const, label: 'Medical history', placeholder: 'Chronic conditions, surgeries, significant illnesses…' },
          { key: 'medications' as const, label: 'Current medications', placeholder: 'Name, dose, prescribing physician, compliance…' },
          { key: 'substance_use' as const, label: 'Substance use', placeholder: 'Alcohol, drugs, tobacco — frequency and quantity…' },
          { key: 'developmental' as const, label: 'Developmental / early history', placeholder: 'Birth complications, milestones, early adversity…' },
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
  function upd(key: keyof IntakeFamily, val: string) {
    onChange({ ...value, [key]: val })
  }
  return (
    <div>
      <SectionHeader
        label="Family & Relationships"
        desc="Family structure, history of mental illness, childhood and current relationships"
      />
      <div className="space-y-5">
        {[
          { key: 'family_structure' as const, label: 'Family structure', placeholder: 'Parents, siblings, partner, children — living/deceased, quality of relationships…' },
          { key: 'family_mental_health' as const, label: 'Family mental health history', placeholder: 'Known diagnoses, substance abuse, or significant distress in first-degree relatives…' },
          { key: 'childhood' as const, label: 'Childhood & upbringing', placeholder: 'Attachment, trauma, adverse events, cultural and religious context…' },
          { key: 'relationships' as const, label: 'Current relationships', placeholder: 'Partner, friendships, social support — conflicts, quality, isolation…' },
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
  function upd(key: keyof IntakeSocial, val: string) {
    onChange({ ...value, [key]: val })
  }
  return (
    <div>
      <SectionHeader
        label="Social & Cultural Context"
        desc="Living situation, work/education, support network, stressors"
      />
      <div className="space-y-5">
        {[
          { key: 'living_situation' as const, label: 'Living situation', placeholder: 'Who does the client live with, housing stability…' },
          { key: 'occupation' as const, label: 'Occupation / employment', placeholder: 'Current role, work stress, job security…' },
          { key: 'education' as const, label: 'Educational background', placeholder: 'Highest level completed, current enrollment…' },
          { key: 'support_network' as const, label: 'Support network', placeholder: 'Close friends, community ties, religious affiliation…' },
          { key: 'cultural_background' as const, label: 'Cultural & religious background', placeholder: 'Ethnicity, religion, relevant cultural factors affecting presentation…' },
          { key: 'stressors' as const, label: 'Current psychosocial stressors', placeholder: 'Financial, legal, housing, relationship stressors…' },
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

export default function IntakeStepper({ patientId, initial, onFinalized }: IntakeStepperProps) {
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [finalizing, setFinalizing] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const [presenting, setPresenting] = useState(initial?.presenting_concern ?? '')
  const [history, setHistory] = useState<IntakeHistory>(initial?.history ?? defaultHistory)
  const [family, setFamily] = useState<IntakeFamily>(initial?.family ?? defaultFamily)
  const [social, setSocial] = useState<IntakeSocial>(initial?.social ?? defaultSocial)
  const [risk, setRisk] = useState<IntakeRisk>(initial?.risk ?? defaultRisk)

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
      await upsertIntake(patientId, buildPayload())
      setLastSaved(new Date())
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : 'Auto-save failed')
    } finally {
      setSaving(false)
    }
  }, [patientId, buildPayload])

  async function handleFinalize() {
    setFinalizing(true)
    setSaveError(null)
    try {
      await upsertIntake(patientId, buildPayload())
      const result = await finalizeIntake(patientId)
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
