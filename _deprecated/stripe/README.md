# Deprecated: Stripe booking-payment integration

Moved out of `src/` on the day PayPal Multiparty replaced it as the
session-booking payment gateway for the US tenant (and the type default
for future non-India tenants). Kept here for reference only — none of
this code is imported or routed anymore.

Moved from:
- `src/lib/stripe-client.ts` → `stripe-client.ts`
- `src/app/api/stripe/booking/create-payment-intent/route.ts` → `booking-create-payment-intent.route.ts`
- `src/app/api/stripe/connect/onboard/route.ts` → `connect-onboard.route.ts`
- `src/app/api/stripe/connect/status/route.ts` → `connect-status.route.ts`
- `src/app/api/stripe/webhook/route.ts` → `webhook.route.ts`

Notes for whoever eventually cleans this up:
- The `src/app/api/stripe/` folder still contains a few now-empty
  subdirectories (`booking/create-payment-intent`, `connect/onboard`,
  `connect/status`, `webhook`). They're harmless — Next.js only creates a
  route from a folder that has a `route.ts` in it — but you can delete
  them by hand if you want the tree tidy.
- `stripe` was never actually wired up to any live UI: the dashboard
  payments page (`src/app/dashboard/payments/page.tsx`) always rendered
  PayPalConnect for the US tenant, and `BookingWithPayment.tsx` only ever
  called Razorpay. So removing this had zero effect on any working flow.
- The `stripe` npm package has been removed from `package.json`. Run
  `npm install` (or your package manager's equivalent) after pulling this
  change to update `node_modules` / the lockfile.
- Nothing was dropped from the database — `therapists.stripe_account_id`,
  `stripe_onboarded`, `stripe_charges_enabled` and
  `appointments.stripe_payment_intent_id` / `stripe_account_id` (if they
  exist in your schema) are untouched. They're just unused columns now;
  drop them in a future migration if you're sure you'll never revisit Stripe.
