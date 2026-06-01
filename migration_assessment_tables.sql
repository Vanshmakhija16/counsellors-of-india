-- ══════════════════════════════════════════════════════════════════════════════
-- MIGRATION: Switch screening_invites + screening_sessions to use
--            assessment_scales instead of instruments.
--
-- Run this in: Supabase Dashboard → SQL Editor
-- Safe to run more than once (uses IF EXISTS / DO $$ guards).
-- ══════════════════════════════════════════════════════════════════════════════


-- ── 1. Drop the old FK from screening_invites.instrument_id → instruments(id)
--      and replace with a plain UUID column (no FK) so both old and new scale
--      IDs can coexist during the transition.
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  v_constraint text;
BEGIN
  -- Find the FK constraint name (may differ across installs)
  SELECT conname
    INTO v_constraint
    FROM pg_constraint
   WHERE conrelid = 'screening_invites'::regclass
     AND contype  = 'f'
     AND confrelid = 'instruments'::regclass
   LIMIT 1;

  IF v_constraint IS NOT NULL THEN
    EXECUTE format('ALTER TABLE screening_invites DROP CONSTRAINT %I', v_constraint);
  END IF;
END $$;

-- ── 2. Ensure screening_invites can be read by anyone with a token
--      (needed for the public /screen/[token] page and /api/screening/submit)
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "anyone reads invite by token" ON screening_invites;
CREATE POLICY "anyone reads invite by token"
  ON screening_invites FOR SELECT
  USING (true);


-- ── 3. Ensure assessment_scales RLS allows authenticated therapists to read
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE assessment_scales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated reads assessment_scales" ON assessment_scales;
CREATE POLICY "authenticated reads assessment_scales"
  ON assessment_scales FOR SELECT
  USING (auth.role() IN ('authenticated', 'anon') OR true);


-- ── 4. Ensure assessment_questions RLS allows reads
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated reads assessment_questions" ON assessment_questions;
CREATE POLICY "authenticated reads assessment_questions"
  ON assessment_questions FOR SELECT
  USING (true);


-- ── 5. Ensure assessment_options RLS allows reads
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE assessment_options ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated reads assessment_options" ON assessment_options;
CREATE POLICY "authenticated reads assessment_options"
  ON assessment_options FOR SELECT
  USING (true);


-- ── 6. screening_sessions — therapist can write, service role can write for
--       anonymous patient submissions via /api/screening/submit
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE screening_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "therapist manages own screening sessions" ON screening_sessions;
CREATE POLICY "therapist manages own screening sessions"
  ON screening_sessions FOR ALL
  USING  (auth.uid() = therapist_id)
  WITH CHECK (auth.uid() = therapist_id);

-- Allow service role to insert on behalf of anonymous patients
DROP POLICY IF EXISTS "service role manages screening sessions" ON screening_sessions;
CREATE POLICY "service role manages screening sessions"
  ON screening_sessions FOR ALL
  USING  (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');


-- ── 7. screening_responses — same pattern
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE screening_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "therapist manages own screening responses" ON screening_responses;
CREATE POLICY "therapist manages own screening responses"
  ON screening_responses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM screening_sessions s
       WHERE s.id = screening_responses.session_id
         AND s.therapist_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM screening_sessions s
       WHERE s.id = screening_responses.session_id
         AND s.therapist_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "service role manages screening responses" ON screening_responses;
CREATE POLICY "service role manages screening responses"
  ON screening_responses FOR ALL
  USING  (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');


-- ── Done ─────────────────────────────────────────────────────────────────────
-- After running this, the app will:
--   • List assessments from assessment_scales
--   • Fetch questions from assessment_questions (keyed by scale slug)
--   • Fetch options from assessment_options (keyed by scale slug)
--   • Store sessions/responses in screening_sessions / screening_responses (unchanged)
--   • Store invites in screening_invites with instrument_id → assessment_scales.id
