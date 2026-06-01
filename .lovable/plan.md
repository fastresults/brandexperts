## Pricing update: $1,500 / $2,500 → $197 / $297

Founders tier = $197, Cohort tier = $297. Updates code defaults and all existing cohort rows so the admin UI, public pricing UI, and database match.

### Database (migration via supabase tool)
Update all 12 cohort rows in `public.cohorts`:
- `founders_price_cents`: 150000 → 19700
- `cohort_price_cents`: 250000 → 29700

### Code defaults
- `src/lib/cohorts.ts` → `DEFAULT_PRICING`: `foundersPriceCents: 19700`, `cohortPriceCents: 29700` (used when admin creates a new cohort)
- `src/lib/value-grid.ts` → `PRICING`: `founders.price: 197`, `cohort.price: 297` (used by `TotalsBar` "from $197 / $297 after first N seats")

### What stays the same
- Seat counts (founders 4 / cohort 8 internal; 6 public each tier — unchanged)
- Schema, validators (max `10_000_00` covers $197/$297), admin form structure
- Value-grid market-cost ranges (those are agency comparables, not our price)
- The unrelated `1500` matches (zod max chars, address "1500 Indian Trail", 1500ms timeout)

### After apply
Admin → Cohorts will show $197 / $297 per row; home/register pricing cards and TotalsBar will show "from $197", "$297 after first 6 seats".