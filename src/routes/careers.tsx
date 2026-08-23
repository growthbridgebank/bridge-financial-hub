import { createFileRoute } from "@tanstack/react-router";
import { MarketingShell, PageHero, Prose } from "@/components/marketing/MarketingPage";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "Careers | GrowthBridge Bank" },
      { name: "description", content: "Build honest financial infrastructure with the GrowthBridge Bank team." },
      { property: "og:title", content: "Careers | GrowthBridge Bank" },
      { property: "og:description", content: "Build honest financial infrastructure with the GBB team." },
    ],
  }),
  component: CareersPage,
});

function CareersPage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Careers"
        title="Work on financial infrastructure that tells the truth"
        description="We hire engineers, compliance specialists, designers, and support professionals who care about accuracy."
      />
      <Prose>
        <div>
          <h2>Open roles</h2>
          <p>
            We publish roles as teams open them. Send a short note and your work to{" "}
            <span className="font-medium text-foreground">careers@growthbridge.bank</span> and tell us what you would
            improve about modern banking software.
          </p>
        </div>
        <div>
          <h2>How we work</h2>
          <ul>
            <li>Documented decisions and auditable systems.</li>
            <li>Compliance involved from design, not after launch.</li>
            <li>No dark patterns, no invented numbers.</li>
          </ul>
        </div>
      </Prose>
    </MarketingShell>
  );
}
