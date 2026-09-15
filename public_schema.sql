--
-- PostgreSQL database dump
--

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: submit_screening_by_token(text, jsonb, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.submit_screening_by_token(p_token text, p_responses jsonb, p_notes text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: appointments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.appointments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    therapist_id uuid NOT NULL,
    client_id uuid,
    client_name text NOT NULL,
    client_email text NOT NULL,
    client_phone text,
    scheduled_at timestamp with time zone NOT NULL,
    duration_mins integer DEFAULT 50,
    status text DEFAULT 'upcoming'::text,
    session_type text DEFAULT 'online'::text,
    meeting_link text,
    therapist_notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    patient_id uuid,
    service_name text,
    service_price integer,
    txnid text,
    hold_until timestamp with time zone,
    payu_id text,
    slots_blocked integer DEFAULT 1 NOT NULL,
    CONSTRAINT appointments_session_type_check CHECK ((session_type = ANY (ARRAY['online'::text, 'in_person'::text]))),
    CONSTRAINT appointments_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'pending_payment'::text, 'upcoming'::text, 'confirmed'::text, 'completed'::text, 'cancelled'::text, 'payment_failed'::text, 'expired'::text])))
);


--
-- Name: COLUMN appointments.slots_blocked; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.appointments.slots_blocked IS 'Number of consecutive therapist grid slots this appointment occupies. 1 for services that fit within one slot; 2+ for longer services. Used by /api/booked-slots to block all overlapping slot start times.';


--
-- Name: assessment_options; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assessment_options (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    scale_id text,
    option_text text NOT NULL,
    score_value integer NOT NULL,
    display_order integer NOT NULL
);


--
-- Name: assessment_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assessment_questions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    scale_id text,
    question_number integer NOT NULL,
    question_text text NOT NULL,
    is_reverse_scored boolean DEFAULT false,
    category text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: assessment_scales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assessment_scales (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    timeframe text,
    max_score integer,
    scoring_interpretation jsonb
);


--
-- Name: clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    therapist_id uuid NOT NULL,
    full_name text NOT NULL,
    email text,
    phone text,
    date_of_birth date,
    gender text,
    emergency_contact text,
    general_notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: contact_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact_submissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    concern text,
    status text DEFAULT 'new'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT contact_submissions_status_check CHECK ((status = ANY (ARRAY['new'::text, 'read'::text, 'replied'::text, 'archived'::text])))
);


--
-- Name: TABLE contact_submissions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.contact_submissions IS 'Public /contact page form submissions (Name, Email, Mobile required; Concern optional).';


--
-- Name: dsm_criteria; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dsm_criteria (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    disorder_id uuid NOT NULL,
    "group" text NOT NULL,
    label text NOT NULL,
    required_count integer DEFAULT 1 NOT NULL
);


--
-- Name: dsm_disorders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dsm_disorders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    category text NOT NULL,
    criteria_summary text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: feedbacks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.feedbacks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    therapist_id uuid NOT NULL,
    client_name text NOT NULL,
    client_role text,
    rating smallint NOT NULL,
    text text NOT NULL,
    is_published boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT feedbacks_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: instrument_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.instrument_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    instrument_id uuid NOT NULL,
    "position" integer NOT NULL,
    prompt text NOT NULL,
    is_critical boolean DEFAULT false NOT NULL
);


--
-- Name: instruments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.instruments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    short_name text NOT NULL,
    description text,
    domain text NOT NULL,
    recall_window text,
    min_score integer DEFAULT 0 NOT NULL,
    max_score integer NOT NULL,
    severity_bands jsonb NOT NULL,
    options jsonb NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: patient_diagnoses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.patient_diagnoses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    therapist_id uuid NOT NULL,
    patient_id uuid NOT NULL,
    disorder_id uuid NOT NULL,
    status text NOT NULL,
    met_criteria_ids uuid[] DEFAULT '{}'::uuid[] NOT NULL,
    onset_date date,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT patient_diagnoses_status_check CHECK ((status = ANY (ARRAY['provisional'::text, 'working'::text, 'confirmed'::text, 'ruled_out'::text])))
);


