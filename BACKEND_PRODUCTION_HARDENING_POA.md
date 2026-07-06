# Backend Production Hardening Plan of Action

Created: 2026-07-02

## Context

This project has a reasonable backend shape, but the current payment and public API surface has production-blocking security issues. The highest-risk theme is that some routes trust client-supplied payment IDs, appointment IDs, or amounts. For real money, the server must verify gateway signatures, bind payments to database rows, and compute prices from database state.

Before code changes, the installed Next.js route-handler guide was checked at:

`node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`

Key local convention confirmed: app router API routes are `route.ts` files exporting HTTP verb functions and using Web `Request`/`Response` plus `NextRequest`/`NextResponse`.

## Immediate Goals

1. Close payment-forgery paths.
2. Stop trusting client-supplied booking and Razorpay amounts.
3. Bind every successful payment verification to the order/payment row created by the server.
4. Remove or neutralize duplicate unsafe payment endpoints.
5. Add basic public-route throttling and fix email-check pagination.
6. Preserve existing frontend compatibility where feasible, but fail closed for money paths.

## Critical Fixes

### 1. `/api/razorpay/upgrade-plan/route.ts`

Problem: accepts `razorpay_payment_id` from the browser and updates the therapist plan without verifying HMAC.

Action:
- Require `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`, and `plan`.
- Authenticate current user with the cookie-bound Supabase client.
- Verify Razorpay HMAC with the platform secret.
- Ensure the target plan is valid.
- Update only the authenticated user's therapist row.
- Prefer sharing the same verification/update logic as `/api/razorpay?action=plan-upgrade`.

### 2. `/api/razorpay/therapist-verify/route.ts`

Problem: verifies `order_id|payment_id`, then trusts a separate client-supplied `appointment_id`.

Action:
- Look up the `payments` row by `razorpay_order_id`.
- Require it to belong to the submitted `therapist_id`.
- Use `payment.appointment_id` from the DB as the only appointment to mark paid.
- Reject missing payment rows instead of updating arbitrary appointments.
- Optionally verify appointment amount/status before marking it paid.

### 3. Server-authoritative subscription pricing

Problem: `PLAN_PRICE` in `/api/payu/initiate` has `starter: 1`.

Action:
- Create a single plan pricing helper used by PayU and Razorpay subscription order creation.
- Replace `starter: 1` with the real configured production price.
- If a real price is unknown, fail closed via env vars instead of silently charging INR 1.

### 4. Server-authoritative booking pricing

Problem: `/api/booking/hold` trusts `service_price`; `/api/razorpay/therapist-order` trusts `amount`.

Action:
- Add helper to resolve a therapist's service price from DB:
  - Read therapist `fee_per_session`, `session_duration_mins`, `profile_content`, and current `template_id`.
  - If a submitted `service_name` matches a configured service with numeric price, use that.
  - Otherwise use `fee_per_session` when numeric and greater than zero.
  - Treat missing or zero server price as free only if the therapist configuration actually says so.
- In `/api/booking/hold`, ignore client `service_price` except as optional display metadata; store the resolved server price.
- In `/api/razorpay/therapist-order`, if `appointment_id` is provided, load the appointment and use its stored `service_price`; reject mismatches and missing appointments.

### 5. `/api/book/route.ts`

Problem: legacy direct booking creates `upcoming` appointments without payment, auth, captcha, or throttling.

Action:
- Short-term production-safe option: disable this route with HTTP 410 or make it delegate to `/api/booking/hold`.
- Long-term option: migrate remaining frontend callers to `/api/booking/hold`, then delete this route.

## High Priority Fixes

### 6. `/api/auth/check-email/route.ts`

Problems: `listUsers()` is not paginated; route enables email enumeration.

Action:
- Prefer `auth.admin.getUserByEmail` if available in installed Supabase SDK.
- If not available, paginate `listUsers({ page, perPage })` until the email is found or no users remain.
- Add basic rate limiting.
- Consider changing the response to a generic availability/start-OTP flow later to reduce enumeration.

### 7. Public route rate limiting

Problem: public POST routes can be abused.

Action:
- Add a lightweight in-memory limiter helper for runtime-level protection.
- Apply to:
  - `/api/book`
  - `/api/booking/hold`
  - `/api/auth/check-email`
  - `/api/screening/submit`
- Note: in-memory limits are best-effort on serverless/multi-instance deployments. Production should add Redis/Upstash/Vercel KV or gateway/WAF limits.

### 8. Constant-time Razorpay signature checks

Problem: several Razorpay signature checks use `!==`.

Action:
- Add shared `safeEqualHex`/`verifyRazorpaySignature` helper using `crypto.timingSafeEqual`.
- Replace direct string comparison in:
  - `/api/payment/webhook`
  - `/api/razorpay/verify`
  - `/api/razorpay/route.ts`
  - `/api/razorpay/therapist-verify`
  - `/api/razorpay/upgrade-plan`

## Medium Priority Cleanup

1. Consolidate duplicated Razorpay endpoints. Keep one route per operation or make duplicate routes thin wrappers around shared helpers.
2. Remove graceful DB fallback chains once migrations are confirmed applied.
3. Remove empty/dead `lib/database.ts` if confirmed unused.
4. Introduce schema validation for API bodies once critical money paths are fixed.

## Implementation Order

1. Add shared helpers:
   - `src/lib/payment-security.ts`
   - `src/lib/pricing.ts`
   - optionally `src/lib/rate-limit.ts`
2. Patch Razorpay signature comparisons to use constant-time helpers.
3. Patch subscription upgrade endpoints and plan order creation to use server-side plan pricing.
4. Patch booking hold and therapist Razorpay order/verify binding.
5. Disable or redirect legacy `/api/book`.
6. Fix check-email pagination and add rate limits.
7. Run `npm run build`.
8. Document remaining deployment tasks.

## Deployment/Operational Follow-Ups

These require environment or product decisions beyond code:

- Confirm final production plan prices for `starter`, `growth`, and `pro`.
- Configure Redis/KV-backed rate limiting for production if running multiple instances.
- Rotate Razorpay/PayU/webhook secrets if any have been exposed during testing.
- Apply and verify all Supabase migrations in production.
- Add unique DB constraints for appointment slot holds where not already present.
- Add gateway webhooks as the final source of truth for paid state.

## Implementation Status - 2026-07-03

Code-level hardening from the immediate and high-priority sections is implemented:

- Razorpay plan upgrades now require signed `order_id|payment_id`, authenticate the current therapist, and verify the Razorpay order amount/notes against server-side plan pricing before activating a plan.
- Therapist Razorpay payments now create payment rows from server-side appointment prices, then verify against the stored payment row, appointment id, therapist id, and amount before marking paid.
- Booking holds now resolve price from therapist configuration and fail closed when no payable/free server-side price is configured.
- PayU subscription and booking callbacks now verify callback hashes and compare callback amounts to server-side plan or appointment pricing before applying success.
- `/api/book` is disabled with HTTP 410.
- Public route rate limiting is present for booking hold, email check, and screening submit.
- Email checking paginates Supabase admin `listUsers`.
- Razorpay signature checks use the shared constant-time verifier.

Remaining work is operational: confirm production plan prices in env vars, deploy/verify migrations, add durable Redis/KV/WAF rate limiting, rotate any exposed secrets, add DB slot-hold constraints, and rely on gateway webhooks as final paid-state reconciliation.
