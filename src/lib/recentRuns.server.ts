type QueryClientLike = {
  from: (table: string) => {
    select: (columns: string) => any;
  };
};

export async function fetchMyRecentRuns(supabase: QueryClientLike, userId: string) {
  const { data: runs, error: runsError } = await supabase
    .from("ai_pipeline_runs")
    .select("id,status,started_at,finished_at,options")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5);

  if (runsError) {
    throw new Error(runsError.message);
  }

  const ids = (runs ?? []).map((run: { id: string }) => run.id);

  if (!ids.length) {
    return { runs: runs ?? [], steps: [] as Array<Record<string, unknown>> };
  }

  const { data: steps, error: stepsError } = await supabase
    .from("ai_pipeline_steps")
    .select("run_id,deliverable_key,status,error,started_at,finished_at")
    .in("run_id", ids)
    .order("created_at", { ascending: false });

  if (stepsError) {
    throw new Error(stepsError.message);
  }

  return { runs: runs ?? [], steps: steps ?? [] };
}