import { createFileRoute } from "@tanstack/react-router";
import { MarketingShell, PageHero, Prose } from "@/components/marketing/MarketingPage";

export const Route = createFileRoute("/legal/disclosures")({
  head: () => ({
    meta: [
      { title: "Disclosures | GrowthBridge Bank" },
      {
        name: "description",
        content: "Regulatory status, fees, provider relationships, and account disclosures for GrowthBridge Bank.",
      },
      { property: "og:title", content: "Disclosures | GrowthBridge Bank" },
      { property: "og:description", content: "Regulatory status, fees, and provider relationships for GBB." },
    ],
  }),
  component: DisclosuresPage,
});

function DisclosuresPage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Legal"
        title="Disclosures"
        description="Plain statements about what GrowthBridge Bank is, what it is not, and how services are delivered."
      />
      <Prose>
        <div>
          <h2>Regulatory status</h2>
          <p>
            GrowthBridge Bank does not hold a bank charter and makes no claim of FDIC insurance, Federal Reserve
            membership, SEC registration, FINRA membership, or government affiliation. Any such status will be disclosed
            here only if and when the operating entity actually obtains it.
          </p>
        </div>
        <div>
          <h2>Provider relationships</h2>
          <p>
            Deposit accounts, ACH, card issuing, bill payment, identity verification, account aggregation, and brokerage
            custody are performed by third-party providers. Each provider must be contracted and connected before the
            related feature can process real money.
          </p>
        </div>
        <div>
          <h2>Rates and fees</h2>
          <p>
            Any interest rate, APY, or fee shown in the product originates from the connected provider's published
            schedule for your account. No rate is guaranteed or estimated by GBB.
          </p>
        </div>
        <div>
          <h2>Test environments</h2>
          <p>
            Development and sandbox environments are labeled explicitly. Test activity is never mixed with production
            financial records.
          </p>
        </div>
      </Prose>
    </MarketingShell>
  );
}
