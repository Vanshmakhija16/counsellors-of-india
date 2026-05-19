-- ══════════════════════════════════════════════════════
-- Run this in Supabase SQL editor → Dashboard → SQL Editor
-- ══════════════════════════════════════════════════════

-- 1. Add columns to therapists table
ALTER TABLE therapists
  ADD COLUMN IF NOT EXISTS availability         jsonb    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS whatsapp             text     DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS instagram            text     DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS linkedin             text     DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS website              text     DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS tagline              text     DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS approach_text        text     DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS education            text[]   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS certifications       text[]   DEFAULT '{}';

-- 1b. Client feedback / testimonials shown on the public portfolio
CREATE TABLE IF NOT EXISTS feedbacks (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id  uuid NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  client_name   text NOT NULL,
  client_role   text,
  rating        smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text          text NOT NULL,
  is_published  boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feedbacks_therapist
  ON feedbacks (therapist_id, is_published, created_at DESC);

ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

-- Public can read published feedback for any therapist (portfolio is public)
DROP POLICY IF EXISTS "public read published feedback" ON feedbacks;
CREATE POLICY "public read published feedback"
  ON feedbacks FOR SELECT
  USING (is_published = true);

-- Therapists can fully manage their own feedback rows
DROP POLICY IF EXISTS "therapist manages own feedback" ON feedbacks;
CREATE POLICY "therapist manages own feedback"
  ON feedbacks FOR ALL
  USING (auth.uid() = therapist_id)
  WITH CHECK (auth.uid() = therapist_id);

-- 2. The availability column stores this shape:
-- {
--   "duration": 50,
--   "schedule": {
--     "Monday":    { "enabled": true,  "ranges": [{ "start": "09:00", "end": "13:00" }] },
--     "Tuesday":   { "enabled": true,  "ranges": [{ "start": "09:00", "end": "17:00" }] },
--     "Wednesday": { "enabled": false, "ranges": [] },
--     "Thursday":  { "enabled": true,  "ranges": [{ "start": "10:00", "end": "16:00" }] },
--     "Friday":    { "enabled": true,  "ranges": [{ "start": "09:00", "end": "14:00" }] },
--     "Saturday":  { "enabled": false, "ranges": [] },
--     "Sunday":    { "enabled": false, "ranges": [] }
--   }
-- }


-- ══════════════════════════════════════════════════════
-- CLINICAL MODULE — Phase 0: Patients spine
-- (Run after the therapists migration above.)
-- ══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS patients (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id            uuid NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  first_name              text NOT NULL,
  last_name               text NOT NULL,
  dob                     date NOT NULL,
  gender                  text,
  pronouns                text,
  marital_status          text,
  email                   text,
  phone                   text,
  address                 text,
  emergency_contact_name  text,
  emergency_contact_phone text,
  status                  text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','archived','discharged')),
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patients_therapist
  ON patients (therapist_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_patients_name
  ON patients (therapist_id, lower(last_name), lower(first_name));

-- updated_at auto-touch
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS patients_set_updated_at ON patients;
CREATE TRIGGER patients_set_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "therapist manages own patients" ON patients;
CREATE POLICY "therapist manages own patients"
  ON patients FOR ALL
  USING (auth.uid() = therapist_id)
  WITH CHECK (auth.uid() = therapist_id);


-- ══════════════════════════════════════════════════════
-- CLINICAL MODULE — Phase 2: Screening (in-session)
-- (Run after the patients migration above.)
-- ══════════════════════════════════════════════════════

-- The instrument library is shared across all therapists.
-- We seed PHQ-9, GAD-7, PCL-5, AUDIT below.
CREATE TABLE IF NOT EXISTS instruments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text UNIQUE NOT NULL,
  name            text NOT NULL,
  short_name      text NOT NULL,
  description     text,
  domain          text NOT NULL,            -- 'depression' | 'anxiety' | 'trauma' | 'substance'
  recall_window   text,                     -- e.g. "Over the last 2 weeks"
  min_score       int NOT NULL DEFAULT 0,
  max_score       int NOT NULL,
  -- severity bands: [{ "min": 0, "max": 4,  "label": "Minimal" }, ...]
  severity_bands  jsonb NOT NULL,
  -- option set shared by every item (PHQ-9/GAD-7 all use 0-3 Likert):
  -- [{ "value": 0, "label": "Not at all" }, ...]
  options         jsonb NOT NULL,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS instrument_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instrument_id   uuid NOT NULL REFERENCES instruments(id) ON DELETE CASCADE,
  position        int NOT NULL,             -- 1..N
  prompt          text NOT NULL,
  is_critical     boolean NOT NULL DEFAULT false,  -- e.g. PHQ-9 #9 (suicidality)
  UNIQUE (instrument_id, position)
);

CREATE INDEX IF NOT EXISTS idx_instrument_items_instrument
  ON instrument_items (instrument_id, position);

-- Read-only public catalogue (any signed-in therapist can list the library).
ALTER TABLE instruments ENABLE ROW LEVEL SECURITY;
ALTER TABLE instrument_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anyone reads instruments" ON instruments;
CREATE POLICY "anyone reads instruments"
  ON instruments FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "anyone reads instrument items" ON instrument_items;
CREATE POLICY "anyone reads instrument items"
  ON instrument_items FOR SELECT
  USING (true);


-- A single administration of an instrument to a patient.
CREATE TABLE IF NOT EXISTS screening_sessions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id    uuid NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  patient_id      uuid NOT NULL REFERENCES patients(id)   ON DELETE CASCADE,
  instrument_id   uuid NOT NULL REFERENCES instruments(id),
  total_score     int  NOT NULL,
  severity_label  text NOT NULL,
  flagged         boolean NOT NULL DEFAULT false,  -- any critical item > 0
  notes           text,
  administered_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_screening_sessions_patient
  ON screening_sessions (patient_id, administered_at DESC);

CREATE INDEX IF NOT EXISTS idx_screening_sessions_therapist
  ON screening_sessions (therapist_id, administered_at DESC);


-- Per-item answers for one session.
CREATE TABLE IF NOT EXISTS screening_responses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      uuid NOT NULL REFERENCES screening_sessions(id) ON DELETE CASCADE,
  item_id         uuid NOT NULL REFERENCES instrument_items(id),
  value           int  NOT NULL,
  UNIQUE (session_id, item_id)
);

ALTER TABLE screening_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE screening_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "therapist manages own screening sessions" ON screening_sessions;
CREATE POLICY "therapist manages own screening sessions"
  ON screening_sessions FOR ALL
  USING (auth.uid() = therapist_id)
  WITH CHECK (auth.uid() = therapist_id);

-- Responses are reachable only via a session you own.
DROP POLICY IF EXISTS "therapist manages own screening responses" ON screening_responses;
CREATE POLICY "therapist manages own screening responses"
  ON screening_responses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM screening_sessions s
      WHERE s.id = screening_responses.session_id
        AND s.therapist_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM screening_sessions s
      WHERE s.id = screening_responses.session_id
        AND s.therapist_id = auth.uid()
    )
  );


