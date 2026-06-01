export type ValueRow = {
  stageN: number;
  stageLabel: string;
  deliverable: string;
  marketCostMin: number;
  marketCostMax: number;
  diyHoursMin: number;
  diyHoursMax: number;
  postWorkshop?: string;
};

// The 15 deliverables of The Executive Brand Intensive, mapped to the 5 blocks
// that actually produce them. (Block 6 — Commitments — produces no asset; it
// closes the room.) Cost ranges anchor to the spec's value stack: $15K–$40K
// agency comparable, delivered in 3 hours.
export const VALUE_ROWS: ValueRow[] = [
  // Block 1 — Foundation
  { stageN: 1, stageLabel: "Foundation", deliverable: "Brand Blueprint — positioning, 3 pillars, audience, proof points", marketCostMin: 1500, marketCostMax: 3500, diyHoursMin: 8, diyHoursMax: 20, postWorkshop: "Pin the one-sentence positioning to the top of your brand workspace. Every future asset validates against it before publishing." },
  { stageN: 1, stageLabel: "Foundation", deliverable: "Brand Assessment Report — sourced gap analysis vs. category peers", marketCostMin: 800, marketCostMax: 2000, diyHoursMin: 5, diyHoursMax: 12 },

  // Block 2 — Voice
  { stageN: 2, stageLabel: "Voice", deliverable: "Voice Profile — captured tone, vocabulary, cadence, sentence rhythm", marketCostMin: 500, marketCostMax: 1500, diyHoursMin: 4, diyHoursMax: 10 },
  { stageN: 2, stageLabel: "Voice", deliverable: "Three Bios — short (50w) / medium (150w) / long (350w), copy-paste ready", marketCostMin: 300, marketCostMax: 800, diyHoursMin: 2, diyHoursMax: 5, postWorkshop: "Paste the medium bio into LinkedIn About before you leave Block 3. The short one goes on your speaker page; the long one into board bios." },
  { stageN: 2, stageLabel: "Voice", deliverable: "Executive Headshot Set — LinkedIn, press, speaker tile, podcast variations", marketCostMin: 150, marketCostMax: 600, diyHoursMin: 2, diyHoursMax: 6 },

  // Block 3 — Signature Content
  { stageN: 3, stageLabel: "Signature", deliverable: "Op-Ed / thought leadership article — 800–1,200 words on pillar #1", marketCostMin: 600, marketCostMax: 1500, diyHoursMin: 4, diyHoursMax: 10 },
  { stageN: 3, stageLabel: "Signature", deliverable: "POV post — contrarian, publish-ready, designed for comments not likes", marketCostMin: 150, marketCostMax: 400, diyHoursMin: 1, diyHoursMax: 3, postWorkshop: "Publish before Block 6 ends — this is the post you commit to aloud." },
  { stageN: 3, stageLabel: "Signature", deliverable: "Framework Carousel — 7 slides of your proprietary methodology", marketCostMin: 250, marketCostMax: 700, diyHoursMin: 3, diyHoursMax: 8 },

  // Block 4 — Distribution & Repurposing
  { stageN: 4, stageLabel: "Distribution", deliverable: "Keynote Opener + executive Q&A talking points (5-min stage script)", marketCostMin: 500, marketCostMax: 1200, diyHoursMin: 3, diyHoursMax: 8 },
  { stageN: 4, stageLabel: "Distribution", deliverable: "Newsletter Issue — subject line, preview text, full issue from the Op-Ed", marketCostMin: 300, marketCostMax: 700, diyHoursMin: 2, diyHoursMax: 5 },

  // Block 5 — The Compounding System
  { stageN: 5, stageLabel: "System", deliverable: "30-Day Authority Sprint — sequenced day-by-day around pillar #1", marketCostMin: 500, marketCostMax: 1200, diyHoursMin: 4, diyHoursMax: 10 },
  { stageN: 5, stageLabel: "System", deliverable: "90-Day Newsletter Arc — next quarter's themes and through-lines", marketCostMin: 600, marketCostMax: 1500, diyHoursMin: 4, diyHoursMax: 12 },
  { stageN: 5, stageLabel: "System", deliverable: "Two Weeks of Scheduled Social Posts — auto-publishing from day one", marketCostMin: 600, marketCostMax: 1200, diyHoursMin: 3, diyHoursMax: 8, postWorkshop: "Posts auto-publish across LinkedIn + X starting tomorrow morning. Review the queue every Monday in your 30-min cadence." },
  { stageN: 5, stageLabel: "System", deliverable: "Reusable Content Presets — one per pillar, future briefs are 30-sec decisions", marketCostMin: 200, marketCostMax: 500, diyHoursMin: 2, diyHoursMax: 5 },
  { stageN: 5, stageLabel: "System", deliverable: "Personal Brand Operating Manual (PDF) — weekly 30-min cadence, content-trigger map, metrics that matter", marketCostMin: 400, marketCostMax: 1000, diyHoursMin: 3, diyHoursMax: 8, postWorkshop: "Run the 30-min weekly ritual: 10 min review performance · 10 min capture one new idea · 10 min approve next week's queue. That's the entire ongoing time commitment." },
];

export const VALUE_TOTALS = VALUE_ROWS.reduce(
  (acc, r) => ({
    costMin: acc.costMin + r.marketCostMin,
    costMax: acc.costMax + r.marketCostMax,
    hoursMin: acc.hoursMin + r.diyHoursMin,
    hoursMax: acc.hoursMax + r.diyHoursMax,
  }),
  { costMin: 0, costMax: 0, hoursMin: 0, hoursMax: 0 },
);

export const PRICING = {
  founders: { price: 297, label: "Founders Seat", subtitle: "First 6 to register", seats: 4 },
  cohort: { price: 397, label: "Cohort Seat", subtitle: "Next 6 seats", seats: 8 },
} as const;

export type TierKey = keyof typeof PRICING;

export const formatMoney = (n: number) =>
  n === 0 ? "$0" : `$${n.toLocaleString("en-US")}`;

export const formatCostRange = (min: number, max: number) =>
  min === max ? formatMoney(min) : `${formatMoney(min)}–${formatMoney(max)}`;

export const formatHoursRange = (min: number, max: number) =>
  min === max ? `${min} hrs` : `${min}–${max} hrs`;
