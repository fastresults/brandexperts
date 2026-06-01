import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { transcribeAudio } from "@/lib/transcribe.functions";

const MAX_RECORDING_MS = 60_000;

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4;codecs=mp4a.40.2",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  for (const m of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(m)) return m;
    } catch {
      // ignore
    }
  }
  return undefined;
}

export function useVoiceDictation(onTranscript: (text: string) => void) {
  const transcribeFn = useServerFn(transcribeAudio);

  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<number>(0);
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanupRecorder = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    recorderRef.current = null;
  }, []);

  useEffect(() => cleanupRecorder, [cleanupRecorder]);

  const start = useCallback(async () => {
    setError(null);
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("Your browser does not support microphone input.");
      return;
    }
    if (typeof MediaRecorder === "undefined") {
      setError("Your browser does not support audio recording.");
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("Microphone access denied. Enable it in your browser settings.");
      return;
    }

    const mimeType = pickMimeType();
    let recorder: MediaRecorder;
    try {
      recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
    } catch {
      stream.getTracks().forEach((t) => t.stop());
      setError("Unable to start recording on this browser.");
      return;
    }

    chunksRef.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };

    streamRef.current = stream;
    recorderRef.current = recorder;
    startedAtRef.current = Date.now();
    setElapsedMs(0);
    setIsRecording(true);

    tickRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startedAtRef.current);
    }, 250);

    safetyTimerRef.current = setTimeout(() => {
      try {
        recorder.state === "recording" && recorder.stop();
      } catch {
        // ignore
      }
    }, MAX_RECORDING_MS);

    recorder.start();
  }, []);

  const stop = useCallback(async () => {
    const recorder = recorderRef.current;
    if (!recorder) return;

    setIsRecording(false);

    const blob: Blob = await new Promise((resolve) => {
      recorder.onstop = () => {
        const type = recorder.mimeType || "audio/webm";
        resolve(new Blob(chunksRef.current, { type }));
      };
      try {
        if (recorder.state !== "inactive") recorder.stop();
        else resolve(new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" }));
      } catch {
        resolve(new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" }));
      }
    });

    cleanupRecorder();
    chunksRef.current = [];

    if (blob.size === 0) {
      setError("No audio captured. Try again.");
      return;
    }

    setIsTranscribing(true);
    try {
      const ext = (blob.type.includes("mp4") && "m4a") ||
        (blob.type.includes("ogg") && "ogg") ||
        "webm";
      const form = new FormData();
      form.append("audio", blob, `recording.${ext}`);

      const result = await transcribeFn({ data: form });
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.text) {
        onTranscript(result.text);
      } else {
        setError("No speech detected. Try again.");
      }
    } catch (err) {
      console.error("[useVoiceDictation] transcribe failed", err);
      setError("Could not transcribe audio. Please try again.");
    } finally {
      setIsTranscribing(false);
    }
  }, [cleanupRecorder, onTranscript, transcribeFn]);

  return { isRecording, isTranscribing, elapsedMs, error, start, stop };
}
