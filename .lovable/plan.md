## Problem

Current `src/lib/value-grid.ts` totals to **$23,800–$60,200** and **131–324 hrs**. That inflates the stack to enterprise-agency pricing ($15K–$60K), which an executive paying $1K–$1.5K/month for personal branding will read as fantasy. It hurts the credibility of a $297/$397 offer more than it helps it.

## Market reality (2025–2026 personal-brand rates)

- LinkedIn ghostwriting retainers for execs: **$1,500–$5,000/mo** (typical $2K–$3K)
- One-off LinkedIn post / POV piece: **$150–$400**
- Long-form ghostwritten article (800–1,200w): **$500–$1,500**
- Brand positioning / messaging sprint (boutique): **$1,500–$4,000**
- Bio package (3 lengths): **$300–$800**
- AI/exec headshot set: **$50–$300** (AI) up to $800 (light studio)
- Carousel design: **$150–$500**
- Newsletter issue ghostwrite: **$300–$800**
- Keynote opener / talking points: **$500–$1,500**
- 14-day scheduled social calendar: **$600–$1,500**
- Content strategy doc (30/90-day): **$800–$2,000**
- Voice/style guide: **$500–$1,500**

A realistic stack total lands around **$8K–$18K** — still 25–60× the Founders price, which is the persuasion job. It just stops sounding made up.

DIY hours similarly: drafting one Op-Ed is realistically 4–8 hrs for a busy exec, not 10–24. Total should land near **60–140 hrs** (~1–2 months of nights & weekends), not 2–3 months.

## Proposed new numbers (`src/lib/value-grid.ts`)

| Deliverable | Old cost | New cost | Old hrs | New hrs |
|---|---|---|---|---|
| Brand Blueprint | $5K–$12K | **$1,500–$3,500** | 24–60 | **8–20** |
| Brand Assessment Report | $2.5K–$6K | **$800–$2,000** | 12–30 | **5–12** |
| Voice Profile | $3K–$8K | **$500–$1,500** | 16–40 | **4–10** |
| Three Bios | $800–$2K | **$300–$800** | 4–10 | **2–5** |
| Executive Headshot Set | $1.2K–$3.5K | **$150–$600** | 4–12 | **2–6** |
| Op-Ed (800–1,200w) | $1.5K–$4K | **$600–$1,500** | 10–24 | **4–10** |
| POV post | $400–$1.2K | **$150–$400** | 3–8 | **1–3** |
| Framework Carousel | $800–$2.5K | **$250–$700** | 6–16 | **3–8** |
| Keynote Opener + Q&A | $1.5K–$3K | **$500–$1,200** | 8–16 | **3–8** |
| Newsletter Issue | $600–$1.5K | **$300–$700** | 4–10 | **2–5** |
| 30-Day Authority Sprint | $1.5K–$3.5K | **$500–$1,200** | 10–24 | **4–10** |
| 90-Day Newsletter Arc | $2K–$5K | **$600–$1,500** | 12–28 | **4–12** |
| 14 Days Scheduled Social | $1.5K–$3.5K | **$600–$1,200** | 8–20 | **3–8** |
| Reusable Content Presets | $500–$1.5K | **$200–$500** | 4–10 | **2–5** |
| Brand Operating Manual (PDF) | $1K–$3K | **$400–$1,000** | 6–16 | **3–8** |

**New totals: ≈ $7,350–$18,300 · 50–130 hrs (~3–5 weeks of nights & weekends)**

Still ~25–60× the $297 Founders price and ~20–45× the $397 Cohort price — the value-stack persuasion math holds, and the numbers are defensible to a CFO.

## Copy adjustments (downstream)

- `TotalsBar` / wherever the "≈ 2–3 months of nights & weekends" string lives — change to "≈ 3–5 weeks of nights & weekends" (or read from a single source). I'll grep for the literal and update.
- No headlines, pills, or pricing change. No structural changes.

## Files to edit

1. `src/lib/value-grid.ts` — replace `marketCostMin/Max` and `diyHoursMin/Max` on all 15 rows per the table above.
2. `src/components/value/TotalsBar.tsx` (and any other file containing "2–3 months of nights") — update the nights-&-weekends descriptor to match the new hours band.

## Out of scope

Pricing tiers, headlines, pills, dynamic cohort data, persuasion architecture, layout — all untouched.
