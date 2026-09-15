-- ══════════════════════════════════════════════════════════════════════
-- PAYPAL MULTIPARTY ("Connect with PayPal") — PER THERAPIST
-- Run in Supabase SQL Editor → Dashboard → SQL Editor
--
-- This is PayPal's equivalent of the razorpay_oauth_* columns
-- (migration_razorpay_oauth.sql): lets a US therapist connect their OWN
-- PayPal account via PayPal's Partner Referrals flow, so session-booking
-- payments land directly in the therapist's PayPal balance (with an
-- optional platform cut), instead of everything going through Stripe
-- Connect or the platform's own PayPal account.
-- ══════════════════════════════════════════════════════════════════════

ALTER TABLE therapists
  ADD COLUMN IF NOT EXISTS paypal_merchant_id         text        DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS paypal_tracking_id         text        DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS paypal_onboarding_status   text        DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS paypal_payments_receivable boolean     DEFAULT false,
  ADD COLUMN IF NOT EXISTS paypal_email_confirmed     boolean     DEFAULT false,
  ADD COLUMN IF NOT EXISTS paypal_connected_at        timestamptz DEFAULT NULL;

COMMENT ON COLUMN therapists.paypal_merchant_id IS
  'PayPal merchant/payer id for this therapist''s connected account -- used as payee.merchant_id on multiparty orders. Safe to expose to frontend.';
COMMENT ON COLUMN therapists.paypal_tracking_id IS
  'Our own random id sent as tracking_id when starting the Partner Referral -- used to look up onboarding status via /v1/customer/partners/{partner_id}/merchant-integrations?tracking_id=...';
COMMENT ON COLUMN therapists.paypal_onboarding_status IS
  'One of: started | pending | completed -- mirrors PayPal''s merchant-integrations status check';
COMMENT ON COLUMN therapists.paypal_payments_receivable IS
  'True once PayPal confirms this merchant can actually receive payments (bank/card verified etc). Multiparty orders should not be created until this is true.';
COMMENT ON COLUMN therapists.paypal_email_confirmed IS
  'True once the therapist has confirmed their PayPal account email.';
COMMENT ON COLUMN therapists.paypal_connected_at IS
  'When the therapist most recently completed PayPal onboarding (payments_receivable flipped true).';

-- One PayPal merchant account can only ever be linked to one therapist.
CREATE UNIQUE INDEX IF NOT EXISTS idx_therapists_paypal_merchant_id
  ON therapists (paypal_merchant_id)
  WHERE paypal_merchant_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_therapists_paypal_tracking_id
  ON therapists (paypal_tracking_id)
  WHERE paypal_tracking_id IS NOT NULL;

-- ══════════════════════════════════════════════════════════════════════
-- Also needed on appointments, to track a PayPal-multiparty booking
-- payment the same way stripe_payment_intent_id / razorpay_order_id do.
-- ══════════════════════════════════════════════════════════════════════
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS paypal_order_id text DEFAULT NULL;
