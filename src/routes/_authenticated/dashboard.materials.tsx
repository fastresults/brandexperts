import { createFileRoute } from "@tanstack/react-router";
import { FileDown, ExternalLink, BookOpen, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import workbookAsset from "@/assets/executive-brand-intensive-workbook.pdf.asset.json";
import runSheetAsset from "@/assets/executive-brand-intensive-run-sheet.pdf.asset.json";

export const Route = createFileRoute("/_authenticated/dashboard/materials")({
  component: MaterialsPage,
  head: () => ({ meta: [{ title: "Workshop materials — Executive Brand Intensive" }] }),
});

type Material = {
  title: string;
  description: string;
  href: string;
  filename: string;
  sizeKb: number;
  icon: typeof BookOpen;
};

const MATERIALS: Material[] = [
  {
    title: "Attendee Workbook",
    description:
      "Pre-work checklist, in-room prompts for all 15 brand deliverables, the one-page Personal Branding Operating System summary, and your 30-minute weekly cadence card.",
    href: workbookAsset.url,
    filename: "executive-brand-intensive-workbook.pdf",
    sizeKb: Math.round(workbookAsset.size / 1024),
    icon: BookOpen,
  },
  {
    title: "Facilitator Run-Sheet",
    description:
      "Persuasion-engine checklist, scripted beats for each of the 6 blocks, timing, and contingency fallbacks if anything stalls.",
    href: runSheetAsset.url,
    filename: "executive-brand-intensive-run-sheet.pdf",
    sizeKb: Math.round(runSheetAsset.size / 1024),
    icon: ClipboardList,
  },
];

function MaterialsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Workshop materials</h1>
        <p className="mt-2 text-muted-foreground">
          Printable PDFs for the Executive Brand Intensive. Bring the workbook to the room — the run-sheet is for the facilitator.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {MATERIALS.map((m) => (
          <div
            key={m.href}
            className="flex flex-col rounded-2xl border border-white/10 bg-card p-6 hover:border-primary/30 transition"
          >
            <m.icon className="h-6 w-6 text-primary" />
            <div className="mt-4 text-lg font-semibold tracking-tight">{m.title}</div>
            <p className="mt-2 text-sm text-muted-foreground">{m.description}</p>
            <div className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">
              PDF · {m.sizeKb} KB
            </div>
            <div className="mt-auto pt-5 flex flex-wrap gap-2">
              <Button asChild size="sm">
                <a href={m.href} download={m.filename}>
                  <FileDown className="h-4 w-4" />
                  Download
                </a>
              </Button>
              <Button asChild size="sm" variant="outline">
                <a href={m.href} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Open in new tab
                </a>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
