-- ══════════════════════════════════════════════════════════════════════
-- RAZORPAY OAUTH ("Connect with Razorpay") — PER THERAPIST
-- Run in Supabase SQL Editor → Dashboard → SQL Editor
--
-- PRECONDITION: run migration_razorpay_per_therapist.sql FIRST if you
-- haven't already -- this migration only adds OAuth columns on top of the
-- manual-key columns/payments table that migration creates. Check with:
--
--   select column_name from information_schema.columns
--   where table_name = 'therapists' and column_name = 'razorpay_key_id';
--
-- If that returns no rows, run migration_razorpay_per_therapist.sql before
-- this one.
--
-- These OAuth columns live alongside (not instead of) the existing manual
-- razorpay_key_id / razorpay_key_secret_encrypted columns -- a therapist can
-- have connected via either path. payments_enabled stays the single
-- "can this therapist accept payments" flag either flow can set.
-- ══════════════════════════════════════════════════════════════════════

ALTER TABLE therapists
  ADD COLUMN IF NOT EXISTS razorpay_oauth_merchant_id        text        DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS razorpay_oauth_access_token_enc   text        DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS razorpay_oauth_refresh_token_enc  text        DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS razorpay_oauth_access_expires_at  timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS razorpay_oauth_refresh_expires_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS razorpay_oauth_scope              text        DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS razorpay_oauth_connected_at       timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS razorpay_oauth_public_token       text        DEFAULT NULL;

COMMENT ON COLUMN therapists.razorpay_oauth_merchant_id IS
  'Razorpay merchant/account id (razorpay_account_id) returned by OAuth -- safe to expose to frontend';
COMMENT ON COLUMN therapists.razorpay_oauth_access_token_enc IS
  'AES-256-GCM encrypted OAuth access token -- NEVER expose to frontend';
COMMENT ON COLUMN therapists.razorpay_oauth_refresh_token_enc IS
  'AES-256-GCM encrypted OAuth refresh token -- NEVER expose to frontend';
COMMENT ON COLUMN therapists.razorpay_oauth_access_expires_at IS
  'When the access token expires -- used for lazy refresh before each API call';
COMMENT ON COLUMN therapists.razorpay_oauth_refresh_expires_at IS
  'When the refresh token itself expires (if Razorpay returns one; NULL if it does not expire)';
COMMENT ON COLUMN therapists.razorpay_oauth_scope IS
  'Space-separated scopes granted (e.g. "read_write")';
COMMENT ON COLUMN therapists.razorpay_oauth_connected_at IS
  'When the therapist most recently completed the OAuth connect flow';
COMMENT ON COLUMN therapists.razorpay_oauth_public_token IS
  'Public-safe token Razorpay returns alongside the OAuth tokens -- used AS the `key` param in Checkout for OAuth-connected therapists, in place of a key_id (which OAuth never gives us). Safe to expose to frontend, same as key_id.';

-- One Razorpay merchant account can only ever be linked to one therapist.
CREATE UNIQUE INDEX IF NOT EXISTS idx_therapists_razorpay_oauth_merchant_id
  ON therapists (razorpay_oauth_merchant_id)
  WHERE razorpay_oauth_merchant_id IS NOT NULL;

-- ══════════════════════════════════════════════════════════════════════
-- SECURITY NOTES
-- 1. Both token columns are AES-256-GCM encrypted with the same
--    ENCRYPTION_KEY used for razorpay_key_secret_encrypted.
-- 2. razorpay_oauth_merchant_id IS safe to return to the client.
-- 3. On account.app.authorization_revoked webhook, the OAuth columns for
--    the matching merchant are cleared (see /api/razorpay/oauth/webhook) --
--    manual-key credentials, if separately configured, are untouched.
-- ══════════════════════════════════════════════════════════════════════
