import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'

/**
 * POST /api/auth/check-email
 * Body: { email: string }
 *
 * Returns { exists: boolean }
 *
 * Uses the service-role key (server-only) to query auth.users via
 * the admin API — the only reliable way to check if an email is registered
 * without exposing anything sensitive to the client.
 */
export async function POST(request: NextRequest) {
  const limited = rateLimit(request, { keyPrefix: 'check-email', limit: 10, windowMs: 10 * 60 * 1000 })
  if (limited) return limited

  const { email } = await request.json()

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const normalizedEmail = email.trim().toLowerCase()
  const perPage = 100
  let page = 1
  let exists = false

  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage })

    if (error) {
      console.error('[check-email] admin.listUsers error:', error.message)
      return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }

    exists = data.users.some((u) => u.email?.toLowerCase() === normalizedEmail)
    if (exists || data.users.length < perPage) break
    page += 1
  }

  return NextResponse.json({ exists })
}
