
## Goal

Rebuild the entire `launch-startuplabs.online` app you uploaded into this project, with a fresh Lovable Cloud (Supabase) backend.

The uploaded project uses the exact same template as this one (TanStack Start + React 19 + Tailwind v4 + Lovable Cloud), so the cleanest approach is to copy the source verbatim, install matching dependencies, enable Cloud, and apply the 25 migrations against the new database.

## Steps

1. **Enable Lovable Cloud** on this project (creates a fresh Supabase project, sets `SUPABASE_*` and `VITE_SUPABASE_*` env vars, scaffolds `src/integrations/supabase/`).

2. **Install missing dependencies** to match the uploaded `package.json`:
   `@ai-sdk/openai-compatible`, `@lovable.dev/cloud-auth-js`, `@lovable.dev/email-js`, `@lovable.dev/webhooks-js`, `@react-email/components`, `ai`, `framer-motion`, `react-email`, `react-markdown`, `remark-gfm`, plus any other diffs.

3. **Copy source tree** from the upload into this project (excluding `.git`, `.env`, `.lovable/project.json`, `package-lock.json`, `__MACOSX`, `.DS_Store`, and the auto-generated `src/integrations/supabase/`):
    - `src/routes/**` (all marketing + auth + admin + dashboard + email + API routes)
    - `src/components/**` (brand, brief, dashboard, facilitator, home, media, register, site, theme, value, voice, admin, ui)
    - `src/hooks/**`, `src/lib/**`, `src/assets/**`, `src/styles.css`
    - `src/router.tsx`, `src/start.ts`, `src/server.ts`
    - `public/**` (logo, favicon)
    - `supabase/migrations/**` (all 25 SQL files) and `supabase/config.toml`
    - `components.json`, `vite.config.ts`, `tsconfig.json`, `eslint.config.js` (only the diffs)

4. **Reconcile Supabase integration glue.** The new Cloud-generated `src/integrations/supabase/{client,client.server,auth-middleware,auth-attacher}.ts` stay as-is. If the uploaded project added helpers there (e.g. additional middleware), port only the additive pieces. Confirm `src/start.ts` still registers `attachSupabaseAuth` in `functionMiddleware`.

5. **Apply the 25 migrations in order** against the new Cloud database (chronological filenames; user roles, profiles, cohorts, applications, attendees, deliverables, media, registrations, inquiries, email infra, etc.). Each migration runs through the migration tool; I'll batch them but verify each succeeds before continuing.

6. **Set required secrets** so AI, email, and webhook routes work. After Cloud is on I'll list what `src/lib/**` and the API routes reference (`LOVABLE_API_KEY` for AI Gateway, any email/webhook secrets) and request them via the secrets tool — only after confirming with you which are actually needed.

7. **Verify build** (auto-run after edits): typecheck passes, route tree regenerates, no `client.server` leaks into client bundles, dev server boots, home page renders.

8. **Smoke-check key routes** in the preview: `/`, `/facilitator`, `/schedule`, `/register`, `/login`, `/signup`. Auth-gated dashboard/admin routes can be verified after you create a test account.

## Out of scope for this plan

- Migrating production data from the old Supabase project (you said fresh).
- Email domain verification, custom domain, publishing — separate follow-ups.
- Behavior changes or redesign — this is a faithful port.

## Notes / things to flag mid-build

- The uploaded migrations are dated `2026-05-28`+; they'll apply cleanly to a new project but I'll watch for any that assume pre-existing rows.
- Some `src/lib/*.functions.ts` likely call AI Gateway or email APIs — those need their secrets present before the routes that use them will work end-to-end, but the app will still build without them.
- If any uploaded file imports an asset I don't copy (e.g. something missed under `src/assets/`), the build will fail loudly and I'll grab it.

Approve this and I'll switch to build mode and start with step 1.
