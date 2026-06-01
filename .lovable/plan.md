# Polish the brand brief experience

Three things to fix, all presentation-layer (no business logic changes):

1. **Chat sometimes shows raw/ugly markdown** (e.g. literal `*` bullets, stray `**bold**`).
2. **The finished brief looks like a text dump** — no hierarchy, weak spacing, no section dividers, no "executive summary" framing.
3. **Confirm the brief always lives in the dashboard** (it already does — verify + make it more discoverable).

---

## 1. Clean up in-chat markdown

**Problem.** The system prompt already forbids bullets/headings in chat replies, but Gemini occasionally slips in `*`/`-` bullets, `**bold**` runs, or `#` headings. The chat bubble renders these via `Markdown`, which mostly works — but a stray `-` at line start, an unmatched `**`, or a single `*` reads as raw punctuation to a non-technical user.

**Fix (two layers).**

- **Render layer (`src/components/brief/Markdown.tsx`)** — Add a small `sanitizeChatMarkdown(text)` helper used only by the chat transcript (not the final brief). It strips leading list markers on otherwise prose-only replies, collapses headings to plain emphasis, and trims stray inline markers. Final brief rendering keeps full markdown.
- **Prompt layer (`src/routes/api/brief-chat.ts`)** — Tighten HARD RULE #3 to also ban `**bold**`, `_italics_`, `#` and leading `-`/`*`/`•` in chat replies (the existing rule says "prose only" but doesn't explicitly forbid inline emphasis markers). Examples-policy rule already says "inline in parentheses" — keep that.

## 2. Make the finished brief look polished

This is the big one. Two parts: **what the model writes** + **how we render it**.

### 2a. What the model writes (`src/routes/api/brief-chat.ts` — `finish_brief` description + a new FINAL-BRIEF FORMAT block)

Today the prompt just says "polished markdown brief" — Gemini returns a flat blob. Add an explicit structure contract so every brief comes back with:

```text
# {Their name} — Brand Operating System

> One-sentence positioning line (the "lean-in" line).

## Executive snapshot
3–4 sentence prose paragraph.

## Identity & credibility
…

## Audience & transformation
**Who they serve** — …
**The pain** — …
**The transformation** — …

## Signature point of view
…

## Voice
**Tone** — …
**Cadence** — …
**Sample openers** — …
**Never sounds like** — …

## Signature themes
- theme 1 — one-line gloss
- theme 2 — one-line gloss
- theme 3 — one-line gloss

## Channels & cadence
…

## Outcome goal & non-negotiables
…

---
*Assembled {date} from your intake conversation.*
```

Sections map 1:1 to the spine so coverage stays honest. Bullets are allowed **here** (the final brief), unlike chat.

### 2b. How we render it (`src/routes/_authenticated/dashboard.brief.tsx` `FinishedView` + `src/components/brief/Markdown.tsx`)

- Wrap the brief in a magazine-style "document" shell: max-width ~720px, generous padding (`p-8 md:p-12`), soft card background, subtle border, sticky in-view title.
- Add a header strip above the markdown: brief title, completion date, a small toolbar with **Copy as markdown**, **Download .md**, and **Keep refining** (move the existing button there).
- Pass a richer prose class set to `Markdown` when used for the final brief: bigger H1, drop-cap-style lead paragraph, `prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-2 prose-h2:mt-10`, `prose-blockquote:text-lg prose-blockquote:not-italic prose-blockquote:font-medium prose-blockquote:text-foreground`, `prose-hr:my-10`, tighter `prose-li` rhythm, `prose-strong:text-primary` for the inline labels (`**Tone** —`).
- Introduce a `variant` prop on `Markdown` (`"chat" | "document"`) so chat keeps its compact styling and the brief gets the document treatment. No new dependency.
- Below the document, keep `BrandAlignmentPanel` but separate it with a clear section header ("How your brief shapes the workshop") so the page reads as two distinct artifacts.

## 3. Brief lives in the dashboard permanently

Already wired (`src/routes/_authenticated/dashboard.tsx` line 98: `/dashboard/brief — "My brand intake"`). Two small improvements:

- Rename the sidebar label to **"Brand brief"** once finished, **"Brand intake (in progress)"** while incomplete — driven by `summary?.completed_at`. (Either a small hook reading the brief query, or a status dot.)
- On `/dashboard` (home), surface a compact "Your Brand Brief" card: shows progress (`X of 14 sections`) while in-progress, or "Ready — view brief" once finished, deep-linking to `/dashboard/brief`.

---

## Files touched

- `src/components/brief/Markdown.tsx` — add `variant` prop + `sanitizeChatMarkdown`; richer document-variant prose classes.
- `src/routes/_authenticated/dashboard.brief.tsx` — `FinishedView` redesign (document shell, toolbar, copy/download); pass `variant="document"`; pass `variant="chat"` in `ChatPane`.
- `src/routes/api/brief-chat.ts` — tighten HARD RULE #3; add FINAL-BRIEF FORMAT block referenced from `finish_brief` description.
- `src/routes/_authenticated/dashboard.tsx` — dynamic sidebar label based on brief status.
- `src/routes/_authenticated/dashboard.index.tsx` — add a compact brief-status card linking to `/dashboard/brief`.

## Out of scope

- Changing the spine, the conversation logic, kickoff guard, or `BrandAlignmentPanel` data model.
- PDF export (markdown copy/download covers the immediate need; PDF can be a follow-up).
- New dependencies.

## Open question

Do you want a **PDF download** of the finished brief now, or is **Copy markdown + Download .md** enough for v1? (PDF would add `@react-pdf/renderer` or a server route; happy to do it as a follow-up.)
