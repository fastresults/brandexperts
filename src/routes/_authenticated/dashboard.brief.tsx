import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Send, Loader2, RefreshCw, CheckCircle2, Copy, Download, RotateCcw, Pencil } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getFounderProfile } from "@/lib/discovery.functions";
import { getBrandBrief, reopenBrandBrief, resetBrandBrief, reviseBrandBrief } from "@/lib/brand-brief.functions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { BrandBriefImportCard } from "@/components/brief/BrandBriefImportCard";
import { MicButton } from "@/components/brief/MicButton";
import { BrandBriefPanel } from "@/components/brief/BrandBriefPanel";
import { BrandAlignmentPanel } from "@/components/brief/BrandAlignmentPanel";
import type { BriefFact } from "@/lib/brand-brief";
import { Markdown } from "@/components/brief/Markdown";
import { parseBrief } from "@/lib/brief-parser";
import { LedgerBrief } from "@/components/brief/LedgerBrief";
import { BriefProgress, type BriefProgressData } from "@/components/brief/BriefProgress";

export const Route = createFileRoute("/_authenticated/dashboard/brief")({
  component: BrandBriefPage,
  head: () => ({ meta: [{ title: "Your brand brief — Brand Experts" }] }),
});

function BrandBriefPage() {
  const briefFn = useServerFn(getBrandBrief);
  const profileFn = useServerFn(getFounderProfile);
  const reopenFn = useServerFn(reopenBrandBrief);
  const resetFn = useServerFn(resetBrandBrief);
  const reviseFn = useServerFn(reviseBrandBrief);

  const brief = useQuery({ queryKey: ["brand-brief"], queryFn: () => briefFn() });
  const profile = useQuery({ queryKey: ["founder-profile"], queryFn: () => profileFn() });

  const facts = (brief.data?.facts ?? []) as BriefFact[];
  const summary = brief.data?.summary ?? null;
  const progress = (brief.data?.progress ?? {
    total: 0,
    completed: 0,
    percent: 0,
    allComplete: false,
    currentSectionId: null,
    currentSectionLabel: "",
    currentIndex: 0,
    sections: [],
  }) as BriefProgressData;
  const finished = !!summary?.completed_at;
  const revisionMode = !finished && facts.length > 0 && !summary;

  const handleRevise = async () => {
    try {
      await reviseFn();
      await Promise.all([brief.refetch(), profile.refetch()]);
      toast.success("Revision mode — your answers are kept. Walk through what you'd like to change.");
    } catch (err) {
      toast.error("Couldn't enter revision mode");
      console.error(err);
    }
  };

  const handleReset = async () => {
    try {
      await resetFn();
      await Promise.all([brief.refetch(), profile.refetch()]);
      toast.success("Cleared — let's start fresh");
    } catch (err) {
      toast.error("Couldn't clear the assessment");
      console.error(err);
    }
  };


  // Auth-aware transport: attach the bearer token to /api/brief-chat.
  const [transport, setTransport] = useState<DefaultChatTransport<UIMessage> | null>(null);
  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      const token = data.session?.access_token;
      setTransport(
        new DefaultChatTransport({
          api: "/api/brief-chat",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }),
      );
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!transport) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading your strategist…
      </div>
    );
  }

  if (finished) {
    return (
      <FinishedView
        markdown={summary.markdown}
        onReopen={async () => {
          await reopenFn();
          await brief.refetch();
        }}
        onReset={handleReset}
      />
    );
  }

  return (
    <div className="grid h-[calc(100vh-6rem)] grid-cols-1 gap-0 md:grid-cols-[1fr_380px]">
      <div className="flex min-h-0 flex-col">
        <div className="border-b border-white/10 p-4 md:p-5">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-semibold tracking-tight">Design your brand operating system</h1>
            <ReviseActions onRevise={handleRevise} onReset={handleReset} hasAnswers={facts.length > 0} variant="link" />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            A conversation with your AI brand strategist. The brief assembles on the right as you go.
          </p>

          <div className="mt-4">
            <BriefProgress progress={progress} revisionMode={revisionMode} />
          </div>

          <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm leading-relaxed text-foreground/90">
            <div className="text-xs font-medium uppercase tracking-wide text-primary">
              {revisionMode ? "Revising your brief" : "Before your workshop"}
            </div>
            <p className="mt-1.5">
              {revisionMode
                ? "Your prior answers are kept. The strategist will walk you through each section so you can keep, refine, or replace any answer. You can also edit any section directly on the right."
                : "Welcome! This short ~10-minute conversation builds your Brand Operating System — the foundation we'll sharpen together in the room. Upload a resume, LinkedIn, or bio to start, then chat at your own pace. Arrive ready, leave with clarity."}
            </p>
          </div>

          <div className="mt-4">
            <BrandBriefImportCard
              importedHeadline={
                (profile.data?.profile as { extracted?: { headline?: string } } | null)?.extracted?.headline ?? null
              }
              onImported={async () => {
                await Promise.all([profile.refetch(), brief.refetch()]);
              }}
            />
          </div>
        </div>


        <ChatPane
          transport={transport}
          onToolDone={() => {
            void brief.refetch();
          }}
        />
      </div>

      <BrandBriefPanel facts={facts} onChanged={() => { void brief.refetch(); }} />
    </div>
  );
}

