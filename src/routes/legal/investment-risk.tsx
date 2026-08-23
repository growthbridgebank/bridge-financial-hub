import { createFileRoute } from "@tanstack/react-router";
import { MarketingShell, PageHero, Prose } from "@/components/marketing/MarketingPage";

export const Route = createFileRoute("/legal/investment-risk")({
  head: () => ({
    meta: [
      { title: "Investment Risk Disclosure | GrowthBridge Bank" },
      {
        name: "description",
        content: "Investing involves risk, including possible loss of principal. Read the GBB investment risk disclosure.",
      },
      { property: "og:title", content: "Investment Risk Disclosure | GrowthBridge Bank" },
      { property: "og:description", content: "Investing involves risk, including possible loss of principal." },
    ],
  }),
  component: RiskPage,
});

function RiskPage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Legal"
        title="Investment Risk Disclosure"
        description="Please read this before using any investment feature on the GrowthBridge platform."
      />
      <Prose>
        <div>
          <h2>Risk of loss</h2>
          <p>
            Investing involves risk, including the possible loss of principal. The value of stocks, ETFs, and bonds
            fluctuates and you may receive less than you invested.
          </p>
        </div>
        <div>
          <h2>No guarantees</h2>
          <p>
            GrowthBridge Bank does not guarantee any return, income, or performance outcome. Past performance does not
            predict future results, and projections are illustrative only.
          </p>
        </div>
        <div>
          <h2>Not insured</h2>
          <p>Investments are not bank deposits and are not FDIC insured.</p>
        </div>
        <div>
          <h2>No advice</h2>
          <p>
            GBB is not a broker-dealer or investment adviser. Risk questionnaires and educational content are
            informational and do not constitute personalized investment advice. Execution and custody are performed by a
            connected licensed provider.
          </p>
        </div>
      </Prose>
    </MarketingShell>
  );
}