--
-- Name: patient_intakes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.patient_intakes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    therapist_id uuid NOT NULL,
    patient_id uuid NOT NULL,
    presenting_concern text,
    history jsonb,
    family jsonb,
    social jsonb,
    risk jsonb,
    status text DEFAULT 'draft'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    CONSTRAINT patient_intakes_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'final'::text])))
);


--
-- Name: patient_resources; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.patient_resources (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    therapist_id uuid NOT NULL,
    patient_id uuid NOT NULL,
    resource_id uuid NOT NULL,
    assigned_at timestamp with time zone DEFAULT now() NOT NULL,
    due_date date,
    completed_at timestamp with time zone,
    note text
);


--
-- Name: patients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.patients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    therapist_id uuid NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    dob date,
    gender text,
    pronouns text,
    marital_status text,
    email text,
    phone text,
    address text,
    emergency_contact_name text,
    emergency_contact_phone text,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT patients_status_check CHECK ((status = ANY (ARRAY['active'::text, 'archived'::text, 'discharged'::text])))
);


--
-- Name: resources; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resources (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    description text,
    kind text NOT NULL,
    file_path text,
    external_url text,
    tags text[] DEFAULT '{}'::text[] NOT NULL,
    domain text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT resources_check CHECK (((file_path IS NOT NULL) OR (external_url IS NOT NULL))),
    CONSTRAINT resources_kind_check CHECK ((kind = ANY (ARRAY['worksheet'::text, 'reading'::text, 'video'::text, 'link'::text])))
);


--
-- Name: screening_invites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.screening_invites (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    therapist_id uuid NOT NULL,
    patient_id uuid NOT NULL,
    instrument_id text NOT NULL,
    token text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    completed_session_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: screening_responses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.screening_responses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    item_id uuid NOT NULL,
    value integer NOT NULL
);


--
-- Name: screening_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.screening_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    therapist_id uuid NOT NULL,
    patient_id uuid NOT NULL,
    instrument_id text NOT NULL,
    total_score integer NOT NULL,
    severity_label text NOT NULL,
    flagged boolean DEFAULT false NOT NULL,
    notes text,
    administered_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: session_notes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session_notes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    appointment_id uuid,
    therapist_id uuid NOT NULL,
    client_id uuid,
    note_text text NOT NULL,
    is_private boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: signup_attempts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.signup_attempts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    phone text,
    full_name text,
    username text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: slots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.slots (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    therapist_id uuid NOT NULL,
    day_of_week integer NOT NULL,
    start_time time without time zone NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT slots_day_of_week_check CHECK (((day_of_week >= 0) AND (day_of_week <= 6)))
);


--
-- Name: therapists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.therapists (
    id uuid NOT NULL,
    username text NOT NULL,
    full_name text NOT NULL,
    bio text,
    photo_url text,
    specialties text[] DEFAULT '{}'::text[],
    languages text[] DEFAULT '{English,Hindi}'::text[],
    fee_per_session integer DEFAULT 0,
    session_duration_mins integer DEFAULT 50,
    timezone text DEFAULT 'Asia/Kolkata'::text,
    city text,
    phone text,
    website text,
    plan text DEFAULT 'free'::text,
    booking_count integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    template_id text DEFAULT 'classic'::text,
    color_id text DEFAULT 'teal'::text,
    title text,
    is_profile_complete boolean DEFAULT false,
    years_experience integer,
    session_mode text DEFAULT 'both'::text,
    email text,
    availability jsonb,
    hidden_sections text[] DEFAULT '{}'::text[] NOT NULL,
    profile_content jsonb DEFAULT '{}'::jsonb,
    plan_activated_at timestamp with time zone,
    subscription_plan text,
    subscription_status text,
    subscription_expires_at timestamp with time zone,
    razorpay_payment_id text,
    razorpay_customer_id text,
    razorpay_subscription_id text,
    highest_plan text DEFAULT 'free'::text,
    template_locked_until timestamp with time zone,
    availability_buffer_mins integer DEFAULT 0,
    availability_exceptions jsonb DEFAULT '{}'::jsonb,
    section_order jsonb,
    instagram text,
    linkedin text,
    whatsapp text,
    setup_complete boolean DEFAULT false NOT NULL,
    meet_link text,
    total_sessions integer,
    stripe_account_id text,
    stripe_onboarded boolean DEFAULT false NOT NULL,
    stripe_charges_enabled boolean DEFAULT false NOT NULL,
    last_plan_payment_gateway text,
    last_plan_payment_ref text
);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: appointments appointments_therapist_id_scheduled_at_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_therapist_id_scheduled_at_key UNIQUE (therapist_id, scheduled_at);


