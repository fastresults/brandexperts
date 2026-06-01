## What the logs + DB show

I checked the user's actual record (`attendee_founder_profile` for the active dashboard user):

- **The PDF was uploaded and the text was extracted.** `raw_text` is 4,541 chars of clean resume prose (Adam Anderson, OPEN Interactive, Citi/Mayo/3M/Disney, St. Kitts, Caribbean Investment Summit, etc.). Storage + parsing worked.
- **The AI structured extraction silently failed.** Every field in `extracted` is empty (`""`, `[]`) — `roles`, `wins`, `skills`, `industries`, `domain_guess`, `voice_signal`, all empty defaults. The model returned `{}` and Zod filled in defaults, so no error was thrown and the toast said "Resume read."
- **The chat never sees the resume.** `brief-chat.ts` only puts `extracted` into the grounding block — never `raw_text`. So the strategist's system prompt currently says "IMPORTED CONTEXT: {all empty fields}" and it has nothing to anchor work_experience on.
- **Current facts for this user**: 14/15 sections locked from a prior session; `work_experience` is the only gap. The resume was uploaded *after* those facts, so we have a clean shot at enriching just that step.

## Goal

1. Make resume extraction actually populate fields (and never silently succeed-as-empty).
2. Ground the chat in `raw_text` as a fallback so the strategist can synthesize `work_experience` even when structured extraction is thin.
3. Trigger the `work_experience` enrichment flow for this user now, and make it the default behavior for anyone whose resume is parsed.

## Changes

### 1. `src/lib/discovery.functions.ts` — make `extractFounderFromText` robust

- Stronger prompt for `google/gemini-3-flash-preview`: explicitly require `roles[]` (title, company, years) and `wins[]` to be populated when the text contains a work history; refuse to return an empty object when ≥ 500 chars of resume text are provided.
- After `generateText`, detect "empty extraction" (no roles, no headline, no skills) and:
  - Retry once with a smaller, role-focused prompt that asks for `roles[]` + `headline` + `wins[]` only.
  - If still empty, set `noteToUser` to "We saved your resume text but couldn't structure it — the strategist will read it directly." (so the UI stops claiming success).
- Always persist `raw_text` (already happening) plus a new boolean signal returned to the client: `structured_ok: boolean`. The `BrandBriefImportCard` toast becomes truthful: success vs. "saved raw text, AI will read it directly."

### 2. `src/routes/api/brief-chat.ts` — feed raw resume text into grounding

- In the grounding block, when `profileRes.data.raw_text` exists, append a new section:
  ```
  RAW RESUME TEXT (verbatim — use ONLY for work_experience synthesis, never quote outside that section):
  <first ~6000 chars of raw_text>
  ```
- Tighten the existing `work_experience` PRIORITY SECTION rule so it explicitly says: "If RAW RESUME TEXT is present, synthesize the 4–6 sentence arc + 3–5 anchor roles directly from it. Do NOT ask the user to paste anything. Call `record_brief_fact` with the synthesized markdown, then ask only 'does this read right?'"
- Add a short note to PROGRESS DISCIPLINE: when only `work_experience` is missing and raw_text exists, jump straight to it on the next turn instead of recapping.

### 3. `src/components/brief/BrandBriefImportCard.tsx` — honest feedback

- Read the new `structured_ok` flag from the extract response.
- If `structured_ok === false` and no `note` was returned: show an amber toast — "Resume saved. We'll have the strategist read it directly in the next message."
- No layout changes.

### 4. One-off backfill for the current user (run from the server function, not a migration)

- Add a small admin-callable server function `reextractFounderProfile` (auth-gated, user can call it for themselves) that re-runs the extractor against the stored `raw_text`. Wire it to a tiny "Re-read resume" link inside the collapsed-state `BrandBriefImportCard` so the user can retrigger if a future upload looks thin.
- For Adam's record specifically, the next chat turn will pick up the new RAW RESUME TEXT grounding automatically — no manual DB edit needed.

## Out of scope

- No changes to the spine order or `BRIEF_SPINE` (work_experience stays step 2 of 15).
- No new tables / migrations.
- No changes to the LinkedIn or paste-bio paths beyond what falls out of #1.
- No re-running the full extraction pipeline for other users — they'll benefit on their next upload.

## Files touched

- `src/lib/discovery.functions.ts` (harden extractor, add `structured_ok`, add `reextractFounderProfile`)
- `src/routes/api/brief-chat.ts` (add RAW RESUME TEXT grounding + tighten work_experience rule)
- `src/components/brief/BrandBriefImportCard.tsx` (honest toast + "Re-read resume" affordance)

## Verification after build

1. Reload `/dashboard/brief` as the current user. Next assistant turn should open with a synthesized work-experience arc anchored on Citi/Mayo/3M/Disney + St. Kitts + Caribbean Investment Summit, and ask "does this read right?"
2. After confirm, `attendee_brief_facts.work_experience` row appears; progress bar shows 15/15.
3. Re-upload the PDF on a fresh test account → `extracted.roles` is non-empty, toast says "Resume read."
