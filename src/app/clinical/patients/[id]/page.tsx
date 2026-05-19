import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ClipboardList, Stethoscope, BookOpen, ArrowRight, Pencil, AlertTriangle } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { hasRiskFlags } from '@/lib/clinical/intake'
import { getIntakeServer } from '@/lib/clinical/intake.server'
import type { Patient } from '@/lib/clinical/patients'

export default async function PatientOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error || !data) notFound()
  const patient = data as Patient

  // Load intake for risk banner
  const intake = await getIntakeServer(id).catch(() => null)
  const riskFlagged = hasRiskFlags(intake?.risk)

  const created = new Date(patient.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
  const updated = new Date(patient.updated_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  const nextSteps = [
    {
      title: 'Begin intake',
      desc: 'Capture history, presenting concern, and social context.',
      href: `/clinical/patients/${patient.id}/intake`,
      icon: ClipboardList,
    },
    {
      title: 'Run a screening',
      desc: 'PHQ-9, GAD-7, or a tailored instrument.',
      href: `/clinical/patients/${patient.id}/screening`,
      icon: Stethoscope,
    },
    {
      title: 'Assign resources',
      desc: 'Send worksheets or recommended reading.',
      href: `/clinical/patients/${patient.id}/resources`,
      icon: BookOpen,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Risk banner from intake */}
      {riskFlagged && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-5 py-4">
          <AlertTriangle size={18} className="text-red-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-700">Risk indicators flagged on intake</p>
            <p className="text-xs text-red-600 mt-0.5">
              Positive SI or HI responses recorded. Confirm a safety plan is documented before the next session.{' '}
              <Link href={`/clinical/patients/${patient.id}/intake`} className="underline font-medium">
                View intake →
              </Link>
            </p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
                Next steps
              </h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {nextSteps.map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  className="group bg-white rounded-xl border border-[#e8e4df] p-4 transition hover:border-[#b8ceca] hover:shadow-sm"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#d4e4e1] text-[#2d4a47] flex items-center justify-center mb-3">
                    <s.icon size={16} />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#1c1c1e]">{s.title}</p>
                    <ArrowRight size={14} className="text-[#9ca3af] transition group-hover:translate-x-0.5 group-hover:text-[#2d4a47]" />
                  </div>
                  <p className="text-xs text-[#6b7280] mt-1">{s.desc}</p>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280] mb-3">
              Activity
            </h2>
            <div className="bg-white rounded-xl border border-[#e8e4df] px-6 py-10 text-center">
              <p className="text-sm font-medium text-[#6b7280]">No activity yet</p>
              <p className="text-xs text-[#6b7280] mt-1">
                Intake, screenings, and notes will appear here once recorded.
              </p>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
                Details
              </h2>
              <Link
                href={`/clinical/patients/${patient.id}/edit`}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#2d4a47] hover:underline"
              >
                <Pencil size={12} /> Edit
              </Link>
            </div>
            <div className="bg-white rounded-xl border border-[#e8e4df] p-5 space-y-3 text-sm">
              <Row label="DOB" value={patient.dob} />
              <Row label="Gender" value={patient.gender} />
              <Row label="Pronouns" value={patient.pronouns} />
              <Row label="Marital status" value={patient.marital_status} />
              <Row label="Email" value={patient.email} />
              <Row label="Phone" value={patient.phone} />
              <Row label="Address" value={patient.address} />
            </div>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280] mb-3">
              Emergency contact
            </h2>
            <div className="bg-white rounded-xl border border-[#e8e4df] p-5 space-y-3 text-sm">
              <Row label="Name" value={patient.emergency_contact_name} />
              <Row label="Phone" value={patient.emergency_contact_phone} />
            </div>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280] mb-3">
              Chart
            </h2>
            <div className="bg-white rounded-xl border border-[#e8e4df] p-5 space-y-3 text-sm">
              <Row label="Status" value={patient.status} />
              <Row label="Created" value={created} />
              <Row label="Updated" value={updated} />
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-xs uppercase tracking-wide text-[#9ca3af] pt-0.5">{label}</span>
      <span className="text-sm text-[#1c1c1e] text-right break-words max-w-[200px] capitalize">
        {value && value.length > 0 ? value : <span className="text-[#9ca3af]">—</span>}
      </span>
    </div>
  )
}
