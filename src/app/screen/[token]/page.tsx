import { notFound } from 'next/navigation'
import { getInviteByToken } from '@/lib/clinical/invites.server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { InstrumentWithItems, InstrumentItem, InstrumentOption, SeverityBand } from '@/lib/clinical/screening'
import PublicScreeningForm from './PublicScreeningForm'

export const dynamic = 'force-dynamic'

export default async function PublicScreenPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const invite = await getInviteByToken(token).catch(() => null)

  if (!invite) notFound()

  if (invite.expired) {
    return (
      <StatusPage
        title="Link expired"
        desc="This screening link has expired. Please contact your therapist to request a new one."
      />
    )
  }
  if (invite.used) {
    return (
      <StatusPage
        title="Already submitted"
        desc="You've already completed this screening. Thank you!"
        success
      />
    )
  }

  const supabase = await createServerSupabaseClient()

  // assessment_scales.id IS the text slug (e.g. 'phq-9')
  const scaleId = invite.instrument_id

  const { data: scaleRow } = await supabase
    .from('assessment_scales')
    .select('id, name, description, timeframe, max_score, scoring_interpretation')
    .eq('id', scaleId)
    .maybeSingle()

  if (!scaleRow) notFound()
  const scale = scaleRow as Record<string, unknown>

  // Fetch questions ordered by question_number
  const { data: questionRows } = await supabase
    .from('assessment_questions')
    .select('id, scale_id, question_number, question_text, is_reverse_scored, category')
    .eq('scale_id', scaleId)
    .order('question_number', { ascending: true })

  // Fetch options ordered by display_order
  const { data: optionRows } = await supabase
    .from('assessment_options')
    .select('option_text, score_value, display_order')
    .eq('scale_id', scaleId)
    .order('display_order', { ascending: true })

  const options: InstrumentOption[] = (optionRows ?? []).map((o: Record<string, unknown>) => ({
    value: o.score_value as number,
    label: o.option_text as string,
  }))

  const items: InstrumentItem[] = (questionRows ?? []).map((q: Record<string, unknown>) => ({
    id:            q.id as string,
    instrument_id: scaleId,
    position:      (q.question_number ?? 0) as number,
    prompt:        (q.question_text ?? '') as string,
    is_critical:   false,
  }))

  const rawBands = scale.scoring_interpretation as SeverityBand[] | null
  const severityBands: SeverityBand[] = Array.isArray(rawBands) ? rawBands : []

  const instrument: InstrumentWithItems = {
    id:             scaleId,
    slug:           scaleId,
    name:           (scale.name ?? '') as string,
    short_name:     (scale.name ?? '') as string,
    description:    (scale.description ?? null) as string | null,
    domain:         'general',
    recall_window:  (scale.timeframe ?? null) as string | null,
    min_score:      0,
    max_score:      (scale.max_score ?? 0) as number,
    severity_bands: severityBands,
    options,
    is_active:      true,
    items,
  }

  return (
    <div className="min-h-screen bg-[#f6f3ef] py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="mb-8 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b7280] mb-1">
            Counsellors of India
          </p>
          <h1
            className="text-2xl font-semibold text-[#1c1c1e]"
            style={{ fontFamily: 'var(--font-fraunces), serif' }}
          >
            {invite.instrument_name}
          </h1>
          <p className="text-sm text-[#6b7280] mt-1">
            Hi {invite.patient_first_name} — please answer each question honestly.
          </p>
        </div>

        <PublicScreeningForm token={token} instrument={instrument} />

        <p className="mt-8 text-center text-[11px] text-[#9ca3af]">
          Your responses go directly to your therapist. This page does not identify you by name to third parties.
        </p>
      </div>
    </div>
  )
}

function StatusPage({
  title,
  desc,
  success,
}: {
  title: string
  desc: string
  success?: boolean
}) {
  return (
    <div className="min-h-screen bg-[#f6f3ef] flex items-center justify-center px-4">
      <div className="max-w-sm w-full bg-white rounded-2xl border border-[#e8e4df] p-10 text-center shadow-sm">
        <div
          className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-5 ${
            success ? 'bg-[#d4e4e1] text-[#2d4a47]' : 'bg-amber-50 text-amber-600'
          }`}
        >
          {success ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
        </div>
        <h2
          className="text-lg font-semibold text-[#1c1c1e]"
          style={{ fontFamily: 'var(--font-fraunces), serif' }}
        >
          {title}
        </h2>
        <p className="text-sm text-[#6b7280] mt-2">{desc}</p>
      </div>
    </div>
  )
}
