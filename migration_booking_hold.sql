-- Migration: booking hold + PayU booking support
-- Run this in Supabase SQL editor

-- 1. New columns on appointments table
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS txnid      TEXT,
  ADD COLUMN IF NOT EXISTS hold_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payu_id    TEXT;

-- 2. Update status check constraint to include new statuses
-- First drop existing constraint if any, then recreate
ALTER TABLE appointments
  DROP CONSTRAINT IF EXISTS appointments_status_check;

ALTER TABLE appointments
  ADD CONSTRAINT appointments_status_check
  CHECK (status IN (
    'pending',          -- legacy
    'pending_payment',  -- slot held, awaiting PayU
    'upcoming',         -- confirmed
    'confirmed',        -- legacy alias
    'completed',
    'cancelled',
    'payment_failed',   -- payment failed, slot released
    'expired'           -- hold expired without payment
  ));

-- 3. Index for fast hold-expiry queries
CREATE INDEX IF NOT EXISTS idx_appointments_hold_until
  ON appointments (hold_until)
  WHERE status = 'pending_payment';

-- 4. Index for slot availability queries
CREATE INDEX IF NOT EXISTS idx_appointments_slot_lookup
  ON appointments (therapist_id, scheduled_at, status);
