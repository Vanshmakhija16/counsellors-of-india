import { NextResponse } from 'next/server'
import { createServiceSupabaseClientForTenant } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

// Tenant-aware: resolves the current request's tenant (via middleware.ts's
// x-tenant header) and queries THAT tenant's own Supabase project, so the
// India homepage keeps showing India therapists and the America homepage
// shows America therapists, from separate databases.
export async function GET() {
  try {
    const supabase = await createServiceSupabaseClientForTenant()

    // Use only columns that actually exist on the therapists table.
    // Filter by is_profile_complete = true so only set-up profiles show.
    const { data, error } = await supabase
      .from('therapists')
      .select(
        'id, full_name, username, title, bio, photo_url, specialties, city, fee_per_session, years_experience, session_mode, plan'
      )
      .eq('is_profile_complete', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[public/therapists] supabase error:', error)
      // If is_profile_complete column doesn't exist either, fall back to all therapists
      const { data: fallback, error: fallbackErr } = await supabase
        .from('therapists')
        .select(
          'id, full_name, username, title, bio, photo_url, specialties, city, fee_per_session, years_experience, session_mode, plan'
        )
        .order('created_at', { ascending: false })

      if (fallbackErr) throw fallbackErr
      return NextResponse.json({ therapists: fallback ?? [] })
    }

    return NextResponse.json({ therapists: data ?? [] })
  } catch (err) {
    console.error('[GET /api/public/therapists]', err)
    return NextResponse.json({ therapists: [] })
  }
}
