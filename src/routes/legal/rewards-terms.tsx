import { createFileRoute } from "@tanstack/react-router";
import { MarketingShell, PageHero, Prose } from "@/components/marketing/MarketingPage";

export const Route = createFileRoute("/legal/rewards-terms")({
  head: () => ({
    meta: [
      { title: "Rewards Terms | GrowthBridge Bank" },
      { name: "description", content: "Program rules for earning, holding, and redeeming GrowthBridge Rewards." },
      { property: "og:title", content: "Rewards Terms | GrowthBridge Bank" },
      { property: "og:description", content: "Rules for earning, holding, and redeeming GrowthBridge Rewards." },
    ],
  }),
  component: RewardsTermsPage,
});

function RewardsTermsPage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Legal"
        title="Rewards Terms"
        description="How rewards are earned, held, adjusted, and redeemed on the GrowthBridge platform."
      />
      <Prose>
        <div>
          <h2>Earning</h2>
          <p>
            Rewards accrue only on eligible settled transactions reported by the connected card or payment provider.
            Pending rewards are shown separately and may be reversed if the underlying transaction is reversed.
          </p>
        </div>
        <div>
          <h2>Partner offers</h2>
          <p>
            Merchant offers appear only when an actual partner agreement is configured. GBB does not display
            unconfirmed or fictitious merchant partnerships.
          </p>
        </div>
        <div>
          <h2>Redemption</h2>
          <p>
            Redemptions post to an eligible GBB account and are recorded as reward transactions with a reference
            identifier.
          </p>
        </div>
        <div>
          <h2>Adjustments</h2>
          <p>
            Manual adjustments require an authorized administrator, a stated reason, and an audit record. Abuse of the
            program may result in forfeiture.
          </p>
        </div>
      </Prose>
    </MarketingShell>
  );
}
