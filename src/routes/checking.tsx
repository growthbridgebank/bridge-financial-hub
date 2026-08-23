import { createFileRoute } from "@tanstack/react-router";
import { FeatureGrid, MarketingShell, PageHero, ProviderNotice } from "@/components/marketing/MarketingPage";

export const Route = createFileRoute("/checking")({
  head: () => ({
    meta: [
      { title: "GrowthBridge Checking | GBB" },
      {
        name: "description",
        content: "A modern checking experience with real-time transaction detail, card controls, and spending insights.",
      },
      { property: "og:title", content: "GrowthBridge Checking | GBB" },
      {
        property: "og:description",
        content: "Real-time transaction detail, card controls, and spending insights.",
      },
    ],
  }),
  component: CheckingPage,
});

function CheckingPage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Checking"
        title="GrowthBridge Checking"
        description="Everyday banking with masked account details, searchable transactions, and clear statuses at every step."
      />
      <FeatureGrid
        items={[
          { title: "Transaction clarity", description: "Pending, processing, completed, failed, reversed, cancelled." },
          { title: "Masked details", description: "Account and routing numbers are masked by default." },
          { title: "Transfers", description: "Move money between your GBB and eligible external accounts." },
          { title: "Bill pay", description: "Schedule billers and autopay through a connected payment provider." },
          { title: "Statements", description: "Download statements generated from actual account activity." },
          { title: "Insights", description: "Automatic categorization of eligible transactions." },
        ]}
      />
      <ProviderNotice provider="Deposit account, ACH, and bill payment" />
    </MarketingShell>
  );
}