--
-- Name: assessment_options assessment_options_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_options
    ADD CONSTRAINT assessment_options_pkey PRIMARY KEY (id);


--
-- Name: assessment_options assessment_options_scale_id_display_order_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_options
    ADD CONSTRAINT assessment_options_scale_id_display_order_key UNIQUE (scale_id, display_order);


--
-- Name: assessment_questions assessment_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_questions
    ADD CONSTRAINT assessment_questions_pkey PRIMARY KEY (id);


--
-- Name: assessment_questions assessment_questions_scale_id_question_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_questions
    ADD CONSTRAINT assessment_questions_scale_id_question_number_key UNIQUE (scale_id, question_number);


--
-- Name: assessment_scales assessment_scales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_scales
    ADD CONSTRAINT assessment_scales_pkey PRIMARY KEY (id);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: contact_submissions contact_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_submissions
    ADD CONSTRAINT contact_submissions_pkey PRIMARY KEY (id);


--
-- Name: dsm_criteria dsm_criteria_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dsm_criteria
    ADD CONSTRAINT dsm_criteria_pkey PRIMARY KEY (id);


--
-- Name: dsm_disorders dsm_disorders_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dsm_disorders
    ADD CONSTRAINT dsm_disorders_code_key UNIQUE (code);


--
-- Name: dsm_disorders dsm_disorders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dsm_disorders
    ADD CONSTRAINT dsm_disorders_pkey PRIMARY KEY (id);


--
-- Name: feedbacks feedbacks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedbacks
    ADD CONSTRAINT feedbacks_pkey PRIMARY KEY (id);


--
-- Name: instrument_items instrument_items_instrument_id_position_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.instrument_items
    ADD CONSTRAINT instrument_items_instrument_id_position_key UNIQUE (instrument_id, "position");


--
-- Name: instrument_items instrument_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.instrument_items
    ADD CONSTRAINT instrument_items_pkey PRIMARY KEY (id);


--
-- Name: instruments instruments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.instruments
    ADD CONSTRAINT instruments_pkey PRIMARY KEY (id);


--
-- Name: instruments instruments_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.instruments
    ADD CONSTRAINT instruments_slug_key UNIQUE (slug);


--
-- Name: patient_diagnoses patient_diagnoses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_diagnoses
    ADD CONSTRAINT patient_diagnoses_pkey PRIMARY KEY (id);


--
-- Name: patient_intakes patient_intakes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_intakes
    ADD CONSTRAINT patient_intakes_pkey PRIMARY KEY (id);


--
-- Name: patient_resources patient_resources_patient_id_resource_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_resources
    ADD CONSTRAINT patient_resources_patient_id_resource_id_key UNIQUE (patient_id, resource_id);


--
-- Name: patient_resources patient_resources_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_resources
    ADD CONSTRAINT patient_resources_pkey PRIMARY KEY (id);


--
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (id);


--
-- Name: resources resources_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_pkey PRIMARY KEY (id);


--
-- Name: resources resources_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_slug_key UNIQUE (slug);


--
-- Name: screening_invites screening_invites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.screening_invites
    ADD CONSTRAINT screening_invites_pkey PRIMARY KEY (id);


--
-- Name: screening_invites screening_invites_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.screening_invites
    ADD CONSTRAINT screening_invites_token_key UNIQUE (token);


--
-- Name: screening_responses screening_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.screening_responses
    ADD CONSTRAINT screening_responses_pkey PRIMARY KEY (id);


--
-- Name: screening_responses screening_responses_session_id_item_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.screening_responses
    ADD CONSTRAINT screening_responses_session_id_item_id_key UNIQUE (session_id, item_id);


--
-- Name: screening_sessions screening_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.screening_sessions
    ADD CONSTRAINT screening_sessions_pkey PRIMARY KEY (id);


--
-- Name: session_notes session_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_notes
    ADD CONSTRAINT session_notes_pkey PRIMARY KEY (id);


