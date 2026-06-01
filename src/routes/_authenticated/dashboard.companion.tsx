import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { STAGES } from "@/lib/curriculum-data";
import {
  Calendar,
  CheckCircle2,
  Circle,
  ClipboardList,
  Clock,
  Upload,
  Sparkles,
  ChevronDown,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/companion")({
  component: WorkshopCompanion,
  head: () => ({ meta: [{ title: "Workshop Companion · Executive Brand Intensive" }] }),
});

// --------- Pre-work checklist (mirrors register.tsx disclosure) ---------
const PREWORK: { key: string; label: string; hint: string }[] = [
  { key: "bio", label: "Current bio (any length)", hint: "Even the stale one. We rewrite it in Block 2." },
  { key: "linkedin", label: "LinkedIn profile URL", hint: "We replace the About section live in the room." },
  { key: "posts", label: "2–3 past posts, talks, or articles", hint: "Source material for your voice profile." },
  { key: "company", label: "Company URL + one competitor URL", hint: "Feeds the Brand Assessment in Block 1." },
  { key: "topics", label: "Three topics you'd publish about", hint: "Seeds your three content pillars." },
  { key: "headshot", label: "One usable headshot (any quality)", hint: "We generate the exec-grade set from it." },
];

// --------- 15 deliverables, grouped 5/5/5 across the 6 blocks ---------
type Deliverable = { key: string; label: string; block: number };

const DELIVERABLES: { group: string; items: Deliverable[] }[] = [
  {
    group: "Brand Foundation",
    items: [
      { key: "blueprint", label: "Brand Blueprint", block: 1 },
      { key: "assessment", label: "Brand Assessment Report", block: 1 },
      { key: "voice", label: "Voice Profile", block: 2 },
      { key: "bios", label: "Three bios (50 / 150 / 350 words)", block: 2 },
      { key: "headshots", label: "Executive Headshot Set", block: 2 },
    ],
  },
  {
    group: "Publish-Ready Content",
    items: [
      { key: "oped", label: "Op-Ed (800–1,200 words)", block: 3 },
      { key: "pov", label: "POV post (contrarian, publish-ready)", block: 3 },
      { key: "carousel", label: "Framework carousel (7 slides)", block: 3 },
      { key: "keynote", label: "Keynote opener + Q&A talking points", block: 4 },
      { key: "newsletter", label: "Newsletter issue (subject + body)", block: 4 },
    ],
  },
  {
    group: "Compounding System",
    items: [
      { key: "sprint", label: "30-Day Authority Sprint", block: 5 },
      { key: "arc", label: "90-Day Newsletter Arc", block: 5 },
      { key: "scheduled", label: "14 days of scheduled posts", block: 4 },
      { key: "presets", label: "Three saved pillar presets", block: 2 },
      { key: "manual", label: "Personal Brand Operating Manual", block: 5 },
    ],
  },
];

// --------- localStorage state hook ---------
function useLocalChecklist(storageKey: string, keys: string[]) {
  const [state, setState] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(keys.map((k) => [k, false])),
  );
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setState((prev) => ({ ...prev, ...JSON.parse(raw) }));
    } catch {
      /* noop */
    }
  }, [storageKey]);
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      /* noop */
    }
  }, [storageKey, state]);
  const toggle = (key: string) => setState((s) => ({ ...s, [key]: !s[key] }));
  return [state, toggle] as const;
}

