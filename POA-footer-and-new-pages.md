# POA — Footer Nav Links + 5 New Pages
**Project:** counsellors-of-india (`C:\Users\HP\Downloads\counsellors-of-india`)
**Created:** 2026-07-09
**Status:** ✅ Complete — all 5 pages built, footer wired, contact page + API added.

---

## Final status (2026-07-09)

- **Footer** (`src/components/layout/SiteFooter.tsx`) — already had all 5 links wired: About Us, Why Us, Blog, Contact (under "Company"), Onboarding Guide (under "Support"). No changes needed.
- **`/about`** — built. Full About Us copy (vision, 4 pillars, "Why COI", "Looking Ahead").
- **`/why-us`** — built. Comparison table + 3 subsections.
- **`/onboarding-guide`** — built. Uses `src/components/onboarding/OnboardingSteps.tsx` for the 7-step accordion flow.
- **`/blog`** — built as a shell (no real posts yet, per original plan).
- **`/contact`** — built this session:
  - `src/app/contact/page.tsx` — page shell using `MarketingHeader` + `SiteFooter`.
  - `src/components/contact/ContactForm.tsx` — client form (Name, Email, Mobile required; Concern optional), calls `/api/contact`.
  - `src/app/api/contact/route.ts` — validates input, stores submission in a new `contact_submissions` Supabase table, and emails the team via the same SMTP/nodemailer pattern used in `booking/hold`. Storage and email are independent — a failed email doesn't lose the submission.
  - **Migration required**: `migration_contact_submissions.sql` — run this in Supabase SQL editor before the contact form will work (creates the `contact_submissions` table).
- **`MarketingHeader.tsx`** — shared lightweight header for all 5 standalone pages, already links to all 5 including `/contact`.

## Remaining / optional follow-ups
- Blog has no real posts yet — still an open question whether posts will be static MDX or CMS-backed (per original plan, section 2d).
- Contact form currently emails the team but doesn't send the submitter an auto-reply confirmation — flag if that's wanted.
- No admin UI yet to view `contact_submissions` — currently just a Supabase table + email notification. Could add a simple admin list view later if needed.
