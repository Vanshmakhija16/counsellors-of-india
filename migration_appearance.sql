-- Run this in Supabase SQL Editor → Dashboard → SQL Editor
-- Adds all columns needed by the Appearance page

ALTER TABLE therapists
  ADD COLUMN IF NOT EXISTS template_id      text    DEFAULT 'classic',
  ADD COLUMN IF NOT EXISTS color_id         text    DEFAULT 'teal',
  ADD COLUMN IF NOT EXISTS hidden_sections  text[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS profile_content  jsonb   DEFAULT '{}';
