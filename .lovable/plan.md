## Goal
Push-to-talk mic on the chat input at `/dashboard/brief`. Tap mic → speak → tap stop → transcript appears appended in the textarea, ready to edit or send.

## Provider
**ElevenLabs Scribe v2** (batch transcription) via the ElevenLabs connector. One-click connect — no API key to paste. Direct API (not gateway), called from a server function with `process.env.ELEVENLABS_API_KEY`.

Endpoint: `POST https://api.elevenlabs.io/v1/speech-to-text` with `model_id=scribe_v2`, auto language detection. ~99-language support, strong accuracy, no diarization/event tagging needed for dictation.

## Files to create
1. **`src/lib/transcribe.functions.ts`** — `transcribeAudio` server function:
   - Auth-protected via `requireSupabaseAuth` middleware.
   - Accepts a `FormData` with an `audio` file blob.
   - Reads `process.env.ELEVENLABS_API_KEY`, POSTs to ElevenLabs Scribe.
   - Returns `{ text }` on success or `{ text: "", error }` on failure (graceful, never throws to UI).
   - 60s/25MB guard.

2. **`src/hooks/use-voice-dictation.ts`** — reusable hook:
   - `start()` → request mic permission, detect supported mime-type (`audio/webm;codecs=opus` for Chrome/Firefox/Edge, `audio/mp4` for Safari/iOS), start `MediaRecorder`.
   - `stop()` → finalize blob, stop all tracks, upload to `transcribeAudio`, return text.
   - Exposes `{ isRecording, isTranscribing, elapsedMs, start, stop, error }`.
   - Hard 60s safety cap with auto-stop.

3. **`src/components/brief/MicButton.tsx`** — UI control:
   - Idle: mic icon. Recording: pulsing red square (stop) + live MM:SS timer. Transcribing: spinner.
   - Tooltip + `aria-label`. Disabled while chat is `busy`.
   - On success calls `onTranscript(text)`; on error shows a sonner toast.

## File to edit
**`src/routes/_authenticated/dashboard.brief.tsx`** (input form, lines ~190–213):
- Drop `<MicButton onTranscript={(t) => setInput(prev => prev ? `${prev} ${t}` : t)} disabled={busy} />` between the textarea and the send button.

## Connector setup (one tool call)
- Call `standard_connectors--connect` with `connector_id: "elevenlabs"`. User picks/creates the connection in Lovable's UI; `ELEVENLABS_API_KEY` becomes available to server functions.

## UX details
- First use triggers browser mic-permission prompt; clear error toast if denied/unsupported.
- Live timer ("0:08") while recording.
- Transcript is **appended**, not auto-sent — user reviews then hits Enter.
- 60s cap per dictation; user can dictate multiple times to extend.

## Not doing
- No live/streaming transcription (push-to-talk is simpler and more reliable).
- No changes to chat backend, brief logic, or any other page.
- No diarization, event tagging, or word-level timestamps.

## Acceptance check
1. Mic button appears in the chat input on `/dashboard/brief`.
2. Click mic → permission prompt → red recording + timer.
3. Click stop → spinner → transcript appended to textarea.
4. Works in Chrome, Safari desktop, iOS Safari, Firefox, Edge.
5. If connector isn't connected, clear toast (no crash).
