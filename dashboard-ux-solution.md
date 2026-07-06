# Dashboard UX Redesign — Solution Plan
## Counsellors of India

---

## Root Problems (Diagnosed)

1. **No clear mental model** — user lands on the dashboard and sees stats, cards, buttons, links all at once with no clear "what do I do first" path.
2. **Two editing surfaces fighting each other** — "Edit website" (appearance page) and "Settings" both let you edit your public-facing info. User has no idea which one to use.
3. **The appearance editor is confusing** — Edit content vs Edit sections vs Preview vs Publish are all separate actions with no clear sequence. On mobile it's especially broken.
4. **Color inconsistency** — the dark `#171412` card is the visual hero of the dashboard but it's off-brand and competes for attention vs the saffron brand color.
5. **Unnecessary duplication** — the old dashboard code is still there (inside `{false && (...)}`) adding dead weight and confusion in the codebase.

---

## The Core Principle Going Forward

> **One path. One action. One save.**

The user should always know:
- Where they are
- What to do next
- What will happen when they click something

---

## Solution: 3 Phases

---

### Phase 1 — Dashboard Page (`/dashboard`)

**What changes:**

#### 1. Remove the dark `#171412` card entirely
Replace it with a clean saffron-accented **"Your practice at a glance"** strip — light background, minimal, just the public URL + copy/share/view buttons. No heavy dark box.

#### 2. Single clear "Next action" CTA
Instead of multiple cards competing, one prominent saffron button at the top that changes based on the user's state:
- No template chosen → **"Choose your template →"**
- Template chosen, no content → **"Add your content →"**
- Content added, not published → **"Publish your site →"**
- Published → **"View your live site →"**

This replaces the current `StepTracker` and `readinessItems` grid with a single focused nudge.

#### 3. Collapse the stats until there's real data
The 3 stat cards (Upcoming / Today / Rescheduled) showing `0 0 0` on an empty account look like a broken dashboard. Hide them behind a "View bookings →" link until at least one booking exists.

#### 4. Remove the old `{false && (...)}` code block
Dead code. Delete it. Reduces file from ~600 lines to ~300.

#### 5. Navbar in dashboard sidebar
Remove "Edit website" and "Set booking hours" as separate top-right buttons. These belong in the sidebar nav, not as top-level page CTAs.

**Visual direction:**
- Background: `#FAFAF8` (warm off-white)
- Cards: white with `1px solid rgba(31,26,20,0.08)` border
- Primary action: `#FF9933` saffron
- Accent text: `#C2650A` (darker saffron, readable on white)
- No black/dark cards

---

### Phase 2 — Merge "Edit Website" + "Settings" into One Flow

**The problem:** Users edit their name/bio/photo in Settings (`/dashboard/settings`) but those fields also appear on the website. The appearance editor has a separate "Edit text & photos" panel that edits `profile_content` (template-specific extras). Two places, one mental model — it breaks.

**The solution:** A single **"My Profile & Website"** page, structured as a left-nav tabbed editor:

```
[ My Profile & Website ]
  ├── Basic Info       ← name, photo, bio, credentials, fee, phone, location
  ├── My Services      ← what you offer, prices, session types
  ├── Availability     ← days, times, session duration (currently at /dashboard/availability)
  ├── Template         ← pick which design (currently buried in appearance)
  └── Sections         ← show/hide, reorder (currently in appearance drawer)
```

This way:
- There is **one place** to edit everything
- The user never has to ask "where do I change my photo?"
- The appearance editor becomes purely a **visual preview** — you see the result, you don't edit there

**On mobile:** The left nav collapses to a horizontal tab strip at the top.

---

### Phase 3 — Appearance Page (`/dashboard/appearance`) Simplified

**What it becomes:** A **read-only live preview** with a single floating action bar.

The editing drawer is removed. Instead:

- Left sidebar: template list (as it is now) ✓
- Center: live iframe preview ✓
- Top bar: only 3 buttons — **"Edit content"** (goes to My Profile & Website), **"Preview in new tab"**, **"Publish"**
- No drawer, no mode switching, no "choose what to edit" step

The "Edit content" button now links to `/dashboard/profile` (the new merged page) instead of opening a drawer. This removes the confusion entirely — you can't edit inline here, you go to the dedicated editor.

**Why this is better:**
- Preview and editing are separated by navigation, not by a drawer overlay
- On mobile, the user goes to `/dashboard/profile` on their phone (full screen, native-feeling form) instead of trying to use a 460px drawer on a 390px screen
- The Publish button's purpose is now crystal clear — it applies what you've already edited elsewhere

---

## Implementation Order (Step by Step)

### Step 1 — Clean dashboard page
- Delete `{false && (...)}` block
- Replace dark card with light saffron URL strip
- Replace `StepTracker` + `readinessItems` grid with single state-aware CTA
- Hide stats until `stats.total > 0`
- Keep bookings pipeline as-is (it's fine)

### Step 2 — Create `/dashboard/profile` merged editor
- New page with tabbed layout: Basic Info / Services / Availability / Template / Sections
- Basic Info tab = what's currently in `/dashboard/settings`
- Services tab = what's currently in the CT1-CT5 content editors (inside the appearance drawer)
- Availability tab = what's currently at `/dashboard/availability` (link or embed)
- Template tab = template picker (currently in appearance page left sidebar)
- Sections tab = show/hide/reorder (currently in appearance drawer)

### Step 3 — Simplify appearance page
- Remove the edit drawer entirely
- Change "Edit content" button to link to `/dashboard/profile`
- Keep template sidebar + iframe preview
- Keep Publish button

### Step 4 — Update sidebar navigation
Replace current nav items with:
- Home (dashboard overview)
- My Website (appearance — preview + publish)
- Profile & Content (the new merged editor)
- Bookings
- Availability
- ~~Settings~~ (merged into Profile & Content)

### Step 5 — Color pass
- Replace all `#171412` usage in dashboard with white cards + saffron accents
- Primary buttons: `#FF9933`
- Active states: `rgba(255,153,51,0.12)` background + `#C2650A` text
- No dark/black backgrounds anywhere in the dashboard

---

## What We Are NOT Changing

- The booking templates themselves (QuietRoom, CT1-CT5) — they're fine
- The Supabase schema — no new columns needed
- The `WhatsApp` flag logic — already done
- Pricing page, auth pages, public profile pages

---

## Summary Table

| Current | Problem | Fix |
|---|---|---|
| Dark `#171412` hero card | Off-brand, visually dominant | Light card with saffron URL strip |
| StepTracker + readiness grid | Too many things at once | Single state-aware CTA |
| Settings page (edit profile) | Duplicates appearance editor | Merge into `/dashboard/profile` |
| Appearance edit drawer | Confusing, broken on mobile | Remove drawer, link to `/dashboard/profile` |
| `{false && (...)}` old code | Dead weight | Delete |
| Stats showing `0 0 0` | Looks broken | Hide until data exists |
| Two "edit" surfaces | User never knows which one | One merged editor, one preview |
