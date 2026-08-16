-- ══════════════════════════════════════════════════════════════════════
-- RAZORPAY OAUTH -- REAL CONNECTION HEALTH TRACKING
-- Run in Supabase SQL Editor
--
-- Problem this fixes: "Connected" in the dashboard only ever checked
-- whether razorpay_oauth_merchant_id exists -- that only proves a
-- connection was made once, never that it still works. A therapist could
-- show as "Connected" for months after Razorpay silently invalidated
-- their token (revoked access, account suspended, switched test/live
-- mode, refresh token expired), and the first anyone found out was a
-- client's booking failing with "Authentication failed".
--
-- These columns let a real health check (see lib/razorpay-oauth.ts
-- checkOAuthHealth()) record what actually happened the last time we
-- verified the connection against Razorpay's own API, and let
-- therapist-order/route.ts flag a connection broken THE MOMENT a real
-- booking fails, not just on the next periodic check.
-- ══════════════════════════════════════════════════════════════════════

ALTER TABLE therapists
  ADD COLUMN IF NOT EXISTS razorpay_oauth_health             text        DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS razorpay_oauth_health_error        text        DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS razorpay_oauth_health_checked_at   timestamptz DEFAULT NULL;

COMMENT ON COLUMN therapists.razorpay_oauth_health IS
  'unknown | healthy | broken -- result of the last real health check or failed booking against Razorpay''s API, NOT just whether we have a merchant_id on file.';
COMMENT ON COLUMN therapists.razorpay_oauth_health_error IS
  'Human-readable reason the connection is broken (e.g. "Razorpay rejected the stored token -- the therapist likely revoked access or their account was suspended."). NULL when healthy/unknown.';
COMMENT ON COLUMN therapists.razorpay_oauth_health_checked_at IS
  'When razorpay_oauth_health was last set -- either by an explicit health check or by a real booking attempt failing.';

-- Existing OAuth-connected therapists start at 'unknown' until the next
-- check or booking attempt actually verifies them -- we don't want to
-- claim they're 'healthy' without ever having checked.
