import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Upload, Link2, Loader2, FileText, Check, X } from "lucide-react";
import { toast } from "sonner";
import {
  createResumeUploadUrl,
  extractFounderFromText,
} from "@/lib/discovery.functions";

type Props = {
  importedHeadline: string | null;
  onImported: () => void | Promise<void>;
};

/**
 * Lightweight resume/LinkedIn/bio import card that sits above the chat.
 * Reuses the existing discovery server functions.
 */
export function BrandBriefImportCard({ importedHeadline, onImported }: Props) {
  const signFn = useServerFn(createResumeUploadUrl);
  const extractFn = useServerFn(extractFounderFromText);

  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [bio, setBio] = useState("");
  const [filename, setFilename] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [collapsed, setCollapsed] = useState(!!importedHeadline);

  if (collapsed) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-card/60 p-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Check className="h-4 w-4 text-primary" />
          <span>
            Context loaded{importedHeadline ? `: ${importedHeadline}` : ""}. The AI will use it.
          </span>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Add more
        </button>
      </div>
    );
  }

  const onFile = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) return toast.error("Max 10MB");
    setBusy(true);
    try {
      const { path, signedUrl } = await signFn({
        data: { filename: file.name, mime: file.type || "application/octet-stream" },
      });
      const up = await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type || "application/octet-stream" },
      });
      if (!up.ok) throw new Error("Upload failed");
      setFilename(file.name);
      const res = await extractFn({
        data: { source: "resume", source_file_path: path, raw_text: null, linkedin_url: null },
      });
      if (res?.note) toast.message(res.note);
      else toast.success("Resume read. The AI now knows your background.");
      await onImported();
      setCollapsed(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const submitLinkedinOrBio = async () => {
    const hasUrl = linkedinUrl.trim().length > 0;
    const hasBio = bio.trim().length >= 20;
    if (!hasUrl && !hasBio) {
      return toast.error("Paste a LinkedIn URL or a short bio (20+ chars).");
    }
    setBusy(true);
    try {
      const res = await extractFn({
        data: {
          source: hasUrl ? "linkedin" : "manual",
          source_file_path: null,
          linkedin_url: hasUrl ? linkedinUrl.trim() : null,
          raw_text: hasBio ? bio.trim() : null,
        },
      });
      if (res?.note) toast.message(res.note);
      else toast.success("Got it. The AI will use this.");
      await onImported();
      setCollapsed(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't read that");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-card/60 p-4 md:p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium">Skip ahead with context (optional)</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Drop a resume, paste your LinkedIn URL, or paste a short bio. The strategist won't re-ask what it already knows.
          </p>
        </div>
        {importedHeadline && (
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {/* Resume */}
        <label className="group flex cursor-pointer flex-col items-start gap-2 rounded-xl border border-dashed border-white/15 bg-background/40 p-3 text-sm hover:border-white/30">
          <div className="flex items-center gap-2 text-foreground">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            <span>{filename ? "Replace resume" : "Upload resume (PDF)"}</span>
          </div>
          {filename && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <FileText className="h-3 w-3" /> {filename}
            </div>
          )}
          <input
            type="file"
            accept=".pdf,application/pdf"
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onFile(f);
            }}
          />
        </label>

        {/* LinkedIn */}
        <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-background/40 p-3 text-sm">
          <div className="flex items-center gap-2"><Link2 className="h-4 w-4" /> LinkedIn URL</div>
          <input
            type="url"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            placeholder="https://linkedin.com/in/…"
            className="w-full rounded-md border border-white/10 bg-background px-2 py-1.5 text-xs outline-none focus:border-white/30"
            disabled={busy}
          />
        </div>

        {/* Bio */}
        <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-background/40 p-3 text-sm">
          <div>Short bio (paste)</div>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="A few sentences about your career, results, the rooms you've been in…"
            className="w-full resize-none rounded-md border border-white/10 bg-background px-2 py-1.5 text-xs outline-none focus:border-white/30"
            disabled={busy}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          className="text-xs text-muted-foreground hover:text-foreground"
          disabled={busy}
        >
          Skip for now
        </button>
        <button
          type="button"
          onClick={submitLinkedinOrBio}
          disabled={busy || (!linkedinUrl.trim() && bio.trim().length < 20)}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {busy ? "Reading…" : "Use this"}
        </button>
      </div>
    </div>
  );
}
