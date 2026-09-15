import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Mail, Phone, MapPin, IndianRupee, Clock, User, Crown, Rocket, TriangleAlert } from 'lucide-react'
import { requireAdmin } from '@/lib/admin'
import { createServiceSupabaseClient } from '@/lib/supabase-server'
import BookingsTable, { type BookingRow } from '@/components/admin/BookingsTable'

interface Props {
  params: Promise<{ id: string }>
}

// Same pill styling as PlanBadge in TherapistsTable.tsx, kept in sync so
// "Pro"/"Starter"/"No plan" read identically in the list and detail views.
function PlanBadge({ plan }: { plan: string | null }) {
  if (isNoPlan(plan)) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[13.5px] font-semibold border border-dashed border-amber-500/40 text-amber-400">
        <TriangleAlert size={12} strokeWidth={2.4} />
        No plan
      </span>
    )
  }
  if (plan === 'pro') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[13.5px] font-semibold border border-[#FF9933]/[0.35] bg-[#FF9933]/[0.08] text-[#FFB565]">
        <Crown size={12} strokeWidth={2.4} />
        Pro
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[13.5px] font-semibold border border-white/[0.18] text-[#F5F1EA] capitalize">
      <Rocket size={12} strokeWidth={2.4} />
      {plan}
    </span>
  )
}

// Matches the same rule in TherapistsTable.tsx -- null, 'free', and the
// literal string 'none'/'None' are all treated as "No plan".
function isNoPlan(plan: string | null) {
  if (!plan) return true
  const normalized = plan.trim().toLowerCase()
  return normalized === '' || normalized === 'free' || normalized === 'none'
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function AdminTherapistDetailPage({ params }: Props) {
  await requireAdmin()
  const { id } = await params
  const db = createServiceSupabaseClient()

  const [{ data: t }, { data: appointments }] = await Promise.all([
    db.from('therapists').select('*').eq('id', id).maybeSingle(),
    db.from('appointments')
      .select('id, client_name, client_email, client_phone, service_name, scheduled_at, duration_mins, service_price, status, payment_status, created_at')
      .eq('therapist_id', id)
      .order('scheduled_at', { ascending: false }),
  ])

  if (!t) notFound()

  const bookings: BookingRow[] = (appointments ?? []).map((a) => ({
    id: a.id,
    client_name: a.client_name,
    client_email: a.client_email,
    client_phone: a.client_phone,
    service_name: a.service_name,
    scheduled_at: a.scheduled_at,
    duration_mins: a.duration_mins,
    service_price: a.service_price,
    status: a.status,
    payment_status: a.payment_status,
  }))

  const totalRevenue = bookings
    .filter((b) => b.payment_status === 'paid')
    .reduce((sum, b) => sum + (b.service_price ?? 0), 0)

  return (
    <div className="px-5 md:px-8 py-6 max-w-6xl" style={{ fontFamily: 'var(--font-instrument-sans)' }}>
      <Link href="/admin/therapists" className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#7A7568] hover:text-[#F5F1EA] mb-5 transition">
        <ArrowLeft size={13} /> Back to therapists
      </Link>

      {/* Profile header */}
      <div className="bg-[#18181B] rounded-lg border border-white/[0.07] p-5 mb-5">
        <div className="flex items-start gap-4 flex-wrap">
          {t.photo_url ? (
            <img src={t.photo_url} alt={t.full_name} className="w-16 h-16 rounded-full object-cover shrink-0" />
          ) : (
            <span className="w-16 h-16 rounded-full bg-white/[0.06] text-[#7A7568] flex items-center justify-center shrink-0"><User size={24} /></span>
          )}
          <div className="flex-1 min-w-[220px]">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-[19px] font-bold text-[#F5F1EA]" style={{ fontFamily: 'var(--font-jakarta)' }}>{t.full_name || 'Unnamed'}</h1>
              <PlanBadge plan={t.plan} />
              <span className={`inline-flex items-center gap-1.5 text-[11.5px] font-medium ${t.is_active ? 'text-emerald-400' : 'text-[#7A7568]'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${t.is_active ? 'bg-emerald-500' : 'bg-[#4A463E]'}`} />
                {t.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            {t.title && <p className="text-[13px] text-[#9C9385] mt-0.5">{t.title}</p>}
            <div className="flex items-center gap-4 flex-wrap mt-2.5 text-[12.5px] text-[#C9C3B5]">
              {t.email && <span className="flex items-center gap-1.5"><Mail size={12} className="text-[#7A7568]" /> {t.email}</span>}
              {(t.whatsapp || t.phone) && <span className="flex items-center gap-1.5"><Phone size={12} className="text-[#7A7568]" /> {t.whatsapp || t.phone}</span>}
              {t.city && <span className="flex items-center gap-1.5"><MapPin size={12} className="text-[#7A7568]" /> {t.city}</span>}
            </div>
          </div>
        </div>

        {t.bio && (
          <p className="text-[13px] text-[#C9C3B5] leading-relaxed mt-4 pt-4 border-t border-white/[0.06] max-w-2xl">{t.bio}</p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/[0.06]">
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-wide text-[#7A7568]">Joined</p>
            <p className="text-[13px] font-semibold text-[#F5F1EA] mt-0.5">{formatDate(t.created_at)}</p>
          </div>
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-wide text-[#7A7568]">Template</p>
            <p className="text-[13px] font-semibold text-[#F5F1EA] mt-0.5">{t.template_id || '—'}</p>
          </div>
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-wide text-[#7A7568]">Payments</p>
            <p className="text-[13px] font-semibold text-[#F5F1EA] mt-0.5 capitalize">
              {t.payments_enabled ? (t.razorpay_oauth_health === 'broken' ? 'Broken' : 'Connected') : 'Not connected'}
            </p>
          </div>
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-wide text-[#7A7568]">Plan expires</p>
            <p className="text-[13px] font-semibold text-[#F5F1EA] mt-0.5">{formatDate(t.subscription_expires_at)}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-[#18181B] rounded-lg border border-white/[0.07] p-4">
          <p className="text-[20px] font-bold text-[#F5F1EA] leading-none" style={{ fontFamily: 'var(--font-jakarta)' }}>{bookings.length}</p>
          <p className="text-[12px] text-[#9C9385] mt-1.5">Total bookings</p>
        </div>
        <div className="bg-[#18181B] rounded-lg border border-white/[0.07] p-4">
          <p className="text-[20px] font-bold text-[#F5F1EA] leading-none flex items-center gap-0.5" style={{ fontFamily: 'var(--font-jakarta)' }}>
            <IndianRupee size={16} />{totalRevenue.toLocaleString('en-IN')}
          </p>
          <p className="text-[12px] text-[#9C9385] mt-1.5">Paid revenue (all-time)</p>
        </div>
        <div className="bg-[#18181B] rounded-lg border border-white/[0.07] p-4">
          <p className="text-[20px] font-bold text-[#F5F1EA] leading-none" style={{ fontFamily: 'var(--font-jakarta)' }}>{bookings.filter(b => b.status === 'upcoming').length}</p>
          <p className="text-[12px] text-[#9C9385] mt-1.5">Upcoming sessions</p>
        </div>
      </div>

      {/* Bookings / clients */}
      <div>
        <h2 className="text-[15px] font-bold text-[#F5F1EA] mb-3" style={{ fontFamily: 'var(--font-jakarta)' }}>Clients &amp; bookings</h2>
        <BookingsTable rows={bookings} />
      </div>
    </div>
  )
}
