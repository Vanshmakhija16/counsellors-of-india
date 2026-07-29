# Counsellors of India — Complete Project Guide

A from-scratch walkthrough of the codebase: what everything is, where it lives, and how it all connects. Read this top to bottom once, then use it as a reference map whenever you're lost in a new part of the code.

---

## 1. The big picture — what is this app?

**Counsellors of India** is a Next.js (App Router) platform where therapists get their own bookable, customizable website. A therapist signs up, picks a design template, fills in their profile, and gets a shareable link (`counsellorsofindia.com/their-username`) where clients can view their profile and book/pay for a session.

Three audiences use this app:
1. **Therapists** — sign up, build their site via a dashboard, manage bookings/payments.
2. **Clients** — visit a therapist's public page, book a session, pay.
3. **Admins (you)** — manage the whole platform via `/admin`.

It's now being expanded into a **multi-country platform** (India, America, Canada, UK, Australia) — one shared codebase serving all five, differentiated by which domain a visitor lands on. More on that in §8.

---

## 2. Top-level folder structure

```
counsellors-of-india/
├── src/
│   ├── app/            ← Every PAGE and API ROUTE lives here (Next.js App Router)
│   ├── components/     ← Reusable UI building blocks
│   ├── lib/             ← Business logic, API clients, database helpers — the "engine room"
│   ├── hooks/           ← Custom React hooks
│   ├── types/           ← Shared TypeScript types
│   └── middleware.ts    ← Runs before EVERY request (multi-tenant domain detection)
├── supabase/
│   └── migrations/      ← SQL files that alter the database structure over time
├── public/               ← Static files (images, icons) served as-is
├── schema.sql            ← A full dump of the database structure (for reference/cloning)
├── package.json          ← Every npm dependency the project uses
└── *.md files            ← Planning docs (POAs) — see §9
```

The single most important thing to internalize: **in Next.js App Router, folder structure IS your routing.** A folder at `src/app/pricing/` with a `page.tsx` inside becomes the `/pricing` URL. A folder at `src/app/api/paypal/create-order/` with a `route.ts` becomes the `/api/paypal/create-order` API endpoint. There's no separate router config file — the filesystem *is* the router.

---

## 3. `src/app` — every page and API route

### 3.1 Public marketing pages
| Folder | Route | What it is |
|---|---|---|
| `app/page.tsx` | `/` | Homepage — hero, template showcase, live template previews, therapist directory teaser |
| `app/about/` | `/about` | About page |
| `app/why-us/` | `/why-us` | Why-us page |
| `app/blog/` | `/blog` | Blog listing |
| `app/contact/` | `/contact` | Contact form |
| `app/alltherapists/` | `/alltherapists` | Full therapist directory |

### 3.2 Auth flow
| Folder | Route | What it is |
|---|---|---|
| `app/signup/` | `/signup` | Therapist registration — multi-step (account → OTP → plan) |
| `app/login/` | `/login` | Therapist login |
| `app/forgot-password/`, `app/reset-password/` | — | Password recovery flow |
| `app/auth/` | — | Auth-related API/callback routes (not pages) |

These pages share a layout component: `AuthLayout.tsx` (in `components/layout/`) — the split-screen design with the form on the left and the branded panel on the right (the one we spent a lot of time redesigning — dark gradient, step tracker, tagline).

### 3.3 Onboarding & plan selection
| Folder | Route | What it is |
|---|---|---|
| `app/onboarding/`, `app/onboarding-guide/` | — | Post-signup setup flow (pick template, fill profile) |
| `app/pricing/` | `/pricing` | Plan selection (Starter/Pro) + checkout — this is where the Razorpay/PayU/PayPal gateway logic lives |
| `app/payment/success/`, `app/payment/failure/`, `app/payment/paypal-return/` | — | Post-payment landing pages, shared across all gateways |

