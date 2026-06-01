import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { useEvent } from "@/lib/use-event";
import { MapPin, Calendar, Users, ArrowRight, Award, Check, Clock, X, Hammer, Timer, AlertTriangle } from "lucide-react";
import facilitatorPhoto from "@/assets/facilitator.jpg";

import { getPublicSiteSettings } from "@/lib/site-settings.functions";
import { HomeSelection } from "@/components/home/HomeSelection";
import { getHeroBackgroundList } from "@/lib/media.functions";

export const FACILITATOR_NAME = "Adam Anderson";
export const FACILITATOR_TITLE =
  "AI-era brand operator · Co-Founder, OPEN Interactive · Has built executive-grade brand systems for Fortune 500s, a sovereign government, and the AI-native frontier.";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    const list = await context.queryClient.ensureQueryData({
      queryKey: ["heroBgList"],
      queryFn: () => getHeroBackgroundList(),
      staleTime: 50 * 60 * 1000,
    });
    const heroBgUrl = list?.urls?.length
      ? list.urls[Math.floor(Math.random() * list.urls.length)]
      : null;
    return { heroBgUrl };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: "The Executive Brand Intensive — One afternoon. A brand that ships without you." },
      {
        name: "description",
        content:
          "A 3-hour, hands-on executive personal-brand workshop in Norcross, GA. Only 6 seats per tier. Walk out with a finished bio, a publish-ready Op-Ed, fourteen days of scheduled posts, and a personal brand operating system that runs on a 30-min weekly cadence.",
      },
      { property: "og:title", content: "The Executive Brand Intensive — One afternoon. 15 finished assets." },
      {
        property: "og:description",
        content:
          "July 23, 2026 · IGNITE Center, Norcross, GA. Three focused hours. Six blocks. Fifteen finished brand assets and a publishing system that runs itself — led by a 30-year operator who's built brand systems for Fortune 500s and a sovereign government.",
      },
    ],
    links: loaderData?.heroBgUrl
      ? [{ rel: "preload", as: "image", href: loaderData.heroBgUrl, fetchPriority: "high" } as any]
      : [],
  }),
  component: HomePage,
});

function HomePage() {
  const { heroBgUrl } = Route.useLoaderData();
  const fetchSettings = useServerFn(getPublicSiteSettings);
  const { data } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => fetchSettings(),
    staleTime: 60_000,
  });
  if (data?.home_variant === "selection") return <HomeSelection heroBgUrl={heroBgUrl} />;
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <Hero heroBgUrl={heroBgUrl} />
      <NotACourseBanner />
      <WalkInWalkOut />
      <WhatYouLeaveWith />
      <FacilitatorSection />
      <VenueCard />
      <BottomCTA />
      <SiteFooter />
    </div>
  );
}

function NotACourseBanner() {
  return (
    <section className="relative bg-neutral-900">
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] via-transparent to-black/30" />

      <div className="relative container mx-auto px-6 py-8 md:py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4 md:max-w-3xl">
            <span className="mt-1 inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/30 backdrop-blur">
              <AlertTriangle className="size-5 text-white" />
            </span>
            <div>
              <p className="text-[11px] md:text-xs uppercase tracking-[0.18em] font-semibold text-gradient-brand">
                Most programs sell a framework. This one ships the assets.
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white/70 leading-tight md:text-xl">
                Walk in with a title. Walk out with assets shipped, posts scheduled, and a system that produces in your voice.
              </h2>
              <p className="mt-2 text-sm text-white/55 leading-relaxed md:text-sm">
                Not a course, not a ghostwriter retainer, not another framework deck. In one focused afternoon you build the operating system of an executive brand — voice, bios, Op-Ed, POV post, framework carousel, newsletter, keynote opener, 30-day calendar — plus a 90-day arc already on auto-publish. You arrive with a profile. You leave with a publishing engine. <span className="text-white/40">(Hard costs — scheduler/newsletter subscriptions, premium AI tier, any paid distribution — aren't covered by the workshop fee.)</span>
              </p>

            </div>
          </div>
          <div className="flex flex-col gap-2 md:flex-col md:items-end md:gap-2 md:shrink-0">
            <BannerChip icon={<Hammer className="size-3.5" />} label="Shipped in the room, not assigned as homework" />
            <BannerChip icon={<Timer className="size-3.5" />} label="Three hours. One executive. Fifteen finished assets." />
            <BannerChip icon={<Check className="size-3.5" />} label="Real published work + a 30-min weekly cadence" />

          </div>
        </div>
      </div>
    </section>
  );
}

function BannerChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white ring-1 ring-white/20 backdrop-blur">
      {icon}
      {label}
    </span>
  );
}

function Hero({ heroBgUrl }: { heroBgUrl: string | null }) {
  const EVENT = useEvent();
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      {heroBgUrl ? (
        <img
          src={heroBgUrl}
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
      <div className="absolute inset-0 bg-background/0" />
      <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-24 lg:py-32">
        <p className="mb-5 text-xs uppercase tracking-[0.18em] text-white/80 md:mb-6 md:text-sm md:tracking-[0.2em]">
          One afternoon. One executive. One launched personal brand operating system.
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight text-white md:text-5xl lg:text-7xl">
          Walk in with a title. <br />
          Walk out <span className="italic">with a brand that ships without you</span>.
        </h1>
        <p className="mt-5 max-w-2xl text-base text-white/90 md:mt-6 md:text-lg">
          Three focused hours at the IGNITE Center in Norcross, GA.{" "}
          <span className="font-medium text-white">
            You bring the bio, posts, and headshot — we build the publishing system, not a template.
          </span>{" "}
          By the closing hour you'll have a finished bio, a publish-ready Op-Ed, fourteen days of
          scheduled social, a 90-day newsletter arc, and an operating manual that runs on a
          30-min weekly cadence.
        </p>
        <p className="mt-4 max-w-2xl text-sm text-white/85 md:text-base">
          The fastest path we know from blank profile to a brand that compounds — in one afternoon,
          with the next 90 days already on the calendar.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 md:mt-10">
          <Link
            to="/register"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-base font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:w-auto"
          >
            Claim one of {EVENT.capacity * 2} seats <ArrowRight className="size-4" />
          </Link>
          <Link
            to="/schedule"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/30 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-white/10 sm:w-auto"
          >
            See the 3-hour flow
          </Link>
        </div>
        <div className="mt-10 grid max-w-3xl grid-cols-1 gap-3 text-white/90 sm:grid-cols-2 lg:grid-cols-4 md:mt-12 md:gap-4">
          <Meta icon={<Calendar className="size-4" />} label={EVENT.dateLabel} />
          <Meta icon={<MapPin className="size-4" />} label="IGNITE Center · Norcross, GA" />
          <Meta icon={<Users className="size-4" />} label={`${EVENT.capacity * 2} seats`} />
          <Meta icon={<Award className="size-4" />} label="30-year brand operator" />
        </div>
      </div>
    </section>
  );
}

function Meta({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-black/20 px-4 py-2 text-sm backdrop-blur">
      {icon}
      <span>{label}</span>
    </div>
  );
}

function FacilitatorSection() {
  return (
    <section className="py-12 md:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-8 rounded-3xl border border-white/10 bg-card p-6 md:grid-cols-[1fr_1.4fr] md:gap-10 md:p-8 lg:p-12">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-hero-gradient">
            <div
              className="absolute inset-0 mix-blend-overlay opacity-30"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)",
                backgroundSize: "18px 18px",
              }}
            />
            <div className="relative flex h-full flex-col justify-end p-6 text-white">
              <Award className="mb-3 size-6 opacity-80" />
              <div className="text-sm uppercase tracking-[0.2em] opacity-80">
                Your facilitator
              </div>
              <div className="mt-1 flex items-center gap-3">
                <div className="size-12 overflow-hidden rounded-full bg-white/15 backdrop-blur">
                  <img src={facilitatorPhoto} alt={FACILITATOR_NAME} className="size-full object-cover" />
                </div>
                <div>
                  <div className="text-2xl font-semibold leading-tight">
                    {FACILITATOR_NAME}
                  </div>
                  <div className="text-xs uppercase tracking-[0.18em] opacity-80">
                    Brand Operator · AI Strategist · Builder
                  </div>
                </div>
              </div>
              <div className="mt-4 text-base leading-snug opacity-95">
                30 years building brand systems. One afternoon installing yours.
              </div>
            </div>
          </div>
          <div>
            <h2 className="mb-2 text-sm uppercase tracking-[0.2em] text-muted-foreground">
              Who's in the room with you
            </h2>
            <p className="text-2xl font-semibold tracking-tight md:text-3xl lg:text-4xl">
              {FACILITATOR_NAME} —{" "}
              <span className="text-gradient-brand">at your table for the afternoon.</span>
            </p>
            <p className="mt-3 text-sm uppercase tracking-[0.15em] text-muted-foreground">
              {FACILITATOR_TITLE}
            </p>
            <p className="mt-5 text-muted-foreground">
              Adam is one of the few practitioners fluent across three rooms most consultants
              never enter together — Fortune 500 boardrooms (Citigroup, Mayo Clinic, 3M, Disney),
              sovereign cabinet ministries (seven years embedded with the Federation of St. Kitts &
              Nevis, branding its national investor program and producing five Caribbean Investment
              Summits), and the AI-native product trenches (shipping five SaaS platforms with the
              same toolchain he runs in this workshop).
            </p>
            <p className="mt-3 text-muted-foreground">
              He's installed executive brand systems for clients who couldn't afford to get it
              wrong. He knows exactly what it takes to go from a stale LinkedIn profile to a brand
              that compounds — and he installs that system, in your voice, in three hours.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <TagChip>Built brand systems for Fortune 500s</TagChip>
              <TagChip>Branded a sovereign nation's flagship program</TagChip>
              <TagChip>Shipped 5 AI-native SaaS products</TagChip>
              <TagChip>Produced 5 international summits</TagChip>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TagChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-foreground/85">
      {children}
    </span>
  );
}

