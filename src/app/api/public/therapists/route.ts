import { NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[public/therapists] missing supabase env vars')
      return NextResponse.json({ therapists: [] })
    }
    const supabase = createServiceSupabaseClient()

    // Use only columns that actually exist on the therapists table.
    // Filter by is_profile_complete = true so only set-up profiles show.
    const { data, error } = await supabase
      .from('therapists')
      .select(
        'id, full_name, username, title, bio, photo_url, specialties, city, fee_per_session, years_experience, session_mode'
      )
      .eq('is_profile_complete', true)
      .order('created_at', { ascending: false })
      .limit(12)

    if (error) {
      console.error('[public/therapists] supabase error:', error)
      // If is_profile_complete column doesn't exist either, fall back to all therapists
      const { data: fallback, error: fallbackErr } = await supabase
        .from('therapists')
        .select(
          'id, full_name, username, title, bio, photo_url, specialties, city, fee_per_session, years_experience, session_mode'
        )
        .order('created_at', { ascending: false })
        .limit(12)

      if (fallbackErr) throw fallbackErr
      return NextResponse.json({ therapists: fallback ?? [] })
    }

    return NextResponse.json({ therapists: data ?? [] })
  } catch (err) {
    console.error('[GET /api/public/therapists]', err)
    return NextResponse.json({ therapists: [] })
  }
}
