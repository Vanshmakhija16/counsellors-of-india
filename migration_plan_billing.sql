-- ══════════════════════════════════════════════════════════════════════
-- PLAN BILLING COLUMNS
-- Run in Supabase SQL Editor — safe to re-run (all idempotent)
-- ══════════════════════════════════════════════════════════════════════

ALTER TABLE therapists
  ADD COLUMN IF NOT EXISTS plan               text        NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS razorpay_payment_id text        DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS plan_activated_at  timestamptz DEFAULT NULL;

-- plan must be one of the three known values
ALTER TABLE therapists
  DROP CONSTRAINT IF EXISTS therapists_plan_check;
ALTER TABLE therapists
  ADD CONSTRAINT therapists_plan_check
  CHECK (plan IN ('free', 'growth', 'pro'));

-- Index for quick plan lookups
CREATE INDEX IF NOT EXISTS idx_therapists_plan ON therapists (plan);
