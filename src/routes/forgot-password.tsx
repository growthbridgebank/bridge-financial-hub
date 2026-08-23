import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { AuthShell } from "@/components/marketing/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset Password | GrowthBridge Bank" },
      { name: "description", content: "Request a secure password reset link for your GrowthBridge Bank account." },
      { property: "og:title", content: "Reset Password | GrowthBridge Bank" },
      { property: "og:description", content: "Request a secure password reset link for your GBB account." },
    ],
  }),
  component: ForgotPasswordPage,
});

const schema = z.object({ email: z.string().trim().email("Enter a valid email address").max(255) });

function ForgotPasswordPage() {
  const [error, setError] = useState("");

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "");
    const result = schema.safeParse({ email });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Invalid email");
      return;
    }
    setError("");
    toast.error("Email provider not connected", {
      description: "Password reset emails send once the authentication and email providers are configured.",
    });
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll email a secure, time-limited reset link to the address on your account."
      footer={
        <Link to="/login" className="font-medium text-foreground underline underline-offset-4">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input id="email" name="email" type="email" autoComplete="email" aria-invalid={!!error} />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <Button type="submit" className="w-full">
          Send reset link
        </Button>
      </form>
    </AuthShell>
  );
}
