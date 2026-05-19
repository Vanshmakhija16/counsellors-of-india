import { notFound } from 'next/navigation'
import { getInviteByToken } from '@/lib/clinical/invites.server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { InstrumentWithItems } from '@/lib/clinical/screening'
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
    return <StatusPage title="Link expired" desc="This screening link has expired. Please contact your therapist to request a new one." />
  }
  if (invite.used) {
    return <StatusPage title="Already submitted" desc="You've already completed this screening. Thank you!" success />
  }

  // Fetch instrument + items using service-role / server client
  const supabase = await createServerSupabaseClient()
  const { data: instRow } = await supabase
    .from('instruments')
    .select('*')
    .eq('id', invite.instrument_id)
    .maybeSingle()
  const { data: itemRows } = await supabase
    .from('instrument_items')
    .select('*')
    .eq('instrument_id', invite.instrument_id)
    .order('position', { ascending: true })

  if (!instRow) notFound()

  const instrument: InstrumentWithItems = {
    ...(instRow as any),
    items: (itemRows ?? []) as any[],
  }

  return (
    <div className="min-h-screen bg-[#f6f3ef] py-12 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b7280] mb-1">
            Counsellors of India
          </p>
          <h1
            className="text-2xl font-semibold text-[#1c1c1e]"
            style={{ fontFamily: 'var(--font-fraunces), serif' }}
          >
            {invite.instrument_short_name}
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
