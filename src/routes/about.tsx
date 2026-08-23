import { createFileRoute } from "@tanstack/react-router";
import { MarketingShell, PageHero, Prose } from "@/components/marketing/MarketingPage";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About GrowthBridge Bank | GBB" },
      {
        name: "description",
        content: "Why GrowthBridge Bank exists: honest financial software that never overstates what it can do.",
      },
      { property: "og:title", content: "About GrowthBridge Bank | GBB" },
      { property: "og:description", content: "Honest financial software that never overstates what it can do." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Company"
        title="Building the bridge to your financial future"
        description="GrowthBridge Bank is an original financial technology brand built on transparency, auditability, and honest reporting."
      />
      <Prose>
        <div>
          <h2>Our approach</h2>
          <p>
            Most financial products hide complexity behind polished screens. GBB does the opposite: every balance,
            transaction, reward, and investment figure is traced to a source — a connected regulated provider or a
            clearly labeled test environment.
          </p>
        </div>
        <div>
          <h2>What we are</h2>
          <p>
            A technology platform that integrates banking-as-a-service, payments, card issuing, identity verification,
            account aggregation, and brokerage custody providers behind one coherent experience.
          </p>
        </div>
        <div>
          <h2>What we are not</h2>
          <ul>
            <li>Not a chartered bank and not FDIC insured.</li>
            <li>Not a Federal Reserve member and not affiliated with any government agency.</li>
            <li>Not a broker-dealer, investment adviser, SEC registrant, or FINRA member.</li>
          </ul>
        </div>
      </Prose>
    </MarketingShell>
  );
}