function WorkshopCompanion() {
  const allDeliverableKeys = useMemo(
    () => DELIVERABLES.flatMap((g) => g.items.map((i) => i.key)),
    [],
  );
  const [delivered, toggleDelivered] = useLocalChecklist(
    "ebi.companion.deliverables.v1",
    allDeliverableKeys,
  );
  const [prework, togglePrework] = useLocalChecklist(
    "ebi.companion.prework.v1",
    PREWORK.map((p) => p.key),
  );
  const [openBlock, setOpenBlock] = useState<number | null>(1);

  const doneCount = Object.values(delivered).filter(Boolean).length;
  const totalCount = allDeliverableKeys.length;
  const pct = totalCount ? (doneCount / totalCount) * 100 : 0;
  const preworkDone = Object.values(prework).filter(Boolean).length;

  return (
    <div className="space-y-10">
      {/* Header */}
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium uppercase tracking-wide text-primary">
          <Sparkles className="h-3.5 w-3.5" /> Workshop Companion
        </div>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Your one-page run sheet for the Executive Brand Intensive
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Follow the six blocks in order. Check each deliverable as it ships in the room.
          By 4:00 PM ET you walk out with fifteen finished assets and a system that runs on
          30 minutes a week.
        </p>
        <div className="flex flex-wrap items-center gap-4 pt-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-4 w-4" /> 1:00–4:00 PM ET
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4" /> 6 blocks · 3 hours
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ClipboardList className="h-4 w-4" /> 15 deliverables
          </span>
        </div>
      </header>

      {/* Overall progress */}
      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-primary/10 via-card to-card p-6 md:p-8">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-primary">
              In-room progress
            </div>
            <div className="mt-1 text-3xl font-semibold tabular-nums">
              {doneCount}
              <span className="text-muted-foreground"> / {totalCount}</span>
            </div>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <div>Pre-work: <span className="text-foreground">{preworkDone}/{PREWORK.length}</span></div>
            <div>Weekly cadence: <span className="text-foreground">30 min</span></div>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted/30">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </section>

      {/* Pre-work upload checklist */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Upload className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Bring this to the room
          </h2>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {PREWORK.map((p) => {
            const done = prework[p.key];
            return (
              <button
                key={p.key}
                onClick={() => togglePrework(p.key)}
                className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                  done
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : "border-white/10 bg-card hover:border-primary/30"
                }`}
              >
                {done ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                ) : (
                  <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                )}
                <div className="min-w-0">
                  <div className="text-sm font-medium">{p.label}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{p.hint}</div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 6 collapsible blocks */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          The six blocks
        </h2>
        {STAGES.map((stage) => {
          const open = openBlock === stage.n;
          const blockDeliverables = DELIVERABLES.flatMap((g) =>
            g.items.filter((i) => i.block === stage.n).map((i) => ({ ...i, group: g.group })),
          );
          const blockDone = blockDeliverables.filter((d) => delivered[d.key]).length;

          return (
            <div
              key={stage.n}
              className="overflow-hidden rounded-2xl border border-white/10 bg-card"
            >
              <button
                onClick={() => setOpenBlock(open ? null : stage.n)}
                className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-white/5 md:p-5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-sm font-semibold text-primary">
                  {stage.n}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-3">
                    <h3 className="font-medium">{stage.title}</h3>
                    <span className="text-xs text-muted-foreground">{stage.duration}</span>
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                    {stage.oneLiner}
                  </p>
                </div>
                <div className="hidden text-xs tabular-nums text-muted-foreground sm:block">
                  {blockDone}/{blockDeliverables.length}
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </button>
              {open && (
                <div className="space-y-4 border-t border-white/10 px-4 pb-5 pt-4 md:px-5">
                  <p className="text-sm text-muted-foreground">{stage.summary}</p>

                  {blockDeliverables.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Ship in this block
                      </div>
                      {blockDeliverables.map((d) => {
                        const done = delivered[d.key];
                        return (
                          <button
                            key={d.key}
                            onClick={() => toggleDelivered(d.key)}
                            className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition ${
                              done
                                ? "border-emerald-500/40 bg-emerald-500/5"
                                : "border-white/10 bg-background/40 hover:border-primary/30"
                            }`}
                          >
                            {done ? (
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                            ) : (
                              <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                            )}
                            <div className="min-w-0">
                              <div className="text-sm font-medium">{d.label}</div>
                              <div className="mt-0.5 text-xs text-muted-foreground">{d.group}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {stage.afterWorkshop.length > 0 && (
                    <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                      <div className="text-xs font-medium uppercase tracking-wide text-amber-600 dark:text-amber-400">
                        Finish at home
                      </div>
                      <ul className="mt-1 space-y-0.5 text-sm text-muted-foreground">
                        {stage.afterWorkshop.map((line) => (
                          <li key={line}>· {line}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* Weekly cadence card */}
      <section className="rounded-3xl border border-white/10 bg-card p-6 md:p-8">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-primary">
          <Clock className="h-4 w-4" /> The 30-minute weekly cadence
        </div>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          What you run for the next 90 days
        </h2>
        <p className="mt-2 text-muted-foreground">
          This is the entire ongoing time commitment. Block it on your calendar before you leave the room.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            { n: "10 min", title: "Review", body: "What landed last week. What didn't. What to amplify." },
            { n: "10 min", title: "Capture", body: "One observation from this week becomes next week's POV." },
            { n: "10 min", title: "Approve", body: "Approve the next 7 days of scheduled posts in your voice." },
          ].map((step) => (
            <div key={step.title} className="rounded-xl border border-white/10 bg-background/40 p-4">
              <div className="text-xs font-medium uppercase tracking-wide text-primary">{step.n}</div>
              <div className="mt-1 font-medium">{step.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
