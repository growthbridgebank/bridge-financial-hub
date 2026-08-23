import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageSquare, Phone } from "lucide-react";
import { MarketingShell, PageHero } from "@/components/marketing/MarketingPage";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact GrowthBridge Bank | GBB" },
      { name: "description", content: "Reach the GrowthBridge Bank support team by email, phone, or secure message." },
      { property: "og:title", content: "Contact GrowthBridge Bank | GBB" },
      { property: "og:description", content: "Reach GBB support by email, phone, or secure message." },
    ],
  }),
  component: ContactPage,
});

const CHANNELS = [
  { icon: Mail, title: "Email", value: "support@growthbridge.bank", note: "Replies within one business day." },
  { icon: Phone, title: "Phone", value: "1-800-000-0000", note: "Available once telephony provider is connected." },
  { icon: MessageSquare, title: "Secure message", value: "Open a ticket in your account", note: "Best for account-specific questions." },
];

function ContactPage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Contact"
        title="Talk to a human"
        description="Account-specific questions are handled inside your secure GBB account so your information stays protected."
      />
      <section className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-14 sm:grid-cols-3 sm:px-6">
        {CHANNELS.map(({ icon: Icon, title, value, note }) => (
          <article key={title} className="rounded-xl border border-border bg-card p-6 shadow-card">
            <Icon className="size-6 text-gold" aria-hidden="true" />
            <h2 className="mt-4 font-display text-lg font-semibold text-foreground">{title}</h2>
            <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
            <p className="mt-2 text-sm text-muted-foreground">{note}</p>
          </article>
        ))}
      </section>
    </MarketingShell>
  );
}
