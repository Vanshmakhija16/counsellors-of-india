import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type {
  Instrument,
  InstrumentItem,
  ScreeningResponse,
  ScreeningSession,
  SeverityBand,
  InstrumentOption,
} from '@/lib/clinical/screening'

export default async function ScreeningResultPage({
  params,
}: {
  params: Promise<{ id: string; sessionId: string }>
}) {
  const { id: patientId, sessionId } = await params
  const supabase = await createServerSupabaseClient()

  const { data: sessRow } = await supabase
    .from('screening_sessions')
    .select('*')
    .eq('id', sessionId)
    .maybeSingle()
  if (!sessRow) notFound()
  const session = sessRow as ScreeningSession

  const [{ data: instRow }, { data: itemsData }, { data: respData }] = await Promise.all([
    supabase.from('instruments').select('*').eq('id', session.instrument_id).maybeSingle(),
    supabase
      .from('instrument_items')
      .select('*')
      .eq('instrument_id', session.instrument_id)
      .order('position', { ascending: true }),
    supabase.from('screening_responses').select('*').eq('session_id', sessionId),
  ])

  if (!instRow) notFound()
  const instrument = instRow as Instrument
  const items = (itemsData ?? []) as InstrumentItem[]
  const responses = (respData ?? []) as ScreeningResponse[]
  const respByItem = new Map(responses.map((r) => [r.item_id, r.value]))
  const optionsByValue = new Map<number, InstrumentOption>(
    instrument.options.map((o) => [o.value, o])
  )

  const date = new Date(session.administered_at).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="space-y-6">
      <Link
        href={`/clinical/patients/${patientId}/screening`}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6b7280] hover:text-[#1c1c1e]"
      >
        <ArrowLeft size={14} /> Back to screening
      </Link>

      <div className="bg-white rounded-xl border border-[#e8e4df] p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1
              className="text-2xl font-semibold text-[#1c1c1e]"
              style={{ fontFamily: 'var(--font-fraunces), serif' }}
            >
              {instrument.short_name}
            </h1>
            <p className="text-sm text-[#6b7280] mt-1">{instrument.name}</p>
            <p className="text-xs text-[#6b7280] mt-2">{date}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-[#9ca3af]">Total score</p>
            <p className="text-4xl font-semibold text-[#1c1c1e]">{session.total_score}</p>
            <p className="text-xs text-[#6b7280] mt-1">
              range {instrument.min_score}–{instrument.max_score}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <SeverityChip label={session.severity_label} />
          {session.flagged && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full">
              <AlertTriangle size={11} /> Critical-item flag
            </span>
          )}
        </div>

        <SeverityScale bands={instrument.severity_bands} score={session.total_score} />

        {session.notes && (
          <div className="mt-5 pt-5 border-t border-[#e8e4df]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280] mb-2">
              Clinical notes
            </p>
            <p className="text-sm text-[#1c1c1e] whitespace-pre-wrap">{session.notes}</p>
          </div>
        )}
      </div>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280] mb-3">
          Item responses
        </h2>
        <ol className="bg-white rounded-xl border border-[#e8e4df] divide-y divide-[#e8e4df]">
          {items.map((item) => {
            const v = respByItem.get(item.id)
            const opt = v !== undefined ? optionsByValue.get(v) : undefined
            return (
              <li key={item.id} className="px-5 py-4 flex items-start gap-4">
                <span className="text-xs font-semibold text-[#9ca3af] w-6 pt-0.5">
                  {String(item.position).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#1c1c1e]">
                    {item.prompt}
                    {item.is_critical && (
                      <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                        <AlertTriangle size={11} /> Critical
                      </span>
                    )}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-medium ${
                      item.is_critical && (v ?? 0) > 0
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-[#d4e4e1] text-[#2d4a47]'
                    }`}
                  >
                    <span className="font-semibold">{v ?? '—'}</span>
                    <span className="opacity-70">{opt?.label ?? ''}</span>
                  </span>
                </div>
              </li>
            )
          })}
        </ol>
      </section>
    </div>
  )
}

function SeverityChip({ label }: { label: string }) {
  const lower = label.toLowerCase()
  const style = lower.includes('severe')
    ? 'bg-red-50 text-red-700 border-red-200'
    : lower.includes('moderate') || lower.includes('harmful') || lower.includes('hazardous')
    ? 'bg-amber-50 text-amber-800 border-amber-200'
    : lower.includes('mild') || lower.includes('probable')
    ? 'bg-orange-50 text-orange-700 border-orange-200'
    : 'bg-[#d4e4e1] text-[#2d4a47] border-[#b8ceca]'
  return (
    <span
      className={`inline-flex items-center text-[11px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full border ${style}`}
    >
      {label}
    </span>
  )
}

function SeverityScale({ bands, score }: { bands: SeverityBand[]; score: number }) {
  if (bands.length === 0) return null
  const max = bands[bands.length - 1].max
  return (
    <div className="mt-5">
      <div className="flex h-2 rounded-full overflow-hidden border border-[#e8e4df]">
        {bands.map((b, i) => {
          const width = ((b.max - b.min + 1) / (max + 1)) * 100
          const colors = ['bg-[#d4e4e1]', 'bg-orange-200', 'bg-amber-300', 'bg-amber-500', 'bg-red-500']
          return (
            <div
              key={b.label + i}
              className={colors[i] ?? 'bg-stone-200'}
              style={{ width: `${width}%` }}
              title={`${b.label}: ${b.min}–${b.max}`}
            />
          )
        })}
      </div>
      <div className="relative mt-1 h-3">
        <div
          className="absolute -translate-x-1/2"
          style={{ left: `${(score / max) * 100}%` }}
        >
          <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-[#1c1c1e]" />
        </div>
      </div>
      <div className="flex justify-between text-[10px] text-[#9ca3af]">
        <span>{bands[0].min}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}
