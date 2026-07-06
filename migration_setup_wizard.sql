-- Migration: setup wizard completion flag
-- Run in Supabase SQL editor

ALTER TABLE therapists
  ADD COLUMN IF NOT EXISTS setup_complete BOOLEAN DEFAULT FALSE;

-- Existing therapists who already have a published template are considered done
UPDATE therapists
  SET setup_complete = TRUE
  WHERE template_id IS NOT NULL
    AND is_profile_complete = TRUE;
