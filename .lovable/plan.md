# Fix: duplicate opener + verbatim parroting

Two distinct bugs producing the two near-identical messages you're seeing.

## Bug 1 — Duplicate kickoff (UI)

`src/routes/_authenticated/dashboard.brief.tsx` has:

```
useEffect(() => {
  if (messages.length === 0 && status === "ready") {
    void sendMessage({ text: KICKOFF });
  }
}, [status]);
```

This fires more than once: React StrictMode in dev re-mounts effects, and `status` cycles `ready → submitted → streaming → ready`, re-triggering the check. By the time the second run reads `messages.length`, the optimistic user message may not yet be in `messages`, so the guard passes and a second `__kickoff__` is sent — producing two assistant greetings.

**Fix:** guard with a `useRef<boolean>` so the kickoff sends exactly once per component mount, regardless of effect re-runs or status churn.

```
const kickedRef = useRef(false);
useEffect(() => {
  if (kickedRef.current) return;
  if (status === "ready" && messages.length === 0) {
    kickedRef.current = true;
    void sendMessage({ text: KICKOFF });
  }
}, [status, messages.length]);
```

## Bug 2 — Model copies my example verbatim (prompt)

In `src/routes/api/brief-chat.ts` the OPENING block contains a literal sample sentence ("Hey — I'm your strategist for the next ~10 minutes…"). Gemini treats it as a script. Same risk on the imported-context line, the voice question, the workshop_alignment closer, and the finishing line.

**Fix — replace scripts with ingredients + anti-copy rule.** System prompt changes only:

1. Add to HARD RULES: "NEVER copy any example sentence from this prompt verbatim. Examples describe shape, not script. Compose your own words every time. In particular, do NOT use the phrases 'I'm your strategist', 'next 10 minutes', or 'when someone introduces you in a room full of strangers' — find your own opening."

2. **OPENING** — strip the canned sentences. Replace with constraints:
   - Max 2 short sentences + 1 question.
   - One human hello (no boilerplate, no time estimate — the page header already says "~10 minutes").
   - One question on identity & credibility, phrased fresh. Vary the angle across attempts (the bio they're proudest of, the credential people quote back, the line that lands when a host introduces them, the result they're known for). Do NOT default to the "room of strangers" angle.

3. **Imported-context branch** — say "Mirror one specific thing from the imported context in your own words (one sentence), then ask if it should anchor their credibility or get sharpened. Use your own phrasing."

4. **Voice question** — replace the literal template with the ingredients (two paths: 3 tone words + 3 anti-tone words, OR a 2–3 sentence writing sample; ask which they prefer). Phrase fresh.

5. **workshop_alignment closer** — replace the literal line with: "Frame it as the final question. Reference the 15 in-room deliverables and ask which 2–3 they want to walk out with. Phrase fresh."

6. **Finishing line** — replace the literal "Got what I need…" with: "Send one short line announcing you're assembling the brief now. Your words, not mine."

## Files

- `src/routes/_authenticated/dashboard.brief.tsx` — add `kickedRef` guard around the kickoff effect.
- `src/routes/api/brief-chat.ts` — system prompt edits per above. No logic changes.

## What I'm not changing

- The hard caps (≤60 words, exactly 1 question, no lists).
- Spine, model, UI structure, kickoff token mechanism.
