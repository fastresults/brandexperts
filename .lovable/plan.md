## Goal
Make `/dashboard` show the Brand Experts brief experience for `fastresults@gmail.com` end-to-end, not just the correct completion state.

## What actually went wrong
The prior fix changed the Today page to use `getBrandBrief`, but the completed-state UI it renders is still the old startup component.

Evidence from the current code:
- `src/routes/_authenticated/dashboard.index.tsx` already reads `getBrandBrief` and checks `summary.completed_at`.
- `src/components/brief/BriefCompleteCard.tsx` is still hard-coded to startup language (`"Your startup brief"`) and startup block data (`BRIEF_BLOCKS`, `getFounderMemory`).
- Supporting helpers still assemble startup-brief memory/context from `attendee_business_brief`, which is why the screenshot still shows startup sections even after the route-level data-source swap.

## Plan
### 1) Replace the completed dashboard card with a brand-brief version
- Stop using the startup-specific `BriefCompleteCard` for the Brand Experts dashboard.
- Create a brand-specific completed card, or refactor the existing card to accept a data model and copy for Brand Experts.
- Drive the card from brand-brief sections/facts instead of startup `BRIEF_BLOCKS` and founder-memory summaries.

### 2) Make the Today page use one consistent brand-brief contract
- Keep `src/routes/_authenticated/dashboard.index.tsx` on `getBrandBrief`.
- Pass only brand-brief-derived props into the completed state.
- Ensure all branches (`before`, `after`, `none`) use the same brand brief completion logic and never fall back to startup labels/content.

### 3) Remove remaining startup wording from dashboard-facing surfaces
- Audit the dashboard shell and Today page for leftover startup copy.
- Fix labels such as the completed card eyebrow, section names, CTA text, and any “startup” references visible to attendees.
- Keep the product language aligned with The Executive Brand Intensive / Brand Experts.

### 4) Isolate legacy startup brief logic from current attendee dashboard UI
- Prevent dashboard-facing components from importing startup-only helpers like `BRIEF_BLOCKS` or `getFounderMemory` unless they are explicitly for a legacy route.
- Leave deeper legacy pipeline code alone unless it directly affects the dashboard, but remove any direct dependency from current attendee dashboard rendering.

### 5) Validate against the real user path before calling it fixed
- Confirm the authenticated user’s brand brief summary exists and is the source being read.
- Verify the Today dashboard, sidebar, and `/dashboard/brief` all agree on the same completion state.
- Recheck the preview with the completed-state card and confirm the startup sections/copy are gone.

## Technical details
**Files likely to change**
- `src/routes/_authenticated/dashboard.index.tsx`
- `src/components/brief/BriefCompleteCard.tsx` or a new brand-specific replacement component
- `src/routes/_authenticated/dashboard.tsx` if any leftover dashboard labels need cleanup
- Possibly a small helper from `src/lib/brand-brief.ts` / `src/lib/brand-brief.functions.ts` to format the completed-state summary cleanly

**Why this plan should work when the earlier one didn’t**
The earlier fix corrected the route-level query, but not the reused UI component that still renders startup-specific content. This plan fixes the actual remaining mismatch: the dashboard is reaching the completed branch, but that branch still renders the wrong component and wrong data model.