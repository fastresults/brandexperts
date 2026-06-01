import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { getBrandBrief } from "@/lib/brand-brief.functions";
import { getMyFiling } from "@/lib/filing.functions";
import { listMyDeliverables } from "@/lib/attendee.functions";
import { getMyCohort } from "@/lib/cohort.functions";
import { getWorkshopMode, formatMinutesLeft, FRIENDLY_STAGE, type WorkshopState } from "@/lib/workshop-mode";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { NextActionCard } from "@/components/dashboard/NextActionCard";
import { BriefCompleteCard } from "@/components/brief/BriefCompleteCard";
import { Calendar, MapPin, Coffee, Sparkles, CheckCircle2, Hand } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: TodayPage,
});

function TodayPage() {
  const briefFn = useServerFn(getBrandBrief);
  const filingFn = useServerFn(getMyFiling);
  const deliverablesFn = useServerFn(listMyDeliverables);
  const cohortFn = useServerFn(getMyCohort);

  const brief = useQuery({ queryKey: ["brand-brief"], queryFn: () => briefFn() });
  const filing = useQuery({ queryKey: ["my", "filing"], queryFn: () => filingFn() });
  const deliverables = useQuery({ queryKey: ["my", "deliverables"], queryFn: () => deliverablesFn() });
  const cohort = useQuery({ queryKey: ["my", "cohort"], queryFn: () => cohortFn(), staleTime: 60_000 });

  // Re-render once a minute so the mode and clock stay live
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  const state = getWorkshopMode(new Date(), cohort.data?.cohort ?? null);
  const summaryDone = !!brief.data?.summary?.completed_at;
  const rawScore = brief.data?.progress?.completed ?? 0;
  const briefTotal = Math.max(brief.data?.progress?.total ?? 0, 1);
  const briefScore = summaryDone ? briefTotal : rawScore;
  const briefReady = summaryDone || !!brief.data?.progress?.allComplete;
  const filingReady = !!filing.data?.filing?.llc_name;
  const publishedDeliverables = deliverables.data?.deliverables ?? [];
  const generated = publishedDeliverables.length;
  const total = generated;
  const firstName = null;
  const pitch = null;

  const facts = brief.data?.facts ?? [];

  return (
    <div className="space-y-8">
      {state.mode === "before" && (
        <BeforeMode
          state={state}
          briefScore={briefScore}
          briefTotal={briefTotal}
          firstName={firstName}
          pitch={pitch}
          facts={facts}
        />
      )}
      {state.mode === "during" && (
        <DuringMode state={state} generated={generated} total={total} />
      )}
      {state.mode === "after" && (
        <AfterMode state={state} generated={generated} total={total} briefReady={briefReady} filingReady={filingReady} />
      )}
      {state.mode === "none" && (
        <NoCohortMode briefScore={briefScore} briefTotal={briefTotal} pitch={pitch} facts={facts} />
      )}
    </div>
  );
}

// ============ MODE A — BEFORE the workshop ============