--
-- Name: signup_attempts signup_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signup_attempts
    ADD CONSTRAINT signup_attempts_pkey PRIMARY KEY (id);


--
-- Name: slots slots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.slots
    ADD CONSTRAINT slots_pkey PRIMARY KEY (id);


--
-- Name: therapists therapists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.therapists
    ADD CONSTRAINT therapists_pkey PRIMARY KEY (id);


--
-- Name: therapists therapists_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.therapists
    ADD CONSTRAINT therapists_username_key UNIQUE (username);


--
-- Name: appointments_therapist_id_scheduled_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX appointments_therapist_id_scheduled_at_idx ON public.appointments USING btree (therapist_id, scheduled_at);


--
-- Name: clients_therapist_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX clients_therapist_id_idx ON public.clients USING btree (therapist_id);


--
-- Name: idx_appointments_hold_until; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointments_hold_until ON public.appointments USING btree (hold_until) WHERE (status = 'pending_payment'::text);


--
-- Name: idx_appointments_slot_lookup; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointments_slot_lookup ON public.appointments USING btree (therapist_id, scheduled_at, status);


--
-- Name: idx_contact_submissions_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contact_submissions_created_at ON public.contact_submissions USING btree (created_at DESC);


--
-- Name: idx_dsm_criteria_disorder; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dsm_criteria_disorder ON public.dsm_criteria USING btree (disorder_id, "group");


--
-- Name: idx_feedbacks_therapist; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_feedbacks_therapist ON public.feedbacks USING btree (therapist_id, is_published, created_at DESC);


--
-- Name: idx_instrument_items_instrument; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_instrument_items_instrument ON public.instrument_items USING btree (instrument_id, "position");


--
-- Name: idx_patient_diagnoses_patient; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_patient_diagnoses_patient ON public.patient_diagnoses USING btree (patient_id, created_at DESC);


--
-- Name: idx_patient_intakes_patient_latest; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_patient_intakes_patient_latest ON public.patient_intakes USING btree (patient_id, created_at DESC);


--
-- Name: idx_patient_intakes_therapist; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_patient_intakes_therapist ON public.patient_intakes USING btree (therapist_id, updated_at DESC);


--
-- Name: idx_patient_resources_patient; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_patient_resources_patient ON public.patient_resources USING btree (patient_id, assigned_at DESC);


--
-- Name: idx_patients_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_patients_name ON public.patients USING btree (therapist_id, lower(last_name), lower(first_name));


--
-- Name: idx_patients_therapist; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_patients_therapist ON public.patients USING btree (therapist_id, status, created_at DESC);


--
-- Name: idx_resources_domain; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_resources_domain ON public.resources USING btree (domain);


--
-- Name: idx_resources_kind; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_resources_kind ON public.resources USING btree (kind);


--
-- Name: idx_screening_invites_patient; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_screening_invites_patient ON public.screening_invites USING btree (patient_id, created_at DESC);


--
-- Name: idx_screening_invites_therapist; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_screening_invites_therapist ON public.screening_invites USING btree (therapist_id, created_at DESC);


--
-- Name: idx_screening_invites_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_screening_invites_token ON public.screening_invites USING btree (token);


--
-- Name: idx_screening_sessions_patient; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_screening_sessions_patient ON public.screening_sessions USING btree (patient_id, administered_at DESC);


--
-- Name: idx_screening_sessions_therapist; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_screening_sessions_therapist ON public.screening_sessions USING btree (therapist_id, administered_at DESC);


--
-- Name: session_notes_appointment_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX session_notes_appointment_id_idx ON public.session_notes USING btree (appointment_id);


--
-- Name: signup_attempts_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX signup_attempts_created_at_idx ON public.signup_attempts USING btree (created_at DESC);


--
-- Name: signup_attempts_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX signup_attempts_email_idx ON public.signup_attempts USING btree (email);


--
-- Name: slots_therapist_id_day_of_week_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX slots_therapist_id_day_of_week_idx ON public.slots USING btree (therapist_id, day_of_week);


--
-- Name: therapists_username_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX therapists_username_idx ON public.therapists USING btree (username);


