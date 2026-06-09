import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/razorpay/upgrade-plan
//
// Called after payment is verified on the client for any paid plan upgrade.
// Body: { razorpay_payment_id: string, plan?: string }
//
// KEY FIX: also writes `highest_plan` so the pricing page can detect
// "already paid" and skip Razorpay when the user re-selects the same plan.
// ─────────────────────────────────────────────────────────────────────────────

const PLAN_RANK: Record<string, number> = { free: 0, growth: 1, pro: 2 }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { razorpay_payment_id, plan } = body

    if (!razorpay_payment_id) {
      return NextResponse.json({ error: 'Missing payment ID' }, { status: 400 })
    }

    const targetPlan = plan ?? 'growth'   // default to growth for old callers

    const supabase = await createServerSupabaseClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Read existing highest_plan so we never downgrade it
    const { data: existing } = await supabase
      .from('therapists')
      .select('highest_plan')
      .eq('id', user.id)
      .single()

    const existingHighest = (existing as { highest_plan?: string } | null)?.highest_plan ?? 'free'
    const newHighest =
      PLAN_RANK[targetPlan] > PLAN_RANK[existingHighest] ? targetPlan : existingHighest

    const { error } = await supabase
      .from('therapists')
      .update({
        plan:               targetPlan,
        highest_plan:       newHighest,        // ← persisted so re-selection is free
        razorpay_payment_id: razorpay_payment_id,
        plan_activated_at:  new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) {
      // Graceful fallback if optional columns don't exist yet
      if (error.message?.includes('column') || error.code === '42703') {
        const { error: fallbackError } = await supabase
          .from('therapists')
          .update({ plan: targetPlan, highest_plan: newHighest })
          .eq('id', user.id)

        if (fallbackError) {
          // Last resort: only update plan
          const { error: minError } = await supabase
            .from('therapists')
            .update({ plan: targetPlan })
            .eq('id', user.id)
          if (minError) throw minError
        }
      } else {
        throw error
      }
    }

    return NextResponse.json({ success: true, plan: targetPlan, highest_plan: newHighest })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[razorpay/upgrade-plan]', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
