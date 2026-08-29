import type { ReactNode } from "react";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";

export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="bg-gradient-navy text-primary-foreground">
      <div className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">
          {eyebrow}
        </p>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
          {title}
        </h1>

        <p className="mt-5 max-w-2xl text-base text-primary-foreground/75 sm:text-lg">
          {description}
        </p>
      </div>
    </section>
  );
}

export function Prose({ children }: { children: ReactNode }) {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-14 sm:px-6">
      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_li]:mb-2 [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}

export function FeatureGrid({
  items,
}: {
  items: { title: string; description: string }[];
}) {
  return (
    <section className="mx-auto grid w-full max-w-4xl gap-4 px-4 pb-14 sm:grid-cols-2 sm:px-6">
      {items.map((item) => (
        <div
          key={item.title}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="font-semibold text-foreground">{item.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {item.description}
          </p>
        </div>
      ))}
    </section>
  );
}

export function ProviderNotice({
  title = "Connected provider required",
  description = "GrowthBridge Bank is a financial technology platform, not a chartered bank. Live balances, payments, and investing require a connected regulated partner institution.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
      <div className="rounded-xl border border-border bg-secondary/40 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
    </section>
  );
}
