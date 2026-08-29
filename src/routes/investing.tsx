import { createFileRoute } from "@tanstack/react-router";
import { FeatureGrid, MarketingShell, PageHero } from "@/components/marketing/MarketingPage";

export const Route = createFileRoute("/investing")({
  head: () => ({
    meta: [
      { title: "GrowthBridge Investments | GBB" },
      {
        name: "description",
        content:
          "Track portfolios, holdings, and performance through a connected brokerage custodian. Investing involves risk.",
      },
      { property: "og:title", content: "GrowthBridge Investments | GBB" },
      {
        property: "og:description",
        content: "Portfolios, holdings, and performance through a connected brokerage custodian.",
      },
    ],
  }),
  component: InvestingPage,
});

function InvestingPage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Investing"
        title="GrowthBridge Investments"
        description="A clear view of portfolio value, holdings, and performance — sourced from your connected custodian, never simulated as real."
      />
      <FeatureGrid
        items={[
          { title: "Portfolio view", description: "Value, today's change, total return, and cash available." },
          { title: "Holdings", description: "Stocks, ETFs, bonds, and cash positions." },
          { title: "Risk profile", description: "Conservative to aggressive questionnaire guidance." },
          { title: "Watchlist", description: "Follow securities you are researching." },
          { title: "Investment goals", description: "Tie contributions to long-term objectives." },
          { title: "Education", description: "Plain-language explanations of products and risk." },
        ]}
      />
      <div className="mx-auto w-full max-w-4xl px-4 pb-6 sm:px-6">
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-foreground">
          Investing involves risk, including possible loss of principal. Past performance does not guarantee future
          results. GrowthBridge Bank is not a broker-dealer, investment adviser, SEC registrant, or FINRA member.
        </p>
      </div>
      
    </MarketingShell>
  );
}