### 3.4 The therapist's public-facing site
| Folder | Route | What it is |
|---|---|---|
| `app/[username]/` | `/anytherapistname` | **This is the actual therapist website.** Next.js's `[brackets]` mean "dynamic segment" — whatever username is in the URL gets looked up. This page fetches the therapist's data from Supabase, then hands it to whichever Template component (CT1–CT8) they've chosen |
| `app/booking/` | — | Booking-related pages/logic |
| `app/screen/` | — | Client-facing assessment/screening flow |
| `app/preview/` | `/preview/classic1` etc. | Live iframe-embeddable previews of each template, used on the homepage's "Explore Templates" section |
| `app/try/` | — | "Try it" demo flow |

### 3.5 The therapist's dashboard (private, logged-in area)
`app/dashboard/` — everything a therapist uses to run their practice:
- `profile/` — edit bio, fee, experience, total sessions, phone, socials
- `appearance/` — pick a template, edit its content (hero text, footer, nav labels — all the CT8 dashboard editors we built)
- `appointments/` — see upcoming bookings
- `availability/` — set weekly availability + exceptions
- `notes/` — session notes per client
- `payments/` — payment/plan management
- `settings/` — account settings
- `layout.tsx` — the shared dashboard shell (sidebar nav) wrapping all of the above

(Note: there's also a stray `app/dashbaord/` — misspelled duplicate folder. Worth checking if it's dead code left over from a typo, or actually still routed to.)

### 3.6 Admin
`app/admin/` — your own control panel for managing therapists, plans, etc. platform-wide.

### 3.7 `app/api/` — every backend endpoint
This is the "server" part of your app — no UI, just logic that runs on Vercel/Azure's servers.

