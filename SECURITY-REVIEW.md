# Security Review

**Date:** 2026-11-24
**Scope:** Frontend, backend API routes, Supabase database policies, storage policies, tenant isolation, payment flows, screening flows, and build/lint validation.

## Executive Summary

The application builds successfully, but the audit found several access-control weaknesses that should be fixed before public multi-country expansion. The most urgent issues are:

1. The public `therapists` table policy exposes all active therapist columns.
2. Therapists can directly update privileged fields on their own database row.
3. Screening invite rows are readable by every anonymous Supabase client.
4. Clinical resource storage policies allow any authenticated therapist to read or write the shared bucket.
5. Many service-role routes target India's Supabase project instead of the request tenant's project.
6. OAuth state values are written to application logs.

## Vulnerability Findings

| # | Severity | File | Lines | Vulnerability | Confidence |
|---|----------|------|-------|---------------|------------|
| 1 | 🔴 CRITICAL | public_schema.sql | 1659 | Public RLS policy allows anonymous reads of every active therapist column, including payment and OAuth-related fields | 10/10 |
| 2 | 🔴 CRITICAL | public_schema.sql | 1686 | Therapists can update their complete row, including privileged fields such as `role`, plan, and payment configuration | 10/10 |
| 3 | 🟠 HIGH | migration.sql | 478-481 | Anonymous clients can read all screening invite rows and obtain bearer tokens and patient identifiers | 10/10 |
| 4 | 🟠 HIGH | migration.sql | 967-979 | All authenticated therapists can read and upload clinical resources across the shared storage bucket | 10/10 |
| 5 | 🟠 HIGH | src/lib/supabase-server.ts | 104-113 | The legacy service-role helper always targets India's Supabase project, while tenant-facing routes may run on US, CA, UK, or AU | 9/10 |
| 6 | 🟡 MEDIUM | src/app/api/razorpay/oauth/callback/route.ts | 78-82 | OAuth callback state and cookie state are logged, exposing transient CSRF-flow secrets | 9/10 |

## Finding Details

### 1. Public therapist columns are exposed

**Location:** [public_schema.sql](public_schema.sql)

The `therapist: public read` policy selects every column for every active therapist:

```sql
CREATE POLICY "therapist: public read"
ON public.therapists
FOR SELECT
USING ((is_active = true));
```

The frontend uses the public Supabase anon key, so an anonymous client can call PostgREST and read fields outside the public profile UI. Separate migrations add payment secret, OAuth token, and OAuth state columns to this table.

**Recommended fix:**

- Remove the broad public select policy.
- Create a narrow public therapist profile view or RPC containing only public display fields.
- Revoke or restrict anonymous access to the underlying `therapists` table.
- Move payment secrets and OAuth tokens to a server-only table or secret store.

### 2. Client-side privilege and payment fields are mutable

**Location:** [public_schema.sql](public_schema.sql)

The `therapists can update own row` policy permits an authenticated therapist to update any column on their own row. An attacker can attempt to set `role = 'admin'`, plan fields, subscription fields, or payment/OAuth fields directly through Supabase.

**Recommended fix:**

- Replace broad self-update access with restricted `UPDATE` policies or a protected database view.
- Do not allow clients to update `role`, plan, subscription, OAuth, webhook, or payment credential columns.
- Restrict privileged updates to service-role server code.
- Consider a trigger that rejects changes to a fixed privileged-column allowlist.

### 3. Screening invite tokens can be enumerated

**Location:** [migration.sql](migration.sql)

The `anyone reads invite by token` policy uses `USING (true)`. It grants anonymous enumeration of all screening invite rows rather than limiting access to the known token.

**Recommended fix:**

- Remove the public select policy.
- Resolve invites through a narrow security-definer RPC that receives exactly the invite token.
- Return only information needed for the public screening form.
- Enforce expiry, use status, and result ownership inside the RPC.

### 4. Clinical resources storage is not tenant/therapist scoped

**Location:** [migration.sql](migration.sql)

The `clinical-resources` bucket policies check only that the requester is authenticated and that the object belongs to the bucket. They do not verify the object path or the therapist/patient relationship.

**Recommended fix:**

- Store objects under ownership-based paths such as `therapist/{therapist_id}/{resource_id}`.
- Require storage path prefixes to match `auth.uid()` for therapist-owned resources.
- Add separate admin or patient authorization rules instead of one shared authenticated policy.
- Verify patient assignment in server code before returning a signed URL.

### 5. Legacy service-role operations break tenant isolation

**Location:** [src/lib/supabase-server.ts](src/lib/supabase-server.ts)

`createServiceSupabaseClient()` is documented to remain India-only, but it is used by tenant-facing booking, reschedule, admin, payment, subscription, and OAuth routes.

This can write an America, Canada, UK, or Australia request to India's database or use India's credentials. It can cause cross-country records and attach payment operations to the wrong project.

