import { useEffect, useMemo } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, RefreshCw, Sparkles, Target } from "lucide-react";
import { toast } from "sonner";
import {
  getBriefAlignment,
  regenerateBriefAlignment,
} from "@/lib/brand-brief.functions";
import { BRIEF_SECTION_BY_ID, type AlignmentItem, type BriefSectionId } from "@/lib/brand-brief";

function groupByBlock(items: AlignmentItem[]) {
  const groups = new Map<string, AlignmentItem[]>();
  for (const it of items) {
    const arr = groups.get(it.block_label) ?? [];
    arr.push(it);
    groups.set(it.block_label, arr);
  }
  return Array.from(groups.entries());
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr ago`;
  return `${Math.round(h / 24)} d ago`;
}

export function BrandAlignmentPanel() {
  const qc = useQueryClient();
  const fetchAlignment = useServerFn(getBriefAlignment);
  const regenerateFn = useServerFn(regenerateBriefAlignment);

  const alignment = useQuery({
    queryKey: ["brand-brief", "alignment"],
    queryFn: () => fetchAlignment(),
  });

  const regen = useMutation({
    mutationFn: async () => regenerateFn(),
    onSuccess: (data) => {
      qc.setQueryData(["brand-brief", "alignment"], data);
      toast.success("Workshop alignment refreshed");
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Could not generate alignment.";
      toast.error(msg);
    },
  });

  const data = alignment.data;
  const hasData = !!data && data.items.length > 0;

  // Auto-generate once on first arrival if missing.
  useEffect(() => {
    if (alignment.isSuccess && !data && !regen.isPending && !regen.isError) {
      regen.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alignment.isSuccess, data]);

  const groups = useMemo(() => (hasData ? groupByBlock(data!.items) : []), [data, hasData]);

  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-card/40 p-5 md:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Your Brand OS, applied to the workshop</h2>
            <p className="text-sm text-muted-foreground">
              How your brief shapes each of the 15 deliverables we'll produce in the room.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {data?.generated_at ? <span>Generated {timeAgo(data.generated_at)}</span> : null}
          <button
            type="button"
            onClick={() => regen.mutate()}
            disabled={regen.isPending}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs hover:bg-white/5 disabled:opacity-50"
          >
            {regen.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            {hasData ? "Regenerate" : "Generate"}
          </button>
        </div>
      </header>

      {alignment.isLoading || (regen.isPending && !hasData) ? (
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-white/10 p-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {regen.isPending ? "Aligning your brief to the workshop deliverables…" : "Loading alignment…"}
        </div>
      ) : !hasData ? (
        <div className="rounded-lg border border-dashed border-white/10 p-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 text-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-medium">No alignment yet.</span>
          </div>
          <p className="mt-1">Click <em>Generate</em> to map your Brand OS to every workshop deliverable.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map(([blockLabel, items]) => (
            <div key={blockLabel}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Block — {blockLabel}
              </h3>
              <ul className="mt-2 space-y-3">
                {items.map((it) => (
                  <li
                    key={it.deliverable_key}
                    className="rounded-xl border border-white/10 bg-background/40 p-4"
                  >
                    <div className="text-sm font-medium text-foreground">{it.deliverable_label}</div>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{it.application_text}</p>
                    {it.anchored_sections.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {it.anchored_sections.map((s) => (
                          <span
                            key={s}
                            className="rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary"
                          >
                            {BRIEF_SECTION_BY_ID[s as BriefSectionId]?.label ?? s}
                          </span>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