function WalkInWalkOut() {
  const walkIn = [
    "A bio that has been stale for 18 months (or 5 years)",
    "A LinkedIn About that reads like everyone else's in your category",
    "Four half-written drafts in Notes that will never get published",
    "A vague intention to \"post more\" and zero system to do it",
    "A ghostwriter retainer you keep thinking about cancelling",
  ];
  return (
    <section className="py-12 md:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="mb-2 text-xs uppercase tracking-[0.18em] text-muted-foreground md:text-sm md:tracking-[0.2em]">
          The transformation
        </h2>
        <p className="mb-8 max-w-3xl text-2xl font-semibold leading-tight tracking-tight md:mb-10 md:text-4xl">
          What changes between{" "}
          <span className="text-gradient-brand">1:00 PM and 4:00 PM</span>.
        </p>
        <div className="grid gap-5 md:grid-cols-[1fr_1.4fr] md:gap-6">
          <div className="rounded-3xl border border-white/10 bg-card/50 p-6 md:p-8">
            <div className="mb-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              1:00 PM
            </div>
            <div className="text-2xl font-semibold tracking-tight text-foreground/80">
              What you walk in with
            </div>
            <ul className="mt-6 space-y-3">
              {walkIn.map((i) => (
                <li key={i} className="flex items-start gap-3 text-foreground/70">
                  <X className="mt-1 size-4 shrink-0 text-foreground/40" />
                  <span>{i}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-card p-6 md:p-8">
            <div className="pointer-events-none absolute inset-0 bg-hero-gradient opacity-[0.08]" />
            <div className="relative">
              <div className="mb-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                4:00 PM
              </div>
              <div className="text-2xl font-semibold tracking-tight">
                <span className="text-gradient-brand">What you walk out with</span>
              </div>
              <div className="mt-6 space-y-7">
                {WALKOUT_PHASES.map((p, idx) => (
                  <div
                    key={p.n}
                    className={
                      idx === 0
                        ? ""
                        : "border-t border-white/10 pt-7"
                    }
                  >
                    <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                      {p.label}
                    </div>
                    <h3 className="mt-1 text-base font-semibold tracking-tight">
                      {p.title}
                    </h3>
                    <p className="mt-1 text-sm leading-snug text-muted-foreground">
                      {p.intro}
                    </p>
                    <ul className="mt-4 space-y-3">
                      {p.items.map((g) => (
                        <li key={g.name} className="flex items-start gap-3">
                          <span className="mt-1.5 inline-block size-1.5 shrink-0 rounded-full bg-hero-gradient" />
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-foreground">
                              {g.name}
                            </div>
                            <div className="text-[12px] leading-snug text-muted-foreground">
                              {g.desc}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhatYouLeaveWith() {
  return (
    <section className="border-y border-white/5 py-12 md:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="mb-2 text-xs uppercase tracking-[0.18em] text-muted-foreground md:text-sm md:tracking-[0.2em]">
          15 finished assets · shipped in 3 hours
        </h2>
        <p className="mb-3 max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl">
          Every asset is the kind of thing executives normally pay specialists to produce.{" "}
          <span className="text-gradient-brand">
            Assembled in a single afternoon, locked to your voice, ready to ship.
          </span>
        </p>
        <p className="mb-10 max-w-2xl text-base text-muted-foreground md:text-lg">
          Three groups. Five assets each. Every one finished in the room.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {WALKOUT_PHASES.map((p) => (
            <div
              key={p.n}
              className="flex flex-col rounded-2xl border border-white/10 bg-card p-6"
            >
              <div className="mb-3 inline-flex size-8 items-center justify-center rounded-full bg-hero-gradient text-sm font-semibold text-white">
                {p.n}
              </div>
              <div className="text-lg font-semibold capitalize tracking-tight">{p.title}</div>
              <p className="mt-2 text-sm text-muted-foreground">{p.intro}</p>

              <div className="mt-5 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Shipped in the room
              </div>
              <ul className="mt-2 space-y-1.5">
                {p.items.map((g) => (
                  <li key={g.name} className="flex items-start gap-2 text-[13px] leading-snug text-foreground/90">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-foreground/80" />
                    <span>{g.name}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 text-[11px] uppercase tracking-[0.18em] text-foreground/70 flex items-start gap-1.5">
                <Clock className="mt-0.5 size-3 shrink-0" />
                <span>{p.runAtHome}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function VenueCard() {
  const EVENT = useEvent();
  return (
    <section className="pb-16 md:pb-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-card p-6 md:p-8 lg:p-12">
          <div className="grid gap-8 md:grid-cols-[1.05fr_1fr] md:gap-10">
            <div>
              <h2 className="mb-2 text-sm uppercase tracking-[0.2em] text-muted-foreground">
                Where it happens
              </h2>
              <p className="text-2xl font-semibold tracking-tight md:text-3xl lg:text-4xl">
                {EVENT.venueName}
              </p>
              <p className="mt-3 text-muted-foreground">{EVENT.address}</p>
              <p className="mt-1 text-muted-foreground">
                {EVENT.dateLabel} · {EVENT.timeLabel}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <TagChip>Free on-site parking</TagChip>
                <TagChip>{EVENT.capacity * 2} seats</TagChip>
                <TagChip>Small cohort · full facilitator attention</TagChip>
              </div>

              <div className="mt-7 flex flex-wrap items-start gap-3">
                <a
                  href={EVENT.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm transition-colors hover:bg-white/10"
                >
                  <MapPin className="size-4" /> Get directions
                </a>

                <details className="group relative">
                  <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm transition-colors hover:bg-white/10 [&::-webkit-details-marker]:hidden">
                    <Calendar className="size-4" /> Add to calendar
                    <ArrowRight className="size-3 rotate-90 transition-transform group-open:-rotate-90" />
                  </summary>
                  <div className="absolute left-0 z-10 mt-2 w-60 overflow-hidden rounded-2xl border border-white/15 bg-card shadow-xl">
                    <a
                      href={EVENT.googleCalendarUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block px-4 py-3 text-sm transition-colors hover:bg-white/5"
                    >
                      Google Calendar
                    </a>
                    <a
                      href={EVENT.icsHref}
                      download={EVENT.icsFilename}
                      className="block border-t border-white/10 px-4 py-3 text-sm transition-colors hover:bg-white/5"
                    >
                      Apple Calendar (.ics)
                    </a>
                    <a
                      href={EVENT.icsHref}
                      download={EVENT.icsFilename}
                      className="block border-t border-white/10 px-4 py-3 text-sm transition-colors hover:bg-white/5"
                    >
                      Outlook (.ics)
                    </a>
                  </div>
                </details>

                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Reserve seat <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>

            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-black/40 md:aspect-auto md:min-h-[320px]">
              <iframe
                title={`Map of ${EVENT.venueName}`}
                aria-label={`Map of ${EVENT.venueName}`}
                src={EVENT.mapsEmbedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const NUMBER_WORDS = [
  "Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
  "Sixteen", "Seventeen", "Eighteen", "Nineteen", "Twenty",
];
function seatsWord(n: number): string {
  return NUMBER_WORDS[n] ?? String(n);
}

function BottomCTA() {
  const EVENT = useEvent();
  return (
    <section className="pb-16 md:pb-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-hero-gradient p-8 md:p-10 lg:p-16">
          <div
            className="absolute inset-0 mix-blend-overlay opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)",
              backgroundSize: "22px 22px",
            }}
          />
          <div className="relative max-w-3xl text-white">
            <h2 className="text-3xl font-semibold leading-tight tracking-tight md:text-4xl lg:text-5xl">
              {seatsWord(EVENT.capacity * 2)} seats. One afternoon. A brand that ships on its own from here on out.
            </h2>
            <p className="mt-4 text-base text-white/90 md:mt-5 md:text-lg">
              If you've been waiting for the right week to finally show up publicly, this is the
              afternoon you stop waiting. Bring the bio, posts, and headshot. We'll bring the
              operator, the room, and the publishing system that runs in your voice long after you
              leave.
            </p>
            <div className="mt-7 md:mt-8">
              <Link
                to="/register"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-base font-medium text-neutral-900 transition-opacity hover:opacity-90 hover:text-neutral-900 sm:w-auto"
              >
                Reserve your seat for July 23 <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type WalkoutItem = { name: string; desc: string };
type WalkoutPhase = {
  n: number;
  label: string;
  title: string;
  intro: string;
  runAtHome: string;
  items: WalkoutItem[];
};

const WALKOUT_PHASES: WalkoutPhase[] = [
  {
    n: 1,
    label: "Group 1 · Brand Foundation",
    title: "Brand foundation — locked, in your voice",
    intro: "By the first break, your positioning is locked and the AI writes as you.",
    runAtHome: "Paste the new About into LinkedIn before Block 3 starts.",
    items: [
      { name: "Brand Blueprint", desc: "Positioning statement, 3 content pillars, target audience, and proof points — the anchor every future asset inherits from." },
      { name: "Brand Assessment Report", desc: "Sourced gap analysis vs. peers in your category, with prioritized white space you can credibly own." },
      { name: "Voice Profile", desc: "Captured tone, vocabulary, cadence, and sentence rhythm — the firewall against generic AI tone." },
      { name: "Three Bios (50w / 150w / 350w)", desc: "Copy/paste ready for LinkedIn About, speaker pages, press kits, podcast intros, and board bios." },
      { name: "Executive Headshot Set", desc: "Multiple on-brand variations from one source photo — LinkedIn, press, speaking decks, podcast tiles." },
    ],
  },
  {
    n: 2,
    label: "Group 2 · Day-One Assets",
    title: "Publish-ready content — three jobs, three formats",
    intro: "By the second hour, three publish-ready pieces are sitting in your folder.",
    runAtHome: "Publish the POV post today — before you leave Block 6.",
    items: [
      { name: "Op-Ed / Thought leadership article", desc: "800–1,200 words on your #1 pillar — the kind of piece editors and conference programmers actually open." },
      { name: "POV Post", desc: "Contrarian, conversation-starting, LinkedIn and X ready — designed for comments, not likes." },
      { name: "Framework Carousel", desc: "7 slides of your proprietary methodology — the format that gets bookmarked, saved, and cited." },
      { name: "Keynote Opener + Q&A talking points", desc: "Same idea repurposed for the stage and for executive Q&A prep." },
      { name: "Newsletter Issue", desc: "Same idea repurposed for subscribers, complete with subject line and preview text." },
    ],
  },
  {
    n: 3,
    label: "Group 3 · Compounding System",
    title: "The compounding system — runs without you",
    intro: "By 4:00 PM, the next 90 days are already on auto-publish.",
    runAtHome: "Run the 30-min weekly cadence: review · capture · approve.",
    items: [
      { name: "30-Day Authority Sprint", desc: "Sequenced day-by-day around pillar #1, ready to execute starting tomorrow." },
      { name: "90-Day Newsletter Arc", desc: "Outline of the next quarter's issues — themes, through-lines, and order." },
      { name: "Two Weeks of Scheduled Social Posts", desc: "Auto-publishing from day one across the platforms you actually use." },
      { name: "Reusable Content Presets", desc: "One per pillar — every future draft auto-aligns to brand without re-explaining context." },
      { name: "Personal Brand Operating Manual (PDF)", desc: "Your playbook for running this yourself — weekly 30-min cadence, content-trigger map, metrics that matter." },
    ],
  },
];
