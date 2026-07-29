-- Adds Stripe Connect fields so therapists can receive booking payments
-- directly into their own account, and PayPal order tracking for platform
-- subscription payments. Run this against the US Supabase project (and any
-- other Stripe-Connect tenant) — NOT required for India, which stays on
-- Razorpay/PayU.

ALTER TABLE therapists ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;
ALTER TABLE therapists ADD COLUMN IF NOT EXISTS stripe_onboarded BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE therapists ADD COLUMN IF NOT EXISTS stripe_charges_enabled BOOLEAN NOT NULL DEFAULT FALSE;

-- Optional but recommended: track which gateway + which external order/
-- payment id was used per plan-upgrade, so support/refunds are traceable
-- across Razorpay (India) and PayPal (US and beyond).
ALTER TABLE therapists ADD COLUMN IF NOT EXISTS last_plan_payment_gateway TEXT;
ALTER TABLE therapists ADD COLUMN IF NOT EXISTS last_plan_payment_ref TEXT;

-- Stripe Connect payment tracking, added DIRECTLY to appointments —
-- matching the existing pattern already used for PayU (txnid, payu_id)
-- rather than introducing a new `payments` table that doesn't exist
-- anywhere in the current schema.
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;
