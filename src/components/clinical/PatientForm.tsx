'use client'

import { useState } from 'react'
import {
  patientCreateSchema,
  type Patient,
  type PatientCreateData,
  type PatientStatus,
} from '@/lib/clinical/patients'

interface PatientFormProps {
  initial?: Patient
  submitLabel: string
  onSubmit: (data: PatientCreateData) => Promise<void>
  onCancel?: () => void
}

type FormState = {
  first_name: string
  last_name: string
  dob: string
  gender: string
  pronouns: string
  marital_status: string
  email: string
  phone: string
  address: string
  emergency_contact_name: string
  emergency_contact_phone: string
  status: PatientStatus
}

const emptyState: FormState = {
  first_name: '',
  last_name: '',
  dob: '',
  gender: '',
  pronouns: '',
  marital_status: '',
  email: '',
  phone: '',
  address: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  status: 'active',
}

function fromPatient(p: Patient): FormState {
  return {
    first_name: p.first_name,
    last_name: p.last_name,
    dob: p.dob,
    gender: p.gender ?? '',
    pronouns: p.pronouns ?? '',
    marital_status: p.marital_status ?? '',
    email: p.email ?? '',
    phone: p.phone ?? '',
    address: p.address ?? '',
    emergency_contact_name: p.emergency_contact_name ?? '',
    emergency_contact_phone: p.emergency_contact_phone ?? '',
    status: p.status,
  }
}

export default function PatientForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: PatientFormProps) {
  const [state, setState] = useState<FormState>(
    initial ? fromPatient(initial) : emptyState
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((s) => ({ ...s, [key]: value }))
    if (errors[key]) {
      setErrors((e) => {
        const { [key]: _, ...rest } = e
        return rest
      })
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError(null)
    const parsed = patientCreateSchema.safeParse(state)
    if (!parsed.success) {
      const flat: Record<string, string> = {}
      const fieldLabels: string[] = []
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]
        if (typeof key === 'string' && !flat[key]) {
          flat[key] = issue.message
          fieldLabels.push(`${key.replace(/_/g, ' ')}: ${issue.message}`)
        }
      }
      setErrors(flat)
      setSubmitError(
        `Please fix ${fieldLabels.length} field${fieldLabels.length === 1 ? '' : 's'} — ${fieldLabels.join('; ')}`
      )
      return
    }
    setSubmitting(true)
    try {
      await onSubmit(parsed.data)
    } catch (err: unknown) {
      console.error('[PatientForm] create failed:', err)
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setSubmitError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Section title="Identity">
        <Grid>
          <Field label="First name" error={errors.first_name} required>
            <TextInput
              value={state.first_name}
              onChange={(v) => update('first_name', v)}
              autoComplete="given-name"
            />
          </Field>
          <Field label="Last name" error={errors.last_name} required>
            <TextInput
              value={state.last_name}
              onChange={(v) => update('last_name', v)}
              autoComplete="family-name"
            />
          </Field>
          <Field label="Date of birth" error={errors.dob} required>
            <TextInput
              type="date"
              value={state.dob}
              onChange={(v) => update('dob', v)}
            />
          </Field>
          <Field label="Gender" error={errors.gender}>
            <SelectInput
              value={state.gender}
              onChange={(v) => update('gender', v)}
              options={['', 'Female', 'Male', 'Non-binary', 'Prefer not to say', 'Other']}
            />
          </Field>
          <Field label="Pronouns" error={errors.pronouns}>
            <TextInput
              value={state.pronouns}
              onChange={(v) => update('pronouns', v)}
              placeholder="she/her, he/him, they/them"
            />
          </Field>
          <Field label="Marital status" error={errors.marital_status}>
            <SelectInput
              value={state.marital_status}
              onChange={(v) => update('marital_status', v)}
              options={['', 'Single', 'Married', 'Partnered', 'Divorced', 'Widowed', 'Other']}
            />
          </Field>
        </Grid>
      </Section>

      <Section title="Contact">
        <Grid>
          <Field label="Email" error={errors.email}>
            <TextInput
              type="email"
              value={state.email}
              onChange={(v) => update('email', v)}
              autoComplete="email"
            />
          </Field>
          <Field label="Phone" error={errors.phone}>
            <TextInput
              type="tel"
              value={state.phone}
              onChange={(v) => update('phone', v)}
              placeholder="+91 98765 43210"
              autoComplete="tel"
            />
          </Field>
          <Field label="Address" error={errors.address} colSpan={2}>
            <TextareaInput
              value={state.address}
              onChange={(v) => update('address', v)}
              rows={2}
            />
          </Field>
        </Grid>
      </Section>

      <Section title="Emergency contact">
        <Grid>
          <Field label="Name" error={errors.emergency_contact_name}>
            <TextInput
              value={state.emergency_contact_name}
              onChange={(v) => update('emergency_contact_name', v)}
            />
          </Field>
          <Field label="Phone" error={errors.emergency_contact_phone}>
            <TextInput
              type="tel"
              value={state.emergency_contact_phone}
              onChange={(v) => update('emergency_contact_phone', v)}
            />
          </Field>
        </Grid>
      </Section>

      {initial && (
        <Section title="Status">
          <Grid>
            <Field label="Patient status" error={errors.status}>
              <SelectInput
                value={state.status}
                onChange={(v) => update('status', v as PatientStatus)}
                options={['active', 'archived', 'discharged']}
              />
            </Field>
          </Grid>
        </Section>
      )}

      {submitError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#e8e4df]">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="h-11 px-5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="h-11 px-5 rounded-lg bg-[#354744] text-white text-sm font-medium hover:bg-[#1a2f2d] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280] mb-3">
        {title}
      </h2>
      <div className="bg-white rounded-xl border border-[#e8e4df] p-5">{children}</div>
    </div>
  )
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
}

function Field({
  label,
  error,
  required,
  colSpan,
  children,
}: {
  label: string
  error?: string
  required?: boolean
  colSpan?: 1 | 2
  children: React.ReactNode
}) {
  return (
    <div className={colSpan === 2 ? 'sm:col-span-2 space-y-1.5' : 'space-y-1.5'}>
      <label className="block text-sm font-medium text-gray-600">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

function TextInput({
  value,
  onChange,
  type = 'text',
  placeholder,
  autoComplete,
}: {
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  autoComplete?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete={autoComplete}
      className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a3b8b4] focus:border-transparent"
    />
  )
}

function TextareaInput({
  value,
  onChange,
  rows = 3,
}: {
  value: string
  onChange: (v: string) => void
  rows?: number
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a3b8b4] focus:border-transparent"
    />
  )
}

function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: string[]
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-11 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#a3b8b4] focus:border-transparent"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt === '' ? '— Select —' : opt}
        </option>
      ))}
    </select>
  )
}
