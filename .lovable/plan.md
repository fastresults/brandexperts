## Goal

Elevate the body copy across every public-facing page to award-winning, personal-branding-operator caliber — grounded in the 10 tangible benefits you provided (defensible voice, compounding authority, boardroom-grade prep, elevation of every touchpoint, speed on cultural moments, ghostwriter-tax elimination, compounding inbound, knowledge base that appreciates, insulation against AI commoditization, 30-min weekly cadence).

## Hard constraints

- Do NOT change any pills, eyebrow chips, badges, or headlines (h1/h2/h3 hero lines).
- Do NOT touch dates, seat counts, pricing — keep `useEvent()` / `EVENT.*` dynamic values intact.
- Do NOT change layout, structure, components, or routing.
- Preserve the persuasion architecture (contrarian opener, disqualifier, time-compression, scarcity, operator authority, value-stack, public-commitment close).
- Frontend / copy only — no logic, no schema, no server functions.

## Pages and components in scope

Public routes:
- `src/routes/index.tsx` (home)
- `src/routes/facilitator.tsx` + all `src/components/facilitator/*`
- `src/routes/register.tsx` + `src/components/register/RegisterSelection.tsx`
- `src/routes/schedule.tsx`
- `src/routes/contact.tsx`

Public components:
- `src/components/home/HomeSelection.tsx` (paragraph copy, criteria descriptions, step descriptions, timeline blurbs, finalist-offer body, bottom-CTA paragraph)
- `src/components/home/ArtOfThePossible.tsx` (body paragraphs only)
- `src/components/value/ValueGrid.tsx`, `PricingTiers.tsx`, `CohortPicker.tsx`, `TotalsBar.tsx` (descriptions, sub-labels, item explanations — not card titles)
- `src/components/site/Footer.tsx` (tagline / descriptive lines only)

Out of scope: `_authenticated/*`, admin, dashboard, brief/voice/brand/media tools, auth pages (login/signup/reset-password), legal (privacy/terms), email templates, unsubscribe.

## Approach

1. Read every file in scope to inventory existing body copy and identify which strings are headline/pill vs. body. Treat anything rendered inside h1/h2/h3, `Badge`, eyebrow span, or pill component as off-limits.
2. For each body string, rewrite it through the lens of the most-relevant benefit(s) from your 10. Map roughly:
   - Hero/intro paragraphs → #1 defensible voice + #9 insulation against commoditization
   - "What you'll walk out with" / value grids → #2 compounding authority + #4 elevation of touchpoints + #10 30-min cadence
   - "Who this is for" / disqualifier → #1, #6 (ghostwriter tax), #7 (inbound)
   - Timeline / in-the-room copy → #3 boardroom-grade prep + #5 speed-to-market
   - Pricing / value-stack support copy → #6 ghostwriter tax + #8 knowledge base appreciates
   - Final CTA / commitment close → meta-benefit (attention defaults to authentic signal)
3. Keep the operator-authority voice (Citi/Mayo/3M/Disney + Caribbean government + 5 summits) and Adam's facilitator framing on `facilitator.tsx`.
4. Tone rules: specific over generic, concrete over abstract, second-person ("you"), no hype words ("revolutionary", "game-changing"), no em-dash overuse, no AI-tells. Each rewritten paragraph must earn its line — cut anything that doesn't.
5. Length: match or shorten existing copy; never inflate. If a paragraph currently is 2 sentences, the replacement is ≤ 2 sentences.
6. After edits, grep for the original phrases to confirm nothing was missed, and visually confirm pills/headlines are untouched.

## Technical notes

- All edits are surgical `code--line_replace` calls on string literals inside JSX — no component restructuring.
- Anything wrapped in `EVENT.*`, `useEvent()`, `cohort.*`, or dynamic interpolation stays as-is; only the static prose around it changes.
- No new dependencies, no new files.

## Deliverable

A single build-mode pass that rewrites body copy across the files above, leaving pills, headlines, dates, seats, pricing, and structure identical. I'll list the edited files at the end.
