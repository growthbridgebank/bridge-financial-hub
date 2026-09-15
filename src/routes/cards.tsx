import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, Eye, Settings2, Snowflake } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/dashboard/AppShell";
import { EmptyState, ListSkeleton, LoadError, Panel, SectionTitle } from "@/components/dashboard/pieces";
import { useRequireAuth } from "@/components/dashboard/useRequireAuth";
import { Button } from "@/components/ui/button";
import { useCustomerCards, useCustomerProfile } from "@/lib/customer-data";

export const Route = createFileRoute("/cards")({
  head: () => ({
    meta: [
      { title: "Cards | GrowthBridge Bank" },
      {
        name: "description",
        content: "View and manage your GrowthBridge debit cards securely, with sensitive details masked.",
      },
      { property: "og:title", content: "Cards | GrowthBridge Bank" },
      {
        property: "og:description",
        content: "Manage your GrowthBridge Bank cards: freeze, review and control them.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CardsPage,
});

function CardsPage() {
  const ready = useRequireAuth();
  const profile = useCustomerProfile();
  const cards = useCustomerCards();
  const [revealed, setRevealed] = useState<string | null>(null);

  if (!ready) return null;

  return (
    <AppShell firstName={profile.data?.first_name ?? undefined} title="Cards">
      <div className="space-y-6">
        <SectionTitle>My cards</SectionTitle>

        {cards.isError ? (
          <LoadError onRetry={() => void cards.refetch()} />
        ) : cards.isLoading ? (
          <Panel>
            <ListSkeleton rows={2} />
          </Panel>
        ) : (cards.data ?? []).length === 0 ? (
          <Panel>
            <EmptyState
              title="No card issued yet"
              description="Once a GrowthBridge card is issued to you it will appear here."
            />
          </Panel>
        ) : (
          <div className="space-y-4">
            {(cards.data ?? []).map((card) => (
              <div key={card.id} className="space-y-3">
                <div className="rounded-3xl bg-[var(--gradient-navy)] p-5 text-primary-foreground shadow-[var(--shadow-elevated)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.22em] text-gold">GBB</p>
                      <p className="mt-1 truncate font-display text-base font-semibold">
                        GBB Debit Card
                      </p>
                    </div>
                    <CreditCard className="size-6 shrink-0 text-gold" />
                  </div>

                  <p className="mt-6 font-mono text-lg tracking-[0.18em]">
                    {revealed === card.id && card.last4
                      ? `•••• •••• •••• ${card.last4}`
                      : "•••• •••• •••• ••••"}
                  </p>

                  <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
                    <p className="truncate text-sm font-medium">{card.cardholder_name}</p>
                    <p className="shrink-0 text-xs text-primary-foreground/80">
                      {card.exp_month && card.exp_year
                        ? `${String(card.exp_month).padStart(2, "0")}/${String(card.exp_year).slice(-2)}`
                        : "--/--"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <Button
                    variant="outline"
                    className="min-h-11"
                    onClick={() => setRevealed((value) => (value === card.id ? null : card.id))}
                  >
                    <Eye className="size-4" />
                    {revealed === card.id ? "Hide details" : "View details"}
                  </Button>
                  <Button
                    variant="outline"
                    className="min-h-11"
                    onClick={() =>
                      toast.info("Card freeze requires confirmation from our team", {
                        description: "Contact support and we will freeze this card immediately.",
                      })
                    }
                  >
                    <Snowflake className="size-4" />
                    Freeze card
                  </Button>
                  <Button
                    variant="outline"
                    className="min-h-11"
                    onClick={() =>
                      toast.info("Card management is not enabled on your account yet")
                    }
                  >
                    <Settings2 className="size-4" />
                    Manage card
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                  Status: {card.status.replace(/_/g, " ")}. Full card number, CVV and PIN are never shown
                  here.
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
