import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// This route is called by unauthenticated patients completing a screening invite.
// It calls the SECURITY DEFINER RPC so no therapist session is needed.
export async function POST(req: NextRequest) {
  try {
    const { token, responses, notes } = await req.json()
    if (!token || !Array.isArray(responses)) {
      return NextResponse.json({ error: 'token and responses required' }, { status: 400 })
    }

    // Use the anon key / no-session client — the RPC enforces its own access control
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => [],
          setAll: () => {},
        },
      }
    )

    const { data, error } = await supabase.rpc('submit_screening_by_token', {
      p_token: token,
      p_responses: responses, // jsonb — pass the array as-is, supabase-js encodes it
      p_notes: notes ?? null,
    })

    if (error) {
      console.error('[submit_screening_by_token]', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, session_id: data })
  } catch (e: unknown) {
    console.error('[POST /api/screening/submit]', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Internal error' },
      { status: 500 }
    )
  }
}
