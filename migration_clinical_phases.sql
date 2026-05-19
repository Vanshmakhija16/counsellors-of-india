-- ══════════════════════════════════════════════════════════════════════════════
-- CLINICAL MODULE — Phases 1, 2b, 3, 4  (run in Supabase SQL editor)
-- Safe to run multiple times (idempotent via IF NOT EXISTS / ON CONFLICT).
-- ══════════════════════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────────────────────
-- PHASE 1 — Patient Intake
-- ─────────────────────────────────────────────────────────────────────────────

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
    CHECK (status IN ('draft', 'final')),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patient_intakes_therapist
  ON patient_intakes (therapist_id, patient_id);

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


-- ─────────────────────────────────────────────────────────────────────────────
-- PHASE 2b — Patient-administered screening (tokenized link)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS screening_invites (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id          uuid NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  patient_id            uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  instrument_id         uuid NOT NULL REFERENCES instruments(id),
  token                 text UNIQUE NOT NULL,
  expires_at            timestamptz NOT NULL,
  completed_session_id  uuid REFERENCES screening_sessions(id) ON DELETE SET NULL,
  created_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_screening_invites_token
  ON screening_invites (token);

CREATE INDEX IF NOT EXISTS idx_screening_invites_therapist
  ON screening_invites (therapist_id, created_at DESC);

ALTER TABLE screening_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "therapist manages own invites" ON screening_invites;
CREATE POLICY "therapist manages own invites"
  ON screening_invites FOR ALL
  USING (auth.uid() = therapist_id)
  WITH CHECK (auth.uid() = therapist_id);


-- SECURITY DEFINER RPC for anonymous patient submission
-- Called by /api/screening/submit without a therapist session.
CREATE OR REPLACE FUNCTION submit_screening_by_token(
  p_token     text,
  p_responses jsonb,   -- [{item_id, value}, ...]
  p_notes     text DEFAULT NULL
)
RETURNS uuid           -- returns the new screening_session id
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite    screening_invites%ROWTYPE;
  v_instrument instruments%ROWTYPE;
  v_total     int := 0;
  v_flagged   bool := false;
  v_severity  text;
  v_session_id uuid;
  v_item      record;
  v_value     int;
  v_band      jsonb;
BEGIN
  -- Lock and validate the invite
  SELECT * INTO v_invite
  FROM screening_invites
  WHERE token = p_token
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid token';
  END IF;
  IF v_invite.expires_at < now() THEN
    RAISE EXCEPTION 'Token expired';
  END IF;
  IF v_invite.completed_session_id IS NOT NULL THEN
    RAISE EXCEPTION 'Token already used';
  END IF;

  -- Fetch instrument
  SELECT * INTO v_instrument FROM instruments WHERE id = v_invite.instrument_id;

  -- Score responses
  FOR v_item IN
    SELECT ii.id, ii.is_critical
    FROM instrument_items ii
    WHERE ii.instrument_id = v_invite.instrument_id
  LOOP
    v_value := COALESCE(
      (p_responses @> jsonb_build_array(jsonb_build_object('item_id', v_item.id::text)))::int,
      0
    );
    -- Extract value from array of {item_id, value} objects
    SELECT COALESCE((elem->>'value')::int, 0) INTO v_value
    FROM jsonb_array_elements(p_responses) AS elem
    WHERE elem->>'item_id' = v_item.id::text
    LIMIT 1;

    v_total := v_total + v_value;
    IF v_item.is_critical AND v_value > 0 THEN
      v_flagged := true;
    END IF;
  END LOOP;

  -- Determine severity label
  v_severity := 'Unknown';
  FOR v_band IN SELECT * FROM jsonb_array_elements(v_instrument.severity_bands) LOOP
    IF v_total >= (v_band->>'min')::int AND v_total <= (v_band->>'max')::int THEN
      v_severity := v_band->>'label';
      EXIT;
    END IF;
  END LOOP;

  -- Insert session
  INSERT INTO screening_sessions (
    therapist_id, patient_id, instrument_id,
    total_score, severity_label, flagged, notes
  ) VALUES (
    v_invite.therapist_id, v_invite.patient_id, v_invite.instrument_id,
    v_total, v_severity, v_flagged, p_notes
  ) RETURNING id INTO v_session_id;

  -- Insert responses
  INSERT INTO screening_responses (session_id, item_id, value)
  SELECT v_session_id, (elem->>'item_id')::uuid, (elem->>'value')::int
  FROM jsonb_array_elements(p_responses) AS elem;

  -- Mark token used
  UPDATE screening_invites
  SET completed_session_id = v_session_id
  WHERE id = v_invite.id;

  RETURN v_session_id;
END;
$$;

GRANT EXECUTE ON FUNCTION submit_screening_by_token(text, jsonb, text) TO anon;


-- ─────────────────────────────────────────────────────────────────────────────
-- PHASE 3 — Diagnosis (DSM-5)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS dsm_disorders (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code             text UNIQUE NOT NULL,   -- e.g. '296.23'
  name             text NOT NULL,
  category         text NOT NULL,
  criteria_summary text                    -- paraphrased, not APA verbatim
);

ALTER TABLE dsm_disorders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anyone reads dsm disorders" ON dsm_disorders;
CREATE POLICY "anyone reads dsm disorders"
  ON dsm_disorders FOR SELECT
  USING (true);


CREATE TABLE IF NOT EXISTS dsm_criteria (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  disorder_id    uuid NOT NULL REFERENCES dsm_disorders(id) ON DELETE CASCADE,
  label          text NOT NULL,            -- paraphrased criterion text
  "group"        text NOT NULL,            -- 'A', 'B', etc.
  required_count int  NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_dsm_criteria_disorder
  ON dsm_criteria (disorder_id, "group");

ALTER TABLE dsm_criteria ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anyone reads dsm criteria" ON dsm_criteria;
CREATE POLICY "anyone reads dsm criteria"
  ON dsm_criteria FOR SELECT
  USING (true);


CREATE TABLE IF NOT EXISTS patient_diagnoses (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id     uuid NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  patient_id       uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  disorder_id      uuid NOT NULL REFERENCES dsm_disorders(id),
  status           text NOT NULL DEFAULT 'provisional'
    CHECK (status IN ('provisional', 'working', 'confirmed', 'ruled_out')),
  met_criteria_ids uuid[] NOT NULL DEFAULT '{}',
  onset_date       date,
  notes            text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
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


-- ── DSM-5 SEED (v1: 10 disorders, paraphrased criteria) ──────────────────────

-- Major Depressive Disorder (MDD)
INSERT INTO dsm_disorders (code, name, category, criteria_summary)
VALUES ('296.2x', 'Major Depressive Disorder', 'Depressive Disorders',
  'Characterised by five or more depressive symptoms over two weeks, including depressed mood or loss of interest, causing significant impairment.')
ON CONFLICT (code) DO NOTHING;

INSERT INTO dsm_criteria (disorder_id, label, "group", required_count)
SELECT d.id, v.label, v.grp, v.req
FROM dsm_disorders d,
(VALUES
  ('Depressed mood most of the day, nearly every day', 'A', 5),
  ('Markedly diminished interest or pleasure in most activities', 'A', 5),
  ('Significant weight change (>5%) or appetite disturbance', 'A', 5),
  ('Insomnia or hypersomnia', 'A', 5),
  ('Psychomotor agitation or retardation observable by others', 'A', 5),
  ('Fatigue or loss of energy', 'A', 5),
  ('Feelings of worthlessness or excessive guilt', 'A', 5),
  ('Difficulty concentrating or making decisions', 'A', 5),
  ('Recurrent thoughts of death or suicidal ideation', 'A', 5)
) AS v(label, grp, req)
WHERE d.code = '296.2x'
ON CONFLICT DO NOTHING;


-- Persistent Depressive Disorder (Dysthymia)
INSERT INTO dsm_disorders (code, name, category, criteria_summary)
VALUES ('300.4', 'Persistent Depressive Disorder', 'Depressive Disorders',
  'Depressed mood for most of the day, more days than not, for at least two years, with two or more associated symptoms.')
ON CONFLICT (code) DO NOTHING;

INSERT INTO dsm_criteria (disorder_id, label, "group", required_count)
SELECT d.id, v.label, v.grp, v.req
FROM dsm_disorders d,
(VALUES
  ('Depressed mood most of the day, more days than not, for ≥2 years', 'A', 1),
  ('Poor appetite or overeating', 'B', 2),
  ('Insomnia or hypersomnia', 'B', 2),
  ('Low energy or fatigue', 'B', 2),
  ('Low self-esteem', 'B', 2),
  ('Poor concentration or difficulty making decisions', 'B', 2),
  ('Feelings of hopelessness', 'B', 2)
) AS v(label, grp, req)
WHERE d.code = '300.4'
ON CONFLICT DO NOTHING;


-- Generalized Anxiety Disorder
INSERT INTO dsm_disorders (code, name, category, criteria_summary)
VALUES ('300.02', 'Generalized Anxiety Disorder', 'Anxiety Disorders',
  'Excessive anxiety and worry about multiple events for ≥6 months, difficult to control, with three or more associated symptoms.')
ON CONFLICT (code) DO NOTHING;

INSERT INTO dsm_criteria (disorder_id, label, "group", required_count)
SELECT d.id, v.label, v.grp, v.req
FROM dsm_disorders d,
(VALUES
  ('Excessive anxiety and worry about multiple topics for ≥6 months', 'A', 1),
  ('Restlessness or feeling keyed up or on edge', 'B', 3),
  ('Being easily fatigued', 'B', 3),
  ('Difficulty concentrating or mind going blank', 'B', 3),
  ('Irritability', 'B', 3),
  ('Muscle tension', 'B', 3),
  ('Sleep disturbance', 'B', 3)
) AS v(label, grp, req)
WHERE d.code = '300.02'
ON CONFLICT DO NOTHING;


-- Panic Disorder
INSERT INTO dsm_disorders (code, name, category, criteria_summary)
VALUES ('300.01', 'Panic Disorder', 'Anxiety Disorders',
  'Recurrent unexpected panic attacks followed by persistent concern about future attacks or maladaptive behavioural change for ≥1 month.')
ON CONFLICT (code) DO NOTHING;

INSERT INTO dsm_criteria (disorder_id, label, "group", required_count)
SELECT d.id, v.label, v.grp, v.req
FROM dsm_disorders d,
(VALUES
  ('Recurrent unexpected panic attacks', 'A', 1),
  ('Persistent concern about additional panic attacks or their consequences for ≥1 month', 'B', 1),
  ('Significant maladaptive change in behaviour related to attacks', 'B', 1)
) AS v(label, grp, req)
WHERE d.code = '300.01'
ON CONFLICT DO NOTHING;


-- Social Anxiety Disorder
INSERT INTO dsm_disorders (code, name, category, criteria_summary)
VALUES ('300.23', 'Social Anxiety Disorder', 'Anxiety Disorders',
  'Marked fear or anxiety about social situations where scrutiny by others may occur, leading to avoidance or endurance with intense distress.')
ON CONFLICT (code) DO NOTHING;

INSERT INTO dsm_criteria (disorder_id, label, "group", required_count)
SELECT d.id, v.label, v.grp, v.req
FROM dsm_disorders d,
(VALUES
  ('Marked fear or anxiety about social situations with possible scrutiny', 'A', 1),
  ('Fear of acting in a way that will be negatively evaluated', 'B', 1),
  ('Social situations almost always provoke fear or anxiety', 'C', 1),
  ('Social situations are avoided or endured with intense distress', 'D', 1),
  ('Fear is disproportionate to the actual threat', 'E', 1),
  ('Persists for ≥6 months', 'F', 1)
) AS v(label, grp, req)
WHERE d.code = '300.23'
ON CONFLICT DO NOTHING;


-- PTSD
INSERT INTO dsm_disorders (code, name, category, criteria_summary)
VALUES ('309.81', 'Post-Traumatic Stress Disorder', 'Trauma- and Stressor-Related Disorders',
  'Exposure to actual or threatened death, serious injury, or sexual violence, with intrusion, avoidance, negative alterations in cognition/mood, and hyperarousal lasting >1 month.')
ON CONFLICT (code) DO NOTHING;

INSERT INTO dsm_criteria (disorder_id, label, "group", required_count)
SELECT d.id, v.label, v.grp, v.req
FROM dsm_disorders d,
(VALUES
  ('Exposure to actual/threatened trauma (direct, witnessed, or indirect)', 'A', 1),
  ('Intrusive memories', 'B', 1),
  ('Trauma-related nightmares', 'B', 1),
  ('Dissociative reactions / flashbacks', 'B', 1),
  ('Intense psychological distress to trauma cues', 'B', 1),
  ('Physiological reactions to trauma cues', 'B', 1),
  ('Avoidance of distressing trauma-related thoughts or feelings', 'C', 1),
  ('Avoidance of external reminders', 'C', 1),
  ('Negative alterations in cognition or mood (2+ symptoms)', 'D', 2),
  ('Marked alterations in arousal and reactivity (2+ symptoms)', 'E', 2)
) AS v(label, grp, req)
WHERE d.code = '309.81'
ON CONFLICT DO NOTHING;


-- OCD
INSERT INTO dsm_disorders (code, name, category, criteria_summary)
VALUES ('300.3', 'Obsessive-Compulsive Disorder', 'Obsessive-Compulsive and Related Disorders',
  'Presence of obsessions, compulsions, or both, that are time-consuming (>1 hr/day) or cause significant distress or impairment.')
ON CONFLICT (code) DO NOTHING;

INSERT INTO dsm_criteria (disorder_id, label, "group", required_count)
SELECT d.id, v.label, v.grp, v.req
FROM dsm_disorders d,
(VALUES
  ('Obsessions and/or compulsions present', 'A', 1),
  ('Obsessions/compulsions are time-consuming (>1 hr/day) or cause distress/impairment', 'B', 1)
) AS v(label, grp, req)
WHERE d.code = '300.3'
ON CONFLICT DO NOTHING;


-- ADHD
INSERT INTO dsm_disorders (code, name, category, criteria_summary)
VALUES ('314.01', 'Attention-Deficit/Hyperactivity Disorder', 'Neurodevelopmental Disorders',
  'Persistent pattern of inattention and/or hyperactivity-impulsivity interfering with functioning, with onset before age 12.')
ON CONFLICT (code) DO NOTHING;

INSERT INTO dsm_criteria (disorder_id, label, "group", required_count)
SELECT d.id, v.label, v.grp, v.req
FROM dsm_disorders d,
(VALUES
  ('≥6 inattention symptoms present for ≥6 months (≥5 if ≥17 yrs)', 'A', 1),
  ('≥6 hyperactivity-impulsivity symptoms present for ≥6 months (≥5 if ≥17 yrs)', 'A', 1),
  ('Symptoms present in ≥2 settings', 'B', 1),
  ('Clear evidence symptoms interfere with functioning', 'C', 1),
  ('Symptom onset before age 12', 'D', 1)
) AS v(label, grp, req)
WHERE d.code = '314.01'
ON CONFLICT DO NOTHING;


-- Bipolar I
INSERT INTO dsm_disorders (code, name, category, criteria_summary)
VALUES ('296.41', 'Bipolar I Disorder', 'Bipolar and Related Disorders',
  'Defined by at least one manic episode lasting ≥7 days (or any duration if hospitalised), sufficient alone for Bipolar I diagnosis.')
ON CONFLICT (code) DO NOTHING;

INSERT INTO dsm_criteria (disorder_id, label, "group", required_count)
SELECT d.id, v.label, v.grp, v.req
FROM dsm_disorders d,
(VALUES
  ('Full manic episode lasting ≥7 days or requiring hospitalisation', 'A', 1),
  ('Manic episode not attributable to substances or medical condition', 'B', 1)
) AS v(label, grp, req)
WHERE d.code = '296.41'
ON CONFLICT DO NOTHING;


-- Bipolar II
INSERT INTO dsm_disorders (code, name, category, criteria_summary)
VALUES ('296.89', 'Bipolar II Disorder', 'Bipolar and Related Disorders',
  'Characterised by at least one hypomanic episode and at least one major depressive episode, with no full manic episodes.')
ON CONFLICT (code) DO NOTHING;

INSERT INTO dsm_criteria (disorder_id, label, "group", required_count)
SELECT d.id, v.label, v.grp, v.req
FROM dsm_disorders d,
(VALUES
  ('At least one hypomanic episode (≥4 consecutive days)', 'A', 1),
  ('At least one major depressive episode', 'B', 1),
  ('No full manic episode ever', 'C', 1)
) AS v(label, grp, req)
WHERE d.code = '296.89'
ON CONFLICT DO NOTHING;


-- ─────────────────────────────────────────────────────────────────────────────
-- PHASE 4 — Resources
-- ─────────────────────────────────────────────────────────────────────────────

-- Add role column to therapists (admin gating for resource upload)
ALTER TABLE therapists
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'therapist'
    CHECK (role IN ('therapist', 'admin'));

-- Shared resource library (admin-uploaded)
CREATE TABLE IF NOT EXISTS resources (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         text UNIQUE NOT NULL,
  title        text NOT NULL,
  description  text,
  kind         text NOT NULL DEFAULT 'worksheet'
    CHECK (kind IN ('worksheet', 'reading', 'video', 'link')),
  file_path    text,          -- Storage path in 'clinical-resources' bucket
  external_url text,          -- For 'link' / 'video' kinds
  tags         text[] NOT NULL DEFAULT '{}',
  domain       text,          -- e.g. 'depression', 'anxiety', 'general'
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_resources_domain
  ON resources (domain, kind);

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Any authenticated therapist can read the library
DROP POLICY IF EXISTS "therapist reads resources" ON resources;
CREATE POLICY "therapist reads resources"
  ON resources FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only admins can write resources (enforced at app layer too)
DROP POLICY IF EXISTS "admin manages resources" ON resources;
CREATE POLICY "admin manages resources"
  ON resources FOR ALL
  USING (
    EXISTS (SELECT 1 FROM therapists t WHERE t.id = auth.uid() AND t.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM therapists t WHERE t.id = auth.uid() AND t.role = 'admin')
  );


-- Per-patient resource assignments
CREATE TABLE IF NOT EXISTS patient_resources (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id uuid NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  patient_id   uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  resource_id  uuid NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  assigned_at  timestamptz NOT NULL DEFAULT now(),
  due_date     date,
  completed_at timestamptz,
  note         text,
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


-- ─────────────────────────────────────────────────────────────────────────────
-- CROSS-CUTTING — Soft-delete & audit log
-- ─────────────────────────────────────────────────────────────────────────────

-- Soft-delete columns
ALTER TABLE patients          ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;
ALTER TABLE screening_sessions ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;

-- Update RLS to exclude soft-deleted rows
DROP POLICY IF EXISTS "therapist manages own patients" ON patients;
CREATE POLICY "therapist manages own patients"
  ON patients FOR ALL
  USING (auth.uid() = therapist_id AND deleted_at IS NULL)
  WITH CHECK (auth.uid() = therapist_id);

-- Audit log
CREATE TABLE IF NOT EXISTS clinical_audit (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id uuid NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  action       text NOT NULL,    -- 'create' | 'update' | 'delete' | 'finalize'
  target_table text NOT NULL,
  target_id    uuid NOT NULL,
  at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clinical_audit_therapist
  ON clinical_audit (therapist_id, at DESC);

ALTER TABLE clinical_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "therapist reads own audit" ON clinical_audit;
CREATE POLICY "therapist reads own audit"
  ON clinical_audit FOR SELECT
  USING (auth.uid() = therapist_id);

-- Only server-side (service role) inserts into audit; no client INSERT policy.
