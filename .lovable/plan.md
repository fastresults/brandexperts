## Push-to-talk voice input for the brief chat

### Approach (Lovable-recommended, cross-browser)
Lovable's AI Gateway does not expose speech-to-text. Per Lovable docs, the recommended STT pattern is **record in the browser → send audio to a secure backend → call OpenAI Whisper**. This works in every modern browser (Chrome, Safari, Edge, Firefox) — unlike the Web Speech API, which is Chrome-only and unreliable.

Push-to-talk (record → stop → transcribe → paste into the textarea) — no streaming/WebSocket fragility, one round-trip per utterance.

### Pieces

1. **Secret**: `OPENAI_API_KEY` — requested via `add_secret` (user grabs it from platform.openai.com → API Keys). I'll request this first; the rest goes in once it's set.

2. **Server route** `src/routes/api/transcribe.ts` (POST):
   - Verifies the Supabase bearer token so the endpoint isn't open to the world
   - Accepts `multipart/form-data` with an `audio` field
   - Validates mime starts with `audio/` and size ≤ 25 MB (Whisper's cap)
   - Forwards to `https://api.openai.com/v1/audio/transcriptions` with `model=whisper-1`
   - Returns `{ text }` or `{ error }`; try/catch around the fetch; never leaks the API key

3. **Hook** `src/hooks/use-voice-input.ts`:
   - Uses `MediaRecorder` with the first supported mime (webm/opus → mp4/aac for Safari)
   - States: `idle` | `recording` | `transcribing` | `error`
   - `start()` requests mic permission, begins recording
   - `stop()` finalizes blob, POSTs to `/api/transcribe`, resolves with text
   - Auto-stops at 60 s; clear toast messages for permission denial, no mic, or API failure

4. **MicButton** `src/components/brief/MicButton.tsx`:
   - Lucide `Mic` (idle) → red pulsing `Square` (recording) → spinning `Loader2` (transcribing)
   - Live MM:SS timer while recording; tooltip "Tap to speak"

5. **Wire into `dashboard.brief.tsx` `ChatPane`**:
   - Mount `<MicButton />` in the existing input bar, left of Send
   - On transcript: append to the textarea (`prev ? prev + " " + text : text`) — never overwrite
   - Re-focus textarea after paste so the user can edit before sending

### Explicitly NOT doing
- No auto-send after transcription — user reviews/edits first
- No Web Speech API (Chrome-only)
- No mic on the bio textarea — chat only for now
- No changes to chat prompts, brief spine, or business logic

### Files
- New: `src/routes/api/transcribe.ts`, `src/hooks/use-voice-input.ts`, `src/components/brief/MicButton.tsx`
- Edited: `src/routes/_authenticated/dashboard.brief.tsx`
- Secret: `OPENAI_API_KEY`