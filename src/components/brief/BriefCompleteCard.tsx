import { Link } from "@tanstack/react-router";
import { CheckCircle2, Sparkles } from "lucide-react";
import { BRIEF_SPINE, type BriefFact, type BriefSectionId } from "@/lib/brand-brief";

type Props = {
  facts?: BriefFact[];
  pitch?: string | null;
  secondary?: { to: string; label: string };
  footnote?: string;
};

// Group brand-brief sections into a small set of attendee-facing themes
// so the completed-state card stays scannable instead of listing all 15.
const GROUPS: { title: string; sections: BriefSectionId[] }[] = [
  { title: "Who you are", sections: ["identity_credibility", "work_experience"] },
  { title: "What you want to be known for", sections: ["domain", "expertise", "signature_pov", "origin_arc"] },
  { title: "Your audience", sections: ["audience", "audience_pain", "transformation"] },
  { title: "Your voice & channels", sections: ["voice", "signature_themes", "channels"] },
  { title: "Your 12-month outcome", sections: ["outcome_goal", "non_negotiables", "workshop_alignment"] },
];

export function BriefCompleteCard({ facts = [], pitch, secondary, footnote }: Props) {
  const filled = new Set(
    facts.filter((f) => (f.value ?? "").trim().length > 0).map((f) => f.section),
  );

  return (
    <div className="rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-8 md:p-10 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-primary">
        <Sparkles className="h-4 w-4" /> Your brand brief
      </div>
      <h2 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight leading-tight">
        You've told us everything we need.
      </h2>
      {pitch ? (
        <p className="mt-3 text-base md:text-lg text-muted-foreground max-w-2xl">
          We know your positioning as: <span className="text-foreground italic">"{pitch}"</span>
        </p>
      ) : (
        <p className="mt-3 text-base md:text-lg text-muted-foreground max-w-2xl">
          Your AI strategist has the full picture and will use it to personalize every deliverable in the room.
        </p>
      )}

      <ul className="mt-6 space-y-3">
        {GROUPS.map((g) => {
          const captured = g.sections.filter((s) => filled.has(s)).length;
          const total = g.sections.length;
          const items = g.sections
            .map((id) => BRIEF_SPINE.find((s) => s.id === id)?.label)
            .filter(Boolean) as string[];
          return (
            <li key={g.title} className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-medium">{g.title}</div>
                <div className="text-sm text-muted-foreground line-clamp-2">
                  {captured}/{total} captured · {items.join(" · ")}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <Link
          to="/dashboard/brief"
          className="inline-flex items-center rounded-xl bg-primary px-6 py-3 text-base font-medium text-primary-foreground hover:opacity-90 min-h-[44px]"
        >
          Review my brief
        </Link>
        {secondary && (
          <Link
            to={secondary.to as never}
            className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
          >
            {secondary.label}
          </Link>
        )}
      </div>

      {footnote && (
        <p className="mt-5 text-xs text-muted-foreground">{footnote}</p>
      )}
    </div>
  );
}