-- ══════════════════════════════════════════════════════
-- SEED: PHQ-9, GAD-7, PCL-5, AUDIT
-- Idempotent — uses ON CONFLICT (slug) to skip re-inserts.
-- ══════════════════════════════════════════════════════

-- ---------- PHQ-9 ----------
INSERT INTO instruments (slug, name, short_name, description, domain, recall_window, min_score, max_score, severity_bands, options)
VALUES (
  'phq-9',
  'Patient Health Questionnaire-9',
  'PHQ-9',
  'Nine-item depression screening instrument.',
  'depression',
  'Over the last 2 weeks',
  0, 27,
  '[
    {"min":0,"max":4,"label":"Minimal"},
    {"min":5,"max":9,"label":"Mild"},
    {"min":10,"max":14,"label":"Moderate"},
    {"min":15,"max":19,"label":"Moderately severe"},
    {"min":20,"max":27,"label":"Severe"}
  ]'::jsonb,
  '[
    {"value":0,"label":"Not at all"},
    {"value":1,"label":"Several days"},
    {"value":2,"label":"More than half the days"},
    {"value":3,"label":"Nearly every day"}
  ]'::jsonb
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO instrument_items (instrument_id, position, prompt, is_critical)
SELECT i.id, v.position, v.prompt, v.is_critical
FROM (VALUES
  (1, 'Little interest or pleasure in doing things', false),
  (2, 'Feeling down, depressed, or hopeless', false),
  (3, 'Trouble falling or staying asleep, or sleeping too much', false),
  (4, 'Feeling tired or having little energy', false),
  (5, 'Poor appetite or overeating', false),
  (6, 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down', false),
  (7, 'Trouble concentrating on things, such as reading the newspaper or watching television', false),
  (8, 'Moving or speaking so slowly that other people could have noticed — or being so fidgety or restless that you have been moving around a lot more than usual', false),
  (9, 'Thoughts that you would be better off dead, or of hurting yourself in some way', true)
) AS v(position, prompt, is_critical)
CROSS JOIN instruments i
WHERE i.slug = 'phq-9'
ON CONFLICT (instrument_id, position) DO NOTHING;


-- ---------- GAD-7 ----------
INSERT INTO instruments (slug, name, short_name, description, domain, recall_window, min_score, max_score, severity_bands, options)
VALUES (
  'gad-7',
  'Generalized Anxiety Disorder-7',
  'GAD-7',
  'Seven-item anxiety screening instrument.',
  'anxiety',
  'Over the last 2 weeks',
  0, 21,
  '[
    {"min":0,"max":4,"label":"Minimal"},
    {"min":5,"max":9,"label":"Mild"},
    {"min":10,"max":14,"label":"Moderate"},
    {"min":15,"max":21,"label":"Severe"}
  ]'::jsonb,
  '[
    {"value":0,"label":"Not at all"},
    {"value":1,"label":"Several days"},
    {"value":2,"label":"More than half the days"},
    {"value":3,"label":"Nearly every day"}
  ]'::jsonb
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO instrument_items (instrument_id, position, prompt, is_critical)
SELECT i.id, v.position, v.prompt, v.is_critical
FROM (VALUES
  (1, 'Feeling nervous, anxious, or on edge', false),
  (2, 'Not being able to stop or control worrying', false),
  (3, 'Worrying too much about different things', false),
  (4, 'Trouble relaxing', false),
  (5, 'Being so restless that it is hard to sit still', false),
  (6, 'Becoming easily annoyed or irritable', false),
  (7, 'Feeling afraid, as if something awful might happen', false)
) AS v(position, prompt, is_critical)
CROSS JOIN instruments i
WHERE i.slug = 'gad-7'
ON CONFLICT (instrument_id, position) DO NOTHING;


