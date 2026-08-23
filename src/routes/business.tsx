import { createFileRoute } from "@tanstack/react-router";
import { FeatureGrid, MarketingShell, PageHero, ProviderNotice } from "@/components/marketing/MarketingPage";

export const Route = createFileRoute("/business")({
  head: () => ({
    meta: [
      { title: "Business Banking | GrowthBridge Bank" },
      {
        name: "description",
        content:
          "Operating accounts, payables, team cards, and reporting for growing businesses on the GrowthBridge platform.",
      },
      { property: "og:title", content: "Business Banking | GrowthBridge Bank" },
      {
        property: "og:description",
        content: "Operating accounts, payables, team cards, and reporting for growing businesses.",
      },
    ],
  }),
  component: BusinessPage,
});

function BusinessPage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Business"
        title="Financial operations for growing companies"
        description="Run payables, cards, and reconciliation on a platform designed for auditability from day one."
      />
      <FeatureGrid
        items={[
          { title: "Operating accounts", description: "Segregated accounts with full transaction ledgers." },
          { title: "Team cards", description: "Issue, freeze, and control spend per employee." },
          { title: "Payables", description: "Scheduled bill payments with approval trails." },
          { title: "Reconciliation", description: "Exportable statements and categorized activity." },
          { title: "Roles & access", description: "Granular permissions with full audit logging." },
          { title: "Integrations", description: "Connect accounting and aggregation providers." },
        ]}
      />
      <ProviderNotice provider="Business banking, card issuing, and payables" />
    </MarketingShell>
  );
}
