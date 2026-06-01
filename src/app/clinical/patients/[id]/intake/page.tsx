import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AlertTriangle, Plus, ChevronRight, ClipboardList, Pencil } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { hasRiskFlags, type PatientIntake } from '@/lib/clinical/intake'
import type { Patient } from '@/lib/clinical/patients'

export default async function IntakePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const [{ data: patientRow }, { data: intakeRows }] = await Promise.all([
    supabase.from('patients').select('*').eq('id', id).maybeSingle(),
    supabase
      .from('patient_intakes')
      .select('*')
      .eq('patient_id', id)
      .order('version', { ascending: false }),
  ])

  if (!patientRow) notFound()
  // patient is fetched only to verify it exists / RLS ownership
  void (patientRow as Patient)

  const intakes = (intakeRows ?? []) as PatientIntake[]
  const latest = intakes[0] ?? null
  const draft = intakes.find((i) => i.status === 'draft') ?? null
  const finalIntakes = intakes.filter((i) => i.status === 'final')
  const latestRiskFlagged = hasRiskFlags(latest?.risk)

  const primaryCta = draft
    ? { label: 'Continue intake', href: `/clinical/patients/${id}/intake/new` }
    : intakes.length === 0
      ? { label: 'Begin intake', href: `/clinical/patients/${id}/intake/new` }
      : { label: 'Add intake', href: `/clinical/patients/${id}/intake/new` }

  return (
    <div className="space-y-6">
      {/* Risk banner from latest intake */}
      {latestRiskFlagged && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-5 py-4">
          <AlertTriangle size={18} className="text-red-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-700">Risk indicators flagged on latest intake</p>
            <p className="text-xs text-red-600 mt-0.5">
              Positive SI or HI responses recorded. Confirm a safety plan is documented before the next session.
            </p>
          </div>
        </div>
      )}

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
            Intake history
          </h2>
          <Link
            href={primaryCta.href}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#354744] text-white text-xs font-medium hover:bg-[#1a2f2d] transition"
          >
            <Plus size={13} /> {primaryCta.label}
          </Link>
        </div>

        {intakes.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#e8e4df] px-6 py-12 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#d4e4e1] text-[#2d4a47] flex items-center justify-center mb-3">
              <ClipboardList size={20} />
            </div>
            <p className="text-sm font-medium text-[#6b7280]">No intake on file yet</p>
            <p className="text-xs text-[#6b7280] mt-1 max-w-md mx-auto">
              Capture presenting concern, history, family, social context, and risk assessment.
              Each saved intake is preserved as part of the patient's history.
            </p>
          </div>
        ) : (
          <ul className="bg-white rounded-xl border border-[#e8e4df] divide-y divide-[#e8e4df] overflow-hidden">
            {draft && (
              <li>
                <Link
                  href={`/clinical/patients/${id}/intake/new`}
                  className="group flex items-center justify-between gap-4 px-5 py-4 hover:bg-stone-50 transition"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                      <Pencil size={14} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#1c1c1e]">
                        Intake v{draft.version} — draft
                      </p>
                      <p className="text-xs text-[#6b7280] mt-0.5">
                        Last edited {formatDate(draft.updated_at)} · continue where you left off
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-[#9ca3af] group-hover:text-[#2d4a47] group-hover:translate-x-0.5 transition" />
                </Link>
              </li>
            )}

            {finalIntakes.map((it) => (
              <li key={it.id}>
                <Link
                  href={`/clinical/patients/${id}/intake/${it.id}`}
                  className="group flex items-center justify-between gap-4 px-5 py-4 hover:bg-stone-50 transition"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#d4e4e1] text-[#2d4a47] shrink-0">
                      <ClipboardList size={14} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#1c1c1e]">
                        Intake v{it.version}
                        {hasRiskFlags(it.risk) && (
                          <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-red-700">
                            <AlertTriangle size={10} /> Risk flagged
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-[#6b7280] mt-0.5">
                        Finalised {formatDate(it.updated_at)}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-[#9ca3af] group-hover:text-[#2d4a47] group-hover:translate-x-0.5 transition" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
