import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText, Output } from "ai";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import {
  BRIEF_SPINE,
  BRIEF_SECTION_BY_ID,
  type AlignmentItem,
  type BriefAlignment,
  type BriefFact,
  type BriefSectionId,
  type BriefSummary,
} from "@/lib/brand-brief";
import { VALUE_ROWS } from "@/lib/value-grid";

const SECTION_IDS = BRIEF_SPINE.map((s) => s.id) as [BriefSectionId, ...BriefSectionId[]];
const SectionEnum = z.enum(SECTION_IDS);
const DELIVERABLE_KEYS = VALUE_ROWS.map((r) => r.key) as [string, ...string[]];
const DeliverableKeyEnum = z.enum(DELIVERABLE_KEYS);


// ----- Read -----

export const getBrandBrief = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const [factsRes, summaryRes] = await Promise.all([
      supabaseAdmin
        .from("attendee_brief_facts")
        .select("section, value, confidence, updated_at")
        .eq("user_id", userId),
      supabaseAdmin
        .from("attendee_brief_summary")
        .select("markdown, spine_coverage, completed_at, updated_at")
        .eq("user_id", userId)
        .maybeSingle(),
    ]);
    if (factsRes.error) throw new Error(factsRes.error.message);
    if (summaryRes.error) throw new Error(summaryRes.error.message);
    return {
      facts: (factsRes.data ?? []) as BriefFact[],
      summary: (summaryRes.data ?? null) as BriefSummary | null,
    };
  });

// ----- Inline edit from the live brief panel -----

const UpsertFactInput = z.object({
  section: SectionEnum,
  value: z.string().trim().max(2000),
  confidence: z.number().int().min(1).max(5).optional(),
});

export const upsertBrandBriefFact = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => UpsertFactInput.parse(i))
  .handler(async ({ context, data }) => {
    const { userId } = context;
    if (!data.value) {
      const { error } = await supabaseAdmin
        .from("attendee_brief_facts")
        .delete()
        .eq("user_id", userId)
        .eq("section", data.section);
      if (error) throw new Error(error.message);
      return { ok: true, deleted: true };
    }
    const { error } = await supabaseAdmin
      .from("attendee_brief_facts")
      .upsert(
        {
          user_id: userId,
          section: data.section,
          value: data.value,
          confidence: data.confidence ?? 4,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,section" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ----- Reopen for refinement -----

export const reopenBrandBrief = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { error } = await supabaseAdmin
      .from("attendee_brief_summary")
      .update({ completed_at: null })
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ----- Workshop alignment -----

const ALIGNMENT_MODEL = "google/gemini-3-flash-preview";

export const getBriefAlignment = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<BriefAlignment | null> => {
    const { userId } = context;
    const { data, error } = await supabaseAdmin
      .from("attendee_brief_alignment")
      .select("items, model, generated_at, updated_at")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    return {
      items: (data.items ?? []) as AlignmentItem[],
      model: data.model ?? null,
      generated_at: data.generated_at,
      updated_at: data.updated_at,
    };
  });

const AlignmentItemSchema = z.object({
  deliverable_key: DeliverableKeyEnum,
  application_text: z.string().min(20).max(800),
  anchored_sections: z.array(SectionEnum).min(1).max(6),
});

const AlignmentOutputSchema = z.object({
  items: z.array(AlignmentItemSchema).min(VALUE_ROWS.length).max(VALUE_ROWS.length),
});

export const regenerateBriefAlignment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<BriefAlignment> => {
    const { userId } = context;

    // Load the user's brief.
    const [factsRes, summaryRes] = await Promise.all([
      supabaseAdmin
        .from("attendee_brief_facts")
        .select("section, value, confidence")
        .eq("user_id", userId),
      supabaseAdmin
        .from("attendee_brief_summary")
        .select("markdown, completed_at")
        .eq("user_id", userId)
        .maybeSingle(),
    ]);
    if (factsRes.error) throw new Error(factsRes.error.message);
    if (summaryRes.error) throw new Error(summaryRes.error.message);

    const facts = (factsRes.data ?? []) as Array<Pick<BriefFact, "section" | "value" | "confidence">>;
    const summary = (summaryRes.data ?? null) as Pick<BriefSummary, "markdown" | "completed_at"> | null;
    if (facts.length === 0 && !summary?.markdown) {
      throw new Error("Finish your Brand Brief first so we have something to align to.");
    }

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

    const factsBlock = facts
      .map((f) => `- [${f.section}] ${BRIEF_SECTION_BY_ID[f.section as BriefSectionId]?.label ?? f.section}: ${f.value}`)
      .join("\n");
    const deliverablesBlock = VALUE_ROWS
      .map((r) => `- ${r.key} | Block: ${r.stageLabel} | ${r.deliverable}`)
      .join("\n");
    const sectionList = BRIEF_SPINE.map((s) => `${s.id} (${s.label})`).join(", ");

    const gateway = createLovableAiGatewayProvider(apiKey);
    const { output } = await generateText({
      model: gateway(ALIGNMENT_MODEL),
      output: Output.object({ schema: AlignmentOutputSchema }),
      system: [
        "You are a senior brand strategist for The Executive Brand Intensive.",
        "Given an executive's Brand Operating System brief, write how each of the workshop's 15 promised deliverables will be personalized for them.",
        "For every deliverable, write ONE tight paragraph (2–3 sentences, ≤ 60 words) addressed to the executive ('you', 'your').",
        "Ground every sentence in specifics from their brief — quote a phrase, name their audience, reference their POV, voice, or 12-month outcome.",
        "Do NOT invent facts. If a relevant section is missing, say what we'll lock down in the room.",
        "Then list 1–4 brief section IDs you anchored on (allowed: " + sectionList + ").",
        "Return all 15 items, one per deliverable_key, in the order given.",
      ].join("\n"),
      prompt: [
        "BRIEF SUMMARY (markdown):",
        summary?.markdown?.trim() || "(no summary yet)",
        "",
        "BRIEF FACTS:",
        factsBlock || "(no facts yet)",
        "",
        "DELIVERABLES TO ALIGN (use these deliverable_key values exactly):",
        deliverablesBlock,
      ].join("\n"),
    });

    // Merge AI output with canonical labels.
    const byKey = new Map(output.items.map((i) => [i.deliverable_key, i]));
    const items: AlignmentItem[] = VALUE_ROWS.map((row) => {
      const ai = byKey.get(row.key);
      return {
        deliverable_key: row.key,
        deliverable_label: row.deliverable,
        block_label: row.stageLabel,
        application_text:
          ai?.application_text?.trim() ||
          "We'll personalize this in the room using your brief.",
        anchored_sections: (ai?.anchored_sections ?? []) as BriefSectionId[],
      };
    });

    const nowIso = new Date().toISOString();
    const { error: upErr } = await supabaseAdmin
      .from("attendee_brief_alignment")
      .upsert(
        {
          user_id: userId,
          items,
          model: ALIGNMENT_MODEL,
          generated_at: nowIso,
          updated_at: nowIso,
        },
        { onConflict: "user_id" },
      );
    if (upErr) throw new Error(upErr.message);

    return { items, model: ALIGNMENT_MODEL, generated_at: nowIso, updated_at: nowIso };
  });
