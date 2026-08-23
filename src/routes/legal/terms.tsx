import { createFileRoute } from "@tanstack/react-router";
import { MarketingShell, PageHero, Prose } from "@/components/marketing/MarketingPage";

export const Route = createFileRoute("/legal/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service | GrowthBridge Bank" },
      { name: "description", content: "The terms that govern your use of the GrowthBridge Bank platform." },
      { property: "og:title", content: "Terms of Service | GrowthBridge Bank" },
      { property: "og:description", content: "The terms that govern your use of the GBB platform." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Legal"
        title="Terms of Service"
        description="By opening a GrowthBridge Bank profile you agree to these terms and to the terms of any connected provider."
      />
      <Prose>
        <div>
          <h2>Eligibility</h2>
          <p>You must be of legal age in your jurisdiction and provide accurate information at account opening.</p>
        </div>
        <div>
          <h2>Nature of the service</h2>
          <p>
            GBB is a technology platform. Regulated financial services are provided by partner institutions under their
            own agreements, which control in the event of conflict.
          </p>
        </div>
        <div>
          <h2>Your responsibilities</h2>
          <ul>
            <li>Keep your credentials and second factor secure.</li>
            <li>Review activity and report anything unrecognized promptly.</li>
            <li>Use the platform only for lawful purposes.</li>
          </ul>
        </div>
        <div>
          <h2>Availability</h2>
          <p>
            Features that depend on a provider are unavailable when that provider is not connected or is experiencing an
            outage. Operations are never reported as successful before provider confirmation.
          </p>
        </div>
        <div>
          <h2>Termination</h2>
          <p>Either party may close the relationship subject to applicable law and outstanding obligations.</p>
        </div>
      </Prose>
    </MarketingShell>
  );
}
