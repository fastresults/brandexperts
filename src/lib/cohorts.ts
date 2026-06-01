// Cohort model + pure helpers. Data lives in the `cohorts` table and is
// fetched via `listCohorts()` in `cohorts.functions.ts`.

export type CohortStatus = "sold_out" | "filling" | "open";

export type CohortRow = {
  id: string;
  cohort_date: string;       // "YYYY-MM-DD"
  tz: "EDT" | "EST";
  start_time: string;        // "HH:MM" or "HH:MM:SS"
  end_time: string;
  status: CohortStatus;
  seats_left: number | null;
  venue_name: string;
  venue_address: string;
  venue_city: string;
  venue_region: string;
  venue_postal: string;
  sort_order: number;
  founders_price_cents: number;
  founders_seats: number;
  cohort_price_cents: number;
  cohort_seats: number;
  founders_display_floor_pct: number;
  founders_warming_boost: number;
  founders_honest_threshold_pct: number;
  cohort_display_floor_pct: number;
  cohort_warming_boost: number;
  cohort_honest_threshold_pct: number;
};

export type Cohort = {
  id: string;
  startISO: string;
  endISO: string;
  dateLabel: string;       // "Wed, Aug 5, 2026"
  dateLabelLong: string;   // "Wednesday, August 5, 2026"
  dayOfWeekLong: string;   // "Wednesday"
  shortLabel: string;      // "Aug 5"
  monthLabel: string;      // "August 2026"
  decisionDateLabel: string; // "July 21, 2026" — 15 days before workshop
  status: CohortStatus;
  seatsLeft?: number;
  // Pricing & capacity (per cohort)
  foundersPriceCents: number;
  foundersSeats: number;
  cohortPriceCents: number;
  cohortSeats: number;
  totalSeats: number;
  // Scarcity display config
  foundersDisplayFloorPct: number;
  foundersWarmingBoost: number;
  foundersHonestThresholdPct: number;
  cohortDisplayFloorPct: number;
  cohortWarmingBoost: number;
  cohortHonestThresholdPct: number;
  // Venue
  venueName: string;
  venueAddress: string;
  venueCity: string;
  venueRegion: string;
  venuePostal: string;
  venueLine: string;            // single-line full address
  cityLabel: string;            // "Norcross, GA"
  isDefaultVenue: boolean;
  mapsUrl: string;
  // Calendar
  googleCalendarUrl: string;
  icsHref: string;
  icsFilename: string;
};

export const DEFAULT_VENUE = {
  name: "IGNITE Center at Greater Atlanta Christian School",
  address: "1500 Indian Trail Lilburn Rd NW",
  city: "Norcross",
  region: "GA",
  postal: "30093",
} as const;

export const DEFAULT_PRICING = {
  foundersPriceCents: 29700,
  foundersSeats: 4,
  cohortPriceCents: 39700,
  cohortSeats: 8,
} as const;

// Public-facing seat counts are shown at half of the real internal capacity.
// Admin / DB / registration pipeline always uses the real internal numbers.
// The marketing site shows the scaled-down public numbers so the workshop
// reads as intimate and hands-on.
export const PUBLIC_DISPLAY_DIVISOR = 2;

export function toPublicSeats(internal: number): number {
  if (internal <= 0) return 0;
  return Math.max(1, Math.round(internal / PUBLIC_DISPLAY_DIVISOR));
}

export function toPublicTaken(
  internalTaken: number,
  internalCapacity: number,
  publicCapacity: number,
): number {
  if (internalCapacity <= 0 || publicCapacity <= 0) return 0;
  const scaled = Math.round((internalTaken / internalCapacity) * publicCapacity);
  return Math.min(publicCapacity, Math.max(0, scaled));
}

const EVENT_TITLE = "The Executive Brand Intensive";
const EVENT_DETAILS =
  "Three-hour, hands-on executive personal-brand workshop with Adam Anderson. You walk in with a bio, posts, and a headshot — you walk out with a launched personal brand operating system: voice profile, three bios, an Op-Ed, a POV post, a framework carousel, a newsletter, a keynote opener, fourteen days of scheduled posts, and a 30-min weekly cadence already on your calendar.";

