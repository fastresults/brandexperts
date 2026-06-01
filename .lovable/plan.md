# Complete Package Export

Add a third action next to **Copy markdown** / **Download .md** on the finished brief view that produces one organized markdown file containing every source, every answer, and the final brief — so the user has a single archival document of the entire intake.

## What goes in the package

The file is assembled in this order, with clear `##` section dividers:

1. **Cover** — title, user name/email, generated-at timestamp, brief completion date, spine coverage summary.
2. **Final Brand Brief** — the existing `attendee_brief_summary.markdown` verbatim.
3. **Founder Profile (Enriched)** — structured fields from `attendee_founder_profile.extracted` (roles, skills, narrative, unfair advantage, right-person reason, LinkedIn URL).
4. **Raw Source Material** — `attendee_founder_profile.raw_text` (full resume / LinkedIn extraction text), with the source filename and extraction date.
5. **Uploaded Documents** — list from `attendee_documents` (kind, original name, size, uploaded date) so the user has a manifest of what fed the system.
6. **Question & Answer Ledger** — every `attendee_brief_facts` row, grouped by `section`, in the canonical 15-section order, formatted as:
   ```
   ### Section name
   - **Q:** <question label>
     **A:** <value>  _(confidence: 4/5 · updated: 2026-06-01)_
   ```
7. **Alignment Notes** — any `attendee_brief_alignment.items` if present.
8. **Appendix: Generation Metadata** — model used for brief, last regeneration time, fact count, sections covered vs. missing.

## Implementation

### New server function — `src/lib/brand-brief.functions.ts`
Add `exportCompletePackage` (POST, `requireSupabaseAuth`):
- Loads in parallel: `attendee_brief_summary`, `attendee_brief_facts` (all rows), `attendee_founder_profile`, `attendee_documents`, `attendee_brief_alignment`, and the user's email/name from `auth.users` via the authed client.
- Composes the markdown using a pure helper `buildCompletePackageMarkdown(...)` (see below). No AI call — this is deterministic assembly.
- Returns `{ markdown, filename }` where filename is `brand-brief-complete-${YYYY-MM-DD}.md`.

### New helper — `src/lib/complete-package.ts`
Pure function `buildCompletePackageMarkdown(input)` that:
- Reuses the canonical 15-section order (import from wherever `BRIEF_SECTIONS` / spine lives — likely `src/lib/brief-format.ts` or `brief-chat.ts`; if not exported, lift it there).
- Maps each section key to a human label (reuse existing label map).
- Escapes/normalizes raw text (trims, fences resume body in a `~~~text` block to preserve formatting without breaking markdown).
- Skips empty sections gracefully with `_No entries yet._`.

### UI — `src/routes/_authenticated/dashboard.brief.tsx` (`FinishedView`)
- Add a third button between **Download .md** and **Keep refining**: **"Copy complete package"** with a `Package` (or `FileArchive`) lucide icon.
- On click: call `exportCompletePackage` via `useServerFn`, then trigger a Blob download (same pattern as existing `download()`), and show a success toast. Loading state with spinner while building.
- Keep existing two buttons unchanged.

### Optional: also expose on in-progress view
Out of scope for this plan — the user specifically asked for the finished-view action area. We can add it to the in-progress header in a follow-up if desired.

## Files touched

- `src/lib/brand-brief.functions.ts` — add `exportCompletePackage` server fn.
- `src/lib/complete-package.ts` *(new)* — pure markdown assembler.
- `src/lib/brief-format.ts` — export the canonical section order/labels if not already exported (small additive change).
- `src/routes/_authenticated/dashboard.brief.tsx` — add the third button + handler in `FinishedView`.

## Out of scope

- No schema changes, no new tables.
- No AI/LLM call — assembly is deterministic.
- No PDF/DOCX export (markdown only, per request).
- No changes to chat flow, progress UI, or revision logic.
