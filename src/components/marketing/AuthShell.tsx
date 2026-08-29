import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-gradient-navy p-10 text-primary-foreground lg:flex">
        <Logo variant="light" />
        <div>
          <h1 className="max-w-md text-4xl font-semibold leading-tight">Building Your Financial Future.</h1>
          <p className="mt-4 max-w-sm text-sm text-primary-foreground/70">
            Bank, save, invest, and manage your money with a modern financial platform designed around your goals.
          </p>
        </div>
      </div>

      <main className="flex flex-col justify-center bg-background px-4 py-12 sm:px-8">
        <div className="mx-auto w-full max-w-md">
          <div className="lg:hidden">
            <Logo />
          </div>
          <h1 className="mt-8 text-2xl font-semibold text-foreground lg:mt-0">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-8 text-sm text-muted-foreground">{footer}</div>
          <p className="mt-10 text-xs text-muted-foreground">
            By continuing you agree to the{" "}
            <Link to="/legal/terms" className="underline underline-offset-4 hover:text-foreground">
              Terms
            </Link>
            ,{" "}
            <Link to="/legal/privacy" className="underline underline-offset-4 hover:text-foreground">
              Privacy Policy
            </Link>
            , and{" "}
            <Link to="/legal/electronic-communications" className="underline underline-offset-4 hover:text-foreground">
              Electronic Communications Consent
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
