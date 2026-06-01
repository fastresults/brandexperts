## What I missed

The DB and the `PRICING` / `cohorts` source-of-truth are correct ($297 / $397, first Wednesday of each month from Aug 2026). But large portions of the site still use **hardcoded copy** from the original spec — they never read from the live cohort. The screenshot is one symptom; an audit found many more.

## Audit results (everything still hardcoded)

### Homepage — `src/routes/index.tsx`
- L36: "…Twelve seats…" in hero description
- L42: "**July 23, 2026** · IGNITE Center…Twelve seats" in OG/twitter description
- L163, 175, 437: `{EVENT.capacity * 2} seats` — multiplies an already‑halved public count, prints "12 seats" instead of the intended public count
- L533: `seatsWord(EVENT.capacity * 2)` in the closing CTA
- L546: "Reserve your seat for **July 23**"

### Selection page — `src/components/home/HomeSelection.tsx`
- 7 hardcoded mentions of "July 23, 2026" / "July 23" / "July 8" (decision date)
- Day‑of label and timeline both pinned to Thursday July 23

### Register page — `src/components/register/RegisterSelection.tsx`
- Validation message, checkbox label, hint copy, and confirmation paragraph all reference "Thursday, July 23, 2026" / "July 8"

### Schedule page — `src/routes/schedule.tsx`
- L263: "One afternoon. One door. **Twelve seats.**"

### Admin
- `_authenticated/_admin/admin.site.tsx` L107: event card description "…Free. **July 23, 2026.**"
- `_authenticated/_admin/admin.applications.$id.tsx` L134: canned reply email body hardcodes "July 23, 2026"

### Emails
- `lib/email-templates/inquiry-reply.tsx` L50: sample body "next selection cohort opens **July 15**"

### Memory
- `mem://index.md` still says "Pricing: Founders **$197 / Cohort $297**" and "Capacity: 12 internal → 6 public seats per tier" — both stale after the pricing change.

### Seat‑count math bug
`EVENT.capacity` already runs `toPublicSeats(foundersSeats + cohortSeats)` = `round((4+8)/2) = 6`. Every `EVENT.capacity * 2` therefore renders **12**, undoing the "show half" rule and double‑counting against the documented intent of "6 public seats per tier". Decision needed (see Question 1).

## Plan

1. **Centralize date + seat formatting.** Add two helpers in `src/lib/schedule-data.ts` (or extend `useEvent`): `formatEventDateLong(cohort)` → "Wednesday, August 5, 2026", and `publicSeatLabel(cohort)` (returns the agreed public total). Every page imports these instead of hardcoding.

2. **Homepage `src/routes/index.tsx`.** Replace L36/L42 descriptions to drop "July 23" and "Twelve seats" — derive from `EVENT` in the route's `head()` (loader can read the next cohort). Replace all `EVENT.capacity * 2` with the new `publicSeatLabel`. Replace L546 "Reserve your seat for July 23" with the dynamic date.

3. **`HomeSelection.tsx`.** Accept the next cohort as a prop (or call `useEvent()` inside). Replace every "July 23, 2026" / "July 23" / "Thursday, July 23, 2026" with dynamic values. The "decision by July 8" date becomes `cohortDate − 15 days` (derived helper).

4. **`RegisterSelection.tsx`.** Same treatment: dynamic date in validation message, checkbox, hint, confirmation copy.

5. **`schedule.tsx`** L263: replace "Twelve seats." with the dynamic seat label.

6. **Admin surfaces.**
   - `admin.site.tsx` event card description → read next cohort.
   - `admin.applications.$id.tsx` canned reply → template the date from the application's `cohort_id` row.

7. **Emails.** `inquiry-reply.tsx` sample body → use the next open cohort date pulled when the template renders.

8. **Verify DB once more.** Confirm `cohorts` rows: Jun 17 + Jul 15 (kept), then Aug 5, Sep 2, Oct 7, Nov 4, Dec 2 / Jan 6, Feb 3, Mar 3, Apr 7, May 5; prices `29700` / `39700`. (Already correct from prior turn — included as a verification step, not a change.)

9. **Update `mem://index.md`** Core block: pricing to "Founders $297 / Cohort $397", and clarify the public seat rule once Question 1 is answered.

10. **Visual QA.** Reload `/`, `/register`, `/schedule`, `/admin/site`, `/admin/applications/<id>`; confirm every previously‑hardcoded mention now reads the live cohort and that the seat label is consistent everywhere.

## Out of scope

- Changing the seat‑count *math* itself (only the display label) unless Question 1 calls for it.
- Touching June 17 (sold out) and July 15 (filling) cohort dates.

## Questions before I build

1. **Seat label.** Right now `EVENT.capacity * 2` prints **12** total public seats (which is internal 4+8). The earlier intent in memory was "6 public seats per tier" → 12 public total, but the helper `toPublicSeats` rounds 4+8 to **6** public total. Which do you want shown on the site: **12 seats** (current rendered value), **6 seats** (what `toPublicSeats` actually returns), or something else like **"12 seats · 6 per tier"**?
2. **"Decision date" copy.** Selection cohort copy says "Decision by July 8" (15 days before July 23). Keep the same 15‑day offset for every future cohort, or pick a fixed rule (e.g., "10 days before")?
3. **July 15 cohort (currently "filling").** Leave its date as Jul 15, or also move it to the nearest first Wednesday (Jul 1, 2026)?
