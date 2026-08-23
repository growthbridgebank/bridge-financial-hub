import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { AuthShell } from "@/components/marketing/AuthShell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  identifier: z.string().trim().min(3, "Enter your username or email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

function LoginPage() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = schema.safeParse({
      identifier: String(form.get("identifier") ?? ""),
      password: String(form.get("password") ?? ""),
    });

    if (!result.success) {
      const next: Record<string, string> = {};
      for (const issue of result.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }

    setErrors({});
    toast.error("Authentication provider not connected", {
      description: "Sign-in becomes available once the secure authentication and database backend is enabled.",
    });
  }

  return (
    <AuthShell
      title="Sign in to GrowthBridge"
      subtitle="Use your username or email. Two-factor verification is requested when required."
      footer={
        <span>
          New to GBB?{" "}
          <Link to="/register" className="font-medium text-foreground underline underline-offset-4">
            Open an account
          </Link>
        </span>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <div className="space-y-2">
          <Label htmlFor="identifier">Username or email</Label>
          <Input id="identifier" name="identifier" autoComplete="username" aria-invalid={!!errors["identifier"]} />
          {errors["identifier"] && <p className="text-sm text-destructive">{errors["identifier"]}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" autoComplete="current-password" aria-invalid={!!errors["password"]} />
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

        <Button type="submit" className="w-full">
          Sign In
        </Button>
      </form>
    </AuthShell>
  );
}
