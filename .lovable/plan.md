## Goal

Replace the current flat-prose brief card with the **Ledger** editorial layout (selected direction): 12-col grid, numbered section marks (`01.`, `02.` …) in uppercase tracked caps, varying typographic weight per section, pull-quote treatment for the Signature POV, and an architectural workshop-alignment footer.

## The core challenge

The brief is stored as markdown, and the model has been emitting flat numbered prose (`1. Identity & Credibility\nGlobal marketing...`) rather than proper H2 sections — so even good CSS can't rescue it. The fix has two halves: **tighten what the model emits** and **parse whatever it emits into known slots**, so old briefs in the DB also render beautifully without regeneration.

## Plan

### 1. Lock the brief schema (`src/routes/api/brief-chat.ts`)
Rewrite the `FINAL-BRIEF FORMAT` block so the model emits a deterministic set of H2 sections with stable titles, in fixed order:

```
## Identity & Credibility
## Domain
## Expertise          (3 label: description lines)
## Audience
## Audience Pain
## Transformation
## Signature POV       (single sentence, will be pulled as quote)
## Voice               (Tone — …, Cadence — …, Vocabulary — …)
## Signature Themes    (exactly 3 short titles, one per line)
## Channels
## Outcome Goal
## Workshop Alignment  (optional)
```

Forbid numbered prose ("1. …", "2. …") and inline bold labels in the brief.

### 2. Brief parser (new `src/lib/brief-parser.ts`)
A pure function `parseBrief(md: string): BriefSections` that:
- Splits on `^## ` and `^\d+\.\s` headings (handles both new H2 format and legacy numbered prose so old briefs upgrade visually).
- Normalizes section keys via fuzzy match (`identity`, `credibility` → `identity`; `pov`, `signature pov` → `pov`; etc.).
- Returns `{ identity, domain, expertise: {title, desc}[], audience, audiencePain, transformation, pov, voice: {tone, cadence, vocabulary}, themes: string[], channels, outcomeGoal, workshopAlignment, _unknown: {title, body}[] }`.
- Strips leading `**bold:**` runs and stray `-`/`*` bullets within section bodies.

### 3. Build `<LedgerBrief />` (new `src/components/brief/LedgerBrief.tsx`)
Receives the parsed sections and renders the Ledger layout verbatim from the selected prototype:
- Numbered section marks (`01. Identity & Credibility`) in `text-[10px] font-bold tracking-[0.3em] uppercase text-muted-foreground`.
- Identity in `text-2xl font-light leading-relaxed` for executive-poster feel.
- Expertise as 3-row stacked list (bold title + muted description).
- Audience / Audience Pain / Transformation in a 3-column band separated by a top hairline.
- Signature POV in a `bg-muted/40 rounded-xl border` card with `text-3xl font-light italic` blockquote.
- Voice & Signature Themes left col; Channels & Outcome Goal right col.
- Workshop Alignment footer with a small "Alignment Verified" status pill.

Use semantic tokens only (`bg-background`, `border-border`, `text-foreground`, `text-muted-foreground`, `bg-muted/40`) — no raw hex. Container `max-w-[1000px]`. Gracefully omit any section that's empty in the parsed data.

### 4. Wire it into `FinishedView` (`src/routes/_authenticated/dashboard.brief.tsx`)
- Keep the existing header (title, caption, Copy markdown / Download .md / Keep refining toolbar) — just restyle the buttons to match the prototype (`px-3.5 py-2 text-xs font-semibold`, neutral chip + white primary).
- Replace the `<Markdown variant="document" />` block with `<LedgerBrief sections={parseBrief(brief.markdown)} />`.
- Keep `_unknown` sections rendered via the existing `<Markdown />` as a graceful fallback below the structured layout.
- Keep `BrandAlignmentPanel` rendered below as its own visually-separated artifact (it already is).

### 5. Out of scope
No PDF export. No changes to chat conversation logic, kickoff guard, intake spine, or DB schema. `Markdown.tsx` `variant="document"` styling stays as a fallback path. No regenerate-existing-briefs migration — the parser handles legacy formats.

## Files

**New**
- `src/lib/brief-parser.ts`
- `src/components/brief/LedgerBrief.tsx`

**Edited**
- `src/routes/api/brief-chat.ts` — tighten FINAL-BRIEF FORMAT
- `src/routes/_authenticated/dashboard.brief.tsx` — swap rendering in `FinishedView`

## Acceptance

- Existing brief in the screenshot renders into proper sections (numbered marks, pull-quote for POV, voice as label/value, themes as 3 left-bordered items) without regeneration.
- A fresh brief generated after the prompt update is structurally identical and even tighter (no stray bullets, no inline bold).
- Toolbar buttons keep working (copy, download, keep refining).
- Workshop alignment block remains below as a separate section.