function ChatPane({
  transport,
  onToolDone,
}: {
  transport: DefaultChatTransport<UIMessage>;
  onToolDone: () => void;
}) {
  const { messages, sendMessage, status } = useChat({
    transport,
    onError: (e) => toast.error(e.message || "Chat failed"),
    onFinish: () => onToolDone(),
  });
  const [input, setInput] = useState("");
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Refresh the brief panel as tool calls stream in.
  useEffect(() => {
    onToolDone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Kick off the conversation exactly once per mount. Guarded by a ref so
  // StrictMode re-runs and status churn (ready → submitted → ready) can't
  // re-fire it and produce a duplicate opening message.
  const KICKOFF = "__kickoff__";
  const kickedRef = useRef(false);
  useEffect(() => {
    if (kickedRef.current) return;
    if (status === "ready" && messages.length === 0) {
      kickedRef.current = true;
      void sendMessage({ text: KICKOFF });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, messages.length]);

  const busy = status === "submitted" || status === "streaming";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={scrollerRef} className="flex-1 overflow-y-auto p-4 md:p-6">
        <ul className="mx-auto max-w-2xl space-y-4">
          {messages.map((m) => {
            const text = m.parts
              .map((p) => (p.type === "text" ? p.text : ""))
              .join("");
            if (!text) return null;
            const isUser = m.role === "user";
            // Hide the kickoff trigger from the transcript.
            if (isUser && text.trim() === KICKOFF) return null;
            return (
              <li key={m.id} className={isUser ? "flex justify-end" : ""}>
                {isUser ? (
                  <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2 text-sm text-primary-foreground whitespace-pre-wrap">
                    {text}
                  </div>
                ) : (
                  <div className="max-w-[85%] text-foreground/90">
                    <Markdown variant="chat">{text}</Markdown>
                  </div>
                )}
              </li>
            );
          })}
          {busy && (
            <li className="text-sm text-muted-foreground">
              <Loader2 className="inline h-3.5 w-3.5 animate-spin" /> Thinking…
            </li>
          )}
        </ul>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const text = input.trim();
          if (!text || busy) return;
          setInput("");
          void sendMessage({ text });
        }}
        className="border-t border-white/10 p-3 md:p-4"
      >
        <div className="mx-auto flex max-w-2xl items-end gap-2 rounded-2xl border border-white/10 bg-background/60 p-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                (e.currentTarget.form as HTMLFormElement | null)?.requestSubmit();
              }
            }}
            rows={1}
            placeholder="Type your answer… (Enter to send, Shift+Enter for a new line)"
            className="max-h-40 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none"
            disabled={busy}
          />
          <MicButton
            disabled={busy}
            onTranscript={(text) =>
              setInput((prev) => (prev ? `${prev.replace(/\s+$/, "")} ${text}` : text))
            }
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="rounded-xl bg-primary p-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mx-auto mt-2 max-w-2xl text-center text-[11px] text-muted-foreground">
          Tap any section on the right to edit. Your brief saves as you go.
        </p>
      </form>
    </div>
  );
}

function FinishedView({ markdown, onReopen, onReset }: { markdown: string; onReopen: () => void | Promise<void>; onReset: () => void | Promise<void> }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      toast.success("Brief copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  };

  const download = () => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `brand-brief-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const sections = parseBrief(markdown);

  return (
    <div className="mx-auto w-full max-w-[1000px] space-y-12 px-4 py-12 md:px-6 md:py-16">
      {/* Header strip */}
      <header className="flex flex-col justify-between gap-6 border-b border-white/10 pb-8 md:flex-row md:items-end">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
            <CheckCircle2 className="h-3 w-3" />
            Brand brief ready
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">
            {sections.title ?? "Your Brand Operating System"}
          </h1>
          <p className="text-sm font-medium tracking-wide text-muted-foreground">
            Assembled from your intake conversation · always available in your dashboard
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void copy()}
            className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-muted/40 px-3.5 py-2 text-xs font-semibold text-foreground/90 transition-colors hover:bg-muted/70"
          >
            <Copy className="h-3.5 w-3.5" /> {copied ? "Copied" : "Copy markdown"}
          </button>
          <button
            type="button"
            onClick={download}
            className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-muted/40 px-3.5 py-2 text-xs font-semibold text-foreground/90 transition-colors hover:bg-muted/70"
          >
            <Download className="h-3.5 w-3.5" /> Download .md
          </button>
          <button
            type="button"
            onClick={() => void onReopen()}
            className="inline-flex items-center gap-2 rounded-md bg-foreground px-3.5 py-2 text-xs font-semibold text-background transition-colors hover:bg-foreground/90"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Keep refining
          </button>
          <StartOverButton onConfirm={onReset} variant="ghost" />
        </div>
      </header>

      {/* The document — Ledger editorial layout */}
      <LedgerBrief sections={sections} />

      {/* Workshop alignment block, clearly separated */}
      <section className="space-y-4 border-t border-white/10 pt-12">
        <div className="space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
            Applied to the workshop
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">
            How your brief shapes what we build in the room
          </h2>
        </div>
        <BrandAlignmentPanel />
      </section>
    </div>
  );
}

function StartOverButton({
  onConfirm,
  variant = "ghost",
}: {
  onConfirm: () => void | Promise<void>;
  variant?: "ghost" | "link";
}) {
  const [busy, setBusy] = useState(false);
  const triggerClass =
    variant === "link"
      ? "inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-destructive"
      : "inline-flex items-center gap-2 rounded-md border border-destructive/30 bg-transparent px-3.5 py-2 text-xs font-semibold text-destructive/90 transition-colors hover:bg-destructive/10 hover:text-destructive";

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button type="button" className={triggerClass} disabled={busy}>
          <RotateCcw className="h-3.5 w-3.5" /> Start over
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset your brand brief?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently clears your captured facts, generated brief, and workshop alignment.
            The conversation will start fresh. This can't be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={busy}
            onClick={async (e) => {
              e.preventDefault();
              setBusy(true);
              try {
                await onConfirm();
              } finally {
                setBusy(false);
              }
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {busy ? "Resetting…" : "Yes, start over"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
