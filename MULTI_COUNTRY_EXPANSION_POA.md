# Multi-Country Expansion — Plan of Action (POA)

**Owner:** Vansh Makhija
**Repo:** `counsellors-of-india` (Vanshmakhija16)
**Status:** Planning complete — implementation not yet started
**Last updated:** 2026-07-21

---

## 1. Goal

Expand "Counsellors of India" into 4 additional country sites:

| # | Country   | Domain                          | Currency | Payment Gateway |
|---|-----------|----------------------------------|----------|------------------|
| 1 | India     | www.counsellorsofindia.com       | ₹ INR    | Razorpay + PayU  |
| 2 | America   | www.counsellorsofamerica.com     | $ USD    | Stripe           |
| 3 | Canada    | www.counsellorsofcanada.com      | $ CAD    | Stripe           |
| 4 | UK        | www.counsellorsofuk.com          | £ GBP    | Stripe           |
| 5 | Australia | www.counsellorsofaustralia.com   | $ AUD    | Stripe           |

**Core decision:** One shared codebase (multi-tenant), not 4 separate repos/projects.
Fix a bug or improve a template once → it reflects on all 5 live sites automatically.

---

## 2. Why multi-tenant (not separate repos per country)

**Reused across all countries (~70% of the app, zero rebuild):**
- All 7 booking templates (`ClassicTemplate` → `ClassicTemplate7`) and their sub-components
  (Hero, Footer, SideNav, About, Services, FAQ, Booking, Insights)
- `src/components/booking/templates/templateUtils.tsx`
- `src/app/[username]/page.tsx` (public profile renderer)
- Dashboard: appearance editor, appointments, availability, notes
- `src/app/admin/`
- Auth: signup/login/forgot-password/reset-password
- Booking + screening/assessment engine (`src/app/booking/`, `src/app/screen/`)

**Needs to become tenant-aware (small, targeted edits):**
- `src/lib/pricing.ts` — currency + amount per tenant
- `src/app/dashboard/payments/` — gateway UI branches by tenant
- `src/app/dashboard/profile/page.tsx` — currency symbol, phone format
- `src/app/layout.tsx`, `SiteFooter` — brand name/logo from tenant config
- Booking/availability system — **timezone-awareness** (see §5, Phase 4)

**Needs fresh, country-specific content (no reuse of copy):**
- Homepage (`src/app/page.tsx`) — hero copy, testimonials, remove India-only wordmark
- `about`, `why-us`, `blog`, `contact` pages
- Privacy Policy / Terms of Service (legally distinct per country — see §5, Phase 6)

**New files that don't exist yet:**
- `middleware.ts` — domain → tenant detection ("the receptionist")
- `src/lib/tenants/{in,us,ca,au,uk}.ts` — one settings file per country
- `src/lib/stripe-client.ts` — new gateway module (mirrors `razorpay-client.ts` shape)

---

## 3. Data & backend isolation decisions

| Concern | Decision | Why |
|---|---|---|
| **Codebase** | One shared repo/app | "Fix once, reflects everywhere" |
| **Database** | Separate Supabase project per country (`coi-in`, `coi-us`, `coi-ca`, `coi-uk`, `coi-au`) | Data residency law (GDPR/UK, PIPEDA/Canada, Privacy Act/Australia), blast-radius isolation, avoids accidental cross-country data leaks, cleaner GDPR "right to be forgotten" handling |
| **Deployment** | One Azure App Service, multiple custom domains bound to it (can split into multiple App Services from the same build later if needed) | Avoids 4x infra to manage; still get code-level "fix once" benefit |
| **Payments** | Razorpay/PayU stay India-only; Stripe for US/CA/UK/AU, behind one shared interface | Razorpay/PayU don't support international cards well; Stripe has strong multi-currency support |
| **Therapist visibility** | Hard wall — India therapists only ever show on the India site, America therapists only on the America site, no cross-listing (confirmed decision) | Matches separate-database design; avoids confusing cross-country matching |

