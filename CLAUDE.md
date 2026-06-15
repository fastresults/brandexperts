# EvoveMyBrand — Project Memory for Claude

## What this is
**The Brand OS Intensive** — a 3-hour brand workshop event for founders and operators.
Live at: https://brandexperts.org
GitHub: https://github.com/fastresults/brandexperts

---

## Stack

| Layer | Tech |
|---|---|
| Framework | React 19 + TypeScript |
| Routing | TanStack Router v1 (file-based, `src/routes/`) |
| SSR | TanStack Start v1 + Nitro (server entry: `src/server.ts`) |
| Build | Vite 7 via `@lovable.dev/vite-tanstack-config` |
| Package manager | Bun (`bun.lock`, `bunfig.toml`) — also has `package-lock.json` |
| Styles | Tailwind CSS v4 (`src/styles.css`) — uses `@utility`, `@theme inline`, `@custom-variant`, oklch colors |
| Components | shadcn/ui (`components.json`) |
| Animations | framer-motion (facilitator components) |
| Backend | Supabase (auth + DB; migrations in `supabase/migrations/`) |
| Deployment | Netlify (root `netlify.toml`) |

---

## Netlify Deployment

**Root `netlify.toml`** controls the build (the `.netlify/netlify.toml` is legacy UI config — ignore it).

Key settings:
- `vite.config.ts` MUST pass `nitro: { preset: "netlify" }` to `defineConfig` — outside the Lovable sandbox, `@lovable.dev/vite-tanstack-config` skips the nitro deploy plugin entirely unless `nitro` is explicitly set. Without it, `npm run build` is a plain Vite build with no SSR output (no `index.html`, no server bundle) -> 404 on every route.
- `NITRO_PRESET = "netlify"` env var - overrides Nitro's default Cloudflare target
- `publish = "dist"` - the parent `dist/` dir, not `dist/client`. Nitro's netlify preset emits `dist/client` (static), `dist/server` (SSR fn), and `dist/nitro.json`; Netlify's build image auto-detects `dist/nitro.json` and wires up the SSR function + redirects itself. Do NOT add manual `[[redirects]]` or `[functions]` blocks for this.

**Before changing `netlify.toml` or the nitro config:** run `rm -rf dist .output && npm run build` locally and inspect the `dist/` output (confirm `dist/nitro.json`, `dist/client/`, `dist/server/` all exist) before pushing. Verify against actual build output, not assumptions - this has regressed twice from guesswork.

- **`public/_redirects` must NOT exist / must NOT contain a SPA fallback like `/* /index.html 200`.** This is an SSR app — there is no `index.html` to fall back to. If this file is present with a catch-all rule, Nitro's build logs "Not adding Nitro fallback to _redirects (as an existing fallback was found)" and skips writing the redirect to the SSR function, causing every route to 404. If you need custom redirects/headers, add them via `netlify.toml` `[[redirects]]`/`[[headers]]`, not `public/_redirects`.
- After any build-output-affecting change, check the build log for the line `[nitro] ✔ Generated public dist/client` and confirm it does NOT also log "Not adding Nitro fallback to _redirects".

**If you see a Netlify 404:** check `vite.config.ts` has `nitro: { preset: "netlify" }`, `NITRO_PRESET=netlify` is set, and `publish = "dist"`. The old `.netlify/netlify.toml` had `publish` pointing to an absolute local path - that file is now superseded by root `netlify.toml`.

---

## Routes

```
src/routes/
  index.tsx      → /          (home — hero, NotACourseBanner, WalkIn/WalkOut, ArtOfThePossible, BottomCTA)
  schedule.tsx   → /schedule
  register.tsx   → /register
  facilitator.tsx → /facilitator
  contact.tsx    → /contact
```

Server functions use `useServerFn` from `@tanstack/react-start` — these are NOT client-side.

---

## Design System

**File:** `src/styles.css`

Key GenZ utilities added in the last major session:

```css
/* Real gradient text (was a flat blue #5aaff6 before — that's fixed) */
@utility text-gradient-brand { ... -webkit-background-clip: text ... }

/* Glassmorphism */
@utility glass { background: oklch(1 0 0 / 0.055); backdrop-filter: blur(18px) ... }

/* Glow effects */
@utility glow-primary { box-shadow: 0 0 18px -4px oklch(0.65 0.22 255 / 0.55) ... }
@utility glow-brand   { box-shadow: 0 0 22px -4px oklch(0.66 0.30 350 / 0.50) ... }

/* Animations */
@utility animate-fade-up    { animation: fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both }
@utility animate-pulse-glow { animation: pulse-glow 2.2s ease-in-out infinite }
@utility animate-shimmer    { background-size: 200% auto; animation: shimmer 2.8s linear infinite }

/* Gradient token */
--gradient-genz: linear-gradient(90deg, oklch(0.82 0.22 55), oklch(0.70 0.30 350), oklch(0.67 0.28 255));
```

Apply `hover:glow-primary` or `hover:glow-brand` on CTAs. Use `glass` for card surfaces. Use `animate-fade-up` with inline `animationDelay` for staggered reveals.

---

## Copy Voice & Psychology (GenZ Framework)

Applied across all pages in the last copy pass. Core principles:

1. **Builder-first credentialing** — lead with what was *built*, not titles or years
2. **Specificity over authority** — "15 assets" not "comprehensive toolkit"; "30 min/week" not "low time commitment"
3. **Anti-hustle framing** — "no willpower tax", "still running next quarter" (systems language)
4. **Direct address** — "you" statements, present tense, no passive voice
5. **Short declarative sentences** — cut anything after the second comma
6. **Peer validation** — "50+ brand systems installed for founders and operators" not "industry leader"
7. **Anti-ChatGPT positioning** — "sounds exactly like everyone else's ChatGPT output"

Key copy anchors:
- Event name: **The Brand OS Intensive**
- Hero H1: `"AI doesn't replace the real ones. But it will replace anyone who sounds generic."`
- Primary CTA: `"Lock in your seat"`
- WalkOut header: `"15 assets. 1 system. 0 homework."`
- Facilitator credential: `"Brand Operator · AI Builder · 50+ brand systems installed"`

---

## Component Locations

```
src/components/
  site/        → Header.tsx, Footer.tsx
  home/        → ArtOfThePossible.tsx (and others)
  facilitator/ → FacilitatorHero, Stats, Story, Pillars, Timeline, Audience, CTA
  brand/       → StartupLabsLogo.tsx
  ui/          → shadcn components
```

---

## Event Constants

Defined in `src/routes/index.tsx` (top of file, look for `EVENT` and `FACILITATOR_TITLE` constants).
Venue: IGNITE Center, Norcross GA.

---

## Git / GitHub

- Repo: `https://github.com/fastresults/brandexperts`
- Branch: check with `git branch` — likely `main`
- When pushing: `git add -A && git commit -m "..." && git push origin main`

---

## Things NOT to change without flagging

- The `routeTree.gen.ts` file is auto-generated by TanStack Router — never edit manually
- Supabase migrations in `supabase/migrations/` — coordinate with DB schema before changing
- `@lovable.dev/vite-tanstack-config` wraps Nitro + TanStack Start — don't add duplicate plugins
