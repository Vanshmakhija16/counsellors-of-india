-- ══════════════════════════════════════════════════════════════════════════════
-- MIGRATION: Add profile_content JSONB to therapists
-- Stores all per-template editable section content
-- Run in: Supabase Dashboard → SQL Editor
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE therapists
  ADD COLUMN IF NOT EXISTS profile_content jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Example shape stored for classic4:
-- {
--   "classic4": {
--     "hero": {
--       "quote": "The curious paradox is that when I accept myself...",
--       "quote_author": "Carl R. Rogers"
--     },
--     "ticker": {
--       "items": ["Licensed Practitioner", "Confidential Sessions", ...]
--     },
--     "services": [
--       { "name": "Individual Psychotherapy", "desc": "..." },
--       ...
--     ],
--     "faq": [
--       { "q": "How is the first session structured?", "a": "..." },
--       ...
--     ],
--     "insights": {
--       "trust_bar": [
--         { "label": "Approach", "value": "Integrative · Psychodynamic" },
--         ...
--       ]
--     }
--   }
-- }
