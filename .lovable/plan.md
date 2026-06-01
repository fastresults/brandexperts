## Problem

`fastresults@gmail.com` has completed the brand brief (15 facts, 5,250-char summary, `attendee_brief_summary.completed_at` set), but `profiles.member_status` is still `pending`. The `_authenticated` layout (`src/routes/_authenticated.tsx`) redirects every non-approved user to `/welcome`, so `/dashboard/materials`, `/dashboard/brief`, etc. all show the "Welcome — start your brief" screen even though the brief is already done.

Today `member_status` only flips to `approved` via the `auto_approve_member_on_payment` trigger (on `workshop_registrations` → paid/confirmed). Brief completion has no equivalent path.

## Fix

Auto-approve the user the moment their brief summary is finalized.

### 1. Server-side promotion in `regenerateBriefSummary`

In `src/lib/brand-brief.functions.ts`, right after the `attendee_brief_summary` upsert that sets `completed_at: nowIso` (around line 463), promote the profile using `supabaseAdmin`:

```ts
await supabaseAdmin
  .from("profiles")
  .update({
    member_status: "approved",
    approved_at: new Date().toISOString(),
    approved_via: "brief",
  })
  .eq("user_id", userId)
  .neq("member_status", "approved");
```

`supabaseAdmin` is already imported and bypasses RLS, so no policy changes are needed. Using `.neq("member_status", "approved")` keeps it idempotent and preserves any earlier `approved_at`/`approved_via` if a paid registration already promoted them.

### 2. Backfill the existing stuck user

Run a one-time data update via the insert tool to promote every user who already has a completed brief but is still `pending`:

```sql
UPDATE public.profiles p
   SET member_status = 'approved',
       approved_at   = COALESCE(p.approved_at, now()),
       approved_via  = COALESCE(p.approved_via, 'brief')
 WHERE p.member_status <> 'approved'
   AND EXISTS (
     SELECT 1 FROM public.attendee_brief_summary s
      WHERE s.user_id = p.user_id AND s.completed_at IS NOT NULL
   );
```

This unblocks `fastresults@gmail.com` immediately and covers any other user in the same state.

### 3. Client cache refresh

`useAuth()` reads `member_status` from `profiles`. After step 1 fires server-side, the dashboard panel that triggers brief finalization should `router.invalidate()` (or `queryClient.invalidateQueries({ queryKey: ["auth"] })` — whichever key `useAuth` uses) so the user is moved past the `/welcome` gate without a manual refresh. I'll wire this into the existing "finalize brief" success handler in `src/routes/_authenticated/dashboard.brief.tsx`.

## Out of scope

- No changes to the `_authenticated` gate itself — keeping `isApprovedMember` as the single source of truth for dashboard access.
- No changes to RLS or table grants.
- No changes to the payment-based approval trigger.

## Files

- `src/lib/brand-brief.functions.ts` — promote profile in `regenerateBriefSummary`.
- `src/routes/_authenticated/dashboard.brief.tsx` — invalidate auth/router after finalize.
- One-time SQL `UPDATE` via the insert tool — backfill stuck users.
