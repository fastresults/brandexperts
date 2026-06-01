# Plan v2: Pivot to "The Executive Brand Intensive" — preserving the original site's psychology

Same location (IGNITE Center, Norcross), same facilitator (Adam Anderson). New product: a 3-hour, 6-block, 15-deliverable executive personal-brand workshop.

The original site's persuasion engine is what's actually selling — we keep that engine intact and only swap the cargo. Below maps each existing psychological move 1:1 onto the new product so the page **feels** identical even though every word changes.

---

## The original site's psychology (what we are NOT changing)

| Move | Where it lives today | What it does to the reader |
|---|---|---|
| **Contrarian opener** ("Walk in with an idea. Walk out with a business built to earn.") | Hero H1 | Anchors a before/after transformation in one breath |
| **Category disqualifier** ("Most workshops teach. This one builds.") | `NotACourseBanner` | Frames competitors as inferior before competitors enter the reader's mind |
| **Time compression promise** ("Seven focused hours… by 4:30 PM") | Hero subhead + meta chips | Converts the workshop fee into a time-savings calculation |
| **Done-in-the-room vs. you-finish-at-home** | Flow strip + schedule cards | Pre-empts the "but I'll never actually do the homework" objection |
| **Scarcity + intimacy** ("Just 10 seats") | Meta chip, hero CTA | Justifies premium pricing without saying premium |
| **Operator authority, not guru authority** (Citi/Mayo/3M/Disney, Caribbean gov, 5 summits) | `FacilitatorSection` + `FacilitatorProof` | "He's done it, not just taught it" |
| **Public commitment as the close** (signed launch plan, room states it aloud) | Stage 7 / close-out | Loss aversion baked into the offer |
| **Value-stack math** (what an agency would charge vs. this) | `TotalsBar`, `ValueGrid`, `PricingTiers` | Reframes price as savings |
| **Hard-cost honesty** ("filing fees, hosting… aren't covered") | Banner footnote | Buys trust by naming what's NOT included |

Every Phase 1 rewrite below is keyed to one of these moves so the page's center of gravity doesn't shift.

---

## Phase 1 — Public site re-aligned (ship first)

### 1. Homepage (`src/routes/index.tsx`)

**Hero** — same shape (kicker → H1 → subhead → secondary line → CTAs → meta chips):
- Kicker: *"One afternoon. One executive. One launched personal brand operating system."*
- H1: **"Walk in with a title. Walk out *with a brand that ships without you*."**
- Subhead: 3-hour intensive at IGNITE Center, Norcross. You bring the bio, posts, and headshot — we build the publishing system, not a template. By the closing hour you'll have a finished bio, a publish-ready op-ed, a scheduled 30-day calendar, and an operating manual that runs on a 30-min weekly cadence.
- Secondary line (the time-compression close): *"The fastest path we know from blank profile to a brand that compounds — in one afternoon, with the next 90 days already scheduled."*
- Meta chips: date · IGNITE Center · 12 seats (cap from spec) · 30-year operator
- CTAs unchanged: "Claim one of 12 seats" / "See the 3-hour flow"

