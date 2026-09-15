/**
 * API Route: DELETE /api/admin/therapists/[id]
 *
 * Permanently deletes a therapist row and everything tied to it --
 * appointments, clients, patients, session notes, etc. Admin-only
 * (see lib/admin.ts).
 *
 * Relies on ON DELETE CASCADE, which schema.sql already sets on every
 * table with a therapist_id foreign key -- deleting the therapist row
 * is enough; Postgres cleans up the rest. (There is no separate
 * "payments" table in this schema to worry about.)
 *
 * No "double confirm" logic lives here -- that's a UI concern (see
 * TherapistsTable.tsx's two-step delete modal). This route does exactly
 * what it's asked the moment it's called; the double-confirmation is what
 * makes it hard to call by accident in the first place.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin'
import { createServiceSupabaseClient } from '@/lib/supabase-server'

interface Params {
  params: Promise<{ id: string }>
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  if (!id) return NextResponse.json({ error: 'Missing therapist id.' }, { status: 400 })

  const db = createServiceSupabaseClient()

  const { data: therapist, error: findErr } = await db
    .from('therapists')
    .select('id, full_name, photo_url')
    .eq('id', id)
    .maybeSingle()

  if (findErr) {
    console.error('[admin/therapists/delete] Lookup failed:', findErr)
    return NextResponse.json({ error: 'Failed to look up therapist.' }, { status: 500 })
  }
  if (!therapist) return NextResponse.json({ error: 'Therapist not found.' }, { status: 404 })

  try {
    // Every table with a therapist_id column (appointments, clients,
    // feedbacks, patients, patient_diagnoses, patient_intakes,
    // patient_resources, screening_invites, screening_sessions,
    // session_notes, slots) has ON DELETE CASCADE configured in schema.sql
    // -- deleting the therapist row alone cleans up everything. There is
    // no separate "payments" table in this schema; payment/OAuth status
    // lives as columns directly on the therapists row itself.
    const { error: therapistErr } = await db.from('therapists').delete().eq('id', id)
    if (therapistErr) throw new Error(`therapists: ${therapistErr.message}`)

    console.log(`[admin/therapists/delete] Admin ${admin.email} permanently deleted therapist ${id} (${therapist.full_name})`)

    return NextResponse.json({ success: true, deleted_id: id })
  } catch (err: unknown) {
    console.error('[admin/therapists/delete] Deletion failed partway through:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Deletion failed partway through -- some related data may already be gone. Check the therapist manually.' },
      { status: 500 }
    )
  }
}
