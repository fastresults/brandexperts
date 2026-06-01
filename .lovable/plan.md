## Fix plan

The issue is not just missing permissions anymore — the dashboard is still reading the wrong brief system.

### What I’ll change
1. **Replace the Today page’s data source**
   - Stop using `getMyBrief` in `src/routes/_authenticated/dashboard.index.tsx` for the completion gate.
   - Use the same brand-brief source that the real brief page and sidebar already use: `getBrandBrief`.

2. **Make the completion logic consistent everywhere**
   - Drive the dashboard’s `done / not done` state from `brand brief summary.completed_at` and brand-brief progress, not the older startup-brief fields.
   - Ensure the hero card, CTA label, and fallback copy all follow that same source of truth.

3. **Remove the product-mismatch on the dashboard**
   - The screenshot shows startup users being told to “Design your brand operating system.”
   - I’ll update the Today page so it renders the correct completed state for this product instead of falling back to the stale brand-intake CTA.

4. **Check for one more mixed path**
   - The sidebar already uses `getBrandBrief`, while the Today page uses `getMyBrief`.
   - I’ll align any remaining dashboard-only brief labels so this cannot split again.

## Exact problem
Right now the app has **two different brief systems wired into the dashboard**:
- `dashboard.index.tsx` uses `getMyBrief` from `src/lib/brief.functions.ts`
- `dashboard.tsx` sidebar and `/dashboard/brief` use `getBrandBrief` from `src/lib/brand-brief.functions.ts`

That mismatch is why a user can complete their real brief and still land on the “start your brief” card.

## Technical notes
- Files likely touched:
  - `src/routes/_authenticated/dashboard.index.tsx`
  - possibly `src/routes/_authenticated/dashboard.tsx` for label cleanup only
- No backend schema change should be needed for this step if the grants migration already ran.
- After implementation, I’ll verify that a completed user on `/dashboard` sees `BriefCompleteCard` instead of `NextActionCard`.
