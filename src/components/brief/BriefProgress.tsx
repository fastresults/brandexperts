import { CheckCircle2, Circle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type BriefProgressData = {
  total: number;
  completed: number;
  percent: number;
  allComplete: boolean;
  currentSectionId: string | null;
  currentSectionLabel: string;
  currentIndex: number;
  sections: Array<{ id: string; label: string; index: number; completed: boolean }>;
};

type Props = {
  progress: BriefProgressData;
  variant?: "full" | "slim";
  revisionMode?: boolean;
  className?: string;
};

export function BriefProgress({ progress, variant = "full", revisionMode = false, className }: Props) {
  const { total, completed, percent, allComplete, currentSectionLabel, currentIndex, sections } = progress;
  const displayStep = Math.min(currentIndex + 1, total);

  const Bar = (
    <div className={cn("flex items-center gap-[3px]", variant === "slim" ? "h-1" : "h-1.5")}>
      {sections.map((s) => {
        const isCurrent = !allComplete && s.index === currentIndex;
        return (
          <TooltipProvider key={s.id} delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "flex-1 rounded-full transition-colors",
                    variant === "slim" ? "h-1" : "h-1.5",
                    s.completed
                      ? revisionMode
                        ? "bg-primary/40"
                        : "bg-primary"
                      : isCurrent
                      ? "bg-primary/70 animate-pulse"
                      : "bg-white/10",
                  )}
                />
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                <span className="inline-flex items-center gap-1.5">
                  {s.completed ? (
                    <CheckCircle2 className="h-3 w-3 text-primary" />
                  ) : (
                    <Circle className="h-3 w-3 text-muted-foreground" />
                  )}
                  Step {s.index + 1} · {s.label}
                </span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );

  if (variant === "slim") {
    return (
      <div className={cn("space-y-1.5", className)}>
        {Bar}
        <div className="flex items-center justify-between text-[10px] uppercase tracking-wide text-muted-foreground">
          <span>
            {allComplete ? "All sections covered" : `Step ${displayStep} of ${total} · ${currentSectionLabel}`}
          </span>
          <span className="tabular-nums">{percent}%</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-muted/30 p-3 md:p-3.5",
        revisionMode && "border-primary/30 bg-primary/5",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {revisionMode ? (
              <>
                <Sparkles className="h-3 w-3 text-primary" /> Revising your brief
              </>
            ) : (
              <>Your progress</>
            )}
          </div>
          <div className="truncate text-sm font-medium text-foreground">
            {allComplete
              ? "All sections covered — ready to finalize"
              : `Step ${displayStep} of ${total} · ${currentSectionLabel}`}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-base font-semibold tabular-nums text-foreground">{percent}%</div>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
            {completed}/{total} done
          </div>
        </div>
      </div>
      <div className="mt-3">{Bar}</div>
    </div>
  );
}
