## Goal

Today the finished brief screen has a **Keep refining** button (reopens the existing brief for edits). There is no way to fully **redo the assessment from scratch** — clear all captured facts, the generated summary, and the workshop alignment — and start the conversation over.

This plan adds that option in the UI, with a confirmation step so it's not destructive by accident.

## Scope

1. **New server function: `resetBrandBrief`** in `src/lib/brand-brief.functions.ts`
   - Auth-protected (`requireSupabaseAuth`).
   - For the current `userId`, delete rows from:
     - `attendee_brief_facts`
     - `attendee_brief_summary`
     - `attendee_brief_alignment`
   - Returns `{ ok: true }`.
   - Chat messages are already ephemeral (in-memory in `ChatPane`), so no chat table cleanup is needed.

2. **UI: "Start over" action** in `src/routes/_authenticated/dashboard.brief.tsx`
   - **Finished view (`FinishedView`)**: add a third button next to *Copy markdown / Download / Keep refining* labeled **"Start over"** (lucide `RotateCcw` icon), styled as a subtle destructive ghost button so it doesn't compete with the primary action.
   - **In-progress view** (the chat + brief panel): add a small **"Start over"** link in the header near the H1, so a user who's mid-conversation can also restart.
   - Both entry points open a `shadcn/ui` `AlertDialog` confirming:
     > "Reset your brand brief? This permanently clears your captured facts, generated brief, and workshop alignment. The conversation will start fresh."
     with **Cancel** / **Yes, start over** actions.
   - On confirm: call `resetBrandBrief`, `await brief.refetch()` + `profile.refetch()`, toast "Assessment reset — let's start fresh", and the page naturally renders the empty in-progress view again.

3. **Reuse, don't duplicate**
   - Keep `reopenBrandBrief` and the **Keep refining** button untouched — these are different intents (edit vs wipe).
   - Reuse existing `useServerFn`, `useQuery`, and `toast` patterns already in the file.

## Out of scope

- Per-section reset (already handled by `BrandBriefPanel` edit flow).
- Server-side audit/history of resets.
- Any change to the chat transport, parser, or LedgerBrief rendering.

## Files touched

- `src/lib/brand-brief.functions.ts` — add `resetBrandBrief` server function.
- `src/routes/_authenticated/dashboard.brief.tsx` — wire the two entry points and the confirmation dialog.
