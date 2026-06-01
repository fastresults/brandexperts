# Why this keeps happening

The app has two parallel deliverable systems wired up at the same time:

1. **Brand Intensive (correct)** — `/dashboard/brief` (brand brief chat) → `/dashboard/deliverables` (rendered from `attendee.functions.listMyDeliverables` and admin-published `deliverable_types`). This is the product per project memory: a 3-hour Executive Brand Intensive.

2. **Legacy startup-formation pipeline (wrong product)** — `/dashboard/workflow` + `/dashboard/workflow/$key`, backed by `src/lib/workflow.ts` (7 stages: Form, Customer, Offer, Build, Brand, Marketing, Launch) and `src/lib/userPipeline.functions.ts` (`getMyWorkflow`, `runMyDeliverable`). It reads a separate "Startup Brief" (`attendee_business_brief`, 10 fields like `one_line_pitch`, `origin_story`), which is why the page in screenshot 2 says "Finish your Startup Brief first (0 / 10 fields done)" and shows "GA LLC Filing Packet, EIN Issued, ToS, Funding model…" — none of which belong to the Executive Brand Intensive.

The Brand Brief complete card ("Review my brief" screenshot) correctly points "Review my brief" at `/dashboard/brief`. The problem is **every other** "deliverables / plan / 90-day" link in the app still points at the legacy `/dashboard/workflow`, so the moment the user clicks anywhere downstream of the brief they land in the startup product. Specifically:

- `src/routes/_authenticated/dashboard.index.tsx`
  - L254 — "Generating in the background" card → `/dashboard/workflow`
  - L301 — "View" link on a deliverable preview → `/dashboard/workflow/$key`
  - L340 — Next-action CTA: `"Open your 90-day plan" → /dashboard/workflow`
  - L380 — `BriefCompleteCard secondary={{ to: "/dashboard/workflow", label: "Browse the 15 deliverables →" }}` ← exact link from screenshot 1
  - L407 — Walk-out moment "Take me to my 90-day plan" → `/dashboard/workflow`
  - The "Finish your Startup Brief" yellow alert in screenshot 2 is rendered by `dashboard.workflow.tsx` L43–48, driven by `useQuery(getMyWorkflow)` which reads the startup brief, not the brand brief.
- `src/routes/_authenticated/dashboard.tsx` L104 — sidebar "Plan" item → `/dashboard/workflow`
- `src/components/brief/BriefCompleteCard.tsx` — copy hard-codes "Browse the 15 deliverables"; it doesn't know which surface is correct.

Result: the brand brief flow ends cleanly, then any forward navigation drops the user into a different product that's still half-wired in the codebase.

# Durable fix

Treat `/dashboard/workflow` and the underlying startup-pipeline UI as removed product. All forward navigation from the brand brief lands on brand-intensive surfaces. No "Startup Brief" wording, no 7-stage form/customer/offer/build pipeline, no `getMyWorkflow`-driven readiness gate anywhere a brand-intensive attendee can see.

## 1. Repoint every consumer-facing link off `/dashboard/workflow`

In `src/routes/_authenticated/dashboard.index.tsx`:
- L254, L340, L380, L407 → `/dashboard/deliverables` (the brand-deliverables page).
- L301 deliverable-preview "View" → `/dashboard/deliverables` (the brand deliverables page doesn't currently route per item; either drop the per-item link or, if desired, scroll-to-anchor by deliverable key).
- Rewrite next-action copy: replace "Open your 90-day plan" and "Browse the 15 deliverables" with brand-intensive language ("See your deliverables", count sourced from `listMyDeliverables`).
- Remove the "Generating in the background" widget if it depended on `getMyWorkflow`; replace its data source with `listMyDeliverables` from `src/lib/attendee.functions.ts` so the count reflects the real brand deliverables.

In `src/routes/_authenticated/dashboard.tsx` (sidebar):
- Remove the "Plan" item (or repoint it to `/dashboard/deliverables`; "Made by your AI" in `dashboard.files.tsx` already covers this destination — prefer remove to avoid duplicate nav).

In `src/components/brief/BriefCompleteCard.tsx`:
- Stop hardcoding "15 deliverables". Either accept a `secondaryLabel` from the caller (already supported via `secondary.label`) and let each caller pass the right copy, or accept a `deliverableCount` prop. Default secondary destination remains `/dashboard/deliverables`.

## 2. Retire the legacy startup-workflow surface

Delete the user-facing routes so nothing can land there again:
- `src/routes/_authenticated/dashboard.workflow.tsx`
- `src/routes/_authenticated/dashboard.workflow.$key.tsx`

Leave the server-side files (`src/lib/userPipeline.functions.ts`, `src/lib/workflow.ts`, `src/lib/pipeline.functions.ts`) in place for this pass — they're imported by admin routes (`admin.attendees.$userId.workflow.tsx`, `admin.attendees.$userId.deliverables.$key.tsx`). Mark them as admin-only / legacy in a single header comment, and follow up with a separate cleanup task once admin surfaces are migrated. This keeps the user-facing fix scoped and reversible.

## 3. Kill the "Startup Brief" gate everywhere a member can see it

The "Finish your Startup Brief first (0 / 10 fields done)" banner only exists on `/dashboard/workflow`. Deleting that route removes the banner. Audit once more for any other component reading `getMyWorkflow` / `attendee_business_brief.completeness_score` and rendering it to members; expected hits are zero after step 2, but confirm with a grep before closing.

## 4. Verification

- Sign in as a brand-intensive member with a completed brand brief.
- On `/dashboard`, the BriefCompleteCard's secondary link reads brand-intensive copy and navigates to `/dashboard/deliverables` — not `/dashboard/workflow`.
- Visiting `/dashboard/workflow` directly 404s (route deleted) and there is no sidebar entry for "Plan".
- No screen visible to a member mentions "Startup Brief", "GA LLC Filing Packet", "EIN Issued", "Form / Customer / Offer / Build / Brand / Marketing / Launch", or "90-day plan".
- Admin pages under `/admin/attendees/$userId/workflow` still load (legacy server fns intact).
- Run a project-wide search for `/dashboard/workflow` and confirm only admin or test files remain.

## Files touched (member-facing fix)

- `src/routes/_authenticated/dashboard.index.tsx` (repoint links, swap data source for counts, update copy)
- `src/routes/_authenticated/dashboard.tsx` (sidebar nav)
- `src/components/brief/BriefCompleteCard.tsx` (remove hardcoded "15 deliverables")
- delete `src/routes/_authenticated/dashboard.workflow.tsx`
- delete `src/routes/_authenticated/dashboard.workflow.$key.tsx`

## Out of scope (follow-up)

- Removing `src/lib/userPipeline.functions.ts`, `src/lib/workflow.ts`, `src/lib/pipeline.functions.ts`, the `attendee_business_brief` table, and the admin "workflow" tab. These are still wired to admin tooling and should be migrated in a dedicated cleanup PR.
