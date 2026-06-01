# Brand OS → Workshop alignment

After the AI brand brief is finished, show the executive a personalized **alignment summary** that maps their Brand Operating System onto the 15 deliverables this workshop has promised — each one rewritten in terms of *their* POV, audience, voice, and 12-month outcome.

The 15 promised deliverables already live in `src/lib/value-grid.ts` (`VALUE_ROWS`), grouped into 5 blocks: Foundation, Voice, Signature, Distribution, System. Today the finished brief just shows the markdown — there's no bridge from "this is who I am" to "this is what we'll produce for you Wednesday."

## What the user will see

When the brief is marked complete on `/dashboard/brief`, the FinishedView gets a second section: **"Your Brand OS, applied to the workshop."**

```text
Your Brand Operating System Brief
[markdown brief — unchanged]

────────────────────────────────────────
Your Brand OS, applied to the workshop
15 deliverables, personalized to your POV and audience

▸ Block 1 — Foundation
  Brand Blueprint
    Anchored on: signature_pov, audience, transformation
    "We'll position you as the operator who [POV] — for [audience]
     who are quietly [pain]. The three pillars will be [themes]."

  Brand Assessment Report
    Anchored on: identity_credibility, signature_themes
    "We'll benchmark you against [peer category] using your Citi/Mayo
     credibility as the moat the others don't have."

▸ Block 2 — Voice
  Voice Profile — …
  Three Bios — …
  Executive Headshot Set — …
… (15 total, grouped by block)

[Regenerate alignment] [Keep refining the brief]
```

A short header summarizes the alignment ("Anchored on 11 of 12 brief sections · generated 2 min ago").

## Architecture

1. **One new table — `attendee_brief_alignment`**
   - `user_id uuid pk`
   - `items jsonb` — array of `{ deliverable_key, deliverable_label, block_label, application_text, anchored_sections: BriefSectionId[] }`
   - `model text`, `generated_at timestamptz`, `updated_at timestamptz`
   - RLS: user owns their row + service_role full access. Grants for `authenticated` (CRUD) and `service_role`.

2. **Stable keys on `VALUE_ROWS`** (`src/lib/value-grid.ts`)
   Add `key: string` to each `ValueRow` (e.g. `"brand_blueprint"`, `"voice_profile"`, `"three_bios"`). Required so the AI output and DB rows reference deliverables stably. No other consumer breaks — existing UI just reads label/cost.

3. **Server route — `src/routes/api/brief-alignment.ts`** (POST, JWT-authenticated via `auth-middleware`)
   - Loads brief summary + facts for the authenticated user.
   - Calls Lovable AI Gateway (`google/gemini-3-flash-preview`) with AI SDK `generateText` + `Output.object`, schema = array of 15 items keyed by deliverable_key.
   - System prompt instructs the model to write **one tight paragraph per deliverable** (≤ 60 words), grounded only in the user's brief, naming specific phrases from their facts, and listing which spine sections it pulls from.
   - Upserts the result into `attendee_brief_alignment`.
   - Returns `{ items, generated_at }`.

4. **Server functions — extend `src/lib/brand-brief.functions.ts`**
   - `getMyAlignment()` — read-only fetch via `requireSupabaseAuth`.
   - `regenerateAlignment()` — thin wrapper that POSTs to the route (or duplicates the logic; route stays the single owner of the AI call). Used by the "Regenerate" button.

5. **UI — `src/components/brief/BrandAlignmentPanel.tsx` (new)**
   - Reads `getMyAlignment` via TanStack Query.
   - If no row yet → shows a primary CTA "Generate alignment" that triggers a mutation; auto-runs once on first reach if missing.
   - Renders deliverables grouped by `block_label` (Foundation → System), each with `application_text` and small chips for `anchored_sections`.
   - Loading skeleton; error toast on AI failures (surface 429/402 from gateway).

6. **Wire-up — `src/routes/_authenticated/dashboard.brief.tsx`**
   - In `FinishedView`, after the markdown article, render `<BrandAlignmentPanel />`.
   - On first render, if no alignment exists yet, call the regenerate mutation automatically.
   - "Keep refining" button stays.

## Out of scope

- No change to `workflow.ts` or the legacy 25-deliverable startup pipeline.
- No change to the conversational brief itself (`src/routes/api/brief-chat.ts`).
- No change to marketing pages, pricing, or the public `VALUE_ROWS` value-stack table.
- Alignment is regenerated on demand, not on every brief edit (cheap to recompute; user keeps control).

## Files touched

- New: `supabase/migrations/<ts>_brief_alignment.sql`
- New: `src/routes/api/brief-alignment.ts`
- New: `src/components/brief/BrandAlignmentPanel.tsx`
- Edit: `src/lib/value-grid.ts` (add `key` per row)
- Edit: `src/lib/brand-brief.ts` (export `AlignmentItem` type)
- Edit: `src/lib/brand-brief.functions.ts` (add `getMyAlignment`)
- Edit: `src/routes/_authenticated/dashboard.brief.tsx` (mount panel in FinishedView)
