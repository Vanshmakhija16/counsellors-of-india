/**
 * POST /api/payu/initiate
 *
 * Initialises a PayU hosted-checkout payment for a PLATFORM SUBSCRIPTION
 * (free → starter / pro). Returns the action URL + the exact form fields the
 * browser must POST to PayU. The SHA-512 request hash is computed here, on the
 * server — the SALT never reaches the client.
 *
 * Body: { plan: 'starter' | 'pro' }
 * Returns: { action, fields } where `fields` is posted as a form to `action`.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import {
  PAYU_KEY,
  PAYU_BASE_URL,
  assertPayuConfigured,
  buildRequestHash,
  generateTxnId,
  formatAmount,
} from '@/lib/payu'

// Server-authoritative pricing — never trust an amount sent from the client.
const PLAN_PRICE: Record<string, number> = { starter: 1499, pro: 2499 }

export async function POST(req: NextRequest) {
  try {
    assertPayuConfigured()

    const { plan } = (await req.json()) as { plan?: string }
    if (!plan || !(plan in PLAN_PRICE)) {
      return NextResponse.json({ error: 'Invalid or missing plan.' }, { status: 400 })
    }

    // Authenticated user (the therapist upgrading their plan)
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const amount = formatAmount(PLAN_PRICE[plan])
    const txnid = generateTxnId('plan')
    const productinfo = `COI ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`
    const firstname = (user.user_metadata?.full_name as string)?.split(' ')[0] || 'Member'
    const email = user.email ?? ''

    // udf1 = therapist_id, udf2 = plan — read back (and hash-verified) on callback,
    // so we can apply the upgrade without relying on a session cookie there.
    const udf1 = user.id
    const udf2 = plan

    // PayU must POST the callback to the CANONICAL host directly. If it posts to
    // a host that 301-redirects (e.g. non-www → www), the redirect turns the
    // POST into a GET and the callback 405s. Force the canonical www host.
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin
    baseUrl = baseUrl.replace(/\/+$/, '')                       // no trailing slash
    baseUrl = baseUrl.replace(
      /^https?:\/\/counsellorsofindia\.com/i,
      'https://www.counsellorsofindia.com',
    )                                                            // non-www → canonical www
    const surl = `${baseUrl}/api/payu/callback`
    const furl = `${baseUrl}/api/payu/callback`

    const hash = buildRequestHash({
      txnid, amount, productinfo, firstname, email, udf1, udf2,
    })

    const fields: Record<string, string> = {
      key: PAYU_KEY,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      phone: (user.user_metadata?.phone as string) ?? '',
      udf1,
      udf2,
      surl,
      furl,
      hash,
    }

    return NextResponse.json({ action: PAYU_BASE_URL, fields })
  } catch (err: unknown) {
    console.error('[payu/initiate]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    )
  }
}
