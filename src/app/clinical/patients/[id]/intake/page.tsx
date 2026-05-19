import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Check, AlertTriangle, ClipboardList } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { intakeCompletionFlags, hasRiskFlags } from '@/lib/clinical/intake'
import { getIntakeServer } from '@/lib/clinical/intake.server'
import type { Patient } from '@/lib/clinical/patients'
import IntakeClientShell from './IntakeClientShell'

export default async function IntakePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.from('patients').select('*').eq('id', id).maybeSingle()
  if (error || !data) notFound()
  const patient = data as Patient

  const intake = await getIntakeServer(id).catch(() => null)
  const flags = intakeCompletionFlags(intake)
  const riskFlagged = hasRiskFlags(intake?.risk)
  const allDone = Object.values(flags).every(Boolean)

  const sections = [
    { key: 'presenting', label: 'Presenting Concern', done: flags.presenting },
    { key: 'history', label: 'History', done: flags.history },
    { key: 'family', label: 'Family & Relationships', done: flags.family },
    { key: 'social', label: 'Social & Cultural', done: flags.social },
    { key: 'risk', label: 'Risk Assessment', done: flags.risk },
  ]

  return (
    <div className="space-y-6">
      {/* Risk banner */}
      {riskFlagged && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-5 py-4">
          <AlertTriangle size={18} className="text-red-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-700">Risk indicators flagged</p>
            <p className="text-xs text-red-600 mt-0.5">
              This patient's intake records positive SI or HI responses. Review the risk section and confirm a safety plan is documented.
            </p>
          </div>
        </div>
      )}

      {/* Section completion overview */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
            Sections
          </h2>
          {intake?.status === 'final' && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#d4e4e1] text-[#2d4a47] uppercase tracking-wide">
              Finalised
            </span>
          )}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {sections.map((s, i) => (
            <div
              key={s.key}
              className={`bg-white rounded-xl border p-4 flex items-center gap-3 ${
                s.done ? 'border-[#b8ceca]' : 'border-[#e8e4df]'
              }`}
            >
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  s.done ? 'bg-[#2d4a47] text-white' : 'bg-gray-100 text-gray-400'
                }`}
              >
                {s.done ? <Check size={13} strokeWidth={3} /> : <span className="text-xs">{i + 1}</span>}
              </span>
              <span className="text-xs font-medium text-gray-700">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Client shell handles the interactive stepper */}
      <IntakeClientShell patientId={id} initial={intake} isFinalized={intake?.status === 'final'} />
    </div>
  )
}
