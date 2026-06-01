import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/login")({
  validateSearch: searchSchema,
  component: LoginPage,
  head: () => ({
    meta: [{ title: "Sign in — Atlanta Startup Workshop" }],
  }),
});

function LoginPage() {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const { redirect } = useSearch({ from: "/login" });
  const navigate = useNavigate();
  const safeRedirect = redirect && !redirect.startsWith("/login") && !redirect.startsWith("/signup") ? redirect : undefined;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      const fallback = isAdmin ? "/admin" : "/dashboard";
      navigate({ to: safeRedirect ?? fallback, replace: true });
    }
  }, [loading, isAuthenticated, isAdmin, safeRedirect, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) {
      setErrorMsg(error.message);
      toast.error(error.message);
      return;
    }
    setInfoMsg("Signed in. Redirecting…");
    toast.success("Signed in");
  };


  const handleGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/login",
    });
    if (result.error) {
      toast.error(result.error.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-white/10 bg-card p-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">Welcome back.</p>
        </div>

        <Button type="button" variant="outline" className="w-full" onClick={handleGoogle}>
          Continue with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">or</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <ForgotPasswordLink email={email} />
            </div>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {errorMsg && (
            <div role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errorMsg}
            </div>
          )}
          {infoMsg && (
            <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
              {infoMsg}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          No account?{" "}
          <Link to="/signup" className="text-foreground underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

function ForgotPasswordLink({ email }: { email: string }) {
  const [busy, setBusy] = useState(false);
  const handle = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      toast.error("Enter your email above first, then click Forgot?");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: window.location.origin + "/reset-password",
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success(`Reset link sent to ${trimmed}. Check your inbox (and spam).`);
  };
  return (
    <button
      type="button"
      onClick={handle}
      disabled={busy}
      className="text-xs text-muted-foreground underline disabled:opacity-50"
    >
      {busy ? "Sending…" : "Forgot?"}
    </button>
  );
}
