# Clinical Module Roadmap

Context: Phase 0 (patients) and Phase 2 (screening, in-session) are DONE. Migrations in `migration.sql`. Tables: `patients`, `instruments`, `instrument_items`, `screening_sessions`, `screening_responses`. All RLS by `auth.uid() = therapist_id`. UI lives under `/clinical/`, layout `src/components/layout/ClinicalLayout.tsx`. Stepper component: `src/components/clinical/JourneyStepper.tsx`. UI primitives: `src/components/ui/Button.tsx`, `Input.tsx`. Style tokens: `bg-[#d4e4e1] text-[#2d4a47]` accent, `bg-[#354744]` primary button, Fraunces serif for headings, max-w-5xl page width, `bg-white rounded-xl border border-[#e8e4df]` cards.

---

## Phase 1 — Patient Intake

Goal: structured intake form filed against a patient. Replace Coming-Soon at `src/app/clinical/patients/[id]/intake/page.tsx`.

Steps:
1. Migration: table `patient_intakes` (id, therapist_id, patient_id UNIQUE, presenting_concern text, history jsonb, family jsonb, social jsonb, risk jsonb, status enum 'draft'|'final', created_at, updated_at). RLS by therapist_id. Trigger `set_updated_at`.
2. `src/lib/clinical/intake.ts` — types, Zod schemas per section, `getIntake(patientId)`, `upsertIntake(patientId, partial)`, `finalizeIntake(patientId)`.
3. `src/components/clinical/IntakeStepper.tsx` — 4 sub-steps: Presenting → History → Social → Risk. Each is its own form section, auto-saves on blur.
4. `src/app/clinical/patients/[id]/intake/page.tsx` — overview with section completion chips, "Continue" CTA.
5. `src/app/clinical/patients/[id]/intake/[section]/page.tsx` — dynamic section editor.
6. Wire `JourneyStepper` "completed.intake" once `status === 'final'`.

Risk section MUST include: SI/HI yes/no, plan, means, history of attempts. If any positive, surface red banner on patient overview.

---

## Phase 2b — Patient-administered screening (tokenized link)

Goal: therapist can send a link; patient completes screening unauthenticated; result lands in chart.

Steps:
1. Migration: table `screening_invites` (id, therapist_id, patient_id, instrument_id, token text UNIQUE, expires_at timestamptz, completed_session_id uuid nullable, created_at). Index on token. RLS: therapist manages own rows.
2. RLS for anonymous flow: add policy on `screening_sessions` and `screening_responses` allowing INSERT when request supplies a valid unexpired unused token. Use a SECURITY DEFINER RPC `submit_screening_by_token(token, responses jsonb, notes text)` instead of direct table policy — safer.
3. `src/lib/clinical/invites.ts` — `createInvite(patientId, slug)` returns token, `getInviteByToken(token)`, calls the RPC on submit.
4. UI add to screening index: "Send link to patient" button next to "Start in session". Modal shows generated URL + WhatsApp/email share buttons.
5. Public route `src/app/screen/[token]/page.tsx` — NO ClinicalLayout. Fetch invite + instrument. Render the same item UI as in-session form. On submit call RPC. Show thank-you screen.
6. Token URL: `/screen/<token>`. Single-use. 14-day expiry. Rate-limit by IP via middleware.
7. Email/WhatsApp delivery: reuse `src/lib/whatsapp.ts` and `nodemailer` from `src/app/api/book/route.ts`. New endpoint `src/app/api/screening/invite/route.ts` sends the link.

Security gates before shipping: rate limit `/screen/[token]` to 30 req/min/IP; never echo therapist or patient name on the public page beyond first name; mark token used inside the RPC transaction so concurrent submits cannot double-insert.

---

## Phase 3 — Diagnosis (DSM-5)

Goal: working/provisional/confirmed diagnoses with DSM-5 criteria checklists.

