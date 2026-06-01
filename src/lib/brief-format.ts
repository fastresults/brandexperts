// Shared FINAL-BRIEF FORMAT skeleton used by both:
//   - the chat tool `finish_brief` (in src/routes/api/brief-chat.ts)
//   - the on-demand `regenerateBriefSummary` server fn (in brand-brief.functions.ts)
// Keep these two callers in sync by editing this file only.

export const FINAL_BRIEF_FORMAT_PROMPT = `Use this exact skeleton. EVERY section heading MUST be an H2 (\`## \`). NEVER use numbered prose like "1. Identity & Credibility" — that breaks the rendering. Fill each section with prose written in their voice, drawing only on locked facts. Sections may be omitted ONLY if there's truly no signal. Use \`---\` between major blocks. Keep paragraphs short (2–4 sentences). Bullets allowed in "Signature themes" only.

# {Their full name} — Brand Operating System

> {One-sentence positioning line — the "lean-in" line. Vivid, specific, no hedging.}

## Executive snapshot
{3–4 sentence prose paragraph: who they are, what they're known for, who they serve, and the shift they create. No bullets.}

---

## Identity & credibility
{2–3 sentence prose. Lead with their proudest credential or signature result.}

## Work experience
{4–6 sentence narrative paragraph: the arc across roles, scope of responsibility, signature wins, and the through-line that ties them together. Pull from IMPORTED CONTEXT verbatim where possible — do not invent.}

- **{Role, Company (years)}** — {one-line outcome}
- **{Role, Company (years)}** — {one-line outcome}
- **{Role, Company (years)}** — {one-line outcome}

## Domain
{2–3 sentence paragraph naming the specific field they want to own and why they've earned the right to own it.}

**Domains:** {tag1} · {tag2} · {tag3} · {tag4}

## Audience & transformation
**Who they serve** — {one sentence}
**The pain they walk in with** — {one sentence}
**The transformation** — {one sentence}

## Signature point of view
{2–3 sentence prose. The contrarian or sharpened belief that separates them.}

## Origin arc
{2–3 sentence prose. The pivot or earned moment that gives the POV its authority.}

## Voice
{1–2 sentence prose summary of how they sound on the page — the overall feel before the labels.}

**Tone** — {3–6 adjectives}
**Cadence** — {short phrase}
**Vocabulary** — {what they say / don't say}
**Sample openers** — {1–2 short examples}
**Never sounds like** — {3–4 anti-tone words}

## Signature themes
- **{Theme 1}** — {one-line gloss}
- **{Theme 2}** — {one-line gloss}
- **{Theme 3}** — {one-line gloss}

## Channels & cadence
{2–3 sentence prose. Where they show up, how often, and in what format.}

## Outcome goal & non-negotiables
{2–3 sentence prose. What "won" looks like in 12 months, plus any hard lines.}

---

## Workshop alignment
{2–3 sentence prose. The 2–3 in-room deliverables they want to walk out with, and why those matter most for them right now.}

---

*Assembled from your intake conversation. Edit any section from your dashboard.*`;

// Minimum locked facts required before we'll let the user generate a final brief
// from the dashboard (independent of the chat-driven `finish_brief` tool, which
// the model judges turn-by-turn).
export const MIN_FACTS_TO_FINALIZE = 6;
