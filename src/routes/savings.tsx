import { createFileRoute } from "@tanstack/react-router";
import { FeatureGrid, MarketingShell, PageHero } from "@/components/marketing/MarketingPage";

export const Route = createFileRoute("/savings")({
  head: () => ({
    meta: [
      { title: "GrowthBridge Savings | GBB" },
      {
        name: "description",
        content: "Goal-based savings with automatic contributions, progress tracking, and transparent rate disclosure.",
      },
      { property: "og:title", content: "GrowthBridge Savings | GBB" },
      {
        property: "og:description",
        content: "Goal-based savings with automatic contributions and progress tracking.",
      },
    ],
  }),
  component: SavingsPage,
});

function SavingsPage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Savings"
        title="GrowthBridge Savings"
        description="Set goals, automate contributions, and watch progress without guesswork or invented numbers."
      />
      <FeatureGrid
        items={[
          { title: "Savings goals", description: "Emergency fund, car, house, vacation, education, or custom." },
          { title: "Automatic savings", description: "Recurring transfers from checking on your schedule." },
          { title: "Progress tracking", description: "Target, current, percentage complete, and target date." },
          { title: "Two-way transfers", description: "Move funds to and from checking in a few taps." },
          { title: "Rate transparency", description: "Any APY shown comes from the connected deposit provider." },
          { title: "Full history", description: "Every contribution and withdrawal is recorded." },
        ]}
      />
      
    </MarketingShell>
  );
}
