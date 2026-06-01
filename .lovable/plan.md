# Fix: strategist dumps everything in one giant message

The page scrolled to y=2310 on the first assistant turn — that's a wall of text, not a conversation. Root cause is in the system prompt: the OPENING block tells the model to greet, set expectations, mirror imported context in 2–3 lines, AND ask the first question, all in one turn. Gemini happily expands that into a full briefing dump (probably with bullet lists per spine section).

## Fix

Tighten `src/routes/api/brief-chat.ts` system prompt with hard caps that beat the model's tendency to over-explain:

1. **Hard length cap, stated up front and repeated**: "EVERY message ≤ 60 words. EVERY message ends in EXACTLY ONE question. Never preview future questions. Never list more than one section per turn. No bullet lists of questions. No headings."

2. **Split the opening into two turns**, not one:
   - Turn 1 (greeting only): 1–2 short sentences. Sets expectation ("About 10 min. I'll ask one thing at a time."). Ends with the FIRST question (identity & credibility), with 1 short example. That's it.
   - If imported context exists: Turn 1 mirrors in ONE sentence ("I see you led ops at X — want me to use that as your starting credibility?") and waits for yes/no. No 3-line bios.

3. **Ban the spine dump**. Add: "NEVER list the spine, the plan, or what's coming next. NEVER say 'we'll also cover…'. The right panel shows progress; your job is the next question only."

4. **Examples format**: when offering 2–3 examples, write them inline as a short "(for example: A, B, or C)" — NOT as a bulleted list. Bullet lists make the message feel like a form.

5. **Reinforce one-question constraint with a self-check**: "Before sending, count question marks in your message. If more than 1, rewrite."

6. **Remove the "Begin (or continue) the conversation." closer** — it invites a wind-up. Replace with: "Send your next message now. Short. One question. No lists."

## Files

- `src/routes/api/brief-chat.ts` — system prompt only. No code/logic changes elsewhere.

## What I'm not changing

- The spine, the UI, the kickoff token mechanism, the model. Just the prompt discipline.
