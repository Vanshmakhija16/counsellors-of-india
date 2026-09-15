import Link from 'next/link'
import { Users, IndianRupee, CalendarCheck, ShieldAlert, ArrowUpRight } from 'lucide-react'
import { requireAdmin } from '@/lib/admin'
import { createServiceSupabaseClient } from '@/lib/supabase-server'

export default async function AdminOverviewPage() {
  await requireAdmin()
  const db = createServiceSupabaseClient()

  const [{ data: therapists }, { count: totalBookings }, { count: bookingsThisMonth }] = await Promise.all([
    db.from('therapists').select('id, plan, is_active, razorpay_oauth_health, payments_enabled, created_at'),
    db.from('appointments').select('id', { count: 'exact', head: true }),
    db.from('appointments').select('id', { count: 'exact', head: true })
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
  ])

  const list = therapists ?? []
  const total = list.length
  const byPlan: Record<string, number> = {}
  let active = 0
  let brokenPayments = 0
  let noPlan = 0
  for (const t of list) {
    // 'free', null, and the literal string 'none'/'None' all count as
    // "no real plan" -- matches the same rule used in TherapistsTable.tsx
    // and the therapist detail page.
    const normalizedPlan = t.plan ? t.plan.trim().toLowerCase() : ''
    if (normalizedPlan && normalizedPlan !== 'free' && normalizedPlan !== 'none') {
      byPlan[t.plan!] = (byPlan[t.plan!] ?? 0) + 1
    } else {
      noPlan++
    }
    if (t.is_active) active++
    if (t.razorpay_oauth_health === 'broken') brokenPayments++
  }

  const cards = [
    { label: 'Total Therapists', value: total, icon: Users, sub: `${active} active` },
    { label: 'Total Bookings', value: totalBookings ?? 0, icon: CalendarCheck, sub: `${bookingsThisMonth ?? 0} this month` },
    { label: 'Pro Plan', value: byPlan.pro ?? 0, icon: IndianRupee, sub: `${byPlan.starter ?? 0} on Starter` },
    { label: 'No Plan Set', value: noPlan, icon: ShieldAlert, sub: noPlan > 0 ? 'Needs review' : 'All accounted for', alert: noPlan > 0 },
    { label: 'Broken Payment Connections', value: brokenPayments, icon: ShieldAlert, sub: brokenPayments > 0 ? 'Needs attention' : 'All healthy', alert: brokenPayments > 0 },
  ]

  return (
    <div className="px-5 md:px-8 py-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-[20px] font-bold text-[#F5F1EA]" style={{ fontFamily: 'var(--font-jakarta)' }}>Overview</h1>
        <p className="text-[13px] text-[#9C9385] mt-0.5">Platform-wide snapshot across all therapists.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-[#18181B] rounded-lg border border-white/[0.07] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className={`w-8 h-8 rounded-md flex items-center justify-center ${c.alert ? 'bg-red-500/10 text-red-400' : 'bg-white/[0.06] text-[#C9C3B5]'}`}>
                <c.icon size={15} />
              </span>
            </div>
            <p className="text-[22px] font-bold text-[#F5F1EA] leading-none" style={{ fontFamily: 'var(--font-jakarta)' }}>{c.value}</p>
            <p className="text-[12px] text-[#9C9385] mt-1.5">{c.label}</p>
            <p className={`text-[11px] mt-1 font-medium ${c.alert ? 'text-red-400' : 'text-[#7A7568]'}`}>{c.sub}</p>
          </div>
        ))}
      </div>

      <Link
        href="/admin/therapists"
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#F5F1EA] hover:text-[#FF9933] hover:gap-2.5 transition-all"
      >
        View all therapists <ArrowUpRight size={14} />
      </Link>
    </div>
  )
}
