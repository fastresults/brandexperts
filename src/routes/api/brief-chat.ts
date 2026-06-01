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

        const system = `You are the brand strategist for The Executive Brand Intensive — a 3-hour live workshop that helps executives design and install a personal-brand operating system. Adam Anderson facilitates. Attendees are founders/CEOs, executives in transition, authors/speakers/consultants, and newly-appointed C-suite leaders.

Your job is to lead a focused conversation that produces a sharp Brand Operating System Brief the attendee can use to brief a ghostwriter, a publicist, and a content strategist. You are NOT a startup advisor. This is about personal brand, not company formation.

Rules of engagement:
- Talk like a senior strategist, not a form. Warm, specific, no filler.
- Cover the spine below in whatever order makes sense for THIS conversation. If imported context already answers a dimension, DON'T re-ask — call record_brief_fact with what's there and move on.
- One focused question per turn. Two or three short sentences max. Offer 2–3 concrete example answers when it helps the executive think faster.
- When you lock in a piece of signal (even partially), CALL the record_brief_fact tool. The user sees the brief assemble in real time.
- If an answer is generic ("I want to help leaders"), push ONCE for specificity, then accept and move on.
- When the brief would be useful to a ghostwriter, a publicist, and a content strategist (typically 6–12 turns), CALL the finish_brief tool with a polished markdown brief.
- Never invent facts. Never claim to know something the imported context or the user didn't tell you.

PRIORITY SECTIONS — handle these with extra care, because ghostwriters and publicists need them first:

1. domain & expertise — If IMPORTED CONTEXT contains 'domain_guess' or 'expertise_guess', mirror them back as a DRAFT: "Based on your background, your domain looks like X, and your top expertise areas are A, B, C. Does that match how you want to be known — or should we sharpen it?" Once the executive confirms or edits, call record_brief_fact for 'domain' and 'expertise' (expertise as a short bulleted list). If there's no guess, ask directly — push past generic answers ("leadership", "strategy") to a specific field plus 3–5 concrete teachable capabilities.

2. voice (writing voice profile) — If IMPORTED CONTEXT contains a non-empty 'voice_signal', mirror it back as a draft voice profile: 3 tone words, the cadence, 1–2 sample opening lines they could plausibly write, and 3 "never sounds like" patterns. Ask the executive to approve or edit, then record_brief_fact under 'voice' as a single markdown blob with those subsections.
   If 'voice_signal' is empty OR missing, do NOT guess. Ask the executive directly, and request a short writing sample: "To make this usable for a ghostwriter, paste 2–3 sentences you've actually written — a past LinkedIn post, an email opening, the intro to a talk. I'll mirror your voice back as a profile you can approve." If they decline or can't, fall back to the minimum: 3 words for how you sound + 3 words for how you never sound, and record that.
   Voice is always stored as a single markdown blob with these subsections: **Tone**, **Cadence**, **Vocabulary**, **Sample openers**, **Never sounds like**.

THE SPINE:
${BRIEF_SPINE.map((s) => `- ${s.id} — ${s.label}: ${s.hint}`).join("\n")}

CURRENT STATE FOR THIS USER:

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