Steps:
1. Migration A: table `dsm_disorders` (id, code text UNIQUE e.g. '296.23', name, category, criteria jsonb). Public read RLS like `instruments`.
2. Migration B: table `dsm_criteria` (id, disorder_id, label text, group text e.g. 'A','B', required_count int). Public read.
3. Migration C: table `patient_diagnoses` (id, therapist_id, patient_id, disorder_id, status enum 'provisional'|'working'|'confirmed'|'ruled_out', met_criteria_ids uuid[], onset_date date, notes, created_at, updated_at). RLS by therapist.
4. Seed top 10 disorders for v1: MDD, Persistent Depressive Disorder, GAD, Panic Disorder, Social Anxiety, PTSD, OCD, ADHD, Bipolar I, Bipolar II. Hand-encode criteria from DSM-5 text.
5. `src/lib/clinical/diagnosis.ts` — CRUD + helper `meetsCriteria(diagnosis, criteria)` returning per-group pass/fail.
6. Replace Coming-Soon at `src/app/clinical/patients/[id]/diagnosis/page.tsx` — list of patient's diagnoses + "Add diagnosis" picker.
7. `src/app/clinical/patients/[id]/diagnosis/new/page.tsx` — disorder search → criteria checklist → status + notes.
8. `src/app/clinical/patients/[id]/diagnosis/[diagnosisId]/page.tsx` — edit page.
9. Pull recent screening scores into diagnosis context (PHQ-9 ≥ 10 hints at MDD).

Legal note: DSM-5 content is copyrighted by APA. Use paraphrased criteria summaries, link out to clinician's licensed copy. Add disclaimer on every diagnosis page.

---

## Phase 4 — Resources

Goal: admin-uploaded library of worksheets/PDFs/links; therapist assigns to patient.

Steps:
1. Supabase Storage bucket `clinical-resources` (private, signed URLs only).
2. Migration A: table `resources` (id, slug, title, description, kind enum 'worksheet'|'reading'|'video'|'link', file_path text nullable, external_url text nullable, tags text[], domain text, created_at). Public read for therapists.
3. Migration B: table `patient_resources` (id, therapist_id, patient_id, resource_id, assigned_at, due_date date nullable, completed_at timestamptz nullable, note text). RLS by therapist.
4. Admin route at `src/app/admin/resources/` (NEW area, gated by `therapists.role = 'admin'` column — add this column first). CRUD + upload to bucket.
5. `src/lib/clinical/resources.ts` — list/search resources, assign/unassign, signed-URL helper.
6. Replace Coming-Soon at `src/app/clinical/patients/[id]/resources/page.tsx` — two columns: "Assigned" (with completion checkboxes) + "Library" (searchable, click to assign).
7. `src/app/clinical/patients/[id]/resources/library/page.tsx` — full library browser.
8. Patient-facing future: optional email of signed URL with 7-day expiry.

---

## Cross-cutting follow-ups

- Replace static `src/app/dashboard/clients/page.tsx` mockup with a real view backed by `patients` (or delete and redirect to `/clinical/patients`).
- Add `appointments.patient_id` FK so appointments link to patient charts. Migration + backfill via email match.
- Soft-delete pattern: `deleted_at` column on `patients`, `screening_sessions`. Update RLS + queries.
- Audit log: `clinical_audit` table capturing therapist_id, action, target_table, target_id, at. Insert in lib functions.
- Export: per-patient PDF chart export (intake + diagnoses + screening history). Use `@react-pdf/renderer`.
- i18n: prompts in `instruments`/`dsm_disorders` need a `translations jsonb` column for Hindi/Tamil/Bengali.

---

## Conventions to follow

- All new tables: `id uuid PK default gen_random_uuid()`, `therapist_id` FK with RLS `auth.uid() = therapist_id`, `created_at` + `updated_at` with `set_updated_at` trigger when mutable.
- All Supabase calls go through `src/lib/clinical/*.ts`. Pages never call `createClient()` directly except for one-shot reads.
- Server components for read-only patient chart pages (use `createServerSupabaseClient`). Client components only where interaction needed.
- Zod schemas with `.nullish()` (not `.optional()`) for nullable DB columns so re-parse of saved data doesn't fail.
- Forms surface field errors AND a top-level summary banner (precedent: `src/components/clinical/PatientForm.tsx`).
- Type check after each phase: `npx tsc --noEmit`. Two pre-existing errors are unrelated (nodemailer types, LivePreview); ignore.
- After adding new dynamic-segment folders, restart `npm run dev` — Turbopack does not pick them up live.
