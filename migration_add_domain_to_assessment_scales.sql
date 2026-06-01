-- ══════════════════════════════════════════════════════════════════════════════
-- MIGRATION: Add `domain` column to assessment_scales
-- Run in: Supabase Dashboard → SQL Editor
-- ══════════════════════════════════════════════════════════════════════════════

-- assessment_scales.id is the text slug (e.g. 'phq-9'), so we can use it directly.
ALTER TABLE assessment_scales
  ADD COLUMN IF NOT EXISTS domain text NOT NULL DEFAULT 'general';

UPDATE assessment_scales SET domain = 'depression' WHERE id ILIKE '%phq%';
UPDATE assessment_scales SET domain = 'anxiety'    WHERE id ILIKE '%gad%';
UPDATE assessment_scales SET domain = 'trauma'     WHERE id ILIKE '%pcl%';
UPDATE assessment_scales SET domain = 'substance'  WHERE id ILIKE '%audit%';
