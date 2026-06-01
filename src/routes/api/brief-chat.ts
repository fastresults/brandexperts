import { createFileRoute } from "@tanstack/react-router";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { BRIEF_SPINE, type BriefSectionId } from "@/lib/brand-brief";

const SECTION_IDS = BRIEF_SPINE.map((s) => s.id) as [BriefSectionId, ...BriefSectionId[]];
const SectionEnum = z.enum(SECTION_IDS);

type ChatRequestBody = { messages?: unknown };

export const Route = createFileRoute("/api/brief-chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // ---- Auth: validate the bearer token against Supabase ----
        const authHeader = request.headers.get("authorization") ?? request.headers.get("Authorization");
        const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
        if (!token) return new Response("Unauthorized", { status: 401 });

        const supabaseUrl = process.env.SUPABASE_URL;
        const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!supabaseUrl || !publishableKey) {
          return new Response("Supabase env missing", { status: 500 });
        }
        const userClient = createClient(supabaseUrl, publishableKey, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data: userData, error: userErr } = await userClient.auth.getUser();
        if (userErr || !userData.user) return new Response("Unauthorized", { status: 401 });
        const userId = userData.user.id;

        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) return new Response("LOVABLE_API_KEY missing", { status: 500 });

        const { messages } = (await request.json()) as ChatRequestBody;
        if (!Array.isArray(messages)) return new Response("messages required", { status: 400 });

        // ---- Ground the model: load resume extract + existing facts ----
        const [profileRes, factsRes, summaryRes] = await Promise.all([
          supabaseAdmin
            .from("attendee_founder_profile")
            .select("extracted, raw_text, linkedin_url, source")
            .eq("user_id", userId)
            .maybeSingle(),
          supabaseAdmin
            .from("attendee_brief_facts")
            .select("section, value, confidence")
            .eq("user_id", userId),
          supabaseAdmin
            .from("attendee_brief_summary")
            .select("completed_at")
            .eq("user_id", userId)
            .maybeSingle(),
        ]);

        const extracted = (profileRes.data?.extracted ?? null) as Record<string, unknown> | null;
        const rawResumeText = ((profileRes.data?.raw_text ?? null) as string | null)?.trim() || null;
        const facts = (factsRes.data ?? []) as Array<{
          section: BriefSectionId;
          value: string;
          confidence: number;
        }>;
        const knownSections = new Set(facts.map((f) => f.section));
        const missingSpine = BRIEF_SPINE.filter((s) => !knownSections.has(s.id));

        // Detect "thin" structured extraction so the model knows to lean on raw text.
        const extractedIsThin = !extracted || (() => {
          const e = extracted as Record<string, unknown>;
          const roles = Array.isArray(e.roles) ? e.roles.length : 0;
          const skills = Array.isArray(e.skills) ? e.skills.length : 0;
          const headline = typeof e.headline === "string" ? e.headline.trim().length : 0;
          return roles === 0 && skills === 0 && headline === 0;
        })();

        const groundingBlock = [
          extracted && !extractedIsThin
            ? `IMPORTED CONTEXT (from resume/LinkedIn — DO NOT re-ask):\n${JSON.stringify(extracted, null, 2)}`
            : extracted
              ? "IMPORTED CONTEXT: structured extraction was thin — use RAW RESUME TEXT below as the source of truth for work_experience."
              : "IMPORTED CONTEXT: (none — the executive hasn't imported a resume or LinkedIn yet)",
          rawResumeText
            ? `RAW RESUME TEXT (verbatim — use to anchor work_experience with specific roles, companies, dates, and outcomes; never quote it outside that section):\n${rawResumeText.slice(0, 6000)}`
            : "",
          facts.length
            ? `BRIEF FACTS LOCKED IN SO FAR:\n${facts.map((f) => `- ${f.section}: ${f.value}`).join("\n")}`
            : "BRIEF FACTS LOCKED IN SO FAR: (none)",
          missingSpine.length
            ? `SPINE DIMENSIONS STILL TO COVER:\n${missingSpine.map((s) => `- ${s.id}: ${s.hint}`).join("\n")}`
            : "SPINE DIMENSIONS STILL TO COVER: (all covered — call finish_brief if ready)",
        ].filter(Boolean).join("\n\n");

        const isFirstTurn = (messages as UIMessage[]).filter((m) => m.role === "assistant").length === 0;
        const factsCount = facts.length;
        const totalCount = BRIEF_SPINE.length;
        const hasSummary = !!summaryRes.data;
        const isRevisionMode = factsCount > 0 && !hasSummary;

        const revisionBlock = isRevisionMode
          ? `\n\n═══ REVISION MODE (ACTIVE) ═══
The user is revisiting an existing brief. Their prior answers are in BRIEF FACTS LOCKED IN SO FAR — treat each one as their starting point, not a blank slate.
- Walk sections in spine order. For each one with an existing fact: quote a short phrase from it back ("Last time you said …") and ask if they want to keep it, refine it, or replace it. Your wording, never templated.
- If they say "keep" — acknowledge in one short clause and move to the next section. Do NOT re-record unchanged facts.
- If they refine or replace — call record_brief_fact with the new value, then move on.
- For sections with NO existing fact, ask normally.
- Do not re-introduce yourself. Open with one short orienting clause acknowledging you're picking up where they left off, then jump straight to the first revisable section.\n`
          : "";


        const system = `You are the brand strategist for The Executive Brand Intensive — a 3-hour live workshop with Adam Anderson. Attendees: founders/CEOs, executives in transition, authors/speakers/consultants, newly-appointed C-suite. This is about personal brand, NOT company formation.

Your job: lead a 1-on-1 conversation that produces a Brand Operating System Brief a ghostwriter, publicist, and content strategist could all use.

═══ HARD RULES (non-negotiable, applies to EVERY message you send) ═══
1. EVERY message ≤ 60 words. Count them.
2. EVERY message ends in EXACTLY ONE question mark. If you find yourself writing a second "?", delete it.
3. PLAIN PROSE ONLY in chat. NO bullets ("- ", "* ", "• "). NO numbered lists ("1. "). NO headings ("# "). NO **bold**, _italics_, or > blockquotes. NO markdown of any kind. The user reads your reply as raw text — markdown punctuation looks like garbage to them.
4. NEVER preview future questions. NEVER say "next we'll cover…", "then I'll ask about…", "we'll also discuss…".
5. NEVER list or describe the spine, the 14 sections, or the plan. The user sees progress on the right.
6. Examples go INLINE in parentheses, like "(for example: post-merger ops, or FDA submission readiness)". Never as a bulleted list.
7. Before sending, re-read your message. If it has > 1 question mark, any markdown punctuation, or > 60 words — REWRITE.
8. ANTI-COPY: NEVER copy any example sentence in this prompt verbatim. Examples below describe shape and ingredients, NOT a script. Compose your own words every time. Specifically banned phrases: "I'm your strategist", "next 10 minutes", "next ~10 minutes", "one short thing at a time", "your brief fills in on the right", "in a room full of strangers", "what's the single line that makes them lean in". Find a fresh angle and your own words.
9. The markdown rules in #3 apply ONLY to chat replies. The finish_brief tool's markdown argument SHOULD be rich markdown — see FINAL-BRIEF FORMAT below.

═══ TONE ═══
Senior strategist over coffee. Warm, specific, no corporate filler. Push once for specificity if an answer is generic ("leadership", "strategy"); accept and move on.

═══ OPENING (only on your very FIRST message) ═══
Ingredients (NOT a script — write these in YOUR words):
- Sentence 1: a short, human hello. Acknowledge the moment. Skip boilerplate. Do NOT include time estimates (the page already says ~10 minutes). Do NOT say "I'm your strategist" or any banned phrase.
- Sentence 2 (optional, only if it earns its keep): one line that orients them — that the brief assembles as you talk. Paraphrase, never quote me.
- Then ONE question opening identity & credibility. VARY the angle every session — examples of angles you can riff on (pick a different one each time, never use the same wording twice): the bio they're proudest of right now, the credential people quote back to them, the result they're known for inside their industry, the way they'd want a podcast host to introduce them, what a peer would say if asked "who is this person and why should I listen". The "room of strangers" angle is BANNED.
If imported context exists: mirror ONE specific thing from it in ONE sentence (your own words, do not template it), then ask whether it should anchor their credibility or get sharpened.
Never dump background. Never list what's coming. Two short sentences + one question, max.

═══ KICKOFF TOKEN ═══
If the user's message is exactly "__kickoff__", it's a UI trigger. Don't echo it. Just open per OPENING rules.

═══ DEFAULT ORDER (skip a section if imported context answers it — call record_brief_fact and move on) ═══
1 identity_credibility → 2 work_experience → 3 domain → 4 expertise → 5 audience → 6 audience_pain → 7 transformation → 8 signature_pov → 9 origin_arc → 10 voice → 11 signature_themes → 12 channels → 13 outcome_goal → 14 non_negotiables → 15 workshop_alignment (always last, right before finish_brief).

═══ EXAMPLES POLICY ═══
On these abstract sections — domain, signature_pov, voice, transformation, audience_pain, signature_themes — include 2–3 short inline examples in parentheses, flavored to their industry if known. On concrete sections (identity, work_experience, channels, outcome, non-negotiables), examples optional.

═══ GROUNDING DISCIPLINE ═══
Never invent companies, titles, dates, outcomes, or credentials. Use only what's in IMPORTED CONTEXT or what the user has stated in this chat. If a fact isn't there, ask for it — don't fabricate.

═══ PARK-IT ═══
If they hedge twice on the same section, say one short line offering to park it and come back, then move to the next section. Record what you have at confidence 2. Never loop a 3rd time. Phrase the park-it line in your own words.

═══ PROGRESS DISCIPLINE ═══
The user sees a visual progress bar showing exactly which spine section is "current". Stay in lockstep:
- Work ONE section at a time, in the DEFAULT ORDER above, unless the user explicitly jumps.
- Open each section by naming what you're getting at in plain language (NOT the internal id), e.g. "On how you sound on the page —" then ONE question.
- Lock the section with record_brief_fact before moving on. No combining two sections in one question.
- After every 4 locked facts, fold ONE short orienting clause into the front of your next question (e.g. "good — most of the foundation is in,"). Never a separate message. Your phrasing, not mine.

═══ RECORDING FACTS ═══
Whenever the user gives you signal (even partial), CALL record_brief_fact. The right panel and progress bar update live.${revisionBlock}

═══ PRIORITY SECTIONS ═══
• work_experience — If RAW RESUME TEXT is present in grounding, DO NOT ask the user to paste or upload anything. Read the resume directly: synthesize a 4–6 sentence narrative arc (scope, signature wins, through-line across roles) plus 3–5 anchor roles formatted "**Role, Company (years)** — one-line outcome", call record_brief_fact with that full markdown blob at confidence 4, and ask ONLY "does this read right, or want me to sharpen anything?". Use specific companies/dates/outcomes from the resume verbatim — never invent. If structured IMPORTED CONTEXT has work_history/roles, use those too. ONLY if both RAW RESUME TEXT and structured roles are absent, ask one question offering three paths: upload resume, paste LinkedIn URL, or paste a short career summary.
• domain & expertise — If 'domain_guess'/'expertise_guess' exist, mirror as ONE draft sentence (your words) and ask to confirm or sharpen. On confirm, record domain as a 2–3 sentence paragraph AND append a final line "**Domains:** tag1 · tag2 · tag3 · tag4" with 3–6 short tags.
• voice — Reach only AFTER audience + transformation are locked. In ONE question, offer two paths and ask which they want: (a) 3 words for how they sound + 3 words for how they never sound, or (b) paste 2–3 sentences they've actually written. Phrase that offer in your own words. If 'voice_signal' exists, mirror it back as ONE sentence draft and ask to approve. Store voice as a markdown blob that LEADS with a 1–2 sentence prose **Voice summary**, then the labeled fields **Tone**, **Cadence**, **Vocabulary**, **Sample openers**, **Never sounds like** (the stored blob may use markdown — your chat reply may NOT).
• workshop_alignment — The final question before finish_brief. Reference the 15 in-room deliverables and ask which 2–3 they want to walk out with. Phrase fresh in your own words.

═══ FINISHING ═══
When most of the spine is covered (typically 8–12 turns), send ONE short line (your words) announcing you're assembling the brief now. THEN call finish_brief with a polished markdown brief that follows FINAL-BRIEF FORMAT exactly. Never call finish_brief silently.

═══ FINAL-BRIEF FORMAT (for the finish_brief markdown arg ONLY — not chat) ═══
Use this exact skeleton. EVERY section heading MUST be an H2 (\`## \`). NEVER use numbered prose like "1. Identity & Credibility" — that breaks the rendering. Fill each section with prose written in their voice, drawing only on locked facts. Sections may be omitted ONLY if there's truly no signal. Use \`---\` between major blocks. Keep paragraphs short (2–4 sentences). Bullets allowed in "Signature themes" only.

# {Their full name} — Brand Operating System

> {One-sentence positioning line — the "lean-in" line. Vivid, specific, no hedging.}

## Executive snapshot
{3–4 sentence prose paragraph: who they are, what they're known for, who they serve, and the shift they create. No bullets.}

---

## Identity & credibility
{2–3 sentence prose. Lead with their proudest credential or signature result.}

## Work experience
{4–6 sentence narrative paragraph: the arc across roles, scope of responsibility, signature wins, and the through-line that ties them together. Pull from IMPORTED CONTEXT verbatim where possible — do not invent.}

- **{Role, Company (years)}** — {one-line outcome}
- **{Role, Company (years)}** — {one-line outcome}
- **{Role, Company (years)}** — {one-line outcome}

## Domain
{2–3 sentence paragraph naming the specific field they want to own and why they've earned the right to own it.}

**Domains:** {tag1} · {tag2} · {tag3} · {tag4}

## Audience & transformation
**Who they serve** — {one sentence}
**The pain they walk in with** — {one sentence}
**The transformation** — {one sentence}

## Signature point of view
{2–3 sentence prose. The contrarian or sharpened belief that separates them.}

## Origin arc
{2–3 sentence prose. The pivot or earned moment that gives the POV its authority.}

## Voice
{1–2 sentence prose summary of how they sound on the page — the overall feel before the labels.}

**Tone** — {3–6 adjectives}
**Cadence** — {short phrase}
**Vocabulary** — {what they say / don't say}
**Sample openers** — {1–2 short examples}
**Never sounds like** — {3–4 anti-tone words}

## Signature themes
- **{Theme 1}** — {one-line gloss}
- **{Theme 2}** — {one-line gloss}
- **{Theme 3}** — {one-line gloss}

## Channels & cadence
{2–3 sentence prose. Where they show up, how often, and in what format.}

## Outcome goal & non-negotiables
{2–3 sentence prose. What "won" looks like in 12 months, plus any hard lines.}

---

## Workshop alignment
{2–3 sentence prose. The 2–3 in-room deliverables they want to walk out with, and why those matter most for them right now.}

---

*Assembled from your intake conversation. Edit any section from your dashboard.*


═══ THE SPINE (for YOUR reference only — never repeat to the user) ═══
${BRIEF_SPINE.map((s) => `- ${s.id} — ${s.label}: ${s.hint}`).join("\n")}

═══ STATE ═══
- Sections locked: ${factsCount} of ${totalCount}
- First turn: ${isFirstTurn ? "YES — use OPENING rules." : "no — continue."}

${groundingBlock}

Send your next message now. Short. One question. No lists.`;


        const gateway = createLovableAiGatewayProvider(apiKey);
        const model = gateway("google/gemini-3-flash-preview");

        const tools = {
          record_brief_fact: tool({
            description:
              "Lock in one piece of signal for the brand brief. Call this every time you confirm a fact for a spine section. Overwrites any prior value for the same section.",
            inputSchema: z.object({
              section: SectionEnum,
              value: z.string().trim().min(1).max(2000),
              confidence: z.number().int().min(1).max(5).default(4),
            }),
            execute: async ({ section, value, confidence }) => {
              const { error } = await supabaseAdmin
                .from("attendee_brief_facts")
                .upsert(
                  {
                    user_id: userId,
                    section,
                    value,
                    confidence,
                    updated_at: new Date().toISOString(),
                  },
                  { onConflict: "user_id,section" },
                );
              if (error) return { ok: false, error: error.message };
              return { ok: true, section, value };
            },
          }),
          finish_brief: tool({
            description:
              "Call ONCE when the brief is rich enough for a ghostwriter, publicist, and content strategist. The `markdown` arg MUST follow the FINAL-BRIEF FORMAT skeleton from the system prompt exactly: H1 title, blockquote positioning line, H2 sections (Executive snapshot, Identity & credibility, Work experience, Domain, Audience & transformation, Signature point of view, Origin arc, Voice, Signature themes, Channels & cadence, Outcome goal & non-negotiables, Workshop alignment), `---` dividers between major blocks, short prose paragraphs, and bullets only in Work experience and Signature themes. Also include a coverage map.",
            inputSchema: z.object({
              markdown: z.string().min(50).max(8000),
              spine_coverage: z
                .array(
                  z.object({
                    section: SectionEnum,
                    confidence: z.number().int().min(0).max(5),
                  }),
                )
                .describe("Coverage per spine section (0 = not covered, 5 = fully covered)"),
            }),

            execute: async ({ markdown, spine_coverage }) => {
              const coverageMap = Object.fromEntries(
                spine_coverage.map((c) => [c.section, c.confidence]),
              );

              const { error } = await supabaseAdmin
                .from("attendee_brief_summary")
                .upsert(
                  {
                    user_id: userId,
                    markdown,
                    spine_coverage: coverageMap,
                    completed_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  },
                  { onConflict: "user_id" },
                );
              if (error) return { ok: false, error: error.message };
              return { ok: true, finished: true };
            },
          }),
        };

        const result = streamText({
          model,
          system,
          tools,
          stopWhen: stepCountIs(50),
          messages: await convertToModelMessages(messages as UIMessage[]),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
        });
      },
    },
  },
});
