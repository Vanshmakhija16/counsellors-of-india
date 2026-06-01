-- Add hidden_sections column to therapists table
-- Run this in Supabase SQL Editor

ALTER TABLE therapists
  ADD COLUMN IF NOT EXISTS hidden_sections text[] DEFAULT '{}';
