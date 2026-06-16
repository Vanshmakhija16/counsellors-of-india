-- Add section_order column to therapists table
-- Stores the custom display order of profile sections (e.g. ['hero','services','about',...])
-- Run this in Supabase SQL Editor

ALTER TABLE therapists
  ADD COLUMN IF NOT EXISTS section_order text[] DEFAULT '{}';
