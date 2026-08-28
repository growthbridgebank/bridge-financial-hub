import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { AuthShell } from "@/components/marketing/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset Password | GrowthBridge Bank" },
      {
        name: "description",
        content:
          "Request a secure password reset link for your GrowthBridge Bank account.",
      },
      {
        property: "og:title",
        content: "Reset Password | GrowthBridge Bank",
      },
      {
        property: "og:description",
        content:
          "Request a secure password reset link for your GBB account.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ForgotPasswordPage,
});

const schema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .max(255),
});

function ForgotPasswordPage() {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const result = schema.safeParse({
      email: String(form.get("email") ?? ""),
    });

    if (!result.success) {
      setError(
        result.error.issues[0]?.message ?? "Invalid email address",
      );
      return;
    }

    setError("");
    setSubmitting(true);

    const { error: resetError } =
      await supabase.auth.resetPasswordForEmail(
        result.data.email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        },
      );

    setSubmitting(false);

    if (resetError) {
      toast.error("Could not send reset link", {
        description: resetError.message,
      });
      return;
    }

    setSent(true);

    toast.success("Reset link sent", {
      description:
        "Check your email for instructions to create a new password.",
    });
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll email a secure, time-limited reset link to the address on your account."
      footer={
        <Link
          to="/login"
          className="font-medium text-foreground underline underline-offset-4"
        >
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <div className="space-y-6 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-secondary">
            <span className="text-2xl">✓</span>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Check your email
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              If an account exists for that email address, we've
              sent a password reset link.
            </p>
          </div>

          <Button
            type="button"
            className="w-full"
            onClick={() => setSent(false)}
          >
            Send another link
          </Button>
        </div>
      ) : (
        <form
          onSubmit={onSubmit}
          className="space-y-5"
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>

            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={!!error}
              disabled={submitting}
            />

            {error && (
              <p className="text-sm text-destructive">
                {error}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={submitting}
          >
            {submitting ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
