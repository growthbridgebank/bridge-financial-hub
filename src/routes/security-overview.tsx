import { createFileRoute } from "@tanstack/react-router";
import { FeatureGrid, MarketingShell, PageHero } from "@/components/marketing/MarketingPage";

export const Route = createFileRoute("/security-overview")({
  head: () => ({
    meta: [
      { title: "Security at GrowthBridge Bank | GBB" },
      {
        name: "description",
        content:
          "Two-factor authentication, device management, session control, login alerts, and audited administrative access.",
      },
      { property: "og:title", content: "Security at GrowthBridge Bank | GBB" },
      { property: "og:description", content: "2FA, device management, session control, and audited admin access." },
    ],
  }),
  component: SecurityOverview,
});

function SecurityOverview() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Security"
        title="Security you can inspect"
        description="Your security posture is visible in the product: sessions, devices, alerts, and login history are always in your control."
      />
      <FeatureGrid
        items={[
          { title: "Two-factor authentication", description: "Required for sensitive actions and admin access." },
          { title: "Device management", description: "See trusted devices and revoke any of them." },
          { title: "Active sessions", description: "Sign out of other sessions immediately." },
          { title: "Login alerts", description: "Notifications for new device and location sign-ins." },
          { title: "Rate limiting & lockout", description: "Automated protection against credential attacks." },
          { title: "Audit logging", description: "Privileged actions are recorded and tamper-resistant." },
        ]}
      />
    </MarketingShell>
  );
}
