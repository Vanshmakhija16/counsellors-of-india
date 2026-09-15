import { requireAdmin } from '@/lib/admin'
import { createServiceSupabaseClient } from '@/lib/supabase-server'
import TherapistsTable, { type TherapistRow } from '@/components/admin/TherapistsTable'

export default async function AdminTherapistsPage() {
  await requireAdmin()
  const db = createServiceSupabaseClient()

  const [{ data: therapists }, { data: appointments }] = await Promise.all([
    db.from('therapists')
      .select('id, full_name, email, phone, whatsapp, photo_url, city, plan, subscription_status, payments_enabled, is_active, created_at, template_id, razorpay_oauth_health')
      .order('created_at', { ascending: false }),
    db.from('appointments').select('therapist_id'),
  ])

  const bookingCounts = new Map<string, number>()
  for (const a of appointments ?? []) {
    bookingCounts.set(a.therapist_id, (bookingCounts.get(a.therapist_id) ?? 0) + 1)
  }

  const rows: TherapistRow[] = (therapists ?? []).map((t) => ({
    id:               t.id,
    name:             t.full_name || 'Unnamed',
    email:            t.email,
    phone:            t.whatsapp || t.phone || null,
    photo_url:        t.photo_url,
    city:             t.city,
    plan:             t.plan ?? null, // keep raw value -- do NOT coerce null to 'starter' here, or
                                     // therapists with no plan set become indistinguishable from
                                     // real Starter-plan therapists. TherapistsTable handles display.
    subscription_status: t.subscription_status,
    payments_enabled: !!t.payments_enabled,
    payments_health:  t.razorpay_oauth_health ?? 'unknown',
    is_active:        !!t.is_active,
    created_at:       t.created_at,
    booking_count:    bookingCounts.get(t.id) ?? 0,
  }))

  return <TherapistsTable rows={rows} />
}
