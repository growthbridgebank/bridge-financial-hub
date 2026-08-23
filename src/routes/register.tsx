import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { AuthShell } from "@/components/marketing/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Open an Account | GrowthBridge Bank" },
      {
        name: "description",
        content: "Open a GrowthBridge Bank account. Identity verification is completed by a regulated KYC provider.",
      },
      { property: "og:title", content: "Open an Account | GrowthBridge Bank" },
      { property: "og:description", content: "Open a GBB account with verification handled by a regulated provider." },
    ],
  }),
  component: RegisterPage,
});

const schema = z
  .object({
    firstName: z.string().trim().min(1, "Required").max(60),
    lastName: z.string().trim().min(1, "Required").max(60),
    email: z.string().trim().email("Enter a valid email").max(255),
    phone: z.string().trim().min(7, "Enter a valid phone number").max(20),
    dob: z.string().min(1, "Required"),
    address: z.string().trim().min(3, "Required").max(160),
    city: z.string().trim().min(1, "Required").max(80),
    state: z.string().trim().min(1, "Required").max(60),
    zip: z.string().trim().min(3, "Required").max(12),
    country: z.string().trim().min(2, "Required").max(60),
    username: z.string().trim().min(4, "At least 4 characters").max(32),
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
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

const FIELDS: { name: keyof z.infer<typeof schema>; label: string; type?: string; autoComplete?: string; half?: boolean }[] = [
  { name: "firstName", label: "First name", autoComplete: "given-name", half: true },
  { name: "lastName", label: "Last name", autoComplete: "family-name", half: true },
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
  { name: "phone", label: "Phone", type: "tel", autoComplete: "tel", half: true },
  { name: "dob", label: "Date of birth", type: "date", autoComplete: "bday", half: true },
  { name: "address", label: "Address", autoComplete: "street-address" },
  { name: "city", label: "City", autoComplete: "address-level2", half: true },
  { name: "state", label: "State / Region", autoComplete: "address-level1", half: true },
  { name: "zip", label: "ZIP / Postal code", autoComplete: "postal-code", half: true },
  { name: "country", label: "Country", autoComplete: "country-name", half: true },
  { name: "username", label: "Username", autoComplete: "username" },
  { name: "password", label: "Password", type: "password", autoComplete: "new-password", half: true },
  { name: "confirmPassword", label: "Confirm password", type: "password", autoComplete: "new-password", half: true },
];

function RegisterPage() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const values = Object.fromEntries(FIELDS.map((field) => [field.name, String(form.get(field.name) ?? "")]));
    const result = schema.safeParse(values);

    if (!result.success) {
      const next: Record<string, string> = {};
      for (const issue of result.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }

    setErrors({});
    toast.error("Account opening provider not connected", {
      description:
        "Registration, email/phone verification, and KYC activate once the authentication, email, SMS, and identity providers are configured.",
    });
  }

  return (
    <AuthShell
      title="Open a GrowthBridge account"
      subtitle="Your details are verified by a regulated identity provider before any account is marked verified."
      footer={
        <span>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-foreground underline underline-offset-4">
            Sign in
          </Link>
        </span>
      }
    >
      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-5 sm:grid-cols-2" noValidate>
        {FIELDS.map((field) => (
          <div key={field.name} className={field.half ? "space-y-2" : "space-y-2 sm:col-span-2"}>
            <Label htmlFor={field.name}>{field.label}</Label>
            <Input
              id={field.name}
              name={field.name}
              type={field.type ?? "text"}
              autoComplete={field.autoComplete ?? "off"}
              aria-invalid={!!errors[field.name]}
            />
            {errors[field.name] && <p className="text-sm text-destructive">{errors[field.name]}</p>}
          </div>
        ))}

        <p className="rounded-lg border border-border bg-muted/60 p-3 text-xs text-muted-foreground sm:col-span-2">
          Your account status stays <strong className="font-semibold text-foreground">Pending verification</strong> until
          the configured identity-verification provider confirms your identity.
        </p>

        <Button type="submit" className="w-full sm:col-span-2">
          Open an Account
        </Button>
      </form>
    </AuthShell>
  );
}
