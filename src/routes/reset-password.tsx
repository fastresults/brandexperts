import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
  head: () => ({ meta: [{ title: "Reset password" }] }),
});

type Status = "checking" | "ready" | "invalid";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<Status>("checking");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Supabase puts recovery tokens in the URL hash and fires a PASSWORD_RECOVERY event
  // once the client picks them up. Wait for that (or an existing session) before
  // showing the form, so users with broken/expired links see a clear message.
  useEffect(() => {
    let resolved = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        resolved = true;
        setStatus("ready");
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (resolved) return;
      if (data.session) setStatus("ready");
    });

    const timeout = setTimeout(() => {
      if (!resolved) {
        supabase.auth.getSession().then(({ data }) => {
          setStatus(data.session ? "ready" : "invalid");
        });
      }
    }, 1500);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (error) {
      setErrorMsg(error.message);
      toast.error(error.message);
      return;
    }
    toast.success("Password updated. Please sign in.");
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-4 rounded-2xl border border-white/10 bg-card p-8">
        <h1 className="text-xl font-semibold">Set a new password</h1>

        {status === "checking" && (
          <p className="text-sm text-muted-foreground">Verifying your reset link…</p>
        )}

        {status === "invalid" && (
          <div className="space-y-3">
            <div role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              This reset link is invalid or has expired. Request a new one from the sign-in page.
            </div>
            <Link to="/login" className="inline-block text-sm underline">
              Back to sign in
            </Link>
          </div>
        )}

        {status === "ready" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {errorMsg && (
              <div role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {errorMsg}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Saving..." : "Update password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
