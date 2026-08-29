import { createFileRoute } from "@tanstack/react-router";
import { FeatureGrid, MarketingShell, PageHero } from "@/components/marketing/MarketingPage";

export const Route = createFileRoute("/rewards-overview")({
  head: () => ({
    meta: [
      { title: "Cash Rewards | GrowthBridge Bank" },
      {
        name: "description",
        content: "GrowthBridge Rewards records cashback and partner offers on eligible transactions with a full ledger.",
      },
      { property: "og:title", content: "Cash Rewards | GrowthBridge Bank" },
      { property: "og:description", content: "Cashback and partner offers with a transparent rewards ledger." },
    ],
  }),
  component: RewardsOverview,
});

function RewardsOverview() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Rewards"
        title="GrowthBridge Rewards"
        description="Available, pending, lifetime, and redeemed rewards — each entry backed by a recorded reward transaction."
      />
      <FeatureGrid
        items={[
          { title: "Cashback", description: "Earned on eligible transactions once the card provider reports them." },
          { title: "Partner offers", description: "Shown only when a real merchant partner is configured." },
          { title: "Promotional rewards", description: "Time-bound campaigns managed by the admin portal." },
          { title: "Rewards history", description: "Every accrual, adjustment, and redemption is logged." },
          { title: "Redemption", description: "Redeem to an eligible GBB account." },
          { title: "Rewards terms", description: "Program rules published and versioned." },
        ]}
      />
      
    </MarketingShell>
  );
}
