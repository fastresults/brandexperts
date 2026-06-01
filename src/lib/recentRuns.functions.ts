import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Recent run/step status for the live activity feed (AIWorklogPill).
// Kept in its own small module so the dev server's serverFn ID resolver
// can load it without pulling in the rest of userPipeline.functions.ts.
export const getMyRecentRuns = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: runs } = await supabase
      .from("ai_pipeline_runs")
      .select("id,status,started_at,finished_at,options")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);
    const ids = (runs ?? []).map((r) => r.id);
    const { data: steps } = ids.length
      ? await supabase
          .from("ai_pipeline_steps")
          .select("run_id,deliverable_key,status,error,started_at,finished_at")
          .in("run_id", ids)
          .order("created_at", { ascending: false })
      : { data: [] };
    return { runs: runs ?? [], steps: steps ?? [] };
  });
