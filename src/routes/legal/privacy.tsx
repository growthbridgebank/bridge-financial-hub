import { createFileRoute } from "@tanstack/react-router";
import { MarketingShell, PageHero, Prose } from "@/components/marketing/MarketingPage";

export const Route = createFileRoute("/legal/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | GrowthBridge Bank" },
      { name: "description", content: "How GrowthBridge Bank collects, uses, protects, and shares your information." },
      { property: "og:title", content: "Privacy Policy | GrowthBridge Bank" },
      { property: "og:description", content: "How GBB collects, uses, protects, and shares your information." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        description="This policy explains what GrowthBridge Bank collects, why, and the controls you have over your data."
      />
      <Prose>
        <div>
          <h2>Information we collect</h2>
          <ul>
            <li>Identity and contact details you provide at account opening.</li>
            <li>Verification data processed by our identity-verification provider.</li>
            <li>Account, transaction, and device information generated as you use GBB.</li>
          </ul>
        </div>
        <div>
          <h2>How we use it</h2>
          <p>
            To operate your accounts, prevent fraud, meet legal obligations, and improve the product. We do not sell
            personal information.
          </p>
        </div>
        <div>
          <h2>Sharing</h2>
          <p>
            We share only what is necessary with the regulated providers that deliver banking, payment, card, brokerage,
            verification, email, and SMS services, and with authorities where legally required.
          </p>
        </div>
        <div>
          <h2>Your controls</h2>
          <ul>
            <li>Access and correct your profile information in settings.</li>
            <li>Disconnect external accounts at any time.</li>
            <li>Request deletion subject to financial recordkeeping requirements.</li>
          </ul>
        </div>
        <div>
          <h2>Security</h2>
          <p>
            Passwords are stored using strong one-way hashing. Sensitive credentials are never stored in the browser and
            secrets are never exposed to frontend code.
          </p>
        </div>
      </Prose>
    </MarketingShell>
  );
}
