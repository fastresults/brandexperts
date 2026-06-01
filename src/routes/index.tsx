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
  "30-year brand operator · Co-Founder, OPEN Interactive · Has installed executive brand systems for Fortune 500 boards, a sovereign government, and AI-native operators who couldn't afford to get it wrong.";

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
      { title: "The Executive Brand Intensive — Install a Personal Branding Operating System in one afternoon." },
      {
        name: "description",
        content:
          "Three hours at the IGNITE Center in Norcross, GA. Twelve seats. You walk in as a title. You walk out operating a Personal Branding Operating System that publishes in your voice, on its own, for the next 90 days and every quarter after.",
      },
      { property: "og:title", content: "The Executive Brand Intensive — Install a Personal Branding Operating System in one afternoon." },
      {
        property: "og:description",
        content:
          "July 23, 2026 · IGNITE Center, Norcross, GA. Twelve seats. Installed by a 30-year operator who's built brand systems for Fortune 500 boards, a sovereign government, and the AI-native frontier — for clients who couldn't afford to get it wrong.",
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
                The market is flooded with courses and ghostwriters. Neither survives an AI-era executive's calendar.
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white/70 leading-tight md:text-xl">
                You're not buying a curriculum. You're getting a system installed — in your voice, in one room, in three hours.
              </h2>
              <p className="mt-2 text-sm text-white/55 leading-relaxed md:text-sm">
                A course gives you knowledge you don't have time to apply. A ghostwriter gives you a dependency you can't scale. The Brand Operating System gives you a self-running asset — 15 finished pieces leave the room with you, and a 30-minute weekly cadence keeps the engine producing without rebuilding it. <span className="text-white/40">(Hard costs — scheduler/newsletter subscriptions, premium AI tier, paid distribution — aren't covered by the workshop fee.)</span>
              </p>

            </div>
          </div>
          <div className="flex flex-col gap-2 md:flex-col md:items-end md:gap-2 md:shrink-0">
            <BannerChip icon={<Hammer className="size-3.5" />} label="Installed in the room — not assigned as homework" />
            <BannerChip icon={<Timer className="size-3.5" />} label="Runs on 30 minutes a week — not your willpower" />
            <BannerChip icon={<Check className="size-3.5" />} label="Outlives the workshop — quarter after quarter" />

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
          For executives whose résumé no longer does the work it used to.
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight text-white md:text-5xl lg:text-7xl">
          AI erases your edge.{" "}
          <span className="italic">
            Install a <span className="text-primary">Personal Branding Operating System</span> that compounds.
          </span>
        </h1>
        <p className="mt-5 max-w-2xl text-base text-white/90 md:mt-6 md:text-lg">
          One afternoon at the IGNITE Center in Norcross, GA.{" "}
          <span className="font-medium text-white">
            You walk in as a title. You walk out operating a system that publishes in your voice, on your calendar, without you in the loop —
          </span>{" "}
          for the next 90 days and every quarter after.
        </p>
        <p className="mt-4 max-w-2xl text-sm text-white/85 md:text-base">
          Built by the operator who's installed brand systems for Fortune 500 boards, a sovereign
          government, and the AI-native frontier — for clients who couldn't afford to get it wrong.
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
                30 years installing brand systems. One afternoon installing yours.
              </div>
            </div>
          </div>
          <div>
            <h2 className="mb-2 text-sm uppercase tracking-[0.2em] text-muted-foreground">
              Who installs it
            </h2>
            <p className="text-2xl font-semibold tracking-tight md:text-3xl lg:text-4xl">
              {FACILITATOR_NAME} —{" "}
              <span className="text-gradient-brand">30 years building the brand systems other people teach about.</span>
            </p>
            <p className="mt-3 text-sm uppercase tracking-[0.15em] text-muted-foreground">
              {FACILITATOR_TITLE}
            </p>
            <p className="mt-5 text-muted-foreground">
              Adam is one of a handful of operators fluent in three rooms that almost never overlap —
              Fortune 500 boardrooms (Citigroup, Mayo Clinic, 3M, Disney), sovereign cabinet ministries
              (seven years embedded with the Federation of St. Kitts & Nevis, branding its national investor
              program and producing five Caribbean Investment Summits), and the AI-native product trenches
              (five SaaS platforms shipped with the toolchain he installs in this room).
            </p>
            <p className="mt-3 text-muted-foreground">
              He's spent the last two years compressing what used to take a 90-day agency engagement into a
              single afternoon — because the executives he works with don't have 90 days, and AI no longer
              leaves room to wait. When he installs your Brand Operating System, he's installing the same
              operating model he runs on himself.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <TagChip>Installed brand systems for Fortune 500 boards</TagChip>
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
    "A bio written for a job you no longer hold",
    "A LinkedIn About indistinguishable from three peers in your category",
    "Thinking that only lives in DMs, back-channels, and unsent drafts",
    "A vague resolution to \"post more\" that hasn't survived a single board week",
    "A ghostwriter line item you can't justify to your CFO",
  ];
  return (
    <section className="py-12 md:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="mb-2 text-xs uppercase tracking-[0.18em] text-muted-foreground md:text-sm md:tracking-[0.2em]">
          What three hours actually changes
        </h2>
        <p className="mb-8 max-w-3xl text-2xl font-semibold leading-tight tracking-tight md:mb-10 md:text-4xl">
          Between{" "}
          <span className="text-gradient-brand">1:00 PM and 4:00 PM</span>, your brand stops being a side project and starts being infrastructure.
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
          15 finished assets · one installed system · zero homework
        </h2>
        <p className="mb-3 max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl">
          Each of these is what an executive normally pays a specialist firm to produce —{" "}
          <span className="text-gradient-brand">
            except yours leave the room locked to your voice, on the same afternoon.
          </span>
        </p>
        <p className="mb-10 max-w-2xl text-base text-muted-foreground md:text-lg">
          Three modules of the Brand Operating System. Five assets per module. Every one shipped in the room, every one yours to run.
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
              {seatsWord(EVENT.capacity * 2)} seats. One afternoon. A Brand Operating System that outruns the AI flood.
            </h2>
            <p className="mt-4 text-base text-white/90 md:mt-5 md:text-lg">
              If you've been waiting for the right week to finally show up publicly, this is the
              afternoon you stop waiting — and stop being one of the executives AI is quietly making
              interchangeable. Bring the bio, the posts, and the headshot. We bring the operator,
              the room, and the system that produces in your name long after you leave.
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
    label: "Module 1 · Foundation installed",
    title: "Foundation installed — locked, in your voice",
    intro: "By the first break, your positioning is locked and the AI writes as you — not as a generic LinkedIn voice.",
    runAtHome: "Paste the new About into LinkedIn before Block 3 begins.",
    items: [
      { name: "Brand Blueprint", desc: "Positioning, three content pillars, audience, and proof points — the anchor every future asset inherits from." },
      { name: "Brand Assessment Report", desc: "Sourced gap analysis vs. peers in your category, with the white space you can credibly own." },
      { name: "Voice Profile", desc: "Your tone, vocabulary, cadence, and rhythm — captured as the firewall against generic AI output." },
      { name: "Three Bios (50w / 150w / 350w)", desc: "Copy-paste ready for LinkedIn, speaker pages, press kits, podcast intros, and board bios." },
      { name: "Executive Headshot Set", desc: "On-brand variations from one source photo — LinkedIn, press, speaking decks, podcast tiles." },
    ],
  },
  {
    n: 2,
    label: "Module 2 · Authority assets published",
    title: "Authority assets — published, not promised",
    intro: "By the second hour, three publish-ready pieces are sitting in your folder — every one of them yours, none of them ghostwritten.",
    runAtHome: "Publish the POV post today — before you leave Block 6.",
    items: [
      { name: "Op-Ed / Thought leadership article", desc: "800–1,200 words on your #1 pillar — the kind editors and conference programmers actually open." },
      { name: "POV Post", desc: "Contrarian, conversation-starting, LinkedIn and X ready — engineered for comments, not vanity likes." },
      { name: "Framework Carousel", desc: "Seven slides of your proprietary methodology — the format that gets bookmarked, saved, and cited." },
      { name: "Keynote Opener + Q&A talking points", desc: "Same idea, repurposed for the stage and for executive Q&A prep." },
      { name: "Newsletter Issue", desc: "Same idea, repurposed for subscribers — subject line, preview text, and body included." },
    ],
  },
  {
    n: 3,
    label: "Module 3 · The system running without you",
    title: "The Brand Operating System — running without you",
    intro: "By 4:00 PM, the next 90 days are on auto-publish and the cadence to keep it producing fits inside one weekly coffee.",
    runAtHome: "Run the 30-min weekly cadence: review · capture · approve.",
    items: [
      { name: "30-Day Authority Sprint", desc: "Day-by-day sequence around pillar #1, ready to execute starting tomorrow." },
      { name: "90-Day Newsletter Arc", desc: "The next quarter's issues — themes, through-lines, and publishing order." },
      { name: "Two Weeks of Scheduled Social Posts", desc: "Auto-publishing from day one across the platforms you actually use." },
      { name: "Reusable Content Presets", desc: "One per pillar — every future draft auto-aligns to brand without re-explaining context." },
      { name: "Brand Operating System Playbook (PDF)", desc: "The operating manual — 30-min weekly cadence, content-trigger map, and the metrics that actually matter." },
    ],
  },
];
