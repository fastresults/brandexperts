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