--
-- Name: uq_patient_intakes_patient_version; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_patient_intakes_patient_version ON public.patient_intakes USING btree (patient_id, version);


--
-- Name: patient_diagnoses patient_diagnoses_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER patient_diagnoses_set_updated_at BEFORE UPDATE ON public.patient_diagnoses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: patient_intakes patient_intakes_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER patient_intakes_set_updated_at BEFORE UPDATE ON public.patient_intakes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: patients patients_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER patients_set_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: appointments appointments_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: appointments appointments_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE SET NULL;


--
-- Name: appointments appointments_therapist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_therapist_id_fkey FOREIGN KEY (therapist_id) REFERENCES public.therapists(id) ON DELETE CASCADE;


--
-- Name: assessment_options assessment_options_scale_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_options
    ADD CONSTRAINT assessment_options_scale_id_fkey FOREIGN KEY (scale_id) REFERENCES public.assessment_scales(id) ON DELETE CASCADE;


--
-- Name: assessment_questions assessment_questions_scale_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_questions
    ADD CONSTRAINT assessment_questions_scale_id_fkey FOREIGN KEY (scale_id) REFERENCES public.assessment_scales(id) ON DELETE CASCADE;


--
-- Name: clients clients_therapist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_therapist_id_fkey FOREIGN KEY (therapist_id) REFERENCES public.therapists(id) ON DELETE CASCADE;


--
-- Name: dsm_criteria dsm_criteria_disorder_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dsm_criteria
    ADD CONSTRAINT dsm_criteria_disorder_id_fkey FOREIGN KEY (disorder_id) REFERENCES public.dsm_disorders(id) ON DELETE CASCADE;


--
-- Name: feedbacks feedbacks_therapist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedbacks
    ADD CONSTRAINT feedbacks_therapist_id_fkey FOREIGN KEY (therapist_id) REFERENCES public.therapists(id) ON DELETE CASCADE;


--
-- Name: instrument_items instrument_items_instrument_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.instrument_items
    ADD CONSTRAINT instrument_items_instrument_id_fkey FOREIGN KEY (instrument_id) REFERENCES public.instruments(id) ON DELETE CASCADE;


--
-- Name: patient_diagnoses patient_diagnoses_disorder_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_diagnoses
    ADD CONSTRAINT patient_diagnoses_disorder_id_fkey FOREIGN KEY (disorder_id) REFERENCES public.dsm_disorders(id);


--
-- Name: patient_diagnoses patient_diagnoses_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_diagnoses
    ADD CONSTRAINT patient_diagnoses_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;


--
-- Name: patient_diagnoses patient_diagnoses_therapist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_diagnoses
    ADD CONSTRAINT patient_diagnoses_therapist_id_fkey FOREIGN KEY (therapist_id) REFERENCES public.therapists(id) ON DELETE CASCADE;


--
-- Name: patient_intakes patient_intakes_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_intakes
    ADD CONSTRAINT patient_intakes_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;


--
-- Name: patient_intakes patient_intakes_therapist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_intakes
    ADD CONSTRAINT patient_intakes_therapist_id_fkey FOREIGN KEY (therapist_id) REFERENCES public.therapists(id) ON DELETE CASCADE;


--
-- Name: patient_resources patient_resources_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_resources
    ADD CONSTRAINT patient_resources_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;


--
-- Name: patient_resources patient_resources_resource_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_resources
    ADD CONSTRAINT patient_resources_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id);


--
-- Name: patient_resources patient_resources_therapist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_resources
    ADD CONSTRAINT patient_resources_therapist_id_fkey FOREIGN KEY (therapist_id) REFERENCES public.therapists(id) ON DELETE CASCADE;


--
-- Name: patients patients_therapist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_therapist_id_fkey FOREIGN KEY (therapist_id) REFERENCES public.therapists(id) ON DELETE CASCADE;


--
-- Name: screening_invites screening_invites_completed_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.screening_invites
    ADD CONSTRAINT screening_invites_completed_session_id_fkey FOREIGN KEY (completed_session_id) REFERENCES public.screening_sessions(id) ON DELETE SET NULL;


--
-- Name: screening_invites screening_invites_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.screening_invites
    ADD CONSTRAINT screening_invites_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;


