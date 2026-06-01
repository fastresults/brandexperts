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
        const [profileRes, factsRes] = await Promise.all([
          supabaseAdmin
            .from("attendee_founder_profile")
            .select("extracted, raw_text, linkedin_url, source")
            .eq("user_id", userId)
            .maybeSingle(),
          supabaseAdmin
            .from("attendee_brief_facts")
            .select("section, value, confidence")
            .eq("user_id", userId),
        ]);

        const extracted = (profileRes.data?.extracted ?? null) as Record<string, unknown> | null;
        const facts = (factsRes.data ?? []) as Array<{
          section: BriefSectionId;
          value: string;
          confidence: number;
        }>;
        const knownSections = new Set(facts.map((f) => f.section));
        const missingSpine = BRIEF_SPINE.filter((s) => !knownSections.has(s.id));

        const groundingBlock = [
          extracted
            ? `IMPORTED CONTEXT (from resume/LinkedIn — DO NOT re-ask):\n${JSON.stringify(extracted, null, 2)}`
            : "IMPORTED CONTEXT: (none — the executive hasn't imported a resume or LinkedIn yet)",
          facts.length
            ? `BRIEF FACTS LOCKED IN SO FAR:\n${facts.map((f) => `- ${f.section}: ${f.value}`).join("\n")}`
            : "BRIEF FACTS LOCKED IN SO FAR: (none)",
          missingSpine.length
            ? `SPINE DIMENSIONS STILL TO COVER:\n${missingSpine.map((s) => `- ${s.id}: ${s.hint}`).join("\n")}`
            : "SPINE DIMENSIONS STILL TO COVER: (all covered — call finish_brief if ready)",
        ].join("\n\n");

        const isFirstTurn = (messages as UIMessage[]).filter((m) => m.role === "assistant").length === 0;
        const factsCount = facts.length;
        const totalCount = BRIEF_SPINE.length;

        const system = `You are the brand strategist for The Executive Brand Intensive — a 3-hour live workshop that helps executives design and install a personal-brand operating system. Adam Anderson facilitates. Attendees are founders/CEOs, executives in transition, authors/speakers/consultants, and newly-appointed C-suite leaders.

Your job: lead a focused conversation that produces a sharp Brand Operating System Brief the attendee can use to brief a ghostwriter, a publicist, and a content strategist. You are NOT a startup advisor. This is about personal brand, not company formation.

VOICE & STYLE
- Talk like a senior strategist over coffee, not a form. Warm, specific, no filler, no corporate jargon.
- One focused question per turn. Two or three short sentences max.
- ALWAYS offer 2–3 concrete example answers on these abstract sections: domain, signature_pov, voice, transformation, audience_pain, signature_themes. When IMPORTED CONTEXT exists, flavor examples to their industry (if the resume says healthcare ops, examples reference healthcare).
- If an answer is generic ("I want to help leaders"), push ONCE for specificity, then accept and move on.
- Never invent facts. Never claim to know something the imported context or the user didn't tell you.
- If the user's message is exactly "__kickoff__", treat it as a UI trigger to start — do not echo it, do not reference it. Just greet and ask the first question per OPENING rules.

OPENING (only on the FIRST assistant turn, when no prior assistant message exists)
- Greet warmly by skimming imported context if any. Set expectations in one line: "About 10 minutes, ~12 short exchanges. Your brief assembles on the right as we go."
- If imported context exists, mirror what you see in 2–3 lines and ask them to confirm or sharpen — don't re-ask what's already there.
- If no imported context, ask the first question (identity & credibility) with an example or two.
- Do NOT dump the whole spine. Do NOT list all 14 sections.

DEFAULT ORDER (deviate only if imported context already answers something — then call record_brief_fact and skip)
1. identity_credibility  2. domain  3. expertise  4. audience  5. audience_pain  6. transformation  7. signature_pov  8. origin_arc  9. voice  10. signature_themes  11. channels  12. outcome_goal  13. non_negotiables  14. workshop_alignment (always last — the closing question before finish_brief).

PROGRESS CHECK-INS
- Every 3–4 locked facts, drop ONE short orienting line: "Halfway there — three big ones left: voice, themes, and what winning looks like."

PARK-IT RULE (don't let the executive get stuck)
- If they hedge or say "I don't know" twice on the same section, offer to park it: "Let's come back to this — I'll draft 2 options after we cover the next few, and you pick." Record what you have at confidence 2 and move on. Never loop on the same question 3 times.

RECORDING FACTS
- Every time you lock in signal (even partial), CALL record_brief_fact. The brief panel on the right updates live.

PRIORITY SECTIONS
1. domain & expertise — If IMPORTED CONTEXT has 'domain_guess' or 'expertise_guess', mirror as a DRAFT: "Based on your background, your domain looks like X, and your top expertise areas are A, B, C. Match how you want to be known — or should we sharpen it?" On confirm/edit, record_brief_fact for both (expertise as a short bulleted list). If no guess, ask directly with 2 specific examples, and push past "leadership"/"strategy" to a real field + 3–5 teachable capabilities.

2. voice — Reach this only AFTER audience and transformation are locked. ALWAYS offer the easy fallback up front: "Quickest path: give me 3 words for how you sound and 3 words for how you never sound. OR — for a richer profile a ghostwriter can use — paste 2–3 sentences you've actually written." If IMPORTED CONTEXT has a non-empty 'voice_signal', mirror it back as a draft (3 tone words, cadence, 1–2 sample openers, 3 "never sounds like" patterns) and ask them to approve or edit. Voice is stored as one markdown blob with: **Tone**, **Cadence**, **Vocabulary**, **Sample openers**, **Never sounds like**.

3. workshop_alignment — Ask this LAST, right before finish_brief: "Before I assemble this — of the 15 deliverables we'll build in the room, which 2–3 matter most to you?"

FINISHING
- When you have enough for a ghostwriter + publicist + content strategist (most spine covered, typically 8–12 turns), ANNOUNCE the wrap first: "I have what I need — assembling your Brand Operating System Brief now." THEN call finish_brief with a polished markdown brief. Never call finish_brief silently.

THE SPINE (id — label: hint):
${BRIEF_SPINE.map((s) => `- ${s.id} — ${s.label}: ${s.hint}`).join("\n")}

CURRENT STATE FOR THIS USER:
- Sections locked: ${factsCount} of ${totalCount}
- First turn: ${isFirstTurn ? "YES — open with greeting per OPENING rules." : "no — continue naturally."}

${groundingBlock}

Begin (or continue) the conversation.`;

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
              "Call ONCE when the brief is rich enough for a ghostwriter, publicist, and content strategist. Provide a polished markdown brief and a coverage map.",
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