**Recommended fix:**

- Replace tenant-facing uses of `createServiceSupabaseClient()` with `createServiceSupabaseClientForTenant()`.
- Resolve the tenant before database or payment operations.
- Remove the India fallback from routes that are not explicitly India-only.
- Add tests that verify US and IN requests never access the same Supabase project or therapist ID namespace.

Affected route families include:

- `/api/booking/*`
- `/api/dashboard/appointments/reschedule`
- `/api/razorpay/*`
- `/api/payu/*`
- `/api/payment/webhook`
- `/api/admin/*`
- `/api/subscription/*`

### 6. OAuth state is written to logs

**Location:** [src/app/api/razorpay/oauth/callback/route.ts](src/app/api/razorpay/oauth/callback/route.ts)

The callback debug logging includes callback state and expected cookie state.

**Recommended fix:**

- Remove callback and cookie state values from logs.
- Log only a sanitized mismatch result and non-sensitive request metadata.
- Purge existing logs containing OAuth state values.
- Restrict log access and secret-bearing application logs.

## Additional Backend Observations

### Legacy payment webhook table mismatch

**Location:** [src/app/api/payment/webhook/route.ts](src/app/api/payment/webhook/route.ts)

This route reads and updates a `payments` table and therapist-level Razorpay secret columns. The project guide and multiple schema references indicate that the current appointment/payment model does not consistently include that table. This route can therefore fail or expose legacy behavior that differs from the active Razorpay per-therapist and therapist verification flows.

**Recommended action:**

- Decide whether to migrate this route to the active payments schema or remove it.
- Keep all webhook handlers tenant-aware.
- Add a database existence and integration test before deployment.
- Use the same order/appointment verification rules as the active booking flow.

### Dashboard authentication

The dashboard layout performs a client-side auth and plan gate. Server API routes that mutate protected data must independently validate both the authenticated user and ownership. The reschedule route demonstrates this pattern correctly for therapist ownership, but all API routes should be audited for the same requirement.

### Admin authentication

Admin pages use `requireAdmin()` and API mutation routes use `getAdminUser()`. This is an adequate page/API pattern, but it depends on the `therapists.role` column. The broad row-update policy must be removed or a therapist could promote themselves to admin.

### Screening submission

The screening submit route uses a service-role client and a bearer invite token. The route validates expiry and invite reuse, but its value should be constrained to known question IDs and allowed answer ranges. The database public read policy should be removed even if route-level validation remains.

## Frontend Audit Summary

- The Next.js App Router frontend is substantial and supports marketing, auth, onboarding, therapist dashboard, clinical workflows, public profiles, and administrative pages.
- Build-time rendering succeeds for 82 static/dynamic routes.
- Multi-tenant styling and public Supabase credentials are separated through the tenant provider.
- The dashboard plan gate is client-side only and must not be treated as an authorization boundary.
- Sensitive operations such as plan changes, therapist deletion, credential updates, rescheduling, and screening submission need server-side validation independent of UI rendering.
- The deprecated `middleware` convention warning should be addressed according to the project's current Next.js version before upgrading or deploying from a clean environment.

## Backend Audit Summary

- The backend consists primarily of Next.js Route Handlers backed by tenant-aware Supabase projects.
- Supabase RLS is insufficient in several places because broad public policies expose table columns and shared storage access is not ownership-scoped.
- The strongest backend risk is inconsistent tenant database selection.
- Active Razorpay plan and booking flows contain signature/amount verification, but the legacy India-only service helper and webhook route increase cross-tenant risk.
- API routes should use the current tenant, verify authentication and ownership server-side, and never trust browser-supplied therapist IDs or plan amounts.

## Validation

### Production build

**Result:** PASS

- Next.js 16.2.4 production build completed successfully.
- 82 routes generated.
- TypeScript config and static page collection completed.

**Warning:** Next.js reports that the `middleware` convention is deprecated and recommends migration to the `proxy` convention for this version.

### ESLint

**Result:** FAIL

- 486 findings: 304 errors and 182 warnings.
- The lint baseline needs cleanup, although build-time validation did not surface a compile failure.
- Notable individual findings include:
  - CommonJS `require()` usage in `check-user-diva.js` and `fix-diva.js`.
  - `any` usage in [src/app/[username]/page.tsx](src/app/[username]/page.tsx).
  - Many additional existing code-quality warnings/errors across components and API routes.

## Recommended Remediation Priority

1. Remove the broad public therapist select and privileged column update policies.
2. Remove screening invite enumeration access.
3. Fix clinical resource storage path policies.
4. Replace legacy India-only service-role usage across tenant-facing routes.
5. Remove OAuth state values from application logs.
6. Reconcile or disable the legacy payment webhook route.
7. Address the Next.js proxy migration and lint baseline.