--
-- Name: screening_invites screening_invites_therapist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.screening_invites
    ADD CONSTRAINT screening_invites_therapist_id_fkey FOREIGN KEY (therapist_id) REFERENCES public.therapists(id) ON DELETE CASCADE;


--
-- Name: screening_responses screening_responses_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.screening_responses
    ADD CONSTRAINT screening_responses_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.instrument_items(id);


--
-- Name: screening_responses screening_responses_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.screening_responses
    ADD CONSTRAINT screening_responses_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.screening_sessions(id) ON DELETE CASCADE;


--
-- Name: screening_sessions screening_sessions_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.screening_sessions
    ADD CONSTRAINT screening_sessions_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;


--
-- Name: screening_sessions screening_sessions_therapist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.screening_sessions
    ADD CONSTRAINT screening_sessions_therapist_id_fkey FOREIGN KEY (therapist_id) REFERENCES public.therapists(id) ON DELETE CASCADE;


--
-- Name: session_notes session_notes_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_notes
    ADD CONSTRAINT session_notes_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE CASCADE;


--
-- Name: session_notes session_notes_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_notes
    ADD CONSTRAINT session_notes_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: session_notes session_notes_therapist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_notes
    ADD CONSTRAINT session_notes_therapist_id_fkey FOREIGN KEY (therapist_id) REFERENCES public.therapists(id) ON DELETE CASCADE;


--
-- Name: slots slots_therapist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.slots
    ADD CONSTRAINT slots_therapist_id_fkey FOREIGN KEY (therapist_id) REFERENCES public.therapists(id) ON DELETE CASCADE;


--
-- Name: therapists therapists_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.therapists
    ADD CONSTRAINT therapists_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: assessment_options Allow public read access to options; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access to options" ON public.assessment_options FOR SELECT USING (true);


--
-- Name: assessment_questions Allow public read access to questions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access to questions" ON public.assessment_questions FOR SELECT USING (true);


--
-- Name: assessment_scales Allow public read access to scales; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access to scales" ON public.assessment_scales FOR SELECT USING (true);


--
-- Name: signup_attempts anyone can log a signup attempt; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "anyone can log a signup attempt" ON public.signup_attempts FOR INSERT TO authenticated, anon WITH CHECK (true);


--
-- Name: dsm_criteria anyone reads dsm criteria; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "anyone reads dsm criteria" ON public.dsm_criteria FOR SELECT USING (true);


--
-- Name: dsm_disorders anyone reads dsm disorders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "anyone reads dsm disorders" ON public.dsm_disorders FOR SELECT USING (true);


--
-- Name: instrument_items anyone reads instrument items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "anyone reads instrument items" ON public.instrument_items FOR SELECT USING (true);


--
-- Name: instruments anyone reads instruments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "anyone reads instruments" ON public.instruments FOR SELECT USING ((is_active = true));


--
-- Name: screening_invites anyone reads invite by token; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "anyone reads invite by token" ON public.screening_invites FOR SELECT USING (true);


--
-- Name: appointments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

--
-- Name: appointments appointments: own read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "appointments: own read" ON public.appointments FOR SELECT USING ((therapist_id = auth.uid()));


--
-- Name: appointments appointments: own update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "appointments: own update" ON public.appointments FOR UPDATE USING ((therapist_id = auth.uid()));


--
-- Name: appointments appointments: public insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "appointments: public insert" ON public.appointments FOR INSERT WITH CHECK (true);


--
-- Name: assessment_options; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.assessment_options ENABLE ROW LEVEL SECURITY;

--
-- Name: assessment_questions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;

--
-- Name: assessment_scales; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.assessment_scales ENABLE ROW LEVEL SECURITY;

--
-- Name: resources authenticated reads resources; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "authenticated reads resources" ON public.resources FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: clients; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

--
-- Name: clients clients: own only; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "clients: own only" ON public.clients USING ((therapist_id = auth.uid()));


--
-- Name: dsm_criteria; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.dsm_criteria ENABLE ROW LEVEL SECURITY;

--
-- Name: dsm_disorders; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.dsm_disorders ENABLE ROW LEVEL SECURITY;

--
-- Name: feedbacks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

--
-- Name: instrument_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.instrument_items ENABLE ROW LEVEL SECURITY;

