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
  "Brand Operator · AI Builder · He's made 50+ founders the public figure their category was waiting for.";

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
      { title: "The Brand OS Intensive — You're Already the Expert. This Afternoon Makes You the Name." },
      {
        name: "description",
        content:
          "Three hours at the IGNITE Center in Norcross, GA. Walk in respected. Walk out known. 15 finished assets and a publishing system that keeps you visible — 30 minutes a week, for the next 90 days and every quarter after.",
      },
      { property: "og:title", content: "The Brand OS Intensive — You're Already the Expert. This Afternoon Makes You the Name." },
      {
        property: "og:description",
        content:
          "IGNITE Center, Norcross, GA · 1:00–4:00 PM ET. One afternoon to become the public figure your category has been waiting for.",
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
    <section className="relative overflow-hidden bg-neutral-900">
      {/* Subtle gradient shimmer bar at top */}
      <div className="absolute inset-x-0 top-0 h-px bg-hero-gradient opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.025] via-transparent to-black/40" />

      <div className="relative container mx-auto px-6 py-8 md:py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4 md:max-w-3xl">
            <span className="mt-1 inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/30 backdrop-blur animate-pulse-glow">
              <AlertTriangle className="size-5 text-white" />
            </span>
            <div>
              <p className="text-[11px] md:text-xs uppercase tracking-[0.18em] font-semibold text-gradient-brand">
                Not a course. Not a challenge. Not another thing to finish later.
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white/75 leading-tight md:text-xl">
                Three hours. Everything ships before you walk out the door. Nothing assigned. Nothing pending. Done.
              </h2>
              <p className="mt-2 text-sm text-white/55 leading-relaxed md:text-sm">
                Courses give you frameworks. Challenges give you plans that collapse under real life. This afternoon gives you the actual assets — 15 of them, built in your voice, in the room. You leave as a public figure with a running system. Not a plan to become one. <span className="text-white/40">(Scheduler, newsletter, and AI subscriptions aren't covered by the workshop fee.)</span>
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 md:flex-col md:items-end md:gap-2 md:shrink-0">
            <BannerChip icon={<Hammer className="size-3.5" />} label="Built in the room. Not homework." />
            <BannerChip icon={<Timer className="size-3.5" />} label="30 min/week. No willpower tax." />
            <BannerChip icon={<Check className="size-3.5" />} label="Still running next quarter." />
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
      {/* Gradient overlay — deepens toward bottom so text always pops */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />
      {/* Subtle grain texture for depth */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-24 lg:py-32">
        <p
          className="mb-5 text-xs uppercase tracking-[0.18em] text-white/80 animate-fade-up md:mb-6 md:text-sm md:tracking-[0.2em]"
          style={{ animationDelay: "0.05s" }}
        >
          Stop being the best-kept secret in your category.
        </p>
        <h1
          className="max-w-3xl text-4xl font-semibold leading-[1.06] tracking-tight text-white animate-fade-up md:text-5xl lg:text-[4.5rem]"
          style={{ animationDelay: "0.15s" }}
        >
          You're already the expert.{" "}
          <span className="italic">
            This afternoon makes you{" "}
            <span className="text-gradient-brand">the name.</span>
          </span>
        </h1>
        <p
          className="mt-5 max-w-2xl text-base text-white/90 animate-fade-up md:mt-6 md:text-lg"
          style={{ animationDelay: "0.25s" }}
        >
          Three hours at the IGNITE Center, Norcross GA.{" "}
          <span className="font-medium text-white">
            Walk out with 15 live assets and a Brand OS installed in your voice —
          </span>{" "}
          the system keeps generating on-brand content every month after. 30 minutes a week. No team. No retainer. Just the system running.
        </p>
        <p
          className="mt-4 max-w-2xl text-sm text-white/85 animate-fade-up md:text-base"
          style={{ animationDelay: "0.32s" }}
        >
          No ghostwriter. No content team. Just the system — installed, in your voice, before you leave.
        </p>

        <div
          className="mt-8 flex flex-col gap-3 animate-fade-up sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 md:mt-10"
          style={{ animationDelay: "0.42s" }}
        >
          <Link
            to="/register"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-base font-medium text-primary-foreground transition-all duration-200 hover:opacity-90 hover:scale-[1.03] hover:glow-primary sm:w-auto"
          >
            Claim your seat <ArrowRight className="size-4" />
          </Link>
          <Link
            to="/schedule"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/30 px-6 py-3 text-base font-medium text-white transition-all hover:bg-white/10 hover:border-white/50 sm:w-auto"
          >
            See the agenda
          </Link>
        </div>

        <div
          className="mt-10 grid max-w-3xl grid-cols-1 gap-3 text-white/90 animate-fade-up sm:grid-cols-2 lg:grid-cols-4 md:mt-12 md:gap-4"
          style={{ animationDelay: "0.52s" }}
        >
          <Meta icon={<Calendar className="size-4" />} label={EVENT.dateLabel} />
          <Meta icon={<MapPin className="size-4" />} label="IGNITE Center · Norcross, GA" />
          <Meta icon={<Users className="size-4" />} label={`${EVENT.totalSeats} seats`} />
          <Meta icon={<Award className="size-4" />} label="Brand OS Intensive" />
        </div>
      </div>
    </section>
  );
}

function Meta({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-black/25 px-4 py-2 text-sm backdrop-blur border border-white/10">
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
              Who runs the room
            </h2>
            <p className="text-2xl font-semibold tracking-tight md:text-3xl lg:text-4xl">
              {FACILITATOR_NAME} —{" "}
              <span className="text-gradient-brand">made 50+ founders the name in their category. Now he does it in one afternoon.</span>
            </p>
            <p className="mt-3 text-sm uppercase tracking-[0.15em] text-muted-foreground">
              {FACILITATOR_TITLE}
            </p>
            <p className="mt-5 text-muted-foreground">
              Adam isn't here to teach you personal branding. He's here to install it. He's taken
              50+ founders and operators from respected-in-their-circle to publicly known in their
              category — and he's compressed what agencies charge $15K and 90 days for into a single
              afternoon. Because if you had 90 days, you wouldn't need the intensive.
            </p>
            <p className="mt-3 text-muted-foreground">
              His take: you already have the credibility to be the authority in your space. You just
              never built the infrastructure to be seen as one. So he built the system. He runs it
              himself. And on this afternoon, he hands you the keys.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <TagChip>50+ founders made into the name in their category</TagChip>
              <TagChip>5 AI-native SaaS products shipped</TagChip>
              <TagChip>5 international summits produced</TagChip>
              <TagChip>$15K agency work → compressed to one afternoon</TagChip>
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
    "A LinkedIn profile that doesn't reflect your actual level",
    "Expertise that belongs on stages and in press — still stuck in your head",
    "A 'post more consistently' plan you've restarted three times",
    "A reputation that's miles ahead of your online presence",
    "Ideas good enough to be category-defining — published nowhere",
  ];
  return (
    <section className="py-12 md:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="mb-2 text-xs uppercase tracking-[0.18em] text-muted-foreground md:text-sm md:tracking-[0.2em]">
          Where you start. Where you end up.
        </h2>
        <p className="mb-8 max-w-3xl text-2xl font-semibold leading-tight tracking-tight md:mb-10 md:text-4xl">
          <span className="text-gradient-brand">1:00 PM, you walk in.</span>{" "}
          4:00 PM, you walk out as the public-facing authority your category has been waiting for. That's the only thing that changes today.
        </p>
        <div className="grid gap-5 md:grid-cols-[1fr_1.4fr] md:gap-6">
          <div className="rounded-3xl border border-white/10 bg-card/50 p-6 md:p-8">
            <div className="mb-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              1:00 PM
            </div>
            <div className="text-2xl font-semibold tracking-tight text-foreground/80">
              What walks in with you
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
          15 assets live day one. A Brand OS that keeps generating every month after.
        </h2>
        <p className="mb-3 max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl">
          A PR firm charges $15K, takes 90 days, then bills you monthly to keep it alive.{" "}
          <span className="text-gradient-brand">
            You build all 15 in one afternoon and leave with the OS that keeps generating in your voice. No retainer. No dependency. Just the system.
          </span>
        </p>
        <p className="mb-10 max-w-2xl text-base text-muted-foreground md:text-lg">
          Three modules. Five assets each. The first 15 ship before you leave — article, newsletter, keynote opener, carousel, two weeks of posts, live. Then the Brand OS takes over: one session a month, 30 minutes, one idea becomes five assets across five channels. The same authoritative voice, everywhere, every month — without a team.
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
                <TagChip>{EVENT.totalSeats} seats</TagChip>
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
                  Claim your seat <ArrowRight className="size-4" />
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
        <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-hero-gradient p-8 md:p-10 lg:p-16">
          {/* Dot grid overlay */}
          <div
            className="absolute inset-0 mix-blend-overlay opacity-25"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)",
              backgroundSize: "22px 22px",
            }}
          />
          {/* Bottom glow */}
          <div className="pointer-events-none absolute -bottom-16 -right-16 size-64 rounded-full bg-brand-violet/30 blur-3xl" />
          <div className="relative max-w-3xl text-white">
            <h2 className="text-3xl font-semibold leading-tight tracking-tight md:text-4xl lg:text-5xl">
              {seatsWord(EVENT.totalSeats)} seats. One afternoon. The public figure chapter starts right here.
            </h2>
            <p className="mt-4 text-base text-white/90 md:mt-5 md:text-lg">
              Your competitors are showing up in searches, on stages, in podcasts, in every feed your buyers scroll. You have the expertise to be that name. You just need the system. This is the afternoon you build it. Don't leave this seat for someone else.
            </p>
            <div className="mt-7 md:mt-8">
              <Link
                to="/register"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-base font-semibold text-neutral-900 shadow-lg transition-all duration-200 hover:opacity-95 hover:scale-[1.025] hover:shadow-xl hover:text-neutral-900 sm:w-auto"
              >
                Claim your seat — {EVENT.shortLabel} <ArrowRight className="size-4" />
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
    intro: "By the first break, you have a locked positioning statement, a voice profile that keeps every AI-assisted draft unmistakably yours, and three bios ready to paste everywhere. The 'who is this person' question gets answered — definitively.",
    runAtHome: "Paste the new About into LinkedIn before Block 3 begins.",
    items: [
      { name: "Brand Blueprint", desc: "Positioning, three content pillars, audience, and proof points — the locked anchor every future asset, deck, and email inherits from." },
      { name: "Brand Assessment Report", desc: "Sourced gap analysis against the peers showing up in your category, with the specific white space you can credibly own." },
      { name: "Voice Profile", desc: "Your tone, vocabulary, cadence, and rhythm captured as a reusable pattern — the moat that keeps every AI-assisted draft unmistakably yours." },
      { name: "Three Bios (50w / 150w / 350w)", desc: "Copy-paste ready for LinkedIn, speaker pages, press kits, podcast intros, and board bios — every public surface saying the same thing about you." },
      { name: "Executive Headshot Set", desc: "On-brand variations from one source photo — LinkedIn, press, speaking decks, podcast tiles. No more mismatched headshots leaking across your footprint." },
    ],
  },
  {
    n: 2,
    label: "Module 2 · Authority assets published",
    title: "Authority assets — published, not promised",
    intro: "By hour two, you have a thought leadership article, a POV post, a framework carousel, a keynote opener, and a newsletter issue — done, publish-ready, traceable to your actual expertise. Not billed by a ghostwriter. Not outsourced to a template. Yours.",
    runAtHome: "Publish the POV post today — before you leave Block 6.",
    items: [
      { name: "Op-Ed / Thought leadership article", desc: "800–1,200 words on your #1 pillar — the kind editors and conference programmers actually open, not the kind they delete on sight." },
      { name: "POV Post", desc: "A contrarian, conversation-starting take, LinkedIn and X ready — engineered to earn comments and DMs from buyers, not vanity likes from strangers." },
      { name: "Framework Carousel", desc: "Seven slides of your proprietary methodology — the format that gets bookmarked, saved, and cited back to you in someone else's keynote." },
      { name: "Keynote Opener + Q&A talking points", desc: "The same idea repurposed for the stage and for executive Q&A prep — one thought, two channels, zero rewriting." },
      { name: "Newsletter Issue", desc: "The same idea repurposed for subscribers — subject line, preview text, and body included. One insight, ten places, in a single afternoon." },
    ],
  },
  {
    n: 3,
    label: "Module 3 · The system running without you",
    title: "The Brand Operating System — running without you",
    intro: "By 4:00 PM, the next 90 days are already on auto-publish. The system that keeps you visible, quotable, and bookable runs in 30 minutes a week — so the public figure thing isn't a phase. It's a permanent upgrade.",
    runAtHome: "Run the 30-min weekly cadence: review · capture · approve.",
    items: [
      { name: "30-Day Authority Sprint", desc: "Day-by-day sequence around pillar #1, ready to execute starting tomorrow — no week-long draft-review-revise loop standing between you and the news cycle." },
      { name: "90-Day Newsletter Arc", desc: "The next quarter's issues — themes, through-lines, and publishing order. Authority that compounds week over week instead of restarting every Monday." },
      { name: "Two Weeks of Scheduled Social Posts", desc: "Auto-publishing from day one across the platforms you actually use, so cadence stops depending on your willpower or your assistant's bandwidth." },
      { name: "Reusable Content Presets", desc: "One per pillar — every future draft auto-aligns to your voice and positioning without re-explaining context. The knowledge base gets smarter every time you use it." },
      { name: "Brand Operating System Playbook (PDF)", desc: "The operating manual — 30-min weekly cadence, content-trigger map for breaking-news moments, and the inbound metrics that actually correlate with deals, boards, and stages." },
    ],
  },
];
