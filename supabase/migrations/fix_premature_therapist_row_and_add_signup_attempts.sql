-- ============================================================================
-- Fix: "An account with this email already exists" on retrying signup
--
-- Root cause: handle_new_user() fires on every auth.users INSERT, which
-- Supabase creates the moment signInWithOtp({shouldCreateUser:true}) sends
-- the code — BEFORE the user ever verifies it. So an abandoned signup
-- (closed tab, hit back, etc.) already has a therapists row, and the
-- app's "does this email already have an account" check (which reads the
-- therapists table) wrongly treats that as a completed signup.
--
-- Fix: stop inserting into public.therapists from this trigger entirely.
-- The therapists row is now only ever created by finishSignup() in
-- SignupPageClient.tsx, which runs AFTER verifyOtp succeeds. So a
-- therapists row existing for an email now reliably means "real,
-- verified account" — safe to check against for duplicates.
-- ============================================================================

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- If you want to keep a trigger for something else auth-related later,
-- recreate it here WITHOUT the insert into public.therapists — but for
-- now there's nothing else it needs to do, so it's simply removed.


-- ============================================================================
-- New: signup_attempts — a lightweight log of "someone started signing up"
-- so you don't lose the ability to follow up with people who abandon
-- signup before verifying (which is the whole reason the old trigger
-- existed in the first place). This table is NEVER read by the
-- duplicate-email check, so it can never block a real re-attempt.
-- ============================================================================

create table if not exists public.signup_attempts (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  phone      text,
  full_name  text,
  username   text,
  created_at timestamptz not null default now()
);

create index if not exists signup_attempts_email_idx on public.signup_attempts (email);
create index if not exists signup_attempts_created_at_idx on public.signup_attempts (created_at desc);

alter table public.signup_attempts enable row level security;

-- Anyone (anon, using the public anon key) can INSERT their own attempt —
-- this fires right as someone types their details in, before they have
-- any session at all — but nobody can SELECT/UPDATE/DELETE from the client;
-- only you, reading via the Supabase dashboard or with the service role
-- key, can see this data.
create policy "anyone can log a signup attempt"
  on public.signup_attempts
  for insert
  to anon, authenticated
  with check (true);
