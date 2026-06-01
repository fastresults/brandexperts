import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { fetchMyRecentRuns } from "./recentRuns.server";

// Recent run/step status for the live activity feed (AIWorklogPill).
// Kept in its own small module so the dev server's serverFn ID resolver
// can load it without pulling in the rest of userPipeline.functions.ts.
export const getMyRecentRuns = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    return fetchMyRecentRuns(supabase, userId);
  });
