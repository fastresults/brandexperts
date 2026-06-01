import { STAGES } from "./curriculum-data";
import { FALLBACK_COHORT, toPublicSeats, type Cohort } from "./cohorts";

export type Session = {
  time: string;
  duration: string;
  stage?: number;
  title: string;
  description: string;
  kind?: "session" | "break";
};

// Build an EVENT-shape object from a cohort. Used by hero/schedule/confirmation.
export function buildEvent(cohort: Cohort) {
  const venueAddress = `${cohort.venueAddress}, ${cohort.venueCity}, ${cohort.venueRegion} ${cohort.venuePostal}`;
  return {
    dateLabel: cohort.dateLabel,
    dateLabelLong: cohort.dateLabelLong,
    dayOfWeekLong: cohort.dayOfWeekLong,
    shortLabel: cohort.shortLabel,
    monthLabel: cohort.monthLabel,
    decisionDateLabel: cohort.decisionDateLabel,
    timeLabel: "1:00 PM – 4:00 PM ET",
    durationLabel: "3 hours",
    venueName: cohort.venueName,
    address: venueAddress,
    venueCity: cohort.venueCity,
    venueRegion: cohort.venueRegion,
    isDefaultVenue: cohort.isDefaultVenue,
    // Internal total seat count (founders + cohort). This is the number we
    // surface publicly on the marketing site ("12 seats").
    totalSeats: cohort.totalSeats,
    // Public-facing "intimate room" count = half of real internal capacity.
    // Used in scarcity copy where the smaller number reads as more exclusive.
    capacity: toPublicSeats(cohort.foundersSeats + cohort.cohortSeats),
    mapsUrl: cohort.mapsUrl,
    mapsEmbedUrl: `https://www.google.com/maps?q=${encodeURIComponent(venueAddress)}&output=embed`,
    startISO: cohort.startISO,
    endISO: cohort.endISO,
    googleCalendarUrl: cohort.googleCalendarUrl,
    icsHref: cohort.icsHref,
    icsFilename: cohort.icsFilename,
  };
}

// Static fallback so existing static `EVENT` imports keep working at build time.
// Pages that need live data should call `buildEvent(cohort)` with loader data.
export const EVENT = buildEvent(FALLBACK_COHORT);

// Flow strip on the home page mirrors the curriculum.
export const FLOW_STAGES = STAGES.map((s) => ({
  n: s.n,
  slug: s.slug,
  title: s.shortTitle,
  blurb: s.oneLiner,
  takeHome: s.takeHome,
  walkOut: s.walkOut,
  afterWorkshop: s.afterWorkshop,
}));

// Schedule = 6 blocks + 1 short stretch break across a 3-hour afternoon.
const stageBlock = (n: number, time: string): Session => {
  const s = STAGES[n - 1];
  return {
    time,
    duration: s.duration,
    stage: s.n,
    title: s.title,
    description: s.summary,
    kind: "session",
  };
};

export const SCHEDULE: Session[] = [
  stageBlock(1, "1:00 PM"),
  stageBlock(2, "1:30 PM"),
  stageBlock(3, "2:00 PM"),
  {
    time: "2:45 PM",
    duration: "5 min",
    title: "Stretch reset",
    description: "Quick stand-up, refill, regroup — then back into the build.",
    kind: "break",
  },
  stageBlock(4, "2:50 PM"),
  stageBlock(5, "3:35 PM"),
  stageBlock(6, "4:00 PM"),
  {
    time: "4:05 PM",
    duration: "—",
    title: "Close — commitments stated, cadence on the calendar",
    description:
      "You walk out with three public commitments, a recurring 30-min calendar block, and a brand that ships without you from here.",
    kind: "break",
  },
];
