## Goal

Replace the rigid "10 quick questions about your startup" intake with an **AI-first conversational brief** that talks to the executive like a senior personal-brand strategist would. The AI drives the conversation — it asks only what it still needs, adapts based on what's already known (resume, LinkedIn, prior answers), and ends when it has enough signal to write a sharp **Brand Operating System Brief** aligned to the workshop's deliverables.

No fixed question count. No wizard-style "step 4 of 10." A single chat surface that converges on a brief.

## The new experience

1. **Land on the brief.** Title: *"Let's design your brand operating system."* Subhead: *"A 5–15 minute conversation. Upload a resume or LinkedIn first and it goes faster."*
2. **Context import (optional, recommended).** One panel at the top: drop a PDF résumé, paste a LinkedIn URL, or paste a short bio. Reuses the existing `extractFounderFromText` server function and `attendee-docs` bucket. Extracted facts are shown back as chips ("12 yrs, ex-Citi, ex-Mayo, GA-based") so the executive sees the AI now knows them.
3. **AI-led conversation.** A chat panel opens with the strategist's first turn. The AI:
   - Already knows what was imported (no re-asking name/role/years).
   - Asks one focused question at a time, often with 2–3 suggested-answer chips the user can tap (skippable to free text + voice).
   - Probes for the high-signal dimensions below (the **Brief Spine**) — not in order, only the ones still missing.
   - Calls a `record_brief_fact` tool every time it locks in a piece of signal, so the brief assembles live in the right-hand panel.
   - Calls a `request_clarification` tool when an answer is too vague to act on.
   - Calls a `finish_brief` tool when it judges it has enough — typically 6–12 turns, not a fixed count.
4. **Live brief panel.** Right side of the screen shows the brief assembling in real time, sectioned by the Brief Spine. Each fact has an inline edit pencil so the executive can correct the AI immediately.
5. **Finish state.** When the AI calls `finish_brief`, the panel collapses the chat and shows the **Brand Operating System Brief** as a single readable document: POV, audience, transformation, voice, signature themes, channels, 12-month outcome, non-negotiables, plus an *"AI confidence"* note flagging anything thin. Buttons: *Looks right* (locks it) and *Keep refining* (reopens chat with the AI asking about the thin areas).

## The Brief Spine (what the AI is trying to learn — not a script)

The AI is given this as its **goal state**, not a question list. It works in any order and skips dimensions already covered by the imported context.

- **Identity & credibility** — who the executive is, the credibility that travels (roles, results, rooms, proof). *Mostly auto-filled from resume/LinkedIn.*
- **Signature POV** — the one belief about their industry they would defend on a stage.
- **Origin arc** — the experience or turning point that gave them that POV.
- **Audience** — who specifically needs to hear from them (role, industry, stage, geography).
- **Audience pain** — what that audience is quietly struggling with that no one is naming.
- **Transformation promise** — what's different in the audience's life or career after 12 months of following them.
- **Voice** — three words for how they should sound, three words for how they should never sound.
- **Signature themes** — the 3–5 topics they want to own for the next year.
- **Channels** — where they'll publish (LinkedIn, newsletter, podcast, keynote, etc.).
- **12-month outcome** — what winning concretely looks like (board seats, keynote invites, inbound clients, book deal, exits).
- **Non-negotiables** — topics, tone, platforms, or clients that are off-limits.
- **Workshop alignment** — which of the workshop's deliverables they most want to walk out with.

The AI is told: *"Cover the spine. Don't interrogate. If the resume already told you, don't ask. If an answer is generic, push once for specificity, then move on. End when the brief would be useful to a ghostwriter, a publicist, and a content strategist."*

## What changes in the code

### 1. New server function: `chatBrandBrief` (streaming, tool-calling)

New file `src/lib/brand-brief.functions.ts` exposes a server route (`/api/brief-chat`) using AI SDK `streamText` with `google/gemini-3-flash-preview` via the existing `createLovableAiGatewayProvider` helper. Tools:

- `record_brief_fact({ section, value, confidence })` — writes to a new `attendee_brief_facts` table (one row per section), upserts on `(user_id, section)`. Streams back to the client so the live brief panel updates.
- `request_clarification({ section, why })` — surfaces a suggestion chip in the UI.
- `finish_brief({ summary })` — marks the brief complete, triggers a final write to `attendee_brief_summary` (a single row per user holding the assembled markdown brief + spine coverage map).