**`NotACourseBanner`** — keep the alarm-icon + chip layout, swap the cargo:
- Kicker: *"Most programs sell a framework. This one ships the assets."*
- H2: *"Walk in with a title. Walk out with assets shipped, posts scheduled, and a system that produces in your voice."*
- Body: Not a course, not a ghostwriter retainer, not another framework deck. In one focused afternoon you build the operating system of an executive brand — voice, bios, op-ed, POV post, framework carousel, newsletter, keynote opener, 30-day calendar — plus a 90-day arc already on auto-publish. You arrive with a profile. You leave with a publishing engine. *(Hard costs — scheduler/newsletter subscriptions, premium AI tier, any paid distribution — aren't covered by the workshop fee.)*
- Chips (3, same component): "Shipped in the room, not assigned as homework" · "Three hours. One executive. Fifteen finished assets." · "Real published work + a 30-min weekly cadence"

**`WalkInWalkOut`** — keep the side-by-side contrast. Left column = "What you walk in with" (a bio that's been stale 18 months, a LinkedIn that looks like everyone else's, 4 half-written drafts in Notes, a vague intention to "post more"). Right column = "What you walk out with" (the 15 deliverables grouped).

**New "What you leave with" section** — keep the existing flow-strip card visual ("Done in the room" / "You finish at home" pattern), but render the **15 deliverables in 3 groups of 5**:
- Brand Foundation (1–5): Brand Blueprint · Brand Assessment · Voice Profile · 3 Bios · Headshot set
- Publish-Ready Content (6–10): Op-Ed · POV Post · Framework Carousel · Keynote Opener · Newsletter Issue
- Compounding System (11–15): 30-Day Authority Sprint · 90-Day Newsletter Arc · 2 Weeks Scheduled Posts · Reusable Presets · Personal Brand Operating Manual
- Each card uses the same `Check`-icon "done in the room" pattern. "You finish at home" reduces to one line per group ("Run the 30-min weekly cadence" etc.) — preserves the honesty hook.

**`ArtOfThePossible`** — re-cast as "What an executive brand actually looks like when it ships" — show before/after examples (stale LinkedIn About vs. generated medium bio; one Op-Ed becoming newsletter + keynote + 14 posts). Same visual rhythm.

**`FacilitatorSection` + `FacilitatorProof`** — Adam stays. Rewrite the proof-row table so each row maps a workshop block to a credibility moment (e.g. *Block 2 — Voice → "Wrote the national narrative for a Caribbean country's investor program; built brand experiences for Mayo Clinic and 3M seen by thousands."*). 7 rows → 6 rows. Keeps the "operator, not guru" frame.

**`BottomCTA`** — same scarcity close: "12 seats. One afternoon. A brand that ships on its own from here on out."

**SEO `head()`** — new title/description/og built around "Executive Brand Intensive · One afternoon · Norcross, GA · 15 finished assets and a publishing system that runs itself."

### 2. Schedule (`src/routes/schedule.tsx` + `src/lib/schedule-data.ts` + `src/lib/curriculum-data.ts`)

Keep the existing visual shell (numbered stage cards, "Done in the room" / "You finish at home" sections, hour markers). Replace `STAGES` with **6 blocks**:

| n | Block | Time | Walk-out (room) | Finish at home |
|---|---|---|---|---|
| 1 | Foundation — Who you are on the record | 0:00–0:30 | Brand Blueprint, Brand Assessment Report | — |
| 2 | Voice — Sound like yourself at scale | 0:30–1:00 | Voice profile, 3 bios, headshot set, 3 saved presets | Replace LinkedIn About by end of block |
| 3 | Signature Content — The Authority Trio | 1:00–1:45 | Op-Ed, POV post, framework carousel | Publish the POV post today |
| 4 | Distribution & Repurposing | 1:45–2:30 | Newsletter, keynote opener, talking-points doc, 14 days of scheduled posts | (Optional) press release draft |
| 5 | The Compounding System | 2:30–2:55 | 30-Day Sprint, 90-Day Arc, organized workspace, weekly ritual doc | Run the 30-min weekly cadence |
| 6 | Commitments & 90-day cadence | 2:55–3:00 | Public commitment stated to the room | 90-day cadence on the calendar |

- `buildEvent()` updated: `timeLabel: "1:00 PM – 4:00 PM ET"`, `durationLabel: "3 hours"`.
- Lunch / coffee-reset entries removed; 5-min stretch between Block 3 and Block 4 kept (mirrors original coffee-reset block — preserves the rhythm visual).
- `FLOW_STAGES` keeps mapping over `STAGES`; verify no `STAGES[6]` access.

### 3. Facilitator page (`src/routes/facilitator.tsx` + `src/components/facilitator/*`)

Rewrite the four audience cards in `FacilitatorAudience.tsx` to the spec's audience:
- Founders & CEOs building inbound from their profile
- Executives in transition who need a public brand fast
- Authors, speakers, consultants monetizing authority
- Newly-appointed C-suite showing up credibly in the first 90 days

`FacilitatorHero / Pillars / Stats / Story / Timeline / CTA` — recast Adam's bio toward "built executive-grade brand systems in the AI era," keeping every existing credential (Citi/Mayo/3M/Disney, Caribbean government, 5 summits). The credibility doesn't change; the lens does.

### 4. Cohort + value surface (`src/lib/cohorts.ts`, `src/lib/value-grid.ts`, `src/components/value/*`)

- `FALLBACK_COHORT`: keep July 23, 2026 as the date but shorten window to **1:00 PM – 4:00 PM ET** (afternoon intensive). Regenerate `startISO`, `endISO`, ICS file.
- `VALUE_TOTALS` / `ValueGrid` / `TotalsBar` — replace with the spec's value-stack table (positioning workshop $5–12K, bio writer $0.8–2K, ghostwritten article $1.5–4K, voice model $3–8K, content calendar $3–6K, keynote talking-points $1.5–3K, newsletter strategy $2–5K, operating manual $1–3K → **$15K–$40K agency comparable, delivered in 3 hours**).
- `PricingTiers` / `CohortPicker` — two-tier kept (founders / cohort), copy rewritten. Actual fee numbers in Q1 below.
- `toPublicSeats` math kept; cap raised to **12** to match spec ("cap at 12 for full facilitator attention").

### 5. Site chrome

- `SiteHeader` nav unchanged.
- `register.tsx` hero rewritten with the same scarcity/operator framing; pre-work checklist (bio, LinkedIn URL, 2–3 past posts, company URL + competitor URL, 3 topics, headshot) added as a registration-time disclosure so attendees self-qualify.
- `Footer` tagline updated.

### 6. Memory

Save Core: *"Product is the Executive Brand Intensive — 3-hour exec personal-brand workshop in Norcross. Facilitator: Adam Anderson. Audience: execs/founders/authors/C-suite. Preserve original site's psychology (contrarian opener, done-in-room vs. finish-at-home, scarcity, operator authority, value-stack math, public commitment close) — only the cargo changes. Do not re-introduce 7-stage startup-formation copy."*

**Out of scope for Phase 1:** DB, attendee dashboard, admin pipeline, brief/workflow flows.

---

## Phase 2 — Attendee experience (after Phase 1 ships)

Mirror Phase 1's psychology in the attendee dashboard:
- **Lean option (2A):** replace `/dashboard` with a "Workshop Companion" route — 6 blocks as collapsible cards, 15 deliverable checkboxes, pre-work upload, weekly cadence card. Same "Done in the room / Run at home" visual pattern as the public schedule.
- **Full option (2B):** rewrite `WORKFLOW` (25 startup items) into the 15 brand deliverables; rewrite `BRIEF_FIELDS` for executive intake (bio, LinkedIn, past posts, company URL, competitor URL, 3 topics, headshot); rebuild `dashboard.brief.tsx`, `dashboard.workflow.tsx`, `dashboard.deliverables.tsx`. Heavier lift; keeps the agentic AI generation pattern.

---

## Phase 3 — Admin + DB cleanup

- Migration replacing `deliverable_types` with the 15 brand deliverables (archive, don't drop).
- Update `admin.attendees.$userId.workflow.tsx` / `.deliverables.$key.tsx` / `admin.cohorts.tsx` / `admin.site.tsx`.
- Audit `pipeline.functions.ts`, `userPipeline.functions.ts`, `stageIntake.functions.ts`, `founderMemory.*`, `discovery.*`, `routes/api/public/hooks/publish-due-deliverables.ts` for stage-name leakage.

---

## Phase 4 — Optional companion artifacts

- Facilitator Run-Sheet (PDF)
- Attendee Workbook (PDF) — and/or live companion page (Q3)

---

## Open questions (please answer before Phase 1 ships)

1. **Pricing.** Two-tier kept (founders / cohort)? What are the actual fees?
2. **Attendee dashboard:** Phase 2A (lean) or 2B (full rebuild)?
3. **Attendee workbook:** PDF only, or PDF + live companion page?
4. **Date:** Keep July 23, 2026 (afternoon-only) or pick a new date?

---

## Technical notes (Phase 1)

- Don't touch `src/routes/_authenticated/**`, `src/lib/workflow.ts`, `deliverable_types`, or any migration in Phase 1.
- `EVENT.timeLabel` / `durationLabel` are derived in `buildEvent()` — update from the cohort, not by hard-coding strings.
- `STAGES.length` drops 7 → 6 → verify no `STAGES[6]` access anywhere (homepage flow strip and schedule both `.map` over the array, so this is safe).
- All Phase-1 copy lives in TSX route files + `src/lib/*-data.ts`; design tokens unchanged (keep current dark theme, hero gradient, type system, lucide icon set).
- After edits: verify `/`, `/schedule`, `/facilitator`, `/register` render with new copy and updated SEO `head()`.
