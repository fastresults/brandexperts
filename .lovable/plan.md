## Problem

The Today page (`/dashboard`) reads completion from the legacy `attendee_business_brief.completeness_score` column. The current brief flow writes to `attendee_brief_summary` (with `completed_at`) instead. Users who finish the chat-based brief still see the "We haven't matched you to a workshop date yet. While you wait, start your brief." + "Start the conversation" CTA — making the dashboard look broken.

Confirmed for `fastresults@gmail.com`:
- `attendee_brief_summary.completed_at` is set (5,250-char summary, 15 facts)
- `attendee_business_brief` row is empty → `completeness_score = 0`
- `profiles.member_status = approved`, so the `_authenticated` gate passes
- Result: Today page renders `NoCohortMode` with `briefScore = 0` → "Start the conversation"

## Fix

Make the Today page read brief completion from the new system (`attendee_brief_summary.completed_at`) instead of the legacy score.

### 1. `src/lib/brief.functions.ts` — extend `getMyBrief`

Inside the handler, after fetching `attendee_business_brief`, also fetch the summary row:

```ts
const { data: summary } = await supabase
  .from("attendee_brief_summary")
  .select("completed_at, summary_text")
  .eq("user_id", userId)
  .maybeSingle();

return {
  brief: data ?? ins,
  summaryCompletedAt: summary?.completed_at ?? null,
  summaryText: summary?.summary_text ?? null,
};
```

Return shape stays serializable. The legacy `brief` object is untouched so nothing else breaks.

### 2. `src/routes/_authenticated/dashboard.index.tsx`

Derive a single source of truth at the top of `TodayPage`:

```ts
const briefDone = !!brief.data?.summaryCompletedAt;
const briefScore = briefDone ? 10 : (brief.data?.brief?.completeness_score ?? 0);
```

This keeps the existing `briefScore`/`briefReady`/`pct` math working, and `briefDone` flips both `BeforeMode` and `NoCohortMode` into the "complete" branch.

In `NoCohortMode` (around line 360-385):
- When `briefDone`: render `BriefCompleteCard` with a "We'll match you to a workshop soon" footnote instead of the "Start the conversation" `NextActionCard`.
- Headline copy: keep "Welcome", swap subhead to "Your brief is complete. We'll match you to a workshop date shortly."

Pass `briefDone` down to `BeforeMode` and `NoCohortMode` (small prop addition); the existing `briefDone = briefScore >= briefTotal` line in `BeforeMode` becomes `briefDone` from props.

### 3. No DB migration, no schema changes, no auth changes

Both tables already exist, both already have correct RLS, the user is already approved. This is a pure read-path fix.

## Out of scope

- The legacy `attendee_business_brief` table and `updateBriefField` server fn stay as-is (admin tools still use them).
- `dashboard.brief.tsx`, `dashboard.day.tsx`, deliverables, materials — unchanged.
- No changes to the `_authenticated` gate or member-status logic.

## Files touched

- `src/lib/brief.functions.ts` (extend return shape of `getMyBrief`)
- `src/routes/_authenticated/dashboard.index.tsx` (read `summaryCompletedAt`, flip CTA when done)