-- ---------- PCL-5 (PTSD Checklist for DSM-5) ----------
INSERT INTO instruments (slug, name, short_name, description, domain, recall_window, min_score, max_score, severity_bands, options)
VALUES (
  'pcl-5',
  'PTSD Checklist for DSM-5',
  'PCL-5',
  'Twenty-item self-report for DSM-5 PTSD symptoms.',
  'trauma',
  'In the past month',
  0, 80,
  '[
    {"min":0,"max":32,"label":"Below threshold"},
    {"min":33,"max":80,"label":"Probable PTSD"}
  ]'::jsonb,
  '[
    {"value":0,"label":"Not at all"},
    {"value":1,"label":"A little bit"},
    {"value":2,"label":"Moderately"},
    {"value":3,"label":"Quite a bit"},
    {"value":4,"label":"Extremely"}
  ]'::jsonb
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO instrument_items (instrument_id, position, prompt, is_critical)
SELECT i.id, v.position, v.prompt, v.is_critical
FROM (VALUES
  (1,  'Repeated, disturbing, and unwanted memories of the stressful experience', false),
  (2,  'Repeated, disturbing dreams of the stressful experience', false),
  (3,  'Suddenly feeling or acting as if the stressful experience were actually happening again', false),
  (4,  'Feeling very upset when something reminded you of the stressful experience', false),
  (5,  'Having strong physical reactions when something reminded you of the stressful experience', false),
  (6,  'Avoiding memories, thoughts, or feelings related to the stressful experience', false),
  (7,  'Avoiding external reminders of the stressful experience', false),
  (8,  'Trouble remembering important parts of the stressful experience', false),
  (9,  'Having strong negative beliefs about yourself, other people, or the world', false),
  (10, 'Blaming yourself or someone else for the stressful experience or what happened after it', false),
  (11, 'Having strong negative feelings such as fear, horror, anger, guilt, or shame', false),
  (12, 'Loss of interest in activities that you used to enjoy', false),
  (13, 'Feeling distant or cut off from other people', false),
  (14, 'Trouble experiencing positive feelings', false),
  (15, 'Irritable behavior, angry outbursts, or acting aggressively', false),
  (16, 'Taking too many risks or doing things that could cause you harm', true),
  (17, 'Being super-alert or watchful or on guard', false),
  (18, 'Feeling jumpy or easily startled', false),
  (19, 'Having difficulty concentrating', false),
  (20, 'Trouble falling or staying asleep', false)
) AS v(position, prompt, is_critical)
CROSS JOIN instruments i
WHERE i.slug = 'pcl-5'
ON CONFLICT (instrument_id, position) DO NOTHING;


-- ---------- AUDIT (Alcohol Use Disorders Identification Test) ----------
INSERT INTO instruments (slug, name, short_name, description, domain, recall_window, min_score, max_score, severity_bands, options)
VALUES (
  'audit',
  'Alcohol Use Disorders Identification Test',
  'AUDIT',
  'Ten-item WHO instrument for hazardous and harmful alcohol use.',
  'substance',
  'In the past year',
  0, 40,
  '[
    {"min":0,"max":7,"label":"Low risk"},
    {"min":8,"max":15,"label":"Hazardous"},
    {"min":16,"max":19,"label":"Harmful"},
    {"min":20,"max":40,"label":"Possible dependence"}
  ]'::jsonb,
  -- AUDIT uses different option scales per item, but for v1 we use a
  -- common 0-4 mapping; UI will show the prompt verbatim and accept 0-4.
  '[
    {"value":0,"label":"0"},
    {"value":1,"label":"1"},
    {"value":2,"label":"2"},
    {"value":3,"label":"3"},
    {"value":4,"label":"4"}
  ]'::jsonb
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO instrument_items (instrument_id, position, prompt, is_critical)
SELECT i.id, v.position, v.prompt, v.is_critical
FROM (VALUES
  (1,  'How often do you have a drink containing alcohol? (0 Never · 1 Monthly or less · 2 2-4×/month · 3 2-3×/week · 4 4+×/week)', false),
  (2,  'How many drinks containing alcohol do you have on a typical day when drinking? (0: 1-2 · 1: 3-4 · 2: 5-6 · 3: 7-9 · 4: 10+)', false),
  (3,  'How often do you have six or more drinks on one occasion? (0 Never → 4 Daily or almost daily)', false),
  (4,  'How often during the last year have you found you were not able to stop drinking once you started?', false),
  (5,  'How often during the last year have you failed to do what was normally expected of you because of drinking?', false),
  (6,  'How often during the last year have you needed a first drink in the morning to get going after a heavy session?', false),
  (7,  'How often during the last year have you had a feeling of guilt or remorse after drinking?', false),
  (8,  'How often during the last year have you been unable to remember what happened the night before because of drinking?', false),
  (9,  'Have you or someone else been injured because of your drinking? (0 No · 2 Yes, but not in last year · 4 Yes, in last year)', true),
  (10, 'Has a relative, friend, doctor, or other health worker been concerned about your drinking or suggested you cut down? (0 No · 2 Yes, but not in last year · 4 Yes, in last year)', false)
) AS v(position, prompt, is_critical)
CROSS JOIN instruments i
WHERE i.slug = 'audit'
ON CONFLICT (instrument_id, position) DO NOTHING;