### Explicitly rejected: one shared database for all countries
1. Data residency/compliance risk (GDPR, PIPEDA, Australia Privacy Act, HIPAA-adjacent concerns)
2. One bug/outage takes down all 5 countries at once
3. Noisy-neighbor performance (one country's traffic slows others)
4. Harder to reason about DB connection/scaling limits
5. Structural risk of cross-country data leaks (a missed `WHERE country = 'x'` filter)
6. Tangled backup/deletion-request handling
7. Messier per-country billing/reporting

### Explicitly rejected: one shared backend deployment with no isolation
Same root issues as above, plus:
- A bad deploy for one country can break all countries simultaneously
- Payment logic (Razorpay/PayU vs Stripe) turns into deep if/else spaghetti inside shared routes if not abstracted properly
- Can't scale, test, or roll out features independently per country
- Debugging/log tracing gets harder when all countries' traffic is mixed together

**Resolution:** shared code, isolated data, abstracted payments — gets the reuse benefit without the compliance/blast-radius risk.

---

## 4. How tenant detection will work (plain-language recap)

1. A visitor hits a domain (e.g. counsellorsofamerica.com).
2. Both counsellorsofindia.com and counsellorsofamerica.com point to the **same Azure App Service** — same running app.
3. `middleware.ts` reads the `Host` header on every request — this is the "receptionist" step.
4. It maps the host to a tenant ID (`in`, `us`, `ca`, `uk`, `au`) and loads that tenant's small settings file from `src/lib/tenants/`.
5. That settings file feeds: brand name/logo, currency, payment gateway, Supabase project credentials, timezone defaults, legal page links.
6. Everything downstream (templates, dashboard, booking) runs identically — only these settings differ per request.
7. **Fallback rule:** any unrecognized host (including localhost with no hosts-file entry) defaults to the `in` tenant, guaranteeing the live India site's behavior is never accidentally affected by this work.

**Local testing approach:** add fake entries to the Windows hosts file (e.g. `127.0.0.1 counsellorsofamerica.local`) to preview each tenant locally before any DNS/deployment work, by visiting `http://counsellorsofamerica.local:3000`.

---

## 5. Step-by-step sequencing

> Golden rule for every phase: **the live India site's behavior must stay byte-for-byte identical.** All work happens on a feature branch and is tested against a fake India-like scenario before merging.

### Phase 0 — Branching & tenant detection foundation
- [ ] Create `feature/multi-tenant` branch off current production branch *(do this before committing the files below — see note at end of this phase)*
- [x] Build `middleware.ts` (Host header → tenant ID, with `in` as safe fallback) — `src/middleware.ts`
- [x] Build `src/lib/tenants/{in,us,ca,au,uk}.ts` config skeletons — done, plus `types.ts` (shared interface), `index.ts` (registry + `resolveTenantId`), `server.ts` (`getCurrentTenant()` helper for server components/routes)
- [ ] Test locally via Windows hosts-file entries for each fake domain — **your turn:** add `127.0.0.1 counsellorsofamerica.local` to `C:\Windows\System32\drivers\etc\hosts`, run `npm run dev`, visit `http://counsellorsofamerica.local:3000`
- [ ] Exit criteria: fake us/ca/uk/au domains resolve to correct tenant; localhost and real India domain resolve to `in`

**Implementation notes:**
- Nothing in the app actually *reads* the tenant yet (no page/route calls `getCurrentTenant()` or the pricing/gateway logic isn't wired to it) — that's intentional. Phase 0 only builds the detection plumbing; Phases 1–3 start consuming it. This guarantees zero behavior change on the live India site right now.
- `middleware.ts` matcher excludes static assets/Next internals but runs on all pages + API routes, so payment routes can read `x-tenant` once Phase 2 wires them up.
- Stub tenants (`ca`, `uk`, `au`) resolve correctly for local testing but have `isLive: false` — flip that flag once Phase 5/6 are done for that country.
- **Recommended next step before going further:** create the `feature/multi-tenant` git branch now (if not already done) and commit these new files there, so Phase 1+ work stays isolated from `main` until it's fully tested.

### Phase 1 — Database separation
- [ ] Create 4 new Supabase projects: coi-us, coi-ca, coi-uk, coi-au
- [ ] Run existing schema migrations (therapists, appointments, assessment tables, etc.) into each new project
- [ ] India's existing Supabase project stays untouched
- [ ] Add tenant-aware Supabase client selection in supabase-server.ts
- [ ] Exit criteria: fake-tenant requests hit the correct isolated database; India requests hit the original DB unchanged

### Phase 2 — Payment gateway abstraction
- [ ] Set up Stripe account (test mode first)
- [ ] Build src/lib/stripe-client.ts (same interface shape as razorpay-client.ts: createOrder, verify)
- [ ] Build getPaymentProvider(tenant) — routes to Razorpay/PayU for `in`, Stripe for everyone else
- [ ] Update create-order, upgrade-plan, and booking payment routes to use this abstraction
- [ ] Exit criteria: test booking on fake us tenant completes via Stripe test mode; India flow unaffected

### Phase 3 — Pricing & currency
- [ ] Refactor getPlanPriceInr(plan, email) → getPlanPrice(plan, tenant, email) returning { amount, currency }
- [ ] Update pricing page, dashboard fee inputs, booking summaries to render tenant-correct currency
- [ ] Exit criteria: India pricing page still shows ₹1,499/₹2,499 unchanged; fake-US shows $ equivalent

### Phase 4 — Timezone-aware booking (new requirement, confirmed necessary)
- [ ] Add timezone field to therapist availability settings (auto-detected from country, editable)
- [ ] Store all appointment times in UTC in the database (not naive local-time strings)
- [ ] Convert to visitor's local timezone (via browser detection) when displaying available slots on the public booking page
- [ ] Update confirmation emails/WhatsApp messages to show times in the correct recipient-local timezone
- [ ] Exit criteria: a booking made by a UK visitor with a US therapist shows correct, unambiguous times to both parties

### Phase 5 — Branding & copy (start with America only)
- [ ] Update layout.tsx, SiteFooter, logo references to read from tenant config
- [ ] Write real homepage copy for the us tenant (hero text, testimonials, remove India-only wordmark section)
- [ ] Write about, why-us, blog, contact copy for us tenant
- [ ] Leave ca/uk/au as stub configs for now — do not spread across all 4 simultaneously
- [ ] Exit criteria: fake us domain shows correctly branded homepage/footer locally

### Phase 6 — Legal
- [ ] Obtain US-specific Privacy Policy + Terms of Service (consult a lawyer or reputable template service — do not reuse India's DPDP-Act-based copy)
- [ ] Add as tenant-specific routes/content
- [ ] Exit criteria: us tenant links to its own correct legal pages

### Phase 7 — Full regression test (India)
- [ ] Manually click through entire India flow locally end-to-end: signup → profile build → template selection → booking → Razorpay/PayU payment → dashboard → appointment management
- [ ] Confirm zero regressions introduced by all tenant-aware refactoring above

### Phase 8 — Staging deployment
- [ ] Create a staging deployment slot on the existing Azure App Service (do not deploy to production directly)
- [ ] Deploy feature/multi-tenant branch to staging slot
- [ ] Test staging slot with real Azure infra (temporary URL or test domain) — confirm tenant detection, Stripe, and separate DBs all work outside of local dev

### Phase 9 — Production merge & deploy
- [ ] Merge feature/multi-tenant into main branch
- [ ] Let existing GitHub Actions pipeline build and deploy as usual
- [ ] Immediately verify live India site behaves identically to before this work

### Phase 10 — Go live with America (domain + DNS)
- [ ] Azure Portal → Custom domains → add www.counsellorsofamerica.com (and counsellorsofamerica.com)
- [ ] Add the CNAME/TXT records Azure provides at the domain registrar
- [ ] Validate domain in Azure once DNS propagates
- [ ] Enable HTTPS via free App Service Managed Certificate
- [ ] Verify middleware.ts correctly resolves the real production domain (not just local hosts-file test)
- [ ] Run a real (or Stripe test-mode) booking end-to-end on the live America domain
- [ ] Switch Stripe to live keys once fully verified

### Phase 11 — Repeat for remaining countries, one at a time
- [ ] After America is stable for 1–2 weeks with no major issues, repeat Phase 5–6 (branding + legal) and Phase 10 (domain/DNS/go-live) for Canada
- [ ] Then UK
- [ ] Then Australia
- [ ] Never launch multiple new countries simultaneously — isolate risk and debugging surface

---

## 6. Open decisions / things to confirm before or during implementation

- [ ] Exact list of US/UK/Canada/Australia-specific fields needed on the therapist profile (e.g. licensing body equivalent to India's RCI, state/province fields instead of Indian city/state)
- [ ] Where current Privacy Policy / Terms of Service actually live in the app (not yet located — needs confirming before Phase 6)
- [ ] Confirm whether WhatsApp confirmation messages (India-specific today) should be replaced with SMS/email-only for other countries, or kept where feasible
- [ ] Confirm real domain registrar access for each new domain ahead of Phase 10

---

## 7. Notes on scope discipline

- Reuse, don't rebuild: templates, booking engine, dashboard, and auth are already production-hardened (ResizeObserver fixes, RLS policy fixes, duplicate-booking constraint fixes, etc.) — full rebuilds would throw away that work for no product benefit.
- Ship one country fully before starting the next — reduces the chance of an unstable multi-country launch and keeps debugging scope small.
- India's live traffic and revenue must never be put at risk by this work — every phase above is designed with an explicit "India stays identical" exit criterion.

---

## 8. Next immediate action

Start Phase 0: create the feature/multi-tenant branch and build middleware.ts + the first tenant config files (in.ts, us.ts).
