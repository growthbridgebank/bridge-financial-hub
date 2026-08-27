import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { AuthShell } from "@/components/marketing/AuthShell";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In | GrowthBridge Bank" },
      { name: "description", content: "Sign in securely to your GrowthBridge Bank account with two-factor protection." },
      { property: "og:title", content: "Sign In | GrowthBridge Bank" },
      { property: "og:description", content: "Sign in securely to your GBB account with two-factor protection." },
    ],
  }),
  component: LoginPage,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

function LoginPage() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = schema.safeParse({
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    });

    if (!result.success) {
      const next: Record<string, string> = {};
      for (const issue of result.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }

    setErrors({});
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: result.data.email,
      password: result.data.password,
    });
    setSubmitting(false);

    if (error) {
      toast.error("Could not sign in", { description: error.message });
      return;
    }
    toast.success("Welcome back to GrowthBridge");
    void navigate({ to: "/dashboard" });
  }

  return (
    <AuthShell
      title="Sign in to GrowthBridge"
      subtitle="Access your accounts, transfers, and insights securely."
      footer={
        <span>
          New to GBB?{" "}
          <Link to="/register" className="font-medium text-foreground underline underline-offset-4">
            Open an account
          </Link>
        </span>
      }
    >
      <div className="space-y-6">
        <GoogleButton label="Continue with Google" />

        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs uppercase tracking-wider text-muted-foreground">or</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" aria-invalid={!!errors["email"]} />
            {errors["email"] && <p className="text-sm text-destructive">{errors["email"]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={!!errors["password"]}
            />
            {errors["password"] && <p className="text-sm text-destructive">{errors["password"]}</p>}
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Checkbox id="remember" name="remember" />
              <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">
                Remember this device
              </Label>
            </div>
            <Link to="/forgot-password" className="text-sm font-medium text-foreground underline underline-offset-4">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign In"}
          </Button>
        </form>
      </div>
    </AuthShell>
  );
}
