import { createFileRoute } from "@tanstack/react-router";
import { MarketingShell, PageHero, Prose } from "@/components/marketing/MarketingPage";

export const Route = createFileRoute("/legal/electronic-communications")({
  head: () => ({
    meta: [
      { title: "Electronic Communications Consent | GrowthBridge Bank" },
      {
        name: "description",
        content: "Consent to receive statements, disclosures, and notices electronically from GrowthBridge Bank.",
      },
      { property: "og:title", content: "Electronic Communications Consent | GrowthBridge Bank" },
      { property: "og:description", content: "Consent to receive statements and notices electronically from GBB." },
    ],
  }),
  component: EcommsPage,
});

function EcommsPage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Legal"
        title="Electronic Communications Consent"
        description="Opening a GrowthBridge profile includes consenting to electronic delivery of account documents."
      />
      <Prose>
        <div>
          <h2>Scope</h2>
          <p>
            Statements, disclosures, tax documents where applicable, security alerts, and service notices may be
            delivered electronically through the app, email, or SMS.
          </p>
        </div>
        <div>
          <h2>System requirements</h2>
          <p>A current browser or mobile device, a valid email address, and the ability to view and save PDF files.</p>
        </div>
        <div>
          <h2>Withdrawing consent</h2>
          <p>
            You may withdraw consent in notification preferences. Some services may become unavailable if electronic
            delivery is not accepted.
          </p>
        </div>
        <div>
          <h2>Keeping details current</h2>
          <p>Update your email and phone number in settings so we can reach you about security and account activity.</p>
        </div>
      </Prose>
    </MarketingShell>
  );
}
