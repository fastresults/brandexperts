# Tighten the Brand Brief: Domain, Expertise & Writing Voice

The current brief covers identity, POV, audience, themes, etc., but it under-specifies the three things a ghostwriter/publicist actually needs first: **(1) the domain they own, (2) the specific expertise inside it, (3) a usable writing-voice profile.** Right now `voice` is just "three words how you sound / never sound" and domain/expertise are scattered across `identity_credibility` and `signature_themes`. The resume extractor also doesn't return any voice signal.

This plan fine-tunes the workflow so those three are explicitly captured — by AI analysis when an import exists, by direct conversation when it doesn't.

## 1. Extend the brief spine (`src/lib/brand-brief.ts`)

Add two new spine sections and replace the thin `voice` section with a richer one:

- `domain` — *Domain you own*: the single field/category the executive wants to be known in (e.g. "operational turnarounds in regulated healthcare", not "leadership").
- `expertise` — *Specific expertise*: 3–5 concrete capabilities inside that domain that they can teach (e.g. "post-merger ops integration", "FDA submission readiness", "scaling clinical ops past 200 FTE").
- `voice` *(rewritten)* — *Writing voice profile*: tone descriptors, cadence (short/punchy vs essayistic), vocabulary register, signature phrases, examples of how they'd open a LinkedIn post, plus what they never sound like.

Update `BRIEF_SPINE`, `BriefSectionId`, and `BRIEF_SECTION_BY_ID` accordingly. Order them so `domain` and `expertise` come right after `identity_credibility`, and `voice` keeps its current position. No DB migration needed — `attendee_brief_facts.section` is text and `spine_coverage` is jsonb.

## 2. Enrich the resume/LinkedIn extractor (`src/lib/discovery.functions.ts`)

Extend `ExtractedFounderSchema` with three optional fields the model fills when there's enough signal:

- `domain_guess: string` — single-sentence guess at the domain they own.
- `expertise_guess: string[]` (max 6) — concrete capabilities inferred from roles/wins.
- `voice_signal: { tone: string[]; cadence: string; vocabulary: string; sample_phrases: string[]; avoid: string[] }` — only populated when there's actual prose to analyze (resume summary, pasted bio). Left empty for thin LinkedIn-only imports.

Update the extraction prompt to explicitly ask for these and to leave them empty when the source is too sparse to be honest (no inventing voice from a bullet-pointed resume).

## 3. Sharpen the chat strategist (`src/routes/api/brief-chat.ts`)

The grounding block already injects `extracted` JSON. Update the system prompt so the model:

- Treats `domain_guess` / `expertise_guess` as **drafts to confirm, not facts** — opens with "Based on your background, your domain looks like X and your top expertise areas are A, B, C — does that match how you want to be known?" then records `domain` and `expertise` via `record_brief_fact` once confirmed/edited.
- For `voice`: if `voice_signal` is present, mirrors it back as a draft voice profile (3 tone words, cadence, 2 sample opening lines, 3 "never sounds like") and asks the executive to approve/edit. If `voice_signal` is empty, asks the executive directly — including a short request to paste 2–3 sentences they've actually written (a past post, email, talk intro) so the model can analyze rather than guess.
- Never invents voice. If the user can't or won't provide samples, falls back to the existing "3 words / 3 anti-words" minimum and records that.

No tool-schema changes — `record_brief_fact` already accepts arbitrary section + value strings, so the richer voice profile is stored as a single markdown blob under `voice`.

## 4. Surface the three in the live brief panel (`src/components/brief/BrandBriefPanel.tsx`)

Make sure `domain`, `expertise`, and `voice` render in the spine list using the new labels/hints (auto-handled once `BRIEF_SPINE` is updated, but verify ordering and that the panel doesn't hardcode any old section ids).

## 5. Alignment summary stays in sync (`src/components/brief/BrandAlignmentPanel.tsx` + `src/routes/api/brief-alignment.ts`)

The alignment route uses `BriefSectionId` from the shared types, so anchored-section chips will automatically include the new `domain` / `expertise` ids. Re-read the alignment prompt to confirm it tells the model to lean on `voice` for voice-shaped deliverables (e.g. `voice_profile`, `content_engine`) and on `domain` / `expertise` for positioning-shaped deliverables (e.g. `brand_blueprint`, `signature_themes`). Tighten if needed.

## Out of scope

- No DB migrations (section ids are free-form text in existing tables).
- No changes to `value-grid.ts`, marketing pages, cohorts, pricing, or auth.
- No changes to the import card UI — the existing resume/LinkedIn/bio inputs are enough; we're only making the extractor smarter and the chat sharper about what it does with that input.

## Files touched

- `src/lib/brand-brief.ts` — new spine sections, rewritten voice hint.
- `src/lib/discovery.functions.ts` — extended schema + extraction prompt.
- `src/routes/api/brief-chat.ts` — updated system prompt; no tool changes.
- `src/routes/api/brief-alignment.ts` — small prompt tightening to use the new sections.
- `src/components/brief/BrandBriefPanel.tsx` — verify rendering of new sections.
