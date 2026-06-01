## Goal
Add a reliable, cross-browser **push-to-talk voice dictation** mic button to the chat input on `/dashboard/brief`. User taps mic → speaks → taps stop → transcript is appended into the input field, ready to edit or send.

## Tech choice (per prior research)
- **OpenAI `gpt-4o-mini-transcribe`** — the bulletproof, cross-browser pick. ~$0.003/min, ~2s latency, no Web Speech API gaps in Firefox/iOS Safari.
- Audio captured in the browser via `MediaRecorder` with mime-type detection (webm/opus on Chrome/Firefox/Edge, mp4/AAC on Safari desktop + iOS).
- Audio blob uploaded to a TanStack server function that calls OpenAI server-side. Key stays server-only.

## Prerequisite
Add `OPENAI_API_KEY` as a runtime secret (one click in the secure form Lovable surfaces). Nothing happens until it's set.

## Files to create
1. **`src/lib/transcribe.functions.ts`** — `transcribeAudio` server function:
   - Auth-protected via `requireSupabaseAuth` middleware.
   - Accepts a `FormData` with an `audio` file blob.
   - POSTs to `https://api.openai.com/v1/audio/transcriptions` with `model: gpt-4o-mini-transcribe`, `response_format: text`.
   - Returns `{ text: string }` or `{ text: "", error: string }` on failure (graceful).

2. **`src/hooks/use-voice-dictation.ts`** — reusable hook:
   - `start()` → request mic permission, pick best supported mime-type, start `MediaRecorder`.
   - `stop()` → finalize blob, stop tracks, POST to `transcribeAudio`, return text.
   - Exposes `{ isRecording, isTranscribing, start, stop, error, elapsedMs }`.
   - Hard-stops after 60s as a safety guard.

3. **`src/components/brief/MicButton.tsx`** — UI control:
   - Idle: mic icon. Recording: pulsing red square (stop) + live timer. Transcribing: spinner.
   - Tooltip + `aria-label` for accessibility.
   - Disabled if `busy` (chat is replying).
   - On success, calls `onTranscript(text)` so the parent appends to the textarea.

## File to edit
**`src/routes/_authenticated/dashboard.brief.tsx`** (the input form, lines ~190–213):
- Drop `<MicButton onTranscript={(t) => setInput((prev) => prev ? `${prev} ${t}` : t)} disabled={busy} />` between the textarea and the send button.
- No other layout changes.

## UX details
- First use: browser prompts for mic permission. Clear error toast if denied or unsupported.
- Live timer ("0:08") while recording so users know it's listening.
- Transcript is **appended**, not auto-sent — user reviews and hits Enter.
- Hard cap 60s per dictation; user can dictate again to add more.

## What this is NOT doing
- No live/streaming transcription (push-to-talk only — simpler, more reliable).
- No changes to the chat backend, brief logic, or any other page.
- No client-side audio processing/compression — raw blob is small enough for 60s clips.

## Acceptance check after build
1. Mic button appears in the chat input on `/dashboard/brief`.
2. Click mic → permission prompt → red recording state with timer.
3. Click stop → spinner → transcript text appears appended in the textarea.
4. Works in Chrome, Safari desktop, iOS Safari, Firefox, Edge.
5. Without `OPENAI_API_KEY`, mic returns a clear error toast (no crash).
