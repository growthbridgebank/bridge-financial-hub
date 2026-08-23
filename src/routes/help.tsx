import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingShell, PageHero } from "@/components/marketing/MarketingPage";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help Center | GrowthBridge Bank" },
      {
        name: "description",
        content: "Answers about accounts, transfers, cards, rewards, investing, and security at GrowthBridge Bank.",
      },
      { property: "og:title", content: "Help Center | GrowthBridge Bank" },
      { property: "og:description", content: "Answers about accounts, transfers, cards, rewards, and security." },
    ],
  }),
  component: HelpPage,
});

const FAQS = [
  {
    q: "Is GrowthBridge Bank a chartered bank?",
    a: "No. GBB is a financial technology platform. Deposit, card, payment, and brokerage services are delivered through regulated partner institutions once those partnerships are contracted and connected.",
  },
  {
    q: "Are my balances real?",
    a: "Balances shown in the product come from the connected financial provider for your account, or from a clearly labeled development/test environment. GBB never displays invented balances as real money.",
  },
  {
    q: "How long does a transfer take?",
    a: "A transfer moves through pending, processing, and completed states. It is only marked completed when the connected provider confirms settlement.",
  },
  {
    q: "How do I secure my account?",
    a: "Enable two-factor authentication, review trusted devices, and check the login history in your Security Center. You can terminate any session you do not recognize.",
  },
  {
    q: "Can I connect an external bank account?",
    a: "Yes, through a supported account aggregation provider. GBB does not store unnecessary banking credentials.",
  },
];

function HelpPage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Help Center"
        title="Support that answers honestly"
        description="Browse common questions or open a support ticket from inside your account."
      />
      <section className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6">
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((faq) => (
            <AccordionItem key={faq.q} value={faq.q}>
              <AccordionTrigger className="text-left text-base">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/contact">Contact support</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/login">Sign in to open a ticket</Link>
          </Button>
        </div>
      </section>
    </MarketingShell>
  );
}
