import { createFileRoute } from "@tanstack/react-router";
import { FeatureGrid, MarketingShell, PageHero } from "@/components/marketing/MarketingPage";

export const Route = createFileRoute("/personal")({
  head: () => ({
    meta: [
      { title: "Personal Banking | GrowthBridge Bank" },
      {
        name: "description",
        content:
          "Everyday checking, high-yield savings, cards, rewards, and investing in one GrowthBridge Bank account.",
      },
      { property: "og:title", content: "Personal Banking | GrowthBridge Bank" },
      {
        property: "og:description",
        content: "Everyday checking, savings, cards, rewards, and investing in one GrowthBridge account.",
      },
    ],
  }),
  component: PersonalPage,
});

function PersonalPage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Personal"
        title="Money management built around your goals"
        description="One GrowthBridge profile brings your spending, saving, investing, and rewards together with clear, honest reporting."
      />
      <FeatureGrid
        items={[
          { title: "GrowthBridge Checking", description: "Everyday spending with insights, alerts, and card controls." },
          { title: "GrowthBridge Savings", description: "Goal-based savings with automatic contributions." },
          { title: "Investing", description: "Portfolio tracking through a connected brokerage custodian." },
          { title: "Cash Rewards", description: "Earn on eligible transactions recorded to your rewards ledger." },
          { title: "Spending Insights", description: "Categorized transactions and month-over-month trends." },
          { title: "Security Center", description: "2FA, device management, sessions, and login history." },
        ]}
      />
    </MarketingShell>
  );
}
