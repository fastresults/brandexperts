import { useEffect } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useVoiceDictation } from "@/hooks/use-voice-dictation";

function formatElapsed(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function MicButton({
  onTranscript,
  disabled,
}: {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}) {
  const { isRecording, isTranscribing, elapsedMs, error, start, stop } =
    useVoiceDictation(onTranscript);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const busy = disabled || isTranscribing;

  if (isTranscribing) {
    return (
      <button
        type="button"
        disabled
        className="flex items-center gap-1.5 rounded-xl bg-muted px-2.5 py-2 text-xs text-muted-foreground"
        aria-label="Transcribing"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="hidden sm:inline">Transcribing…</span>
      </button>
    );
  }

  if (isRecording) {
    return (
      <button
        type="button"
        onClick={() => void stop()}
        className="flex items-center gap-1.5 rounded-xl bg-red-500/15 px-2.5 py-2 text-xs font-medium text-red-400 ring-1 ring-red-500/40 hover:bg-red-500/25"
        aria-label="Stop recording"
        title="Stop recording"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
        </span>
        <Square className="h-3.5 w-3.5 fill-current" />
        <span className="tabular-nums">{formatElapsed(elapsedMs)}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void start()}
      disabled={busy}
      className="rounded-xl p-2 text-muted-foreground hover:bg-white/10 hover:text-foreground disabled:opacity-50"
      aria-label="Record voice"
      title="Record voice (tap to start)"
    >
      <Mic className="h-4 w-4" />
    </button>
  );
}
