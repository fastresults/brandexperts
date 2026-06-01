import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";
import { BRIEF_SPINE, type BriefFact, type BriefSectionId } from "@/lib/brand-brief";
import { upsertBrandBriefFact } from "@/lib/brand-brief.functions";

type Props = {
  facts: BriefFact[];
  onChanged: () => void | Promise<void>;
};

export function BrandBriefPanel({ facts, onChanged }: Props) {
  const upsertFn = useServerFn(upsertBrandBriefFact);
  const byId = new Map(facts.map((f) => [f.section, f]));
  const filled = facts.length;
  const total = BRIEF_SPINE.length;

  return (
    <div className="h-full overflow-y-auto border-l border-white/10 bg-card/30 p-4 md:p-5">
      <div className="mb-4">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">Your brand brief</div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-2xl font-semibold tracking-tight">{filled}</span>
          <span className="text-sm text-muted-foreground">of {total} sections</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${(filled / total) * 100}%` }}
          />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          The strategist will assemble this as you talk. Click any section to edit.
        </p>
      </div>

      <ul className="space-y-3">
        {BRIEF_SPINE.map((s) => (
          <BriefRow
            key={s.id}
            id={s.id}
            label={s.label}
            hint={s.hint}
            fact={byId.get(s.id) ?? null}
            onSave={async (value) => {
              await upsertFn({ data: { section: s.id, value, confidence: 4 } });
              await onChanged();
            }}
          />
        ))}
      </ul>
    </div>
  );
}

function BriefRow({
  id: _id,
  label,
  hint,
  fact,
  onSave,
}: {
  id: BriefSectionId;
  label: string;
  hint: string;
  fact: BriefFact | null;
  onSave: (value: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(fact?.value ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) setDraft(fact?.value ?? "");
  }, [fact?.value, editing]);

  const filled = !!fact?.value;

  return (
    <li className="rounded-xl border border-white/10 bg-background/40 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`h-1.5 w-1.5 rounded-full ${filled ? "bg-primary" : "bg-white/20"}`}
              aria-hidden
            />
            <div className="text-sm font-medium">{label}</div>
          </div>
          {!filled && !editing && (
            <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
          )}
        </div>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-muted-foreground hover:text-foreground"
            aria-label={`Edit ${label}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {editing ? (
        <div className="mt-2 space-y-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-md border border-white/10 bg-background px-2 py-1.5 text-xs outline-none focus:border-white/30"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setDraft(fact?.value ?? "");
              }}
              className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" /> Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={async () => {
                setSaving(true);
                try {
                  await onSave(draft.trim());
                  setEditing(false);
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Couldn't save");
                } finally {
                  setSaving(false);
                }
              }}
              className="inline-flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <Check className="h-3 w-3" /> {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      ) : filled ? (
        <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/90">{fact?.value}</p>
      ) : null}
    </li>
  );
}
