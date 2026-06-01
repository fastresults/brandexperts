import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB

export const transcribeAudio = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => {
    if (!(input instanceof FormData)) {
      throw new Error("Expected FormData");
    }
    const audio = input.get("audio");
    if (audio === null || typeof audio === "string") {
      throw new Error("Missing 'audio' file in form data");
    }
    const blob = audio as Blob;
    if (blob.size === 0) {
      throw new Error("Audio file is empty");
    }
    if (blob.size > MAX_BYTES) {
      throw new Error("Audio file exceeds 25 MB");
    }
    const filename =
      typeof (audio as File).name === "string" && (audio as File).name.length > 0
        ? (audio as File).name
        : "recording.webm";
    return { audio: blob, filename };
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return {
        text: "",
        error:
          "Voice input is not configured. Connect the ElevenLabs integration in Lovable Cloud.",
      };
    }

    try {
      const upstream = new FormData();
      upstream.append("file", data.audio, data.filename);
      upstream.append("model_id", "scribe_v2");
      upstream.append("tag_audio_events", "false");
      upstream.append("diarize", "false");

      const res = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
        method: "POST",
        headers: { "xi-api-key": apiKey },
        body: upstream,
      });

      if (!res.ok) {
        const detail = await res.text();
        console.error("[transcribeAudio] ElevenLabs error", res.status, detail);
        return {
          text: "",
          error: `Transcription failed (${res.status}). Please try again.`,
        };
      }

      const json = (await res.json()) as { text?: string };
      return { text: (json.text ?? "").trim(), error: null as string | null };
    } catch (err) {
      console.error("[transcribeAudio] request failed", err);
      return { text: "", error: "Transcription service is unavailable. Please try again." };
    }
  });
