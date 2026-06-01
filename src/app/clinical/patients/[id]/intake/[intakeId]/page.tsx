import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, AlertTriangle, ClipboardList } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { hasRiskFlags, type PatientIntake } from '@/lib/clinical/intake'
import DeleteIntakeButton from '@/components/clinical/DeleteIntakeButton'

export default async function IntakeDetailPage({
  params,
}: {
  params: Promise<{ id: string; intakeId: string }>
}) {
  const { id: patientId, intakeId } = await params
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('patient_intakes')
    .select('*')
    .eq('id', intakeId)
    .eq('patient_id', patientId)
    .maybeSingle()
  if (error || !data) notFound()

  const intake = data as PatientIntake
  const riskFlagged = hasRiskFlags(intake.risk)
  const finalised = intake.status === 'final'

  return (
    <div className="space-y-6">
      <Link
        href={`/clinical/patients/${patientId}/intake`}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6b7280] hover:text-[#1c1c1e]"
      >
        <ArrowLeft size={14} /> Intake history
      </Link>

      <header className="bg-white rounded-xl border border-[#e8e4df] p-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1
              className="text-2xl font-semibold text-[#1c1c1e]"
              style={{ fontFamily: 'var(--font-fraunces), serif' }}
            >
              <ClipboardList size={18} className="inline mr-2 -mt-0.5" />
              Intake v{intake.version}
            </h1>
            <p className="text-sm text-[#6b7280] mt-1">
              {finalised ? 'Finalised' : 'Draft'} · {formatDate(intake.updated_at)}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wide ${
                finalised
                  ? 'bg-[#d4e4e1] text-[#2d4a47]'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {intake.status}
            </span>
            {riskFlagged && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 px-2 py-1 rounded-full">
                <AlertTriangle size={11} /> Risk flagged
              </span>
            )}
            <DeleteIntakeButton intakeId={intake.id} patientId={patientId} />
          </div>
        </div>
      </header>

      <Section title="Presenting concern">
        <Prose value={intake.presenting_concern} />
      </Section>

      <Section title="History">
        <KeyValue
          rows={[
            ['Previous therapy', intake.history?.previous_therapy],
            ['Psychiatric history', intake.history?.psychiatric_history],
            ['Medical history', intake.history?.medical_history],
            ['Medications', intake.history?.medications],
            ['Substance use', intake.history?.substance_use],
            ['Developmental', intake.history?.developmental],
          ]}
        />
      </Section>

      <Section title="Family & relationships">
        <KeyValue
          rows={[
            ['Family structure', intake.family?.family_structure],
            ['Family mental health', intake.family?.family_mental_health],
            ['Childhood', intake.family?.childhood],
            ['Relationships', intake.family?.relationships],
          ]}
        />
      </Section>

      <Section title="Social & cultural">
        <KeyValue
          rows={[
            ['Living situation', intake.social?.living_situation],
            ['Occupation', intake.social?.occupation],
            ['Education', intake.social?.education],
            ['Support network', intake.social?.support_network],
            ['Cultural background', intake.social?.cultural_background],
            ['Stressors', intake.social?.stressors],
          ]}
        />
      </Section>

      <Section title="Risk assessment">
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <RiskRow label="Suicidal ideation present" value={intake.risk?.si_present} />
          <RiskRow label="SI: plan" value={intake.risk?.si_plan} />
          <RiskRow label="SI: means" value={intake.risk?.si_means} />
          <RiskRow label="SI: prior attempts" value={intake.risk?.si_history} />
          <RiskRow label="Homicidal ideation present" value={intake.risk?.hi_present} />
          <RiskRow label="HI: plan" value={intake.risk?.hi_plan} />
          <RiskRow label="HI: means" value={intake.risk?.hi_means} />
        </div>
        {intake.risk?.risk_notes && (
          <div className="mt-4 pt-4 border-t border-[#e8e4df]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280] mb-2">
              Risk notes
            </p>
            <p className="text-sm text-[#1c1c1e] whitespace-pre-wrap">{intake.risk.risk_notes}</p>
          </div>
        )}
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280] mb-3">
        {title}
      </h2>
      <div className="bg-white rounded-xl border border-[#e8e4df] p-5">{children}</div>
    </section>
  )
}

function Prose({ value }: { value: string | null }) {
  if (!value) return <p className="text-sm italic text-[#9ca3af]">Not recorded.</p>
  return <p className="text-sm text-[#1c1c1e] whitespace-pre-wrap leading-relaxed">{value}</p>
}

function KeyValue({ rows }: { rows: [string, string | null | undefined][] }) {
  const visible = rows.filter(([, v]) => v && v.length > 0)
  if (visible.length === 0)
    return <p className="text-sm italic text-[#9ca3af]">Not recorded.</p>
  return (
    <dl className="grid sm:grid-cols-[180px_1fr] gap-y-3 gap-x-4 text-sm">
      {visible.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-xs uppercase tracking-wide text-[#9ca3af] pt-0.5">{k}</dt>
          <dd className="text-sm text-[#1c1c1e] whitespace-pre-wrap">{v}</dd>
        </div>
      ))}
    </dl>
  )
}

function RiskRow({ label, value }: { label: string; value: boolean | null | undefined }) {
  const yes = value === true
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[#1c1c1e]">{label}</span>
      <span
        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${
          yes
            ? 'bg-red-50 text-red-700 border border-red-200'
            : 'bg-stone-100 text-[#6b7280]'
        }`}
      >
        {yes ? 'Yes' : 'No'}
      </span>
    </div>
  )
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
