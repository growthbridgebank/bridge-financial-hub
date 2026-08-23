import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  CreditCard,
  Gift,
  Landmark,
  LineChart,
  LifeBuoy,
  PiggyBank,
  ShieldCheck,
  Smartphone,
  Target,
} from "lucide-react";
import heroImage from "@/assets/hero-banking.jpg";
import { MarketingShell } from "@/components/marketing/MarketingPage";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GrowthBridge Bank — Building Your Financial Future" },
      {
        name: "description",
        content:
          "Bank, save, invest, and manage your money with GrowthBridge Bank (GBB), a modern financial platform designed around your goals.",
      },
      { property: "og:title", content: "GrowthBridge Bank — Building Your Financial Future" },
      {
        property: "og:description",
        content: "Bank, save, invest, and manage your money with a modern financial platform built around your goals.",
      },
    ],
  }),
  component: Index,
});

const PILLARS = [
  {
    icon: Landmark,
    title: "Checking",
    body: "Everyday spending with masked account details, searchable transactions, and honest statuses.",
    to: "/checking",
  },
  {
    icon: PiggyBank,
    title: "Savings",
    body: "Automate contributions toward emergency funds, a home, education, or any custom goal.",
    to: "/savings",
  },
  {
    icon: LineChart,
    title: "Investments",
    body: "Portfolio value, holdings, and performance sourced from a connected brokerage custodian.",
    to: "/investing",
  },
  {
    icon: Gift,
    title: "Cash Rewards",
    body: "Cashback and partner offers recorded to a transparent rewards ledger.",
    to: "/rewards-overview",
  },
  {
    icon: BarChart3,
    title: "Spending Insights",
    body: "Automatic categorization with month-over-month trends drawn from real activity.",
    to: "/personal",
  },
  {
    icon: CreditCard,
    title: "Debit Cards",
    body: "Freeze, replace, and control your GBB card without ever exposing full card numbers.",
    to: "/cards-overview",
  },
  {
    icon: Target,
    title: "Financial Goals",
    body: "Track target, current, remaining, and progress for every goal you set.",
    to: "/personal",
  },
  {
    icon: ShieldCheck,
    title: "Security",
    body: "Two-factor authentication, device management, session control, and login alerts.",
    to: "/security-overview",
  },
  {
    icon: Smartphone,
    title: "Mobile Banking",
    body: "A responsive experience built for phone, tablet, and desktop from the same account.",
    to: "/personal",
  },
  {
    icon: LifeBuoy,
    title: "Customer Support",
    body: "Help center, secure tickets, and status you can follow from open to resolved.",
    to: "/help",
  },
];

function Index() {
  return (
    <MarketingShell>
      <section className="relative overflow-hidden bg-gradient-navy text-primary-foreground">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">GrowthBridge Bank · GBB</p>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Building Your <span className="text-gradient-gold">Financial Future.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base text-primary-foreground/75 sm:text-lg">
              Bank, save, invest, and manage your money with a modern financial platform designed around your goals.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-gradient-gold text-gold-foreground hover:opacity-90">
                <Link to="/register">
                  Open an Account <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
            <p className="mt-8 max-w-xl text-xs text-primary-foreground/55">
              GBB is a financial technology platform, not a chartered bank. Deposits, cards, payments, and investing are
              delivered through regulated partner institutions once connected.
            </p>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-2xl border border-primary-foreground/15 shadow-elevated">
              <img
                src={heroImage}
                alt="A GrowthBridge Bank customer reviewing her accounts on a mobile device"
                width={1280}
                height={1600}
                className="aspect-4/5 size-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            One platform for every part of your money
          </h2>
          <p className="mt-4 text-muted-foreground">
            Each product is wired to a real provider integration — nothing in GrowthBridge represents money that does not
            exist.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map(({ icon: Icon, title, body, to }) => (
            <Link
              key={title}
              to={to}
              className="group rounded-xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-gold/60 hover:shadow-elevated"
            >
              <span className="inline-flex size-11 items-center justify-center rounded-lg bg-secondary text-navy">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-foreground">
                Learn more
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-secondary/60">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Ready to build your bridge?
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Open your GrowthBridge profile in minutes. Verification is completed by a regulated identity provider
              before your account is marked verified.
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild size="lg">
              <Link to="/register">Open an Account</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/help">Help Center</Link>
            </Button>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
