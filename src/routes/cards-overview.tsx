import { createFileRoute } from "@tanstack/react-router";
import { FeatureGrid, MarketingShell, PageHero, ProviderNotice } from "@/components/marketing/MarketingPage";

export const Route = createFileRoute("/cards-overview")({
  head: () => ({
    meta: [
      { title: "GrowthBridge Debit Card | GBB" },
      {
        name: "description",
        content: "A premium GBB debit card with instant freeze, replacement, and controls. Full card numbers never shown.",
      },
      { property: "og:title", content: "GrowthBridge Debit Card | GBB" },
      { property: "og:description", content: "Instant freeze, replacement, and controls on your GBB debit card." },
    ],
  }),
  component: CardsOverview,
});

function CardsOverview() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Cards"
        title="The GrowthBridge Debit Card"
        description="Designed in navy and gold, controlled entirely from your dashboard, and issued through a licensed card provider."
      />
      <FeatureGrid
        items={[
          { title: "Freeze instantly", description: "Lock and unlock your card in one tap." },
          { title: "Report and replace", description: "Report loss or fraud and request a replacement." },
          { title: "Privacy first", description: "Only the last four digits are ever displayed." },
          { title: "Spend controls", description: "Category and channel limits where the issuer supports them." },
          { title: "Real-time alerts", description: "Card notifications for every authorization." },
          { title: "Rewards linked", description: "Eligible purchases feed your rewards ledger." },
        ]}
      />
      <ProviderNotice provider="Card issuing and transaction processing" />
    </MarketingShell>
  );
}
