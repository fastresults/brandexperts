# Plan: Homepage copy overhaul — "The Brand Operating System for Executives in the AI Era"

You're right. The current copy describes a workshop. It doesn't sell a category, doesn't name an enemy, and doesn't make a busy executive feel they'd be reckless to skip it. This pass rewrites the homepage copy only — no layout changes, no new sections. Same skeleton, completely different voice.

## The new positioning thesis (the spine every section hangs off)

> **AI just lowered the floor on executive work. The only executives who'll matter in five years are the ones with a brand operating system running underneath them — producing in their voice, on a schedule, while they run the company.**
>
> **In one afternoon, we install yours. You don't learn it. You don't homework it. You walk out operating it.**

Three things this fixes vs. the current copy:

1. **Names the enemy.** AI is compressing what executives uniquely contribute. A title and a résumé no longer carry signal — the executives who survive are the ones with a public, compounding thought-asset base.
2. **Names the category.** "Brand Operating System" stops being a feature buried at the bottom and becomes THE thing on offer — a proprietary asset, like an ERP for your reputation.
3. **Respects how busy they are.** Three nouns they walk out with: an **understanding** (the system), a **tool** (their installed BOS), a **work product that publishes on its own**. No assignments. No retainers. No willpower required.

## Section-by-section copy rewrite

### 1. Hero (lines 137–177)

- **Kicker**: "For executives whose résumé no longer does the work it used to."
- **H1**: *"While AI flattens everyone else, you install a Brand Operating System that compounds in your name."*
- **Subhead**: One afternoon at the IGNITE Center in Norcross, GA. You walk in as a title. You walk out operating a system that publishes in your voice, on your calendar, without you in the loop — for the next 90 days and every quarter after.
- **Proof line**: "Built by the operator who's installed brand systems for Fortune 500 boards, a sovereign government, and the AI-native frontier — for clients who couldn't afford to get it wrong."
- **CTA buttons stay** ("Claim one of N seats" / "See the 3-hour flow") — wording unchanged.
- **Meta chips stay** — visuals unchanged.

### 2. NotACourseBanner (lines 76–110)

- **Kicker**: "The market is flooded with courses and ghostwriters. Neither survives an AI-era executive's calendar."
- **H2**: *"You're not buying a curriculum. You're getting a system installed — in your voice, in one room, in three hours."*
- **Body**: A course gives you knowledge you don't have time to apply. A ghostwriter gives you a dependency you can't scale. The Brand Operating System gives you a self-running asset — 15 finished pieces leave the room with you, and a 30-minute weekly cadence keeps the engine producing without rebuilding it. *(Hard costs — scheduler/newsletter subscriptions, premium AI tier, paid distribution — aren't covered.)*
- **Three chips** (right column):
  - "Installed in the room — not assigned as homework"
  - "Runs on 30 minutes a week — not your willpower"
  - "Outlives the workshop — quarter after quarter"

### 3. WalkInWalkOut (lines 274–362)

- **Eyebrow**: "What three hours actually changes"
- **H2**: *"Between 1:00 PM and 4:00 PM, your brand stops being a side project and starts being infrastructure."*
- **"What you walk in with"** stays a list of indictments, but sharper and more executive-coded: a bio written for a job you no longer hold; a LinkedIn About indistinguishable from three peers in your category; thinking that only lives in DMs and back-channels; a vague resolution to "post more" that hasn't survived a board week; a ghostwriter line item you can't justify to your CFO.
- **"What you walk out with"** keeps the three-phase grouping but re-titled:
  - Phase 1 — **Foundation installed** (voice locked, AI writes as you, bios shipped)
  - Phase 2 — **Authority assets published** (Op-Ed, POV post, framework carousel, keynote, newsletter — all in your voice, all ready to ship)
  - Phase 3 — **The system running without you** (30-day sprint, 90-day arc, 14 days auto-publishing, the BOS playbook)

### 4. WhatYouLeaveWith (lines 364–414)

- **Eyebrow**: "15 finished assets. One installed system. Zero homework."
- **H2**: *"Each of these is what an executive normally pays a specialist firm to produce — except yours leave the room locked to your voice, on the same afternoon."*
- **Subhead**: Three modules of the Brand Operating System. Five assets per module. Every one shipped in the room, every one yours to run.
- **WALKOUT_PHASES copy (lines 566–608) intro sentences and "runAtHome" lines** rewritten to feel like operating instructions rather than to-do items. Item names stay the same; the descriptions get tightened to executive register (one crisp sentence each, no filler).

### 5. FacilitatorSection (lines 192–264)

- **Eyebrow**: "Who installs it"
- **H2**: *"Adam Anderson — 30 years building the brand systems other people teach about."*
- **Body (rewritten paragraphs)**: Adam is one of a handful of operators fluent in three rooms that almost never overlap — Fortune 500 boardrooms (Citigroup, Mayo Clinic, 3M, Disney), sovereign cabinet ministries (seven years embedded with the Federation of St. Kitts & Nevis, branding its national investor program and producing five Caribbean Investment Summits), and the AI-native product trenches (five SaaS platforms shipped with the toolchain he installs in this room). He's spent the last two years compressing what used to take a 90-day agency engagement into a single afternoon — because the executives he works with don't have 90 days, and AI no longer leaves room to wait.
- **Closer line**: "When he installs your BOS, he's installing the same operating model he runs on himself."

### 6. BottomCTA (lines 517–554)

- **H2**: *"Twelve seats. One afternoon. A brand operating system that outruns the AI flood."*
- **Body**: If you've been waiting for the right week to finally show up publicly, this is the afternoon you stop waiting — and stop being one of the executives AI is quietly making interchangeable. Bring the bio, the posts, and the headshot. We bring the operator, the room, and the system that produces in your name long after you leave.
- **CTA button text unchanged.**

### 7. Page `<head>` metadata (lines 30–47)

- **Title**: "The Executive Brand Intensive — Install a Brand Operating System in one afternoon."
- **Description**: "Three hours at the IGNITE Center in Norcross, GA. Twelve seats. You walk in as a title. You walk out operating a Brand Operating System that publishes in your voice, on its own, for the next 90 days and every quarter after."
- **og:title**: same as title.
- **og:description**: tightened version of above.

### 8. `FACILITATOR_TITLE` (lines 15–16)

Replace the current tag with: *"30-year brand operator · Co-Founder, OPEN Interactive · Has installed executive brand systems for Fortune 500 boards, a sovereign government, and AI-native operators who couldn't afford to get it wrong."*

## What is NOT changing in this pass

- No layout, spacing, color, type, or component changes.
- No new sections, no removed sections.
- No image swaps.
- No changes to schedule, register, dashboard, materials, facilitator route, or any other page (those get their own pass if you like this one).
- No pricing changes; capacity stays at 12 total (6 per tier).
- No date/venue changes.

## Technical notes

- All edits live in `src/routes/index.tsx` plus the `WALKOUT_PHASES` constant at the bottom of that file.
- `FACILITATOR_NAME` and `FACILITATOR_TITLE` are exported and re-used by `src/routes/facilitator.tsx` — updating the title constant will ripple to that page automatically. Anything that looks off there gets handled in a follow-on pass.
- Copy will use the same JSX structure and class names; only the strings inside text nodes change. No risk to layout, responsiveness, or the persuasion-engine order.

## After you approve

I'll execute the rewrite in one pass, then suggest doing the same surgical treatment on the `/schedule`, `/facilitator`, and `/register` pages so the voice is consistent across the funnel.
