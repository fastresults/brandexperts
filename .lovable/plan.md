# Enriched Brief Sections: Voice, Domain, Work Experience

## Goal

Make three sections in the finished brief noticeably richer and more substantive than the rest, anchored in real imported data (resume / LinkedIn / pasted text) when available:

1. **Voice Profile** — tone, cadence, vocabulary, sample openers, never-sounds-like, plus a 1–2 sentence narrative voice summary.
2. **Domain** — areas of past knowledge and competency, written as a paragraph + 3–6 tagged domain areas.
3. **Work Experience** — an enriched narrative summary of actual roles/companies/outcomes, drawn from the imported resume/LinkedIn extract or pasted input. Currently missing from the brief entirely.

## Scope

Frontend/presentation + brief-generation prompt only. No DB schema changes — the resume extract already lives in `attendee_founder_profile.extracted` and is already passed into the chat as `IMPORTED CONTEXT`.

## Changes

### 1. `src/routes/api/brief-chat.ts` — prompt + schema

- **Default order**: insert `work_experience` between `identity_credibility` and `domain`.
- **Grounding**: when `extracted` is present, surface `work_history`, `companies`, `roles`, `education`, and `skills` fields explicitly in the system prompt (not just a JSON dump) so the model treats them as authoritative for the Work Experience and Domain sections. Add a rule: "Do not invent companies, titles, dates, or outcomes — only use what's in IMPORTED CONTEXT or what the user has stated in chat."
- **Priority sections** block: add Work Experience rule — if `work_history` exists, do not ask; synthesize a 4–6 sentence narrative (arc across roles, scope, signature wins) and confirm. If absent, ask one question offering three paths: upload resume, paste LinkedIn URL, or paste a short career summary.
- **Voice** rule: keep the existing 5-field capture but also require a 1–2 sentence narrative "Voice summary" stored alongside, so the rendered card has a lead-in.
- **Domain** rule: store both a 2–3 sentence paragraph AND a comma-separated list of 3–6 domain tags (e.g. "B2B SaaS, fintech compliance, GTM strategy").
- **FINAL-BRIEF FORMAT**: add two new H2 sections and enrich two existing ones:
  - `## Work experience` — 4–6 sentence narrative + a short bulleted list of 3–5 anchor roles formatted `**Role, Company (years)** — one-line outcome`.
  - `## Domain` — 2–3 sentence paragraph followed by a line: `**Domains:** tag1 · tag2 · tag3 · tag4`.
  - `## Voice` — prepend a 1–2 sentence prose voice summary above the existing **Tone/Cadence/Vocabulary/Openers/Never** fields.

### 2. `src/lib/brief-parser.ts` — schema + parsing

- Extend `ParsedBrief`:
  - `workExperience?: { summary: string; roles: Array<{ role: string; company: string; period?: string; outcome?: string }> }`
  - `domainTags: string[]` (in addition to existing `domain` paragraph)
  - `voice.summary?: string`
- Add `parseWorkExperience(body)` that splits prose paragraph from the role bullets (parses `**Role, Company (years)** — outcome`).
- Add domain-tag extraction: pull the `**Domains:** a · b · c` line out of the domain body, split on `·` / `,` / `•`, store as `domainTags`, keep remaining prose as `domain`.
- Extend `parseVoice` to capture any leading prose paragraph (before the bold field labels) as `voice.summary`.
- Register section-key matches: `work experience`, `experience`, `career`, `professional experience` → workExperience.

### 3. `src/components/brief/LedgerBrief.tsx` — render

- New `## 02. Work Experience` block (placed right after Identity, before Domain): renders `summary` as a 2-column-friendly lead paragraph, then a vertical "résumé rail" of role rows — left column role+company, right column period and one-line outcome, separated by hairline `border-border/40` dividers. Visually heavier than the surrounding sections (slightly larger heading, more vertical breathing room) so it reads as a featured section.
- **Domain** block: keep the paragraph, append a `DomainTags` row rendered as small pill chips (`rounded-full border border-border/60 px-3 py-1 text-xs uppercase tracking-wide`).
- **Voice** block: render `voice.summary` as an italic lead line above the existing field grid. Promote Voice from the sidebar column into a full-width featured card (same prominence as the POV pull-quote) so it visually reads as one of the three enriched sections.
- Renumber `SectionMark` counters so the three enriched sections (Work Experience, Domain, Voice) get the visual weight; keep auto-numbering logic intact.

### 4. Backward compatibility

- Parser must not crash on legacy briefs that lack Work Experience / domain tags / voice summary — all new fields are optional, renderer guards each block with a presence check (same pattern as existing `showVoice`).
- No migration needed for existing finished briefs in `attendee_brief_summary`; they simply render without the new blocks until regenerated.

## Out of scope

- Resume/LinkedIn ingestion pipeline (already exists and populates `attendee_founder_profile.extracted`).
- Editing UI for the new sections.
- PDF export.
- Any chat-engine or DB changes beyond the prompt string.

## Files touched

- `src/routes/api/brief-chat.ts` (prompt + grounding)
- `src/lib/brief-parser.ts` (types + parsers)
- `src/components/brief/LedgerBrief.tsx` (new Work Experience block, enriched Domain + Voice rendering)
