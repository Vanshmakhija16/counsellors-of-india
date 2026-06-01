-- ══════════════════════════════════════════════════════════════════════
-- RAZORPAY PER-THERAPIST PAYMENT INTEGRATION
-- Run in Supabase SQL Editor → Dashboard → SQL Editor
-- Architecture: Each therapist connects their OWN Razorpay account.
-- The platform NEVER holds or processes money — it goes directly to
-- each therapist's bank account through their own Razorpay account.
-- ══════════════════════════════════════════════════════════════════════

-- ── 1. Add Razorpay credential columns to therapists table ───────────
ALTER TABLE therapists
  ADD COLUMN IF NOT EXISTS razorpay_key_id               text     DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS razorpay_key_secret_encrypted text     DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS payments_enabled              boolean  NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS webhook_verified              boolean  NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS razorpay_updated_at           timestamptz DEFAULT NULL;

COMMENT ON COLUMN therapists.razorpay_key_id IS
  'Razorpay public key ID for this therapist — safe to expose to frontend';
COMMENT ON COLUMN therapists.razorpay_key_secret_encrypted IS
  'AES-256-GCM encrypted Razorpay secret key — NEVER expose to frontend';
COMMENT ON COLUMN therapists.payments_enabled IS
  'True once therapist has saved valid credentials';
COMMENT ON COLUMN therapists.webhook_verified IS
  'True once at least one verified webhook event has been received';


-- ── 2. Payments table — records every completed payment ──────────────
CREATE TABLE IF NOT EXISTS payments (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id      uuid        NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  therapist_id        uuid        NOT NULL REFERENCES therapists(id)   ON DELETE CASCADE,

  -- Razorpay identifiers
  razorpay_order_id   text        NOT NULL UNIQUE,
  razorpay_payment_id text        UNIQUE,           -- set after capture
  razorpay_signature  text,                         -- set after verification

  -- Money (stored in paise to avoid float rounding; 1 INR = 100 paise)
  amount_paise        int         NOT NULL,
  currency            text        NOT NULL DEFAULT 'INR',

  -- Lifecycle
  status              text        NOT NULL DEFAULT 'created'
    CHECK (status IN ('created', 'paid', 'failed', 'refunded')),

  -- Webhook payload snapshot (useful for debugging / audit)
  webhook_payload     jsonb       DEFAULT NULL,

  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_appointment   ON payments (appointment_id);
CREATE INDEX IF NOT EXISTS idx_payments_therapist     ON payments (therapist_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_order_id      ON payments (razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_id    ON payments (razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status        ON payments (status, created_at DESC);

DROP TRIGGER IF EXISTS payments_set_updated_at ON payments;
CREATE TRIGGER payments_set_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Row-level security: therapists can only see their own payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "therapist reads own payments"  ON payments;
CREATE POLICY "therapist reads own payments"
  ON payments FOR SELECT
  USING (auth.uid() = therapist_id);

-- Backend service-role can insert/update (used by API routes)
-- No INSERT/UPDATE policy needed — server uses service_role key (bypasses RLS)


-- ── 3. Extend appointments with payment tracking ─────────────────────
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  ADD COLUMN IF NOT EXISTS payment_id uuid REFERENCES payments(id) ON DELETE SET NULL;

-- Mark existing appointments as unpaid by default
UPDATE appointments SET payment_status = 'unpaid' WHERE payment_status IS NULL;


-- ── 4. Add service_name / service_price columns (idempotent) ─────────
--    These may already exist from a prior migration; the IF NOT EXISTS
--    guard makes this safe to run multiple times.
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS service_name  text    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS service_price numeric DEFAULT NULL;


-- ══════════════════════════════════════════════════════════════════════
-- SECURITY NOTES
-- 1. razorpay_key_secret_encrypted is encrypted with AES-256-GCM using
--    ENCRYPTION_KEY from server env vars. Never returned to client.
-- 2. razorpay_key_id IS returned to client (it's a public key).
-- 3. The payments table stores order/payment IDs for audit only.
--    Settlement goes directly into therapist's Razorpay account.
-- ══════════════════════════════════════════════════════════════════════
