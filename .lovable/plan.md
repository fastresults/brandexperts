# Why the dashboard says "start your brief" even though the user finished it

## What I found

The user `fastresults@gmail.com` (`auth.users.id = ecc26f23-…dfbfd5`) **has** completed their brief — `public.attendee_brief_summary` has a `completed_at` row for them (timestamped today, 2026-06-01 15:03 UTC).

The dashboard's "Today" page (`src/routes/_authenticated/dashboard.index.tsx`) decides "brief is done" with:

```ts
const summaryDone = !!brief.data?.summaryCompletedAt;
```

That value is supposed to come from `getMyBrief` (`src/lib/brief.functions.ts`), which runs as the authenticated user and queries `attendee_brief_summary`. Row-Level Security policies on that table are correct (`auth.uid() = user_id` for SELECT/INSERT/UPDATE/DELETE).

**But the table has no GRANTs for `authenticated` or `service_role`** — only `sandbox_exec`:

```
attendee_brief_summary | sandbox_exec | INSERT,SELECT
```

PostgREST therefore returns a permission error before RLS is even evaluated. `getMyBrief` ignores the error (it destructures only `data`), so `summary` is `undefined`, `summaryCompletedAt` becomes `null`, and the dashboard falls into the "not done" branch of `NoCohortMode` — exactly what the screenshot shows.

The same missing-grants bug exists on every brief/founder table:

```
attendee_brief_alignment, attendee_brief_facts, attendee_brief_summary,
attendee_business_brief, attendee_founder_memory, attendee_founder_profile
```

These all have RLS policies that reference `authenticated`, but no role has been granted base table privileges, so every read silently fails.

## The fix

Single migration that adds the standard grants the project's own guidelines require (table-level GRANT must accompany every public-schema table):

```sql
GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.attendee_brief_summary,
  public.attendee_business_brief,
  public.attendee_brief_facts,
  public.attendee_brief_alignment,
  public.attendee_founder_memory,
  public.attendee_founder_profile
TO authenticated;

GRANT ALL ON
  public.attendee_brief_summary,
  public.attendee_business_brief,
  public.attendee_brief_facts,
  public.attendee_brief_alignment,
  public.attendee_founder_memory,
  public.attendee_founder_profile
TO service_role;
```

RLS still enforces per-user access (`auth.uid() = user_id`); the grants just let PostgREST attempt the query at all.

## Optional follow-up (not in this fix unless you want it)

`getMyBrief` and `updateBriefField` swallow Supabase errors on several reads (`const { data: summary } = …` with no `error` check). I'd leave the call sites alone for now since the grant fix removes the actual failure, but flagging it — silent error-swallowing is what hid this bug for so long.

## Files touched

- One new migration adding the GRANTs above. No application code changes.

After this, the user's "Today" page will see `summaryCompletedAt`, hit the `done` branch, and render `BriefCompleteCard` instead of the "start your brief" CTA.
