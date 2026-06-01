## Problem

When a user logs in to the published site, they don't land on `/dashboard` — they're redirected to `/welcome`, which still renders the old **"Atlanta Startup Sprint — Tell us what you're building"** intake form (screenshot). That page is a leftover from the prior startup-formation product and has nothing to do with The Executive Brand Intensive.

### Root cause

`src/routes/_authenticated.tsx` enforces an "approved member" gate:

```ts
if (!isApprovedMember && !isWelcome) {
  return <Navigate to="/welcome" replace />;
}
```

`isApprovedMember` is true only when the user is an admin OR `profiles.member_status === 'approved'`. New signups default to `'pending'`, so every normal user gets bounced into the startup-intake funnel and never reaches their dashboard.

This gate made sense for the old "apply to join" startup product. For the Executive Brand Intensive, registration = payment for a workshop seat, and the dashboard is the post-registration experience. There is no "approve to enter the app" step.

## Fix (brute force, as requested)

Remove the approval gate. Any authenticated, non-paused user goes straight into the app.

### 1. `src/routes/_authenticated.tsx`

Strip the `isApprovedMember` / `/welcome` redirect. Keep:
- Auth check (redirect to `/login` if not authenticated)
- Loading state
- `paused` handling (a previously-active member whose access was revoked still gets the `/paused` screen)

Resulting flow:
- Not authenticated → `/login`
- Authenticated + paused (non-admin) → `/paused`
- Everyone else → render `<Outlet />`

### 2. Remove the welcome route

Delete `src/routes/_authenticated/welcome.tsx` (and any `Link to="/welcome"` references, e.g. the "Or register for a workshop directly" link if it points there). The router tree regenerates automatically.

### 3. Backfill existing pending users

Run a one-time data update flipping every `profiles.member_status = 'pending'` to `'approved'` so the `useAuth().isApprovedMember` flag (still used in places like `BeforeMode` copy, admin badges, etc.) reflects reality. Leave `'paused'` and `'rejected'` alone.

### 4. Leave alone

- `member_status` column itself — still useful for the `paused` lifecycle and admin tooling.
- `isAdmin` / `_admin` layout — separate gate, unaffected.
- `member_intakes` table — no schema change; the table just stops getting new rows.

## What you'll see after the fix

Log in → land on `/dashboard` (the Today page with the workshop countdown / brief progress), exactly like an approved member sees today. No more startup-intake form.

## Files touched

- `src/routes/_authenticated.tsx` — remove welcome gate
- `src/routes/_authenticated/welcome.tsx` — delete
- Any stray `to="/welcome"` links — remove or repoint
- One data update on `profiles` (pending → approved)