| Folder | Purpose |
|---|---|
| `api/auth/` | Auth-related server logic (OTP send/verify, etc.) |
| `api/book/`, `api/booking/`, `api/booked-slots/` | Creating/checking bookings and slot availability |
| `api/contact/` | Contact form submission handling |
| `api/screening/` | Assessment/screening submission handling |
| `api/public/` | Public-safe endpoints (e.g., therapist directory data for the homepage) |
| `api/razorpay/` | India's payment gateway — `create-order`, `upgrade-plan` (plan subscription), `therapist-order`/`therapist-verify` (session booking, per-therapist keys), `save-credentials` |
| `api/payu/` | India's alternate gateway — same shape as Razorpay |
| `api/paypal/` | **New** — `create-order`/`capture-order` for the US (and future) tenant's plan-subscription payments |
| `api/stripe/` | **New** — `connect/onboard`, `connect/status` (therapist Stripe Connect onboarding), `booking/create-payment-intent` (client pays therapist directly), `webhook` (Stripe events) |
| `api/payment/webhook/` | A payment webhook handler (worth double-checking exactly which gateway this currently serves — it references a `payments` table that, as we discovered, doesn't actually exist in the schema; likely older/in-progress code) |

---

## 4. `src/components` — reusable building blocks

### 4.1 `components/booking/templates/` — the heart of the product
This is where the 8 different "looks" a therapist's website can have all live. Each template (`ClassicTemplate` through `ClassicTemplate8`) is a **folder** containing its own:
- `Hero.tsx`, `About.tsx`, `Services.tsx`, `FAQ.tsx`, `Footer.tsx`, `Booking.tsx` — section components
- `styles.ts` — a big CSS-in-JS string of every class the template uses
- A top-level `ClassicTemplateN.tsx` that assembles all sections into one page

**Why 8 separate folders instead of one flexible template?** Each template has a genuinely distinct visual identity (color palette, fonts, layout philosophy) — e.g., CT3 ("The Atelier") is an editorial/magazine style, CT8 ("Common Room") is aimed at psychology students with a bento-grid layout for their credentials sections. Cloning the folder per template keeps each one's styling self-contained and safe to redesign without risking the others.

`templateUtils.tsx` is the shared glue — it defines the `TherapistProfile` TypeScript interface (every field a therapist's data can have) and per-template content resolvers (`resolveCT3Content`, `resolveCT8Content`, etc.) that merge saved dashboard edits with sensible defaults.

### 4.2 `components/appearance/`
The **dashboard-side editors** — e.g. `CT3ContentEditor.tsx` is the UI a therapist uses in their dashboard to edit CT3's hero headline, nav labels, footer text, etc. Each template that supports content editing has a matching editor here.

### 4.3 `components/dashboard/`
Shared dashboard UI (sidebar, cards, layout pieces) used across all the `/dashboard/*` pages.

### 4.4 `components/layout/`
Site-wide layout pieces — `AuthLayout.tsx` (the login/signup split-screen shell), `SiteFooter`, etc.

### 4.5 `components/home/`, `components/landing/`
Homepage-specific sections (the `LiveTemplateExperience` component we edited to add/remove T6/T7 lives somewhere in here or directly in `app/page.tsx`).

### 4.6 `components/ui/`
Generic, reusable primitives with no business logic — `Button.tsx`, `Input.tsx`, `Card.tsx`, `Logo.tsx`, `CountryCodeSelect.tsx` (the phone country picker we redesigned).

### 4.7 `components/journey/`
`JourneyProgress.tsx` — the "Account → Plan → Payment → Build Site" step tracker shown during signup (we retinted this from gray to warm sage/tan tones).

### 4.8 `components/providers/`
`TenantSupabaseProvider.tsx` — solves a tricky problem: since one app build serves 5 countries, the Supabase client can't just use one hardcoded set of keys baked in at build time. This provider figures out, in the browser, which tenant's Supabase project to actually talk to.

### 4.9 `components/clinical/`
Components related to the clinical/assessment (DSM, screening) features.

---

## 5. `src/lib` — the engine room (no UI, pure logic)

This is where "how things actually work" lives, separate from "what it looks like."

| File | What it does |
|---|---|
| `supabase.ts` | Creates the **browser-side** Supabase client (uses `NEXT_PUBLIC_*` env vars) |
| `supabase-server.ts` | Creates **server-side** Supabase clients — now tenant-aware (reads `SUPABASE_URL_US` etc. per the country a request came from), with India falling back to the original env vars so nothing broke |
| `pricing.ts` | Single source of truth for plan prices — `getPlanPriceInr()` (India) and `getPlanPriceUsd()` (everyone else), both with a built-in test-account override (₹1 / $0.01) |
| `razorpay.ts` / `razorpay-client.ts` | Razorpay integration — `.ts` = server-side API calls, `-client.ts` = browser-side checkout trigger. This naming split repeats for every gateway |
| `payu.ts` / `payu-client.ts` | Same pattern, for PayU |
| `paypal.ts` / `paypal-client.ts` | Same pattern, newly built, for PayPal (US plan subscriptions) |
| `stripe-client.ts` | Tenant-aware Stripe SDK client — used for Stripe Connect (session-booking payments going directly to a therapist's own account) |
| `template.ts` | Template-related helper logic |
| `useBooking.ts`, `useRazorpay.ts`, `useTherapist.ts` | Custom hooks (despite the `use*` naming and living in `lib/` rather than `hooks/` — a small inconsistency worth knowing about) |
| `whatsapp.ts` | WhatsApp booking-confirmation message logic |
| `encryption.ts` | Encrypts/decrypts sensitive values (e.g., a therapist's own Razorpay secret key, stored per-therapist) |
| `rate-limit.ts` | Rate limiting for API routes |
| `specialties.ts` | The list of therapy specialties used in dropdowns/filters |
| `database.ts` | Misc database helpers |
| `demoSession.ts` | Logic for the "try it" demo mode |

### 5.1 `lib/tenants/` — the multi-country system
| File | Purpose |
|---|---|
| `types.ts` | The `TenantConfig` shape — every country's settings (domains, currency, payment gateway, timezone, Supabase env prefix) |
| `in.ts`, `us.ts`, `ca.ts`, `uk.ts`, `au.ts` | One config file per country |
| `index.ts` | The registry — builds a domain→tenant lookup map, exposes `resolveTenantId(host)`, defaults unknown hosts to `in` (the safety net that guarantees India's live site can't break) |
| `server.ts` | `getCurrentTenant()` — lets any server component/route read which tenant the current request belongs to |

---

## 6. `src/middleware.ts` — the "receptionist"

This single file runs **before every request** hits your app. Its job: read the `Host` header (which domain someone typed), look it up in the tenant registry, and tag the request with an `x-tenant` header (`in`, `us`, `ca`, `uk`, or `au`) so everything downstream knows which country's rules to apply — without every single page/route having to re-derive it themselves.

---

## 7. `supabase/` and the database

- `supabase/migrations/` — incremental SQL files (only 2 small ones tracked here; most of the actual schema was built directly in Supabase's dashboard over time, which is why we had to `pg_dump` India's live schema rather than replay migration files when setting up America's database)
- `schema.sql` (project root) — a full structural dump, useful as a reference of every table/column that exists
- **Key tables:** `therapists` (the core profile data), `appointments` (bookings — payment status lives directly on this table via `status`/`txnid`/`payu_id`, NOT a separate `payments` table), `clients`, `session_notes`, `slots`, plus the DSM/assessment tables (`dsm_disorders`, `assessment_questions`, etc.) for the clinical screening features

---

## 8. How the multi-tenant (multi-country) system actually works end to end

1. A visitor types `counsellorsofamerica.com` (or, locally, `counsellorsofamerica.local:3000`)
2. `middleware.ts` reads that hostname, resolves it to tenant `us`, and stamps `x-tenant: us` on the request
3. Any server code (API routes, server components) that needs to behave differently calls `getCurrentTenant()` to read that stamp
4. `supabase-server.ts` uses the tenant's `supabaseEnvPrefix` (`US`) to pick `SUPABASE_URL_US` etc. instead of India's — so America's therapists/bookings live in a completely separate database
5. The pricing page detects the tenant client-side (via `resolveTenantId(window.location.hostname)`) and automatically shows $ pricing + routes checkout through PayPal, while India visitors see ₹ + Razorpay, automatically, no manual switching
6. Everything else — the 8 templates, the booking engine, the dashboard — is 100% shared code; only these tenant-aware seams (database, currency, gateway) differ

---

## 9. The planning documents (read these for context on *why*, not just *what*)

- `MULTI_COUNTRY_EXPANSION_POA.md` — the full plan for expanding to America/Canada/UK/Australia, phase by phase, with what's done and what's still pending
- `BACKEND_PRODUCTION_HARDENING_POA.md`, `CLINICAL_ROADMAP.md`, `PAYU_CALLBACK_INVESTIGATION.md`, `dashboard-ux-solution.md`, `POA-footer-and-new-pages.md` — other planning/investigation docs worth skimming if you're touching those areas

---

## 10. A mental model for finding your way around

Whenever you're trying to figure out "where does X live," ask:

- **Is it something a visitor SEES?** → `src/app/` (if it's a full page) or `src/components/` (if it's a reusable piece of UI)
- **Is it business logic, an API call, or a calculation with no visual output?** → `src/lib/`
- **Is it a backend endpoint the frontend calls?** → `src/app/api/.../route.ts`
- **Does it differ by country?** → check `src/lib/tenants/` first — that's the seam where country-specific behavior is supposed to plug in
- **Is it about a specific template's look?** → `src/components/booking/templates/ClassicTemplateN/`

That's the whole map. Once these mental categories click, navigating a codebase this size stops feeling overwhelming — you're never actually searching randomly, you're asking "which of these 5 buckets does this belong to" and going straight there.
