-- ══════════════════════════════════════════════════════════════════════════════
-- MIGRATION: Fix screening_sessions and screening_invites to work with
--            assessment_scales (text id) instead of instruments (uuid).
--
-- Run in: Supabase Dashboard → SQL Editor
-- ══════════════════════════════════════════════════════════════════════════════

-- ── 1. screening_sessions.instrument_id: uuid → text ────────────────────────

-- Drop the FK constraint to instruments(id)
ALTER TABLE screening_sessions
  DROP CONSTRAINT IF EXISTS screening_sessions_instrument_id_fkey;

-- Change the column type from uuid to text
ALTER TABLE screening_sessions
  ALTER COLUMN instrument_id TYPE text USING instrument_id::text;


-- ── 2. screening_invites.instrument_id: uuid → text ─────────────────────────

-- Drop the FK constraint to instruments(id)
ALTER TABLE screening_invites
  DROP CONSTRAINT IF EXISTS screening_invites_instrument_id_fkey;

-- Change the column type from uuid to text
ALTER TABLE screening_invites
  ALTER COLUMN instrument_id TYPE text USING instrument_id::text;


-- ── 3. screening_responses.item_id: keep as uuid (assessment_questions.id is uuid) ─
-- No change needed here — assessment_questions.id is already uuid.


-- ── Done ─────────────────────────────────────────────────────────────────────
-- After running this:
--   • screening_sessions.instrument_id stores assessment_scales.id (e.g. 'dast-10')
--   • screening_invites.instrument_id  stores assessment_scales.id (e.g. 'dast-10')
--   • screening_responses.item_id      stores assessment_questions.id (uuid, unchanged)
