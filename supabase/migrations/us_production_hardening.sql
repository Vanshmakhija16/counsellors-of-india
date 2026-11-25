-- Run this migration ONLY against the US Supabase project.
-- Do not apply it to the Counsellors of India project.

-- 1. Prevent public enumeration of screening invites.
ALTER TABLE public.screening_invites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anyone reads invite by token" ON public.screening_invites;

-- 2. Prevent direct client modification of privileged therapist fields.
CREATE OR REPLACE FUNCTION public.prevent_privileged_therapist_updates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  privileged text[] := ARRAY[
    'role','plan','highest_plan','subscription_status','subscription_plan',
    'subscription_expires_at','plan_activated_at','last_plan_payment_gateway',
    'last_plan_payment_ref','razorpay_payment_id','razorpay_key_id',
    'razorpay_key_secret_encrypted','razorpay_ocean_oauth_account_id',
    'razorpay_oauth_access_token_enc','razorpay_oauth_refresh_token_enc',
    'paypal_tracking_id','paypal_merchant_id','paypal_onboarding_status',
    'paypal_payments_receivable','paypal_email_confirmed','paypal_connected_at',
    'stripe_account_id','stripe_onboarded','stripe_charges_enabled',
    'pro_switches_used','pro_switch_cycle_start','webhook_verified'
  ];
  key text;
BEGIN
  IF auth.role() = 'authenticated' THEN
    FOREACH key IN ARRAY privileged LOOP
      IF to_jsonb(NEW)->key IS DISTINCT FROM to_jsonb(OLD)->key THEN
        RAISE EXCEPTION 'Updating privileged therapist field "%" is not allowed', key;
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_privileged_therapist_updates ON public.therapists;
CREATE TRIGGER prevent_privileged_therapist_updates
BEFORE UPDATE ON public.therapists
FOR EACH ROW EXECUTE FUNCTION public.prevent_privileged_therapist_updates();

-- 3. Replace the broad public read with an explicit public-profile view.
DROP POLICY IF EXISTS "therapist: public read" ON public.therapists;
REVOKE SELECT ON TABLE public.therapists FROM anon;
DROP VIEW IF EXISTS public.therapist_public_profiles;
CREATE VIEW public.therapist_public_profiles AS
SELECT
  id,
  full_name,
  username,
  title,
  bio,
  photo_url,
  city,
  specialties,
  languages,
  years_experience,
  fee_per_session,
  session_duration_mins,
  session_mode,
  plan,
  template_id,
  hidden_sections,
  color_id,
  profile_content,
  is_profile_complete,
  is_active
FROM public.therapists
WHERE is_active = true;

GRANT SELECT ON public.therapist_public_profiles TO anon, authenticated;

-- 4. Scope clinical resource storage to therapist-owned paths.
DROP POLICY IF EXISTS "authenticated reads clinical-resources" ON storage.objects;
DROP POLICY IF EXISTS "authenticated writes clinical-resources" ON storage.objects;

CREATE POLICY "therapist reads own clinical-resources"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'clinical-resources'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR (storage.foldername(name))[1] = 'library'
  )
);

CREATE POLICY "therapist writes own clinical-resources"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'clinical-resources'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