--
-- Name: instruments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.instruments ENABLE ROW LEVEL SECURITY;

--
-- Name: session_notes notes: own only; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "notes: own only" ON public.session_notes USING ((therapist_id = auth.uid()));


--
-- Name: patient_diagnoses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.patient_diagnoses ENABLE ROW LEVEL SECURITY;

--
-- Name: patient_intakes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.patient_intakes ENABLE ROW LEVEL SECURITY;

--
-- Name: patient_resources; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.patient_resources ENABLE ROW LEVEL SECURITY;

--
-- Name: patients; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

--
-- Name: patients patients public insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "patients public insert" ON public.patients FOR INSERT WITH CHECK (true);


--
-- Name: feedbacks public read published feedback; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "public read published feedback" ON public.feedbacks FOR SELECT USING ((is_published = true));


--
-- Name: resources; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

--
-- Name: screening_invites; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.screening_invites ENABLE ROW LEVEL SECURITY;

--
-- Name: screening_responses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.screening_responses ENABLE ROW LEVEL SECURITY;

--
-- Name: screening_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.screening_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: session_notes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.session_notes ENABLE ROW LEVEL SECURITY;

--
-- Name: signup_attempts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.signup_attempts ENABLE ROW LEVEL SECURITY;

--
-- Name: slots; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.slots ENABLE ROW LEVEL SECURITY;

--
-- Name: slots slots: own write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "slots: own write" ON public.slots USING ((therapist_id = auth.uid()));


--
-- Name: slots slots: public read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "slots: public read" ON public.slots FOR SELECT USING ((is_active = true));


--
-- Name: patient_diagnoses therapist manages own diagnoses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "therapist manages own diagnoses" ON public.patient_diagnoses USING ((auth.uid() = therapist_id)) WITH CHECK ((auth.uid() = therapist_id));


--
-- Name: feedbacks therapist manages own feedback; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "therapist manages own feedback" ON public.feedbacks USING ((auth.uid() = therapist_id)) WITH CHECK ((auth.uid() = therapist_id));


--
-- Name: patient_intakes therapist manages own intakes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "therapist manages own intakes" ON public.patient_intakes USING ((auth.uid() = therapist_id)) WITH CHECK ((auth.uid() = therapist_id));


--
-- Name: patient_resources therapist manages own patient resources; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "therapist manages own patient resources" ON public.patient_resources USING ((auth.uid() = therapist_id)) WITH CHECK ((auth.uid() = therapist_id));


--
-- Name: patients therapist manages own patients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "therapist manages own patients" ON public.patients USING ((auth.uid() = therapist_id)) WITH CHECK ((auth.uid() = therapist_id));


--
-- Name: screening_invites therapist manages own screening invites; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "therapist manages own screening invites" ON public.screening_invites USING ((auth.uid() = therapist_id)) WITH CHECK ((auth.uid() = therapist_id));


--
-- Name: screening_responses therapist manages own screening responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "therapist manages own screening responses" ON public.screening_responses USING ((EXISTS ( SELECT 1
   FROM public.screening_sessions s
  WHERE ((s.id = screening_responses.session_id) AND (s.therapist_id = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.screening_sessions s
  WHERE ((s.id = screening_responses.session_id) AND (s.therapist_id = auth.uid())))));


--
-- Name: screening_sessions therapist manages own screening sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "therapist manages own screening sessions" ON public.screening_sessions USING ((auth.uid() = therapist_id)) WITH CHECK ((auth.uid() = therapist_id));


--
-- Name: therapists therapist: public read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "therapist: public read" ON public.therapists FOR SELECT USING ((is_active = true));


--
-- Name: therapists; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.therapists ENABLE ROW LEVEL SECURITY;

--
-- Name: therapists therapists can insert own row; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "therapists can insert own row" ON public.therapists FOR INSERT WITH CHECK ((id = auth.uid()));


--
-- Name: therapists therapists can read own row; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "therapists can read own row" ON public.therapists FOR SELECT USING ((id = auth.uid()));


--
-- Name: therapists therapists can update own row; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "therapists can update own row" ON public.therapists FOR UPDATE USING ((id = auth.uid()));


--
-- PostgreSQL database dump complete
--


