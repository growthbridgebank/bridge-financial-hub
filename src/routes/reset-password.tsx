import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { AuthShell } from "@/components/marketing/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a New Password | GrowthBridge Bank" },
      { name: "description", content: "Choose a new password for your GrowthBridge Bank account." },
      { property: "og:title", content: "Set a New Password | GrowthBridge Bank" },
      { property: "og:description", content: "Choose a new password for your GBB account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

const schema = z
  .object({
    password: z
      .string()
      .min(12, "Use at least 12 characters")
      .max(128)
      .regex(/[A-Z]/, "Include an uppercase letter")
      .regex(/[a-z]/, "Include a lowercase letter")
      .regex(/[0-9]/, "Include a number")
      .regex(/[^A-Za-z0-9]/, "Include a symbol"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

function ResetPasswordPage() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = schema.safeParse({
      password: String(form.get("password") ?? ""),
      confirmPassword: String(form.get("confirmPassword") ?? ""),
    });
    if (!result.success) {
      const next: Record<string, string> = {};
      for (const issue of result.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password: result.data.password });
    setSubmitting(false);
    if (error) {
      toast.error("Could not update password", { description: error.message });
      return;
    }
    toast.success("Password updated");
    void navigate({ to: "/dashboard" });
  }

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose a strong password you have not used on another service."
      footer={<span>Password changes are recorded in your security activity log.</span>}
    >
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input id="password" name="password" type="password" autoComplete="new-password" aria-invalid={!!errors["password"]} />
          {errors["password"] && <p className="text-sm text-destructive">{errors["password"]}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors["confirmPassword"]}
          />
          {errors["confirmPassword"] && <p className="text-sm text-destructive">{errors["confirmPassword"]}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Updating…" : "Update password"}
        </Button>
      </form>
    </AuthShell>
  );
}