function BeforeMode({
  state,
  briefScore,
  briefTotal,
  firstName,
  pitch,
  facts,
}: {
  state: WorkshopState;
  briefScore: number;
  briefTotal: number;
  firstName: string | null;
  pitch: string | null;
  facts: import("@/lib/brand-brief").BriefFact[];
}) {
  const cohort = state.cohort!;
  const briefDone = briefScore >= briefTotal;
  const pct = briefScore / briefTotal;

  return (
    <>
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            {firstName ? `Welcome` : `Welcome`}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Your workshop is in <strong className="text-foreground">{state.daysUntil} {state.daysUntil === 1 ? "day" : "days"}</strong>. Let's get you ready.
          </p>
        </div>
        <ProgressRing value={pct} label={`${briefScore}/${briefTotal}`} sublabel="ready" size={96} stroke={8} />
      </div>

      {/* Workshop countdown card */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-primary/10 via-card to-card p-6 md:p-8">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-primary">
          <Calendar className="h-4 w-4" /> Your workshop
        </div>
        <div className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight">{cohort.dateLabel}</div>
        <div className="mt-1 text-sm text-muted-foreground">8:00 AM – 4:30 PM ET</div>
        <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{cohort.venueName} · {cohort.venueAddress}, {cohort.venueCity}, {cohort.venueRegion}</span>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <a
            href={cohort.googleCalendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-lg border border-white/10 bg-card px-4 py-2 text-sm hover:bg-white/5"
          >
            Add to calendar
          </a>
          <a
            href={cohort.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-lg border border-white/10 bg-card px-4 py-2 text-sm hover:bg-white/5"
          >
            Get directions
          </a>
        </div>
      </div>

      {/* The one next thing */}
      {briefDone ? (
        <BriefCompleteCard
          facts={facts}
          pitch={pitch}
          secondary={{ to: "/dashboard/day", label: "What to bring →" }}
          footnote="You're all set. Just show up."
        />
      ) : (
        <NextActionCard
          eyebrow="Pre-work"
          title={briefScore === 0 ? "Design your brand operating system." : "Pick up where you left off."}
          description={
            <>
              Have a short conversation with your AI brand strategist — about your point of view, your audience, and the outcome you want from the workshop. Upload a resume or LinkedIn to skip the warm-up.
            </>
          }
          primary={{ to: "/dashboard/brief", label: briefScore === 0 ? "Start the conversation" : "Continue" }}
        />

      )}

      <WalkOutPreview />
    </>
  );
}

// ============ MODE B — DURING the workshop ============

function DuringMode({ state, generated, total }: { state: WorkshopState; generated: number; total: number }) {
  const block = state.currentBlock!;

  if (block.kind === "break") {
    return (
      <>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{block.title}</h1>
        <div className="mt-6 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-8 md:p-10">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <Coffee className="h-5 w-5" />
            <span className="text-xs font-medium uppercase tracking-wide">On break</span>
          </div>
          <p className="mt-3 text-xl md:text-2xl font-medium leading-snug">{block.subtitle}</p>
          <p className="mt-2 text-muted-foreground">
            Back at {minutesToClock(block.endMin)} ET. Your AI assistant keeps working while you take a breather.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-emerald-500/20 overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${pctOfBlock(state)}%` }}
              />
            </div>
            <span className="text-sm font-mono tabular-nums text-muted-foreground">
              {formatMinutesLeft(state.minutesLeftInBlock ?? 0)}
            </span>
          </div>
        </div>
        <RecentlyFinished />
      </>
    );
  }

  if (block.kind === "close") {
    return <WalkOutMoment />;
  }

  if (block.kind === "checkin") {
    return (
      <>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Good morning</h1>
        <p className="mt-2 text-muted-foreground">{block.subtitle}</p>
        <NextActionCard
          eyebrow="Starting soon"
          title="We start at 8:30 AM."
          description="Grab coffee, get comfortable, and review your brief if you'd like."
          primary={{ to: "/dashboard/brief", label: "Open my brief" }}
        />
      </>
    );
  }

  // Stage block
  const stageN = block.stageN!;
  const friendly = FRIENDLY_STAGE[stageN];

  return (
    <>
      <div>
        <div className="text-xs font-medium uppercase tracking-wide text-primary">Stage {stageN} of 7 · we're live</div>
        <h1 className="mt-1 text-3xl md:text-4xl font-semibold tracking-tight">{friendly.title}</h1>
        <p className="mt-2 text-muted-foreground">{friendly.subtitle}</p>
      </div>

      {/* The current stage card */}
      <div className="rounded-3xl border border-primary/30 bg-card p-6 md:p-8">
        <div className="flex items-center gap-2 text-sm">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">
            Your AI assistant is generating {Math.max(0, total - generated)} more deliverables in the background.
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-semibold tabular-nums">{generated}</span>
          <span className="text-muted-foreground">/ {total} ready</span>
        </div>
        <div className="mt-3 h-2 rounded-full bg-muted/30 overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${total ? (generated / total) * 100 : 0}%` }} />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            to="/dashboard/deliverables"
            className="rounded-xl border border-white/10 bg-card p-4 hover:border-primary/30 transition"
          >
            <div className="text-sm font-medium">See your deliverables</div>
            <div className="mt-1 text-xs text-muted-foreground">
              The work your AI strategist is finishing in the room.
            </div>
          </Link>
          <button
            className="rounded-xl border border-white/10 bg-card p-4 hover:border-amber-500/40 transition text-left"
            onClick={() => alert("Instructor notified. They'll be right over.")}
          >
            <div className="flex items-center gap-2 text-sm font-medium">
              <Hand className="h-4 w-4 text-amber-500" /> Raise hand
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Stuck or need a hand? We'll come to you.
            </div>
          </button>
        </div>
      </div>

      {state.nextBlock && (
        <p className="text-sm text-muted-foreground">
          Up next at {minutesToClock(state.nextBlock.startMin)}: <span className="text-foreground">{state.nextBlock.title}</span>
        </p>
      )}

      <RecentlyFinished />
    </>
  );
}

function RecentlyFinished() {
  const deliverablesFn = useServerFn(listMyDeliverables);
  const { data } = useQuery({
    queryKey: ["my", "deliverables"],
    queryFn: () => deliverablesFn(),
    refetchInterval: 8000,
  });
  const done = (data?.deliverables ?? []).slice(0, 3);
  if (done.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">Just finished by your AI</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {done.map((d) => {
          const type = d.deliverable_types as { label?: string; description?: string | null } | null;
          const content = (d.content_current ?? {}) as { title?: string; summary?: string };
          return (
            <Link
              key={d.id}
              to="/dashboard/deliverables"
              className="rounded-xl border border-white/10 bg-card p-4 hover:border-primary/30 transition"
            >
              <div className="flex items-center gap-2 text-emerald-500">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wide">Ready</span>
              </div>
              <div className="mt-1 font-medium">{content.title ?? type?.label ?? d.deliverable_key}</div>
              {(content.summary ?? type?.description) && (
                <div className="mt-1 text-sm text-muted-foreground line-clamp-2">{content.summary ?? type?.description}</div>
              )}
              <div className="mt-3 text-sm text-primary">Take a look →</div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

// ============ MODE C — AFTER the workshop ============

function AfterMode({
  state,
  generated,
  total,
  briefReady,
  filingReady,
}: {
  state: WorkshopState;
  generated: number;
  total: number;
  briefReady: boolean;
  filingReady: boolean;
}) {
  const day = state.dayOfNinety ?? 1;
  const pct = day / 90;
  const next = !filingReady
    ? { to: "/dashboard/brief", label: "Finish your filing info", hint: "Your LLC needs a couple more details." }
    : !briefReady
      ? { to: "/dashboard/brief", label: "Polish your brief", hint: "More detail = better deliverables." }
      : { to: "/dashboard/deliverables", label: "See your deliverables", hint: generated > 0 ? `${generated} ready so far.` : "We'll publish them as your strategist finishes each one." };

  return (
    <>
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Day {day} of 90</h1>
          <p className="mt-2 text-muted-foreground">Keep going. Small steps, every day.</p>
        </div>
        <ProgressRing value={pct} label={`${day}`} sublabel="of 90" size={96} stroke={8} />
      </div>

      <NextActionCard
        eyebrow="This week"
        title={next.label}
        description={next.hint}
        primary={{ to: next.to, label: "Let's go" }}
      />

      <RecentlyFinished />
    </>
  );
}

// ============ Fallback — no cohort assigned ============

function NoCohortMode({ briefScore, briefTotal, pitch, facts }: { briefScore: number; briefTotal: number; pitch: string | null; facts: import("@/lib/brand-brief").BriefFact[] }) {
  const done = briefScore >= briefTotal;
  return (
    <>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Welcome</h1>
      <p className="mt-2 text-muted-foreground">
        {done
          ? "Your brief is locked in. We'll email you the moment your workshop date is set."
          : "We haven't matched you to a workshop date yet. While you wait, start your brief."}
      </p>
      {done ? (
        <BriefCompleteCard
          facts={facts}
          pitch={pitch}
          secondary={{ to: "/dashboard/workflow", label: "Browse the 15 deliverables →" }}
          footnote="No workshop date yet — we'll be in touch soon."
        />
      ) : (
        <NextActionCard
          eyebrow="Start here"
          title={briefScore === 0 ? "Design your brand operating system." : "Pick up where you left off."}
          description="Have a short conversation with your AI brand strategist. Upload a resume or LinkedIn to skip the warm-up."
          primary={{ to: "/dashboard/brief", label: briefScore === 0 ? "Start the conversation" : "Continue" }}
        />

      )}
    </>
  );
}

// ============ Walk-out moment ============

function WalkOutMoment() {
  return (
    <div className="rounded-3xl border border-primary/40 bg-gradient-to-br from-primary/20 via-card to-card p-8 md:p-12 text-center">
      <div className="text-xs font-medium uppercase tracking-wide text-primary">4:30 PM</div>
      <h1 className="mt-2 text-4xl md:text-5xl font-semibold tracking-tight">You did it 🎉</h1>
      <p className="mt-4 text-lg text-muted-foreground max-w-lg mx-auto">
        You walked in with an idea. You're walking out with a launched startup and a signed 90-day plan.
      </p>
      <Link
        to="/dashboard/workflow"
        className="mt-8 inline-flex items-center rounded-xl bg-primary px-6 py-3 text-base font-medium text-primary-foreground hover:opacity-90"
      >
        Take me to my 90-day plan
      </Link>
    </div>
  );
}

// ============ Walk-out preview (Mode A) ============

function WalkOutPreview() {
  const stages = [1, 2, 3, 4, 5, 6, 7];
  return (
    <section>
      <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
        By 4:30 PM on workshop day, you'll have all of this
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stages.map((n) => (
          <div key={n} className="rounded-xl border border-white/10 bg-card p-4 opacity-80">
            <div className="text-xs text-muted-foreground">Stage {n}</div>
            <div className="mt-1 font-medium">{FRIENDLY_STAGE[n].title}</div>
            <div className="mt-1 text-xs text-muted-foreground">{FRIENDLY_STAGE[n].subtitle}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ============ Utils ============

function minutesToClock(min: number): string {
  // 0 = 8:00 AM
  const totalMin = 8 * 60 + min;
  const h24 = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  const h12 = ((h24 + 11) % 12) + 1;
  const ampm = h24 >= 12 ? "PM" : "AM";
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function pctOfBlock(state: WorkshopState): number {
  if (!state.currentBlock) return 0;
  const b = state.currentBlock;
  const total = b.endMin - b.startMin;
  const into = state.minutesIntoBlock ?? 0;
  return Math.max(0, Math.min(100, (into / total) * 100));
}
