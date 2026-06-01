# Update brief after revision

## Problem

Today, when a user revises answers, `reviseBrandBrief` clears the saved summary and the only way to get a new finished brief is to chat through every section again until the model decides to call `finish_brief`. Users who only tweak one or two answers have no clear path back to a regenerated final brief on their dashboard.

## Goal

Give the user a single, obvious **"Update brief"** button that:
1. Regenerates the final markdown brief from their current facts (no chat round-trip required).
2. Marks the brief complete (`completed_at`) so the dashboard's `FinishedView` renders the updated brief.
3. Works whether they changed one answer or many.

## Plan

### 1. Server: regenerate-and-finalize function
File: `src/lib/brand-brief.functions.ts`

Add `regenerateBriefSummary` (createServerFn, POST, requireSupabaseAuth):
- Load all `attendee_brief_facts` for the user + founder profile (resume `raw_text` / `extracted`) for grounding.
- Require at least N facts (e.g. ≥ 6 or the spine sections marked required); otherwise return `{ ok: false, reason: "insufficient" }` for the UI to surface.
- Call Lovable AI (`google/gemini-2.5-pro`) with the same FINAL-BRIEF FORMAT skeleton already documented in `src/routes/api/brief-chat.ts` (extract that prompt into a shared constant in `src/lib/brief-format.ts` so both the chat tool and this fn stay in sync).
- Compute `spine_coverage` the same way the existing `getBrandBrief` progress logic does.
- Upsert into `attendee_brief_summary` with `markdown`, `spine_coverage`, `completed_at = now()`.
- Return `{ ok: true }`.

No schema changes — the table already supports this shape.

### 2. UI: "Update brief" button
File: `src/routes/_authenticated/dashboard.brief.tsx`

In the in-progress header (currently shows `<ReviseActions />` as a link), add a primary CTA next to it:

```
[ Update brief ]   Revise answers · Clear everything
```

Behavior:
- Visible whenever `facts.length >= MIN_FACTS` AND `!finished` (covers both the post-revise state and the "user edited a fact inline" state).
- On click → call `regenerateBriefSummary`, then `brief.refetch()`. Loading state with spinner; toast on success ("Brief updated"); error toast on failure.
- After refetch, `summary.completed_at` is set, so the page automatically renders `FinishedView` with the new markdown — same surface they already know.
- If the fn returns `{ ok: false, reason: "insufficient" }`, toast: "Answer a few more sections before generating your brief."

Also surface the same button inside `BrandBriefPanel` (the right-hand ledger) as a sticky footer action, so users who edit a single fact inline can update without scrolling up.

### 3. Finished view: make "Update brief" available there too
In `FinishedView`, replace/augment the existing reopen button so that after they reopen → edit → they see the same "Update brief" CTA. Already covered by #2 since reopening sets `completed_at = null`.

### 4. Shared prompt constant
File: `src/lib/brief-format.ts` (new)
- Export `FINAL_BRIEF_FORMAT_PROMPT` (the H1 / blockquote / H2 sections / dividers skeleton currently inlined in `brief-chat.ts`).
- `brief-chat.ts` imports it for `finish_brief`'s description.
- `regenerateBriefSummary` imports it for its system prompt.

## Out of scope
- No changes to the chat flow, progress UI, or revision-mode messaging.
- No new tables, columns, or migrations.
- No changes to `resetBrandBrief` / `reviseBrandBrief` semantics.

## Files touched
- `src/lib/brand-brief.functions.ts` (add `regenerateBriefSummary`)
- `src/lib/brief-format.ts` (new shared prompt constant)
- `src/routes/api/brief-chat.ts` (import the shared constant — no behavior change)
- `src/routes/_authenticated/dashboard.brief.tsx` (header CTA + wiring)
- `src/components/brief/BrandBriefPanel.tsx` (sticky "Update brief" footer)
