-- ══════════════════════════════════════════════════════════════════════
-- PAYPAL MULTIPARTY — booking capture id
-- Run in Supabase SQL Editor → Dashboard → SQL Editor
--
-- Follow-up to migration_paypal_multiparty.sql, which added
-- appointments.paypal_order_id. This adds the matching capture id (the
-- actual charge, distinct from the order id) once a booking payment is
-- captured — same role as stripe_payment_intent_id / payu_id / the
-- razorpay payment id already stored per-payment for the other gateways.
-- ══════════════════════════════════════════════════════════════════════

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS paypal_capture_id text DEFAULT NULL;

COMMENT ON COLUMN appointments.paypal_capture_id IS
  'PayPal capture id for a completed multiparty booking payment (distinct from paypal_order_id, the order that was approved before capture). Set by /api/paypal/booking/capture-order once PayPal confirms COMPLETED.';