System prompt encodes the Brief Spine, the workshop context (Executive Brand Intensive — 3-hr workshop, deliverables list), and the *"don't re-ask what you already know"* rule. The handler injects the imported résumé/LinkedIn extract and any prior `attendee_brief_facts` into the system context on every turn, so the AI is always grounded.

`stopWhen: stepCountIs(50)`.

### 2. New server function: `getBrandBrief`

Reads `attendee_brief_facts` + `attendee_brief_summary` for the current user. Used by the loader for the brief page and the dashboard "Today" card.

### 3. Database (one migration)

- `attendee_brief_facts(user_id uuid, section text, value text, confidence smallint, updated_at timestamptz, primary key(user_id, section))`
- `attendee_brief_summary(user_id uuid primary key, markdown text, spine_coverage jsonb, completed_at timestamptz, updated_at timestamptz)`

Both with GRANTs to `authenticated`/`service_role`, RLS, and `user_id = auth.uid()` policies.

(`attendee_founder_profile` and `attendee_market_profile` continue to exist for the resume/LinkedIn import path — no migration needed there.)

### 4. Replace the wizard at `src/routes/_authenticated/dashboard.brief.tsx`

Rip out the step/block wizard. Replace with a two-pane layout:

- **Left (60%)** — Import card (collapses after first use) + chat (`useChat`, `DefaultChatTransport` pointed at `/api/brief-chat`). Renders `message.parts`. Shows suggested-answer chips when the AI emits `request_clarification`.
- **Right (40%)** — Live `BrandBriefPanel` component that subscribes to `attendee_brief_facts` changes (server-pushed via the chat stream's tool-result parts; no realtime channel needed). Each section is inline-editable.
- **Finish state** — When `finish_brief` fires, the right pane goes full-width and renders `BrandBriefDocument` with the *Looks right / Keep refining* buttons.

Existing components removed from the brief flow (kept in repo, just unused here): `BlockCheckpoint`, `BriefCompleteCard`, `BriefReview`, `FounderBlock`, `MarketBlock`. We delete `src/lib/brief-blocks.ts` and the `BRIEF_FIELDS` array in `src/lib/workflow.ts` (other parts of `workflow.ts` — `STAGES`, `WORKFLOW`, `stageOf` — stay).

### 5. Reuse the existing resume / LinkedIn import

The import card uses `createResumeUploadUrl` + `extractFounderFromText` exactly as they already work. After extraction we also write a one-row "context bootstrap" into `attendee_brief_facts` for `identity_credibility` so the AI can see it on its very first turn.

### 6. Dashboard CTA copy

`src/routes/_authenticated/dashboard.index.tsx`:
- Eyebrow: **START HERE** (unchanged)
- Headline: *"Answer 10 quick questions about your startup."* → *"Design your brand operating system."*
- Subhead: *"You're 0 of 10 done."* → *"A 5–15 minute conversation with our brand strategist AI. Upload a resume to skip ahead."*
- Button: *Start* → *Begin*

Sidebar item *"My brand intake"* stays.

### 7. Downstream

Existing downstream deliverables that read from the old brief field keys will be migrated in a separate pass. For now they continue to read whatever is in storage; the new brief writes to its own tables and is the canonical source going forward. Out of scope for this plan.

## Out of scope

- Public marketing pages, pricing, cohorts, persuasion architecture — untouched.
- The 25-deliverable `WORKFLOW` pipeline — untouched.
- Sidebar nav, routing, auth — untouched.
- Migrating existing `attendee_brief_*` (old startup-shaped) data into the new tables — old rows stay, new tables start fresh.

## Technical notes

- AI SDK on TanStack: streaming chat lives at `src/routes/api/brief-chat.ts` (server route, returns `result.toUIMessageStreamResponse(...)`), supporting one-shot reads via `createServerFn` in `src/lib/brand-brief.functions.ts`. Follows the project's existing `ai-gateway.server.ts` provider pattern.
- Tool execution writes through `supabaseAdmin` keyed by `userId` from `requireSupabaseAuth` middleware on the chat route. RLS still protects reads from the client.
- `stopWhen: stepCountIs(50)` per AI SDK rules.
- The brief is "done" when the AI calls `finish_brief` OR when the user clicks *Looks right* on the live panel. No fixed question count is enforced in code.
- Live updates: the brief panel reads the streamed tool-call parts from `useChat` to update optimistically, and re-fetches `getBrandBrief` on `finish_brief` to confirm.