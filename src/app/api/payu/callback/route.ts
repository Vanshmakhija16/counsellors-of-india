/**
 * POST /api/payu/callback  (PayU `surl` + `furl`)
 *
 * PayU redirects the user's browser here with an x-www-form-urlencoded POST
 * after payment. We:
 *   1. Recompute the SHA-512 reverse hash and reject any mismatch (tamper guard).
 *   2. On a verified `success`, upgrade the therapist's plan — idempotently, so
 *      a duplicate/replayed callback never double-applies.
 *   3. Redirect the browser to a success or failure page.
 *
 * No session cookie is relied upon here (PayU posts cross-site); the therapist
 * id + plan travel in udf1/udf2 and are protected by the verified hash.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase-server'
import { verifyResponseHash } from '@/lib/payu'

const PLAN_RANK: Record<string, number> = { free: 0, starter: 1, pro: 2 }

function redirect(req: NextRequest, path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin
  return NextResponse.redirect(`${baseUrl}${path}`, { status: 303 })
}

export async function POST(req: NextRequest) {
  let txnid = ''
  try {
    const form = await req.formData()
    const get = (k: string) => (form.get(k)?.toString() ?? '')

    if (process.env.PAYU_DEBUG === '1') {
      const all: Record<string, string> = {}
      for (const [k, v] of form.entries()) all[k] = v.toString()
      console.log('[payu/callback] received fields:', all)
    }

    const status = get('status')
    txnid = get('txnid')
    const amount = get('amount')
    const productinfo = get('productinfo')
    const firstname = get('firstname')
    const email = get('email')
    const udf1 = get('udf1') // therapist_id
    const udf2 = get('udf2') // plan
    const hash = get('hash')
    const mihpayid = get('mihpayid') // PayU's payment id
    const additionalCharges = get('additionalCharges') || undefined

    // 1) Verify the hash before trusting ANY field.
    const ok = verifyResponseHash({
      status, txnid, amount, productinfo, firstname, email,
      udf1, udf2, hash, additionalCharges,
    })
    if (!ok) {
      console.error('[payu/callback] hash mismatch for txnid:', txnid, {
        received: hash,
        fields: { status, amount, productinfo, firstname, email, udf1, udf2 },
      })
      return redirect(req, `/payment/failure?reason=invalid_signature&txnid=${encodeURIComponent(txnid)}`)
    }

    // 2) Only a verified success counts.
    if (status !== 'success') {
      return redirect(req, `/payment/failure?reason=${encodeURIComponent(status || 'failed')}&txnid=${encodeURIComponent(txnid)}`)
    }

    const therapistId = udf1
    const plan = udf2
    if (!therapistId || !(plan in PLAN_RANK)) {
      return redirect(req, `/payment/failure?reason=bad_plan&txnid=${encodeURIComponent(txnid)}`)
    }

    const db = createServiceSupabaseClient()

    // 3) Idempotency / duplicate guard: if this exact payment was already
    //    applied, don't re-apply — just send the user to success.
    const { data: existing } = await db
      .from('therapists')
      .select('plan, highest_plan')
      .eq('id', therapistId)
      .single()

    if (existing?.plan === mihpayid) {
      return redirect(req, `/payment/success?plan=${encodeURIComponent(plan)}&txnid=${encodeURIComponent(txnid)}`)
    }

    // highest_plan is a ratchet — never lower it.
    const existingHighest = (existing?.highest_plan as string) ?? 'free'
    const newHighest =
      PLAN_RANK[plan] > (PLAN_RANK[existingHighest] ?? 0) ? plan : existingHighest

    // 4) Apply upgrade (with graceful fallbacks if optional columns are absent).
    let updErr: { code?: string; message?: string } | null = null
    const upd = await db
      .from('therapists')
      .update({
        plan,
        highest_plan: newHighest,
        plan_payment_id: mihpayid,
        plan_activated_at: new Date().toISOString(),
      })
      .eq('id', therapistId)
    updErr = upd.error

    if (updErr?.code === '42703' || updErr?.code === 'PGRST204') {
      const f = await db
        .from('therapists')
        .update({ plan, highest_plan: newHighest })
        .eq('id', therapistId)
      updErr = f.error
    }
    if (updErr?.code === '42703' || updErr?.code === 'PGRST204') {
      const f = await db.from('therapists').update({ plan }).eq('id', therapistId)
      updErr = f.error
    }

    if (updErr) {
      console.error('[payu/callback] DB update failed:', updErr)
      return redirect(req, `/payment/failure?reason=db_error&txnid=${encodeURIComponent(txnid)}`)
    }

    return redirect(req, `/payment/success?plan=${encodeURIComponent(plan)}&txnid=${encodeURIComponent(txnid)}`)
  } catch (err: unknown) {
    console.error('[payu/callback]', err)
    return redirect(req, `/payment/failure?reason=server_error&txnid=${encodeURIComponent(txnid)}`)
  }
}

// PayU posts form-data; a stray GET shouldn't 405 the user into a dead end.
export async function GET(req: NextRequest) {
  return redirect(req, '/payment/failure?reason=direct_access')
}
