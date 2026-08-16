/**
 * API Route: POST /api/razorpay/oauth/disconnect
 *
 * Self-service disconnect -- lets a therapist clear a broken/stale OAuth
 * connection from the dashboard themselves, instead of needing someone to
 * manually clear their razorpay_oauth_* columns in Supabase. After this,
 * "Connect with Razorpay" reappears and starts a completely fresh flow.
 */

import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { disconnectOAuthForTherapist } from '@/lib/razorpay-oauth'

async function getUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  )
  const { data: { user }, error } = await supabase.auth.getUser()
  return error ? null : user
}

export async function POST() {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await disconnectOAuthForTherapist(user.id)

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error('[razorpay/oauth/disconnect]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to disconnect.' },
      { status: 500 }
    )
  }
}
