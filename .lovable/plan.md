# Brief conversation review — what to refine

I read the chat route (`src/routes/api/brief-chat.ts`), the spine (`src/lib/brand-brief.ts`), and the chat UI (`src/routes/_authenticated/dashboard.brief.tsx`). The bones are good: AI-led, one question per turn, live brief panel on the right, import card to skip ahead. Below are the gaps I want to close before you take it.

## Issues I'd fix

1. **The kickoff looks awkward.** The UI auto-sends a literal user message `"Let's begin."` that appears in the transcript. It reads like the executive said it. Replace with a server-generated assistant greeting (no fake user turn) that:
   - says hi, names what we're doing, sets length expectation ("about 10 minutes, ~12 short exchanges"),
   - acknowledges imported context if present ("I read your resume — give me 30 seconds to mirror back what I see"),
   - asks the first real question.

2. **No sense of progress.** Right panel shows "X of 14" but the AI never references it in chat. Add a system-prompt rule: every 3–4 turns, briefly orient ("Halfway there — three more big ones: audience, voice, and what winning looks like.").

3. **Examples are optional today; they should be mandatory on abstract sections.** Current system prompt says "Offer 2–3 concrete example answers when it helps." In practice the model skips them on the hardest sections. Force examples for: `signature_pov`, `voice`, `transformation`, `domain`, `audience_pain`, `signature_themes`. Examples should be domain-flavored when imported context exists (e.g., if resume says "healthcare ops," examples reference healthcare).

4. **No graceful "I don't know" path.** Executive gets stuck on `signature_pov` or `voice` → conversation stalls. Add rule: if the user hedges twice, the strategist offers a "park-it" move ("Let's come back to this — I'll draft 2 options after we cover audience and you pick.") and records a partial fact with confidence 2 so the panel still advances.

5. **Order isn't enforced.** Model is told "whatever order makes sense." For most execs the natural ladder is: identity → domain → expertise → audience → audience_pain → transformation → signature_pov → origin_arc → voice → themes → channels → outcome → non-negotiables → workshop_alignment. Easy/grounded first, abstract later. Pin this as the *default* order, deviate only when imported context already answers something.

6. **Voice ask is heavy and lands too early if model jumps to it.** Keep the current "paste 2–3 sentences you've written" ask, but only after audience/transformation are locked, and always offer the fallback (3 tone words + 3 anti-tone words) up front so it doesn't feel like homework.

7. **A few spine labels/hints read like consulting jargon.** Light relabels in `src/lib/brand-brief.ts`:
   - `domain` label "Domain you own" → "What you want to be known for" (hint stays specific).
   - `signature_pov` hint → add example: "e.g., 'Most turnaround playbooks fail in regulated industries because they ignore the compliance clock.'"
   - `non_negotiables` hint → soften: "Anything off-limits — topics, tones, platforms, or clients you won't touch."
   - `workshop_alignment` → move to a *closing* prompt the strategist asks last ("Before I assemble this — of the 15 deliverables we'll build in the room, which 2–3 matter most?"), not a mid-flow spine item.

8. **Finish behavior is invisible.** `finish_brief` fires silently. Before calling it, the strategist should say "I have enough — assembling your brief now," so the screen transition (chat → finished view) isn't jarring.

9. **Mic + Enter behavior is fine, but no "edit my last answer" affordance.** Add a one-line note under the composer: "Tap any section on the right to edit." (UI already supports it; just surface it.)

10. **Empty-state for the right panel.** "0 of 14" with no items feels cold. Add a single line: "Your brief will fill in here as we talk." (The intro paragraph at the top says something similar but the panel itself reads empty.)

## Files I'd touch

- `src/routes/api/brief-chat.ts` — rewrite the `system` prompt: greeting rule, default order, mandatory examples list, park-it rule, finish-announcement rule, progress check-ins.
- `src/routes/_authenticated/dashboard.brief.tsx` — replace the auto-sent `"Let's begin."` user message with a server-initiated assistant greeting (send an empty messages array or a system-only kickoff token; render nothing for the user side). Add the "Tap any section on the right to edit" hint under the composer.
- `src/lib/brand-brief.ts` — relabel `domain`, sharpen `signature_pov` hint with example, soften `non_negotiables`, move `workshop_alignment` to last position (it already is — keep it but mark it as the closing question in the prompt).
- `src/components/brief/BrandBriefPanel.tsx` — add empty-state line when `facts.length === 0`.

## What I'm NOT changing

- The 14-section spine itself (only labels/hints/order semantics).
- The Gemini model choice.
- The import card flow (already solid).
- The finished-view markdown rendering.

If you want, I can also do a dry-run as a fake executive after the changes land and paste the transcript so you can sanity-check before going through it yourself.
