# Replace logo with BrandExperts SVG (light/dark aware)

## What changes

Swap every "StartupLabs" logo occurrence — public site (Header, Footer, paused/dashboard shells) and admin (AdminSidebar) — for the new BrandExperts SVG. The SVG must recolor automatically with the active theme.

## Approach

The fetched file is a single wide wordmark (`viewBox="0 0 2956.04 398.69"`, all paths filled `#424242`). It has two visual zones:
- A cluster of star/burst glyphs on the left (works as a compact "mark").
- The "brandexperts" wordmark to the right (full logo).

I'll convert both into inline React SVG components so we can drive color via `currentColor` (the cleanest way to do light/dark with Tailwind/`text-foreground`).

## Steps

1. **Save source SVG** to `src/assets/brandexperts-logo.svg` (reference / fallback for any `<img>` use; favicon stays separate).

2. **Rewrite `src/components/brand/StartupLabsLogo.tsx`**
   - Replace contents with the full BrandExperts wordmark paths.
   - Strip the embedded `<style>.cls-1{fill:#424242}</style>` and set `fill="currentColor"` on the root `<g>` (or each path). Removes hard-coded gray.
   - Keep the same exported name `StartupLabsLogo` and `{ className, title }` props so no call sites need to change.
   - Default `title="BrandExperts"`.

3. **Rewrite `src/components/brand/StartupLabsMark.tsx`**
   - Use only the left-side star cluster paths from the source SVG, with a tight square viewBox so it renders well in the collapsed sidebar / favicon-sized slots.
   - `fill="currentColor"`, same prop shape, default `title="BrandExperts"`.

4. **Theme wiring (no component-call changes needed)**
   - All current call sites already pass `text-foreground` / inherit color from a themed container (verified in `AdminSidebar.tsx`, `Header.tsx`, `Footer.tsx`, `dashboard.tsx`, `paused.tsx`). Because we switch fills to `currentColor`, the logo automatically picks up the right color in light vs dark mode via the existing `ThemeProvider`.
   - Spot-audit each of the 5 call sites and add `text-foreground` where the parent doesn't already set a text color, so the logo is always legible on its background.

5. **Favicon**
   - Replace `public/favicon.svg` with a square mark version (same star-cluster paths, `fill="#424242"` baked in since favicons don't get a React theme context — browsers render them on the tab strip directly). Optional: include a `<style>@media (prefers-color-scheme: dark){...}</style>` block inside the SVG to flip to white in dark browsers.
   - Leave `public/startuplabs-logo.svg` in place but unused, or delete it (will confirm — see Question).

6. **No other code changes.** Component exports keep their existing names (`StartupLabsLogo`, `StartupLabsMark`) to avoid touching imports across 7 files. We can rename in a follow-up if you want the symbol names to match the brand.

## Out of scope

- Rebranding text strings ("StartupLabs" copy in headings, page titles, email templates, etc.). This task is logo-only per your request.
- Changing the brand color palette / design tokens in `styles.css`.

## One quick question

Do you want me to **delete** the old `public/startuplabs-logo.svg` and `src/assets/startuplabs-logo.svg` files, or leave them as-is? (They won't be referenced after this change.)
