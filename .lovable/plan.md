## Problem

Two issues to fix together:

1. **Start over is destructive.** Today's `resetBrandBrief` wipes every fact. Users lose all prior answers and have to retype everything.
2. **No progress signal.** The chat is open-ended — users don't know how many sections remain or where they are in the assessment.

## Proposed behavior

### A. Non-destructive revision (retain prior answers)

Three actions, with clear hierarchy:

| Action | What it does | When to use |
|---|---|---|
| **Keep refining** (existing) | Re-opens a completed brief for tweaks | Add depth to a finished brief |
| **Revise answers** (renamed from "Start over") | Keeps all `attendee_brief_facts`. Clears only the generated summary + alignment. Re-opens chat in **revision mode**: strategist walks each section, quotes the prior answer back, user keeps / edits / replaces. | Rework the assessment without losing prior input |
| **Clear everything** (secondary, behind a second confirmation) | The current destructive `resetBrandBrief` — wipes facts, summary, alignment | Truly start blank (rare) |

### B. Progressive onboarding + visual progress indicator

A persistent progress component anchored at the top of the chat pane (and mirrored as a tiny inline bar above the input) shows the user exactly where they are.

```text
Step 3 of 8 · Voice profile
■■■□□□□□   38% complete
```

- **Source of truth:** `BRIEF_SPINE` defines the ordered section list. A section counts as "complete" when at least one fact exists for it in `attendee_brief_facts` (already the data we have).
- **Component:** new `BriefProgress.tsx`:
  - Horizontal segmented bar (one cell per spine section) with filled / current / pending states.
  - Label: `Step {currentIndex + 1} of {total} · {currentSection.label}`.
  - Tooltip / hover reveals the full section list with check marks.
  - Click a completed section → scrolls the right-hand `BrandBriefPanel` to that section for inline edit.
- **"Current" detection:** first spine section with no fact yet; if all are filled, current = "Review & finish".
- **Reuse on right panel:** `BrandBriefPanel` gets a small completion pill per section ("3 of 5 fields", or a check icon when sufficiently covered).
- **In revision mode:** the same bar shows all sections as filled but in a muted "revisable" state; the current cell follows the strategist's lead through each section.

## Scope

1. **`src/lib/brand-brief.functions.ts`**
   - Keep `resetBrandBrief` (used only by "Clear everything").
   - Add `reviseBrandBrief`: delete from `attendee_brief_summary` + `attendee_brief_alignment`; leave `attendee_brief_facts` intact.
   - Extend `getBrandBrief` return shape with a derived `progress` object: `{ total, completed, currentSectionId, currentSectionLabel, sections: [{ id, label, completed }] }` so the client doesn't recompute spine logic.

2. **`src/routes/api/brief-chat.ts`** (system prompt)
   - Add a **REVISION MODE** block: activates when `facts.length > 0 && summary == null`. Strategist quotes the prior answer per section ("Last time you said: '…'. Keep it, refine it, or replace it?") and only re-asks what the user wants to change.
   - Add a **PROGRESS DISCIPLINE** rule: the assistant must work one section at a time in spine order, announce the section name at the start of each turn, and confirm completion before moving on. This keeps the visual progress bar honest.

3. **`src/components/brief/BriefProgress.tsx`** (new)
   - Props: `progress` (from `getBrandBrief`), `onJumpToSection?(id)`.
   - Renders segmented bar + label + accessible tooltip list.
   - Reused at the top of `ChatPane` and as a slim sticky bar above the chat input.

4. **`src/components/brief/BrandBriefPanel.tsx`**
   - Add a small completion indicator per section header.
   - Wire `onJumpToSection` from `BriefProgress` to scroll/highlight the matching section.

5. **`src/routes/_authenticated/dashboard.brief.tsx`**
   - Rename primary destructive action to **"Revise answers"** (icon `Pencil`), wired to `reviseBrandBrief`. Dialog copy:
     > "Revise your brand brief? Your prior answers are kept — the strategist will walk you through each one so you can update what's changed. Your generated brief and workshop alignment will be regenerated."
   - Inside the dialog footer add a subtle link **"Or clear everything and start blank"** → opens a second, hardened confirmation step ("This permanently deletes every answer.") that calls `resetBrandBrief`.
   - Mount `<BriefProgress>` above the chat header in the in-progress view, and a slim version pinned above the chat input.
   - In the finished view, replace the progress bar with a "Complete" state pill.

## Out of scope

- Per-section "ask me again" toggles inside the panel (future).
- Persisted chat transcript replay — chat messages remain ephemeral; facts + progress carry context.
- Versioning / undo of prior brief markdown.
- Gamification (streaks, time-to-complete estimates beyond the simple step count).

## Files touched

- `src/lib/brand-brief.functions.ts` — add `reviseBrandBrief`; extend `getBrandBrief` with `progress`.
- `src/routes/api/brief-chat.ts` — add REVISION MODE + PROGRESS DISCIPLINE blocks.
- `src/components/brief/BriefProgress.tsx` — new component.
- `src/components/brief/BrandBriefPanel.tsx` — per-section completion indicator + jump-to handler.
- `src/routes/_authenticated/dashboard.brief.tsx` — rename action, two-tier confirmation, mount progress bar.
