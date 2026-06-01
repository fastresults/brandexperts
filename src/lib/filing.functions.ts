import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const FilingInput = z.object({
  legal_first_name: z.string().trim().max(120).optional().nullable(),
  legal_last_name: z.string().trim().max(120).optional().nullable(),
  dob: z.string().date().optional().nullable(),
  ssn_last4: z.string().trim().regex(/^\d{4}$/).optional().nullable(),
  ssn_full: z.string().trim().regex(/^\d{9}$/).optional().nullable(),
  address_line1: z.string().trim().max(200).optional().nullable(),
  address_line2: z.string().trim().max(200).optional().nullable(),
  city: z.string().trim().max(120).optional().nullable(),
  state: z.string().trim().max(60).optional().nullable(),
  postal_code: z.string().trim().max(20).optional().nullable(),
  country: z.string().trim().max(60).optional().nullable(),
  llc_name: z.string().trim().max(200).optional().nullable(),
  registered_agent_name: z.string().trim().max(200).optional().nullable(),
  registered_agent_address: z.string().trim().max(300).optional().nullable(),
  business_purpose: z.string().trim().max(2000).optional().nullable(),
});

// Strip `ssn_full` before returning to the client — only `ssn_last4` is exposed
// for display. The full SSN is write-only via updateMyFiling.
function redactFiling<T extends Record<string, any> | null>(row: T): T {
  if (!row) return row;
  const { ssn_full: _omit, ...rest } = row as Record<string, any>;
  return rest as T;
}

export const getMyFiling = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("attendee_filing_info")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) {
      const { data: ins, error: insErr } = await supabase
        .from("attendee_filing_info")
        .insert({ user_id: userId })
        .select("*")
        .single();
      if (insErr) throw new Error(insErr.message);
      return { filing: redactFiling(ins) };
    }
    return { filing: redactFiling(data) };
  });

export const updateMyFiling = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => FilingInput.parse(i))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    // Auto-derive ssn_last4 if full provided
    const patch: Record<string, unknown> = { ...data };
    if (data.ssn_full && !data.ssn_last4) {
      patch.ssn_last4 = data.ssn_full.slice(-4);
    }
    const { error } = await supabase
      .from("attendee_filing_info")
      .upsert({ user_id: userId, ...patch }, { onConflict: "user_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