const MONTH_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Format a "M D, YYYY" label from a date offset N days before another date.
function formatOffsetDateLabel(baseISO: string, daysBefore: number): string {
  const d = new Date(baseISO);
  d.setUTCDate(d.getUTCDate() - daysBefore);
  return `${MONTH_LONG[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

const toCalStamp = (iso: string) =>
  new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

const normalizeTime = (t: string) => (t.length === 5 ? `${t}:00` : t.slice(0, 8));

const buildGoogleUrl = (startISO: string, endISO: string, location: string) =>
  `https://calendar.google.com/calendar/render?action=TEMPLATE` +
  `&text=${encodeURIComponent(EVENT_TITLE)}` +
  `&dates=${toCalStamp(startISO)}/${toCalStamp(endISO)}` +
  `&details=${encodeURIComponent(EVENT_DETAILS)}` +
  `&location=${encodeURIComponent(location)}`;

const buildIcs = (id: string, startISO: string, endISO: string, location: string) =>
  [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Executive Brand Intensive//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:executive-brand-intensive-${id}@greateratlantachristian`,
    `DTSTAMP:${toCalStamp(new Date().toISOString())}`,
    `DTSTART:${toCalStamp(startISO)}`,
    `DTEND:${toCalStamp(endISO)}`,
    `SUMMARY:${EVENT_TITLE}`,
    `LOCATION:${location.replace(/,/g, "\\,")}`,
    `DESCRIPTION:${EVENT_DETAILS.replace(/,/g, "\\,")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

export function buildCohortFromRow(row: CohortRow): Cohort {
  const [y, m, d] = row.cohort_date.split("-").map(Number);
  const offset = row.tz === "EDT" ? "-04:00" : "-05:00";
  const startISO = `${row.cohort_date}T${normalizeTime(row.start_time)}${offset}`;
  const endISO = `${row.cohort_date}T${normalizeTime(row.end_time)}${offset}`;

  const anchor = new Date(Date.UTC(y, m - 1, d, 12));
  const dow = DAY_SHORT[anchor.getUTCDay()];
  const dowLong = DAY_LONG[anchor.getUTCDay()];
  const shortMonth = MONTH_SHORT[m - 1];
  const longMonth = MONTH_LONG[m - 1];

  const venueLine = `${row.venue_name}, ${row.venue_address}, ${row.venue_city}, ${row.venue_region} ${row.venue_postal}`;
  const cityLabel = `${row.venue_city}, ${row.venue_region}`;
  const isDefaultVenue =
    row.venue_name === DEFAULT_VENUE.name &&
    row.venue_address === DEFAULT_VENUE.address &&
    row.venue_city === DEFAULT_VENUE.city &&
    row.venue_region === DEFAULT_VENUE.region &&
    row.venue_postal === DEFAULT_VENUE.postal;

  const mapsUrl =
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(`${row.venue_address}, ${row.venue_city}, ${row.venue_region} ${row.venue_postal}`);

  return {
    id: row.id,
    startISO,
    endISO,
    dateLabel: `${dow}, ${shortMonth} ${d}, ${y}`,
    dateLabelLong: `${dowLong}, ${longMonth} ${d}, ${y}`,
    dayOfWeekLong: dowLong,
    shortLabel: `${shortMonth} ${d}`,
    monthLabel: `${longMonth} ${y}`,
    decisionDateLabel: formatOffsetDateLabel(startISO, 15),
    status: row.status,
    seatsLeft: row.seats_left ?? undefined,
    foundersPriceCents: row.founders_price_cents,
    foundersSeats: row.founders_seats,
    cohortPriceCents: row.cohort_price_cents,
    cohortSeats: row.cohort_seats,
    totalSeats: row.founders_seats + row.cohort_seats,
    foundersDisplayFloorPct: row.founders_display_floor_pct,
    foundersWarmingBoost: row.founders_warming_boost,
    foundersHonestThresholdPct: row.founders_honest_threshold_pct,
    cohortDisplayFloorPct: row.cohort_display_floor_pct,
    cohortWarmingBoost: row.cohort_warming_boost,
    cohortHonestThresholdPct: row.cohort_honest_threshold_pct,
    venueName: row.venue_name,
    venueAddress: row.venue_address,
    venueCity: row.venue_city,
    venueRegion: row.venue_region,
    venuePostal: row.venue_postal,
    venueLine,
    cityLabel,
    isDefaultVenue,
    mapsUrl,
    googleCalendarUrl: buildGoogleUrl(startISO, endISO, venueLine),
    icsHref: `data:text/calendar;charset=utf-8,${encodeURIComponent(buildIcs(row.id, startISO, endISO, venueLine))}`,
    icsFilename: `executive-brand-intensive-${row.id}.ics`,
  };
}

export function getCohortById(cohorts: Cohort[], id: string | undefined | null): Cohort | undefined {
  if (!id) return undefined;
  return cohorts.find((c) => c.id === id);
}

export function getNextAvailable(cohorts: Cohort[]): Cohort | undefined {
  return (
    cohorts.find((c) => c.status === "filling") ??
    cohorts.find((c) => c.status === "open") ??
    cohorts[0]
  );
}

export function getFirstSoldOut(cohorts: Cohort[]): Cohort | undefined {
  return cohorts.find((c) => c.status === "sold_out");
}

export function formatPriceCents(cents: number): string {
  const dollars = cents / 100;
  return dollars % 1 === 0
    ? `$${dollars.toLocaleString("en-US")}`
    : `$${dollars.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Fallback used during SSR before data is hydrated. Lets existing static
// imports of `EVENT` continue to work without crashing.
export const FALLBACK_COHORT: Cohort = buildCohortFromRow({
  id: "fallback",
  cohort_date: "2026-07-23",
  tz: "EDT",
  start_time: "13:00",
  end_time: "16:00",
  status: "open",
  seats_left: null,
  venue_name: DEFAULT_VENUE.name,
  venue_address: DEFAULT_VENUE.address,
  venue_city: DEFAULT_VENUE.city,
  venue_region: DEFAULT_VENUE.region,
  venue_postal: DEFAULT_VENUE.postal,
  sort_order: 0,
  founders_price_cents: DEFAULT_PRICING.foundersPriceCents,
  founders_seats: DEFAULT_PRICING.foundersSeats,
  cohort_price_cents: DEFAULT_PRICING.cohortPriceCents,
  cohort_seats: DEFAULT_PRICING.cohortSeats,
  founders_display_floor_pct: 25,
  founders_warming_boost: 2,
  founders_honest_threshold_pct: 50,
  cohort_display_floor_pct: 25,
  cohort_warming_boost: 2,
  cohort_honest_threshold_pct: 50,
});

// Compute the scarcity-displayed taken count for a tier. Real `taken` stays
// the source of truth for reservations and roll-over; this only powers the
// "X of N seats left" badge on the public registration UI.
export type ScarcityMode = "cold" | "warming" | "honest";

export function computeDisplayedTaken(
  realTaken: number,
  capacity: number,
  floor: number,
  boost: number,
  thresholdPct: number,
): { displayedTaken: number; mode: ScarcityMode } {
  if (capacity <= 0) return { displayedTaken: 0, mode: "honest" };
  const honestAt = Math.max(1, Math.ceil((capacity * thresholdPct) / 100));
  if (realTaken >= honestAt) return { displayedTaken: realTaken, mode: "honest" };
  const inflated = Math.max(realTaken + boost, floor);
  const capped = Math.min(inflated, Math.max(capacity - 1, 0));
  const mode: ScarcityMode = realTaken === 0 ? "cold" : "warming";
  return { displayedTaken: Math.max(capped, realTaken), mode };
}

// Convert a "remaining %" floor (admin setting) into an absolute "displayed taken
// floor" for computeDisplayedTaken. Example: capacity 20, pct 25 → 5 remaining
// → floor of 15 taken. Clamped to capacity - 1 so the cold state never appears
// sold out.
export function displayFloorFromPct(capacity: number, remainingPct: number): number {
  if (capacity <= 0 || remainingPct <= 0) return 0;
  const remaining = Math.max(1, Math.ceil((capacity * remainingPct) / 100));
  const floorTaken = capacity - remaining;
  return Math.max(0, Math.min(floorTaken, Math.max(capacity - 1, 0)));
}