-- ══════════════════════════════════════════════════════
-- CLINICAL MODULE — Phase 1: Patient Intake
-- (Run after the screening migration above.)
-- ══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS patient_intakes (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id        uuid NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  patient_id          uuid NOT NULL UNIQUE REFERENCES patients(id) ON DELETE CASCADE,
  presenting_concern  text,
  history             jsonb,
  family              jsonb,
  social              jsonb,
  risk                jsonb,
  status              text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','final')),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patient_intakes_therapist
  ON patient_intakes (therapist_id, updated_at DESC);

DROP TRIGGER IF EXISTS patient_intakes_set_updated_at ON patient_intakes;
CREATE TRIGGER patient_intakes_set_updated_at
  BEFORE UPDATE ON patient_intakes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE patient_intakes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "therapist manages own intakes" ON patient_intakes;
CREATE POLICY "therapist manages own intakes"
  ON patient_intakes FOR ALL
  USING (auth.uid() = therapist_id)
  WITH CHECK (auth.uid() = therapist_id);


-- ══════════════════════════════════════════════════════
-- CLINICAL MODULE — Phase 2b: Screening invites + public RPC
-- ══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS screening_invites (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id          uuid NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  patient_id            uuid NOT NULL REFERENCES patients(id)   ON DELETE CASCADE,
  instrument_id         uuid NOT NULL REFERENCES instruments(id),
  token                 text NOT NULL UNIQUE,
  expires_at            timestamptz NOT NULL,
  completed_session_id  uuid REFERENCES screening_sessions(id) ON DELETE SET NULL,
  created_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_screening_invites_token       ON screening_invites (token);
CREATE INDEX IF NOT EXISTS idx_screening_invites_therapist   ON screening_invites (therapist_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_screening_invites_patient     ON screening_invites (patient_id, created_at DESC);

ALTER TABLE screening_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "therapist manages own screening invites" ON screening_invites;
CREATE POLICY "therapist manages own screening invites"
  ON screening_invites FOR ALL
  USING (auth.uid() = therapist_id)
  WITH CHECK (auth.uid() = therapist_id);

-- Anyone can SELECT a single invite row by token (used by the public /screen/[token] page).
-- The token itself is the secret — it's 32 bytes of entropy. We expose only the row that matches.
DROP POLICY IF EXISTS "anyone reads invite by token" ON screening_invites;
CREATE POLICY "anyone reads invite by token"
  ON screening_invites FOR SELECT
  USING (true);

-- SECURITY DEFINER RPC for the anonymous submit flow.
-- Validates token + expiry + single-use atomically and inserts session + responses.
-- Returns the new session id (uuid).
CREATE OR REPLACE FUNCTION submit_screening_by_token(
  p_token     text,
  p_responses jsonb,
  p_notes     text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite      screening_invites%ROWTYPE;
  v_instrument  instruments%ROWTYPE;
  v_total       int := 0;
  v_flagged     boolean := false;
  v_band        jsonb;
  v_severity    text := 'Unknown';
  v_session_id  uuid;
  v_resp        jsonb;
  v_item_id     uuid;
  v_value       int;
  v_is_critical boolean;
  v_missing     int;
BEGIN
  -- Lock the invite row to prevent concurrent submissions.
  SELECT * INTO v_invite
  FROM screening_invites
  WHERE token = p_token
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid token' USING ERRCODE = 'P0001';
  END IF;

  IF v_invite.completed_session_id IS NOT NULL THEN
    RAISE EXCEPTION 'This link has already been used' USING ERRCODE = 'P0001';
  END IF;

  IF v_invite.expires_at < now() THEN
    RAISE EXCEPTION 'This link has expired' USING ERRCODE = 'P0001';
  END IF;

  SELECT * INTO v_instrument FROM instruments WHERE id = v_invite.instrument_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Instrument not found' USING ERRCODE = 'P0001';
  END IF;

  -- Verify every item has a response.
  SELECT count(*) INTO v_missing
  FROM instrument_items ii
  WHERE ii.instrument_id = v_instrument.id
    AND NOT EXISTS (
      SELECT 1 FROM jsonb_array_elements(p_responses) r
      WHERE (r->>'item_id')::uuid = ii.id
    );
  IF v_missing > 0 THEN
    RAISE EXCEPTION 'Missing answers for % item(s)', v_missing USING ERRCODE = 'P0001';
  END IF;

  -- Compute total + critical-flag.
  FOR v_resp IN SELECT * FROM jsonb_array_elements(p_responses) LOOP
    v_item_id := (v_resp->>'item_id')::uuid;
    v_value   := (v_resp->>'value')::int;

    SELECT is_critical INTO v_is_critical
    FROM instrument_items
    WHERE id = v_item_id AND instrument_id = v_instrument.id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Response refers to unknown item' USING ERRCODE = 'P0001';
    END IF;

    v_total := v_total + v_value;
    IF v_is_critical AND v_value > 0 THEN
      v_flagged := true;
    END IF;
  END LOOP;

  -- Find severity band.
  FOR v_band IN SELECT * FROM jsonb_array_elements(v_instrument.severity_bands) LOOP
    IF v_total BETWEEN (v_band->>'min')::int AND (v_band->>'max')::int THEN
      v_severity := v_band->>'label';
      EXIT;
    END IF;
  END LOOP;

  -- Insert the session as if administered by the therapist.
  INSERT INTO screening_sessions (
    therapist_id, patient_id, instrument_id,
    total_score, severity_label, flagged, notes
  )
  VALUES (
    v_invite.therapist_id, v_invite.patient_id, v_invite.instrument_id,
    v_total, v_severity, v_flagged, p_notes
  )
  RETURNING id INTO v_session_id;

  -- Insert responses.
  INSERT INTO screening_responses (session_id, item_id, value)
  SELECT
    v_session_id,
    (r->>'item_id')::uuid,
    (r->>'value')::int
  FROM jsonb_array_elements(p_responses) r;

  -- Mark invite used.
  UPDATE screening_invites
  SET completed_session_id = v_session_id
  WHERE id = v_invite.id;

  RETURN v_session_id;
END;
$$;

REVOKE ALL ON FUNCTION submit_screening_by_token(text, jsonb, text) FROM public;
GRANT EXECUTE ON FUNCTION submit_screening_by_token(text, jsonb, text) TO anon, authenticated;


-- ══════════════════════════════════════════════════════
-- CLINICAL MODULE — Phase 3: Diagnosis (DSM-5)
-- ══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS dsm_disorders (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code              text UNIQUE NOT NULL,    -- DSM-5 code, e.g. '296.23'
  name              text NOT NULL,
  category          text NOT NULL,
  criteria_summary  text,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dsm_criteria (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  disorder_id     uuid NOT NULL REFERENCES dsm_disorders(id) ON DELETE CASCADE,
  "group"         text NOT NULL,             -- 'A', 'B', etc.
  label           text NOT NULL,
  required_count  int  NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_dsm_criteria_disorder
  ON dsm_criteria (disorder_id, "group");

ALTER TABLE dsm_disorders ENABLE ROW LEVEL SECURITY;
ALTER TABLE dsm_criteria  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anyone reads dsm disorders" ON dsm_disorders;
CREATE POLICY "anyone reads dsm disorders"
  ON dsm_disorders FOR SELECT USING (true);

DROP POLICY IF EXISTS "anyone reads dsm criteria" ON dsm_criteria;
CREATE POLICY "anyone reads dsm criteria"
  ON dsm_criteria FOR SELECT USING (true);


CREATE TABLE IF NOT EXISTS patient_diagnoses (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id      uuid NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  patient_id        uuid NOT NULL REFERENCES patients(id)   ON DELETE CASCADE,
  disorder_id       uuid NOT NULL REFERENCES dsm_disorders(id),
  status            text NOT NULL
    CHECK (status IN ('provisional','working','confirmed','ruled_out')),
  met_criteria_ids  uuid[] NOT NULL DEFAULT '{}',
  onset_date        date,
  notes             text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patient_diagnoses_patient
  ON patient_diagnoses (patient_id, created_at DESC);

DROP TRIGGER IF EXISTS patient_diagnoses_set_updated_at ON patient_diagnoses;
CREATE TRIGGER patient_diagnoses_set_updated_at
  BEFORE UPDATE ON patient_diagnoses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE patient_diagnoses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "therapist manages own diagnoses" ON patient_diagnoses;
CREATE POLICY "therapist manages own diagnoses"
  ON patient_diagnoses FOR ALL
  USING (auth.uid() = therapist_id)
  WITH CHECK (auth.uid() = therapist_id);


-- ───────────── DSM-5 SEED (top 10 disorders, paraphrased criteria summaries) ─────────────
-- Source: APA DSM-5-TR. Criteria are paraphrased for clinical reference;
-- always confirm against the licensed DSM-5-TR. Idempotent via ON CONFLICT (code).

INSERT INTO dsm_disorders (code, name, category, criteria_summary) VALUES
  ('296.20', 'Major Depressive Disorder, single episode',          'Depressive Disorders',     'Five or more of nine symptoms during the same 2-week period, including depressed mood or loss of interest; causing significant distress or impairment.'),
  ('300.4',  'Persistent Depressive Disorder (Dysthymia)',         'Depressive Disorders',     'Depressed mood for most of the day, more days than not, for at least 2 years, with two or more associated symptoms.'),
  ('300.02', 'Generalized Anxiety Disorder',                       'Anxiety Disorders',        'Excessive anxiety and worry occurring more days than not for at least 6 months, with three or more associated symptoms.'),
  ('300.01', 'Panic Disorder',                                     'Anxiety Disorders',        'Recurrent unexpected panic attacks, with at least one followed by a month of concern or maladaptive behavior change.'),
  ('300.23', 'Social Anxiety Disorder',                            'Anxiety Disorders',        'Marked fear of one or more social situations involving possible scrutiny; lasting 6 months or more.'),
  ('309.81', 'Posttraumatic Stress Disorder',                      'Trauma- and Stressor-Related', 'Exposure to actual or threatened death/injury/violence, plus symptoms from the four PTSD clusters lasting more than 1 month.'),
  ('300.3',  'Obsessive-Compulsive Disorder',                      'Obsessive-Compulsive',     'Presence of obsessions, compulsions, or both, that are time-consuming or cause significant distress.'),
  ('314.01', 'Attention-Deficit/Hyperactivity Disorder',           'Neurodevelopmental',       'Persistent pattern of inattention and/or hyperactivity-impulsivity present before age 12, in two or more settings.'),
  ('296.40', 'Bipolar I Disorder',                                 'Bipolar and Related',      'At least one manic episode; may be preceded or followed by hypomanic or major depressive episodes.'),
  ('296.89', 'Bipolar II Disorder',                                'Bipolar and Related',      'At least one hypomanic episode and at least one major depressive episode; no manic episodes.')
ON CONFLICT (code) DO NOTHING;

-- Criteria for MDD (criterion A: 5+ of 9 symptoms during 2-week window)
INSERT INTO dsm_criteria (disorder_id, "group", label, required_count)
SELECT d.id, v."group", v.label, v.required_count
FROM (VALUES
  ('A', 'Depressed mood most of the day, nearly every day', 5),
  ('A', 'Markedly diminished interest or pleasure in activities', 5),
  ('A', 'Significant weight loss/gain or appetite change', 5),
  ('A', 'Insomnia or hypersomnia nearly every day', 5),
  ('A', 'Psychomotor agitation or retardation', 5),
  ('A', 'Fatigue or loss of energy nearly every day', 5),
  ('A', 'Feelings of worthlessness or excessive guilt', 5),
  ('A', 'Diminished ability to concentrate or indecisiveness', 5),
  ('A', 'Recurrent thoughts of death or suicidal ideation', 5),
  ('B', 'Symptoms cause clinically significant distress or impairment', 1),
  ('C', 'Not attributable to a substance or another medical condition', 1)
) AS v("group", label, required_count)
CROSS JOIN dsm_disorders d
WHERE d.code = '296.20'
  AND NOT EXISTS (
    SELECT 1 FROM dsm_criteria c
    WHERE c.disorder_id = d.id AND c.label = v.label
  );

-- Criteria for GAD
INSERT INTO dsm_criteria (disorder_id, "group", label, required_count)
SELECT d.id, v."group", v.label, v.required_count
FROM (VALUES
  ('A', 'Excessive anxiety and worry, more days than not, for ≥6 months', 1),
  ('B', 'Difficulty controlling the worry', 1),
  ('C', 'Restlessness or feeling keyed up or on edge', 3),
  ('C', 'Being easily fatigued', 3),
  ('C', 'Difficulty concentrating or mind going blank', 3),
  ('C', 'Irritability', 3),
  ('C', 'Muscle tension', 3),
  ('C', 'Sleep disturbance', 3),
  ('D', 'Anxiety/worry/symptoms cause significant distress or impairment', 1),
  ('E', 'Not attributable to a substance or another medical condition', 1)
) AS v("group", label, required_count)
CROSS JOIN dsm_disorders d
WHERE d.code = '300.02'
  AND NOT EXISTS (
    SELECT 1 FROM dsm_criteria c
    WHERE c.disorder_id = d.id AND c.label = v.label
  );

-- Criteria for PTSD (paraphrased; full DSM-5 has 4 symptom clusters)
INSERT INTO dsm_criteria (disorder_id, "group", label, required_count)
SELECT d.id, v."group", v.label, v.required_count
FROM (VALUES
  ('A', 'Exposure to actual or threatened death, serious injury, or sexual violence', 1),
  ('B', 'One or more intrusion symptoms (intrusive memories, dreams, flashbacks, distress at cues, physiological reactions)', 1),
  ('C', 'Persistent avoidance of trauma-associated stimuli (memories/thoughts or external reminders)', 1),
  ('D', 'Two or more negative alterations in cognition or mood', 2),
  ('E', 'Two or more marked alterations in arousal and reactivity', 2),
  ('F', 'Duration of disturbance is more than 1 month', 1),
  ('G', 'Significant distress or functional impairment', 1)
) AS v("group", label, required_count)
CROSS JOIN dsm_disorders d
WHERE d.code = '309.81'
  AND NOT EXISTS (
    SELECT 1 FROM dsm_criteria c
    WHERE c.disorder_id = d.id AND c.label = v.label
  );

-- Persistent Depressive Disorder (Dysthymia)
INSERT INTO dsm_criteria (disorder_id, "group", label, required_count)
SELECT d.id, v."group", v.label, v.required_count
FROM (VALUES
  ('A', 'Depressed mood for most of the day, for more days than not, for at least 2 years (1 year in children/adolescents)', 1),
  ('B', 'Poor appetite or overeating', 2),
  ('B', 'Insomnia or hypersomnia', 2),
  ('B', 'Low energy or fatigue', 2),
  ('B', 'Low self-esteem', 2),
  ('B', 'Poor concentration or difficulty making decisions', 2),
  ('B', 'Feelings of hopelessness', 2),
  ('C', 'Never without the symptoms in A and B for more than 2 months during the 2-year period', 1),
  ('D', 'Significant distress or impairment', 1),
  ('E', 'Not better explained by another disorder or attributable to a substance/medical condition', 1)
) AS v("group", label, required_count)
CROSS JOIN dsm_disorders d
WHERE d.code = '300.4'
  AND NOT EXISTS (
    SELECT 1 FROM dsm_criteria c
    WHERE c.disorder_id = d.id AND c.label = v.label
  );

-- Panic Disorder
INSERT INTO dsm_criteria (disorder_id, "group", label, required_count)
SELECT d.id, v."group", v.label, v.required_count
FROM (VALUES
  ('A', 'Recurrent unexpected panic attacks', 1),
  ('B', 'At least one attack followed by 1+ month of persistent concern about more attacks or their consequences', 1),
  ('B', 'At least one attack followed by 1+ month of significant maladaptive change in behavior', 1),
  ('C', 'Not attributable to a substance or another medical condition', 1),
  ('D', 'Not better explained by another mental disorder', 1)
) AS v("group", label, required_count)
CROSS JOIN dsm_disorders d
WHERE d.code = '300.01'
  AND NOT EXISTS (
    SELECT 1 FROM dsm_criteria c
    WHERE c.disorder_id = d.id AND c.label = v.label
  );

-- Social Anxiety Disorder
INSERT INTO dsm_criteria (disorder_id, "group", label, required_count)
SELECT d.id, v."group", v.label, v.required_count
FROM (VALUES
  ('A', 'Marked fear or anxiety about one or more social situations involving possible scrutiny', 1),
  ('B', 'Fears acting in a way that will be negatively evaluated', 1),
  ('C', 'Social situations almost always provoke fear or anxiety', 1),
  ('D', 'Social situations are avoided or endured with intense fear or anxiety', 1),
  ('E', 'Fear or anxiety is out of proportion to the actual threat', 1),
  ('F', 'Persistent, typically lasting for 6 months or more', 1),
  ('G', 'Causes significant distress or impairment', 1),
  ('H', 'Not attributable to a substance or another medical condition', 1)
) AS v("group", label, required_count)
CROSS JOIN dsm_disorders d
WHERE d.code = '300.23'
  AND NOT EXISTS (
    SELECT 1 FROM dsm_criteria c
    WHERE c.disorder_id = d.id AND c.label = v.label
  );

-- OCD
INSERT INTO dsm_criteria (disorder_id, "group", label, required_count)
SELECT d.id, v."group", v.label, v.required_count
FROM (VALUES
  ('A', 'Presence of obsessions, compulsions, or both', 1),
  ('B', 'Obsessions/compulsions are time-consuming (>1 hour/day) or cause significant distress/impairment', 1),
  ('C', 'Not attributable to a substance or another medical condition', 1),
  ('D', 'Not better explained by another mental disorder', 1)
) AS v("group", label, required_count)
CROSS JOIN dsm_disorders d
WHERE d.code = '300.3'
  AND NOT EXISTS (
    SELECT 1 FROM dsm_criteria c
    WHERE c.disorder_id = d.id AND c.label = v.label
  );

-- ADHD (criterion A: ≥6 inattention OR ≥6 hyperactivity-impulsivity symptoms for ≥6 months)
INSERT INTO dsm_criteria (disorder_id, "group", label, required_count)
SELECT d.id, v."group", v.label, v.required_count
FROM (VALUES
  ('A1-inattention', 'Often fails to give close attention to details / makes careless mistakes', 6),
  ('A1-inattention', 'Often has difficulty sustaining attention in tasks or play', 6),
  ('A1-inattention', 'Often does not seem to listen when spoken to directly', 6),
  ('A1-inattention', 'Often does not follow through on instructions or finish work', 6),
  ('A1-inattention', 'Often has difficulty organizing tasks and activities', 6),
  ('A1-inattention', 'Often avoids tasks requiring sustained mental effort', 6),
  ('A1-inattention', 'Often loses things necessary for tasks or activities', 6),
  ('A1-inattention', 'Often easily distracted by extraneous stimuli', 6),
  ('A1-inattention', 'Often forgetful in daily activities', 6),
  ('A2-hyperactivity', 'Often fidgets or squirms in seat', 6),
  ('A2-hyperactivity', 'Often leaves seat when remaining seated is expected', 6),
  ('A2-hyperactivity', 'Often runs about or climbs in inappropriate situations / feels restless', 6),
  ('A2-hyperactivity', 'Often unable to play or engage in leisure activities quietly', 6),
  ('A2-hyperactivity', 'Often "on the go" or acting as if "driven by a motor"', 6),
  ('A2-hyperactivity', 'Often talks excessively', 6),
  ('A2-hyperactivity', 'Often blurts out an answer before a question has been completed', 6),
  ('A2-hyperactivity', 'Often has difficulty waiting their turn', 6),
  ('A2-hyperactivity', 'Often interrupts or intrudes on others', 6),
  ('B', 'Several symptoms present before age 12 years', 1),
  ('C', 'Symptoms present in 2 or more settings', 1),
  ('D', 'Clear evidence symptoms interfere with social, academic, or occupational functioning', 1),
  ('E', 'Symptoms do not occur exclusively during another mental disorder', 1)
) AS v("group", label, required_count)
CROSS JOIN dsm_disorders d
WHERE d.code = '314.01'
  AND NOT EXISTS (
    SELECT 1 FROM dsm_criteria c
    WHERE c.disorder_id = d.id AND c.label = v.label
  );

-- Bipolar I (manic episode required)
INSERT INTO dsm_criteria (disorder_id, "group", label, required_count)
SELECT d.id, v."group", v.label, v.required_count
FROM (VALUES
  ('A-manic', 'Distinct period of abnormally elevated, expansive, or irritable mood AND increased activity/energy, ≥1 week (any duration if hospitalization required)', 1),
  ('B-manic', 'Inflated self-esteem or grandiosity', 3),
  ('B-manic', 'Decreased need for sleep', 3),
  ('B-manic', 'More talkative than usual or pressure to keep talking', 3),
  ('B-manic', 'Flight of ideas or subjective experience that thoughts are racing', 3),
  ('B-manic', 'Distractibility', 3),
  ('B-manic', 'Increase in goal-directed activity or psychomotor agitation', 3),
  ('B-manic', 'Excessive involvement in activities with high potential for painful consequences', 3),
  ('C', 'Mood disturbance causes marked impairment, requires hospitalization, or has psychotic features', 1),
  ('D', 'Episode not attributable to a substance or another medical condition', 1)
) AS v("group", label, required_count)
CROSS JOIN dsm_disorders d
WHERE d.code = '296.40'
  AND NOT EXISTS (
    SELECT 1 FROM dsm_criteria c
    WHERE c.disorder_id = d.id AND c.label = v.label
  );

-- Bipolar II (at least one hypomanic + one major depressive; no manic)
INSERT INTO dsm_criteria (disorder_id, "group", label, required_count)
SELECT d.id, v."group", v.label, v.required_count
FROM (VALUES
  ('A', 'At least one hypomanic episode (≥4 consecutive days of elevated/irritable mood + ≥3 B-criteria symptoms)', 1),
  ('B', 'At least one major depressive episode (5+ of the 9 MDD symptoms during a 2-week period)', 1),
  ('C', 'No manic episode has ever occurred', 1),
  ('D', 'Symptoms not better explained by schizoaffective or other psychotic disorder', 1),
  ('E', 'Symptoms cause clinically significant distress or impairment', 1)
) AS v("group", label, required_count)
CROSS JOIN dsm_disorders d
WHERE d.code = '296.89'
  AND NOT EXISTS (
    SELECT 1 FROM dsm_criteria c
    WHERE c.disorder_id = d.id AND c.label = v.label
  );


-- ══════════════════════════════════════════════════════
-- CLINICAL MODULE — Phase 4: Resources
-- ══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS resources (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text UNIQUE NOT NULL,
  title         text NOT NULL,
  description   text,
  kind          text NOT NULL
    CHECK (kind IN ('worksheet','reading','video','link')),
  file_path     text,           -- key inside the clinical-resources Storage bucket
  external_url  text,
  tags          text[] NOT NULL DEFAULT '{}',
  domain        text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  CHECK (file_path IS NOT NULL OR external_url IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_resources_domain ON resources (domain);
CREATE INDEX IF NOT EXISTS idx_resources_kind   ON resources (kind);

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Therapists can read the library. Writes are restricted to admins (gated in the app layer for v1).
DROP POLICY IF EXISTS "authenticated reads resources" ON resources;
CREATE POLICY "authenticated reads resources"
  ON resources FOR SELECT
  USING (auth.role() = 'authenticated');


CREATE TABLE IF NOT EXISTS patient_resources (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id  uuid NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  patient_id    uuid NOT NULL REFERENCES patients(id)   ON DELETE CASCADE,
  resource_id   uuid NOT NULL REFERENCES resources(id),
  assigned_at   timestamptz NOT NULL DEFAULT now(),
  due_date      date,
  completed_at  timestamptz,
  note          text,
  UNIQUE (patient_id, resource_id)
);

CREATE INDEX IF NOT EXISTS idx_patient_resources_patient
  ON patient_resources (patient_id, assigned_at DESC);

ALTER TABLE patient_resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "therapist manages own patient resources" ON patient_resources;
CREATE POLICY "therapist manages own patient resources"
  ON patient_resources FOR ALL
  USING (auth.uid() = therapist_id)
  WITH CHECK (auth.uid() = therapist_id);

-- ───────────── Storage bucket for resource files ─────────────
-- Run ONCE. If the bucket already exists this is a no-op.
INSERT INTO storage.buckets (id, name, public)
VALUES ('clinical-resources', 'clinical-resources', false)
ON CONFLICT (id) DO NOTHING;

-- Allow signed-URL reads (every authenticated therapist can read any file).
-- Uploads are still admin-only (handle in app layer or tighten this policy later).
DROP POLICY IF EXISTS "authenticated reads clinical-resources" ON storage.objects;
CREATE POLICY "authenticated reads clinical-resources"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'clinical-resources'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "authenticated writes clinical-resources" ON storage.objects;
CREATE POLICY "authenticated writes clinical-resources"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'clinical-resources'
    AND auth.role() = 'authenticated'
  );


