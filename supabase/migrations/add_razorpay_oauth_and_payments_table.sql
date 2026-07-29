-- ══════════════════════════════════════════════════════════════════════
-- RAZORPAY PARTNER OAUTH (India tenant only)
-- Adds OAuth token storage for the "therapist connects their own Razorpay
-- account via OAuth" flow, alongside the EXISTING manual key-entry columns
-- (razorpay_key_id / razorpay_key_secret_encrypted / payments_enabled),
-- which stay untouched — OAuth is an additional connection method, not a
-- replacement.
--
-- Run this against the INDIA Supabase project only.
-- ══════════════════════════════════════════════════════════════════════

-- ── 1. OAuth token columns on therapists ──────────────────────────────
ALTER TABLE therapists
  ADD COLUMN IF NOT EXISTS razorpay_oauth_merchant_id        text UNIQUE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS razorpay_oauth_access_token_enc   text        DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS razorpay_oauth_refresh_token_enc  text        DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS razorpay_oauth_access_expires_at  timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS razorpay_oauth_refresh_expires_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS razorpay_oauth_scope              text        DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS razorpay_oauth_connected_at       timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS razorpay_oauth_state              text        DEFAULT NULL; -- CSRF nonce, single-use, cleared after callback

COMMENT ON COLUMN therapists.razorpay_oauth_merchant_id IS
  'Razorpay linked-account/merchant id, one per therapist (UNIQUE) — obtained via OAuth, distinct from the manual razorpay_key_id flow';
COMMENT ON COLUMN therapists.razorpay_oauth_access_token_enc IS
  'AES-256-GCM encrypted OAuth access token — NEVER expose to frontend';
COMMENT ON COLUMN therapists.razorpay_oauth_refresh_token_enc IS
  'AES-256-GCM encrypted OAuth refresh token (180-day expiry per Razorpay) — NEVER expose to frontend';
COMMENT ON COLUMN therapists.razorpay_oauth_state IS
  'One-time CSRF state value generated at /oauth/connect, verified and cleared at /oauth/callback';

-- ── 2. The `payments` table — referenced by existing webhook/therapist-  ──
--    order code but (per our earlier discovery) never actually created
--    live. Creating it now, exactly as originally specified in
--    migration_razorpay_per_therapist.sql, so that existing code paths
--    that already assume it start actually working.
CREATE TABLE IF NOT EXISTS payments (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id      uuid        NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  therapist_id        uuid        NOT NULL REFERENCES therapists(id)   ON DELETE CASCADE,

  razorpay_order_id   text        UNIQUE,
  razorpay_payment_id text        UNIQUE,
  razorpay_signature  text,

  amount_paise        int         NOT NULL,
  currency            text        NOT NULL DEFAULT 'INR',

  status              text        NOT NULL DEFAULT 'created'
    CHECK (status IN ('created', 'paid', 'failed', 'refunded')),

  webhook_payload     jsonb       DEFAULT NULL,

  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_appointment ON payments (appointment_id);
CREATE INDEX IF NOT EXISTS idx_payments_therapist   ON payments (therapist_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_status      ON payments (status, created_at DESC);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "therapist reads own payments" ON payments;
CREATE POLICY "therapist reads own payments"
  ON payments FOR SELECT
  USING (auth.uid() = therapist_id);

-- ── 3. payment_status / payment_id on appointments (idempotent) ──────
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  ADD COLUMN IF NOT EXISTS payment_id uuid REFERENCES payments(id) ON DELETE SET NULL;

UPDATE appointments SET payment_status = 'unpaid' WHERE payment_status IS NULL;
