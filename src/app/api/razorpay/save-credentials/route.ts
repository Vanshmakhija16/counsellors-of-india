/**
 * API Route: /api/razorpay/save-credentials
 *
 * Saves a therapist's own Razorpay credentials (encrypted) to the DB.
 * Auth is verified via cookie session. DB writes use service-role client.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServiceSupabaseClient } from '@/lib/supabase-server'
import { encrypt } from '@/lib/encryption'

// ── Helper: get the authenticated user from cookie session ────────────
async function getUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll:  () => cookieStore.getAll(),
        setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  )
  const { data: { user }, error } = await supabase.auth.getUser()
  return error ? null : user
}

// ── POST — save credentials ────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { key_id, key_secret } = body as { key_id?: string; key_secret?: string }

    if (!key_id?.trim() || !key_secret?.trim()) {
      return NextResponse.json(
        { error: 'Both Razorpay Key ID and Key Secret are required.' },
        { status: 400 }
      )
    }

    const trimmedId     = key_id.trim()
    const trimmedSecret = key_secret.trim()

    if (!trimmedId.startsWith('rzp_')) {
      return NextResponse.json(
        { error: 'Key ID must start with rzp_ (e.g. rzp_live_... or rzp_test_...)' },
        { status: 400 }
      )
    }

    // Validate against Razorpay API
    let credentialsValid = true
    try {
      const auth = 'Basic ' + Buffer.from(`${trimmedId}:${trimmedSecret}`).toString('base64')
      const res  = await fetch('https://api.razorpay.com/v1/payments?count=1', {
        headers: { Authorization: auth },
      })
      if (res.status === 401 || res.status === 403) {
        return NextResponse.json(
          { error: 'Invalid Razorpay credentials. Please check your Key ID and Secret.' },
          { status: 400 }
        )
      }
    } catch {
      // Network failure — allow saving
    }

    const encryptedSecret = encrypt(trimmedSecret)

    // Use service-role client (synchronous, no cookies needed)
    const db = createServiceSupabaseClient()
    const { error: dbErr } = await db
      .from('therapists')
      .update({
        razorpay_key_id:               trimmedId,
        razorpay_key_secret_encrypted: encryptedSecret,
        payments_enabled:              credentialsValid,
        razorpay_updated_at:           new Date().toISOString(),
      })
      .eq('id', user.id)

    if (dbErr) throw dbErr

    return NextResponse.json({
      success:          true,
      payments_enabled: credentialsValid,
      key_id:           trimmedId,
      is_test_mode:     trimmedId.includes('test'),
    })
  } catch (err: unknown) {
    console.error('[save-credentials POST]', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 })
  }
}

// ── GET — return connection status (no secrets) ───────────────────────
export async function GET() {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = createServiceSupabaseClient()
    const { data, error } = await db
      .from('therapists')
      .select('razorpay_key_id, payments_enabled, webhook_verified, razorpay_updated_at')
      .eq('id', user.id)
      .single()

    if (error) throw error

    return NextResponse.json({
      key_id:           data.razorpay_key_id    ?? null,
      payments_enabled: data.payments_enabled   ?? false,
      webhook_verified: data.webhook_verified   ?? false,
      updated_at:       data.razorpay_updated_at ?? null,
      is_test_mode:     data.razorpay_key_id?.includes('test') ?? null,
    })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 })
  }
}

// ── DELETE — remove credentials ───────────────────────────────────────
export async function DELETE() {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = createServiceSupabaseClient()
    const { error } = await db
      .from('therapists')
      .update({
        razorpay_key_id:               null,
        razorpay_key_secret_encrypted: null,
        payments_enabled:              false,
        webhook_verified:              false,
        razorpay_updated_at:           new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 })
  }
}
