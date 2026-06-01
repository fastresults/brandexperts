## Problem

The site header CTA still reads **"Reserve seat — from $679"** (hardcoded in `src/components/site/Header.tsx:36`). It was not updated when the tier prices changed to $197 / $297, so it contradicts the live pricing across the rest of the app.

## Audit results

Searched the codebase for hardcoded price strings (`$679`, `$1,500`, `$2,500`, `150000`, `250000`, etc.):

- ✅ `src/lib/value-grid.ts` `PRICING` → already 197 / 297
- ✅ `src/lib/cohorts.ts` `DEFAULT_PRICING` → already 19700 / 29700
- ✅ DB `public.cohorts` (all 12 rows) → already 19700 / 29700
- ❌ `src/components/site/Header.tsx:36` → **hardcoded "$679"** (the bug in the screenshot)
- ✅ `src/components/value/TotalsBar.tsx` → reads from `PRICING` (dynamic)
- ✅ `src/components/value/PricingTiers.tsx` → reads `cohort.foundersPriceCents` (dynamic)
- ✅ `src/lib/business-ideas.ts` price mentions → unrelated demo content, not workshop pricing

## Fix

Update `src/components/site/Header.tsx` so the CTA price is driven by the same `PRICING` source of truth instead of a hardcoded string:

```ts
import { PRICING } from "@/lib/value-grid";
...
const ctaFull = isFreeCohort
  ? "Apply — free cohort"
  : `Reserve seat — from $${PRICING.founders.price}`;
```

Result: header reads **"Reserve seat — from $197"** and will auto-track any future tier change.

No DB changes, no other UI changes — every other surface already reflects $197 / $297.
