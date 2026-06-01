import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Send, Loader2, RefreshCw, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getFounderProfile } from "@/lib/discovery.functions";
import { getBrandBrief, reopenBrandBrief } from "@/lib/brand-brief.functions";
import { BrandBriefImportCard } from "@/components/brief/BrandBriefImportCard";
import { BrandBriefPanel } from "@/components/brief/BrandBriefPanel";
import { BrandAlignmentPanel } from "@/components/brief/BrandAlignmentPanel";
import type { BriefFact } from "@/lib/brand-brief";

export const Route = createFileRoute("/_authenticated/dashboard/brief")({
  component: BrandBriefPage,
  head: () => ({ meta: [{ title: "Your brand brief — Brand Experts" }] }),
});

function BrandBriefPage() {
  const briefFn = useServerFn(getBrandBrief);
  const profileFn = useServerFn(getFounderProfile);
  const reopenFn = useServerFn(reopenBrandBrief);

  const brief = useQuery({ queryKey: ["brand-brief"], queryFn: () => briefFn() });
  const profile = useQuery({ queryKey: ["founder-profile"], queryFn: () => profileFn() });

  const facts = (brief.data?.facts ?? []) as BriefFact[];
  const summary = brief.data?.summary ?? null;
  const finished = !!summary?.completed_at;

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
      />
    );
  }

  return (
    <div className="grid h-[calc(100vh-6rem)] grid-cols-1 gap-0 md:grid-cols-[1fr_380px]">
      <div className="flex min-h-0 flex-col">
        <div className="border-b border-white/10 p-4 md:p-5">
          <h1 className="text-2xl font-semibold tracking-tight">Design your brand operating system</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A conversation with your AI brand strategist. The brief assembles on the right as you go.
          </p>
          <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm leading-relaxed text-foreground/90">
            <div className="text-xs font-medium uppercase tracking-wide text-primary">Before your workshop</div>
            <p className="mt-1.5">
              Welcome! This short ~10-minute conversation builds your Brand Operating System — the foundation we'll sharpen together in the room. Upload a resume, LinkedIn, or bio to start, then chat at your own pace. Arrive ready, leave with clarity.
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

  // Kick off the conversation if empty.
  useEffect(() => {
    if (messages.length === 0 && status === "ready") {
      void sendMessage({ text: "Let's begin." });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

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
            return (
              <li key={m.id} className={isUser ? "flex justify-end" : ""}>
                <div
                  className={
                    isUser
                      ? "max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2 text-sm text-primary-foreground"
                      : "max-w-[85%] text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap"
                  }
                >
                  {text}
                </div>
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
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="rounded-xl bg-primary p-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

function FinishedView({ markdown, onReopen }: { markdown: string; onReopen: () => void | Promise<void> }) {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-8">
      <div className="flex items-center gap-2 text-primary">
        <CheckCircle2 className="h-5 w-5" />
        <span className="text-sm font-medium uppercase tracking-wide">Brand brief ready</span>
      </div>
      <h1 className="text-3xl font-semibold tracking-tight">Your Brand Operating System Brief</h1>
      <article className="prose prose-invert max-w-none whitespace-pre-wrap rounded-2xl border border-white/10 bg-card/60 p-6 text-sm leading-relaxed">
        {markdown}
      </article>

      <BrandAlignmentPanel />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => void onReopen()}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/5"
        >
          <RefreshCw className="h-4 w-4" /> Keep refining
        </button>
      </div>
    </div>
  );
}
