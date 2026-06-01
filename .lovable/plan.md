# Plan: Expose workshop PDFs in the dashboard

Right now the two PDFs generated in Phase 4 (`attendee-workbook.pdf` and `facilitator-run-sheet.pdf`) live in `/mnt/documents/` on the build sandbox — they are NOT yet served by the app. This plan wires them in so any authenticated user can download them from a dedicated dashboard page.

## What to build

### 1. Ship the PDFs as static assets
- Copy both PDFs into `public/materials/`:
  - `public/materials/executive-brand-intensive-workbook.pdf`
  - `public/materials/executive-brand-intensive-run-sheet.pdf`
- Files in `public/` are served at the root, so they'll be available at `/materials/<file>.pdf`.

### 2. New route: `/dashboard/materials`
- Create `src/routes/_authenticated/dashboard.materials.tsx` (under the `_authenticated` layout so unauthenticated visitors are redirected to login — satisfies the "all authenticated users" access rule).
- Page contents:
  - H1 "Workshop materials" + short subhead.
  - Two cards, each with title, description, file size, and two actions:
    - **Download** (anchor with `download` attribute → `/materials/...pdf`)
    - **Open in new tab** (anchor with `target="_blank"`)
  - Cards:
    1. **Attendee Workbook** — "Pre-work, in-room prompts, Brand Operating System summary, and 30-min weekly cadence card."
    2. **Facilitator Run-Sheet** — "Persuasion engine checklist, per-block beats, and contingency fallbacks."
  - Use existing semantic tokens (`bg-card`, `border-white/10`, lucide `FileDown` / `ExternalLink` icons) to match the rest of the dashboard.

### 3. Sidebar entry
- In `src/routes/_authenticated/dashboard.tsx`, add a nav item:
  - `{ to: "/dashboard/materials", label: "Workshop materials", icon: FileDown }`
- Place it directly under "Workshop Companion" so the companion page and the printable materials live next to each other.

### 4. Link from the Workshop Companion page
- Add a small "Download workbook PDF" link at the top of `dashboard.companion.tsx` pointing to `/materials/executive-brand-intensive-workbook.pdf` so attendees following along in-room can grab the PDF without leaving the page. (Lightweight — single line, not a duplicated card.)

## Out of scope
- No Supabase Storage bucket, no signed URLs, no per-user gating beyond the existing `_authenticated` layout — both files are general workshop collateral.
- No admin-only facilitator gating (per your answer, both PDFs are visible to all authenticated users).
- No PDF regeneration pipeline — if copy changes later, we'll re-run the Phase 4 script and copy the new files in.

## Technical notes
- `public/` assets are served verbatim by Vite/TanStack Start, so no route handler or server function is needed.
- The `download` attribute on `<a>` triggers a save dialog with the suggested filename; `target="_blank"` opens the PDF inline in the browser tab.
- File sizes (~42 KB and ~34 KB) are small enough to ship in the static bundle without concern.
