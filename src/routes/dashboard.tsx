import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Building2,
  CreditCard,
  Eye,
  EyeOff,
  Gift,
  PiggyBank,
  Plus,
  Receipt,
  Send,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/dashboard/AppShell";
import { EmptyState, ListSkeleton, LoadError, StatusPill } from "@/components/dashboard/pieces";
import { useRequireAuth } from "@/components/dashboard/useRequireAuth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  primaryCurrency,
  sumAccounts,
  useCustomerAccounts,
  useCustomerProfile,
  useCustomerRewards,
  useCustomerTransactions,
} from "@/lib/customer-data";
import { formatMoney } from "@/lib/money";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "My Account | GrowthBridge Bank" },
      { name: "description", content: "View your GrowthBridge Bank balances, services and recent account activity." },
      { property: "og:title", content: "My Account | GrowthBridge Bank" },
      { property: "og:description", content: "Secure access to your GrowthBridge Bank account and activity." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
});

const quickActions = [
  { to: "/payments", label: "Send", detail: "GBB or bank", icon: Send, tone: "cyan" },
  { to: "/payments", label: "Receive", detail: "Add money", icon: ArrowDownToLine, tone: "gold" },
  { to: "/cards", label: "Cards", detail: "Manage card", icon: CreditCard, tone: "cyan" },
  { to: "/finance", label: "Savings", detail: "Goals & plans", icon: PiggyBank, tone: "gold" },
] as const;

function DashboardPage() {
  const ready = useRequireAuth();
  const [hidden, setHidden] = useState(false);
  const profile = useCustomerProfile();
  const accounts = useCustomerAccounts();
  const transactions = useCustomerTransactions(6);
  const rewards = useCustomerRewards();

  const currency = primaryCurrency(accounts.data);
  const checking = (accounts.data ?? []).find((account) => account.type === "checking") ?? accounts.data?.[0];
  const availableCents = checking?.available_cents ?? 0;
  const savingsCents = sumAccounts(accounts.data, "savings");
  const investmentCents = sumAccounts(accounts.data, "investment");
  const rewardsCents = (rewards.data ?? [])
    .filter((reward) => reward.status === "available")
    .reduce((total, reward) => total + (reward.amount_cents ?? 0), 0);
  const money = (cents: number) => formatMoney(cents, currency);

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-sidebar">
        <div className="size-9 animate-spin rounded-full border-4 border-sidebar-accent border-t-emerald" />
      </div>
    );
  }

  return (
    <AppShell firstName={profile.data?.first_name ?? undefined}>
      <div className="space-y-5 lg:grid lg:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.75fr)] lg:items-start lg:gap-6 lg:space-y-0">
        <div className="space-y-5">
          <section aria-label="Primary account">
            {accounts.isError ? (
              <LoadError onRetry={() => void accounts.refetch()} />
            ) : (
              <div className="relative overflow-hidden rounded-3xl bg-[var(--gradient-emerald)] p-5 text-emerald-foreground shadow-[var(--shadow-elevated)] sm:p-7">
                <div className="absolute -right-16 -top-20 size-52 rounded-full bg-emerald-foreground/10 blur-2xl" />
                <div className="relative">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-foreground/65">
                        {checking?.display_name || "GBB Account"}
                      </p>
                      <p className="mt-1 text-sm text-emerald-foreground/80">Available balance</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setHidden((value) => !value)}
                      aria-label={hidden ? "Show balance" : "Hide balance"}
                      className="rounded-full bg-emerald-foreground/10 text-emerald-foreground hover:bg-emerald-foreground/20 hover:text-emerald-foreground"
                    >
                      {hidden ? <EyeOff /> : <Eye />}
                    </Button>
                  </div>

                  {accounts.isLoading ? (
                    <Skeleton className="mt-4 h-11 w-52 bg-emerald-foreground/20" />
                  ) : (
                    <p className="mt-3 font-display text-3xl font-bold sm:text-4xl">
                      {hidden ? "••••••" : money(availableCents)}
                    </p>
                  )}

                  <div className="mt-8 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-emerald-foreground/55">
                        Account number
                      </p>
                      <p className="mt-1 font-mono text-sm font-medium">
                        •••• •••• {checking?.account_last4 ?? "••••"}
                      </p>
                    </div>
                    <span className="rounded-full bg-gold px-3 py-1.5 text-xs font-bold text-gold-foreground">
                      {checking?.status ? checking.status.charAt(0).toUpperCase() + checking.status.slice(1) : "Account"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </section>

          <section aria-label="Quick actions" className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {quickActions.map(({ to, label, detail, icon: Icon, tone }) => (
              <Link
                key={label}
                to={to}
                className="group rounded-2xl border border-sidebar-border bg-sidebar-accent/65 p-4 transition-colors hover:bg-sidebar-accent lg:border-border lg:bg-card lg:hover:bg-muted"
              >
                <span className={tone === "gold" ? "grid size-10 place-items-center rounded-xl bg-gold/15 text-gold" : "grid size-10 place-items-center rounded-xl bg-emerald/15 text-emerald"}>
                  <Icon className="size-5" />
                </span>
                <p className="mt-3 text-sm font-semibold text-sidebar-foreground lg:text-navy">{label}</p>
                <p className="mt-0.5 text-xs text-sidebar-foreground/45 lg:text-muted-foreground">{detail}</p>
              </Link>
            ))}
          </section>

          <section className="rounded-3xl border border-sidebar-border bg-sidebar-accent/45 p-5 lg:border-border lg:bg-card">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="font-display text-lg font-bold text-sidebar-foreground lg:text-navy">Recent activity</h2>
              <Link to="/transactions" className="flex items-center gap-1 text-sm font-semibold text-emerald">
                View all <ArrowRight className="size-4" />
              </Link>
            </div>
            {transactions.isError ? (
              <LoadError onRetry={() => void transactions.refetch()} />
            ) : transactions.isLoading ? (
              <ListSkeleton rows={4} />
            ) : (transactions.data ?? []).length === 0 ? (
              <EmptyState title="No activity yet" description="Your account activity will appear here." />
            ) : (
              <ul className="divide-y divide-sidebar-border lg:divide-border">
                {(transactions.data ?? []).map((txn) => (
                  <li key={txn.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <span className={txn.direction === "credit" ? "grid size-11 shrink-0 place-items-center rounded-full bg-emerald/15 text-emerald" : "grid size-11 shrink-0 place-items-center rounded-full bg-sidebar-foreground/10 text-sidebar-foreground lg:bg-muted lg:text-navy"}>
                      {txn.direction === "credit" ? <ArrowDownToLine className="size-4" /> : <ArrowUpRight className="size-4" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-sidebar-foreground lg:text-navy">{txn.merchant || txn.description}</p>
                      <p className="truncate text-xs text-sidebar-foreground/45 lg:text-muted-foreground">
                        {new Date(txn.posted_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className={txn.direction === "credit" ? "text-sm font-bold text-emerald" : "text-sm font-bold text-sidebar-foreground lg:text-navy"}>
                        {txn.direction === "credit" ? "+" : "-"}{money(Math.abs(txn.amount_cents))}
                      </p>
                      <div className="mt-1"><StatusPill status={txn.status} /></div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-5">
          <section className="grid grid-cols-3 gap-2 lg:grid-cols-1">
            <SummaryCard icon={PiggyBank} label="Savings" value={money(savingsCents)} hidden={hidden} loading={accounts.isLoading} />
            <SummaryCard icon={TrendingUp} label="Investments" value={money(investmentCents)} hidden={hidden} loading={accounts.isLoading} />
            <SummaryCard icon={Gift} label="Rewards" value={money(rewardsCents)} hidden={hidden} loading={rewards.isLoading} />
          </section>

          <section className="rounded-3xl border border-gold/25 bg-gold/10 p-5">
            <WalletCards className="size-6 text-gold" />
            <h2 className="mt-4 font-display text-lg font-bold text-sidebar-foreground lg:text-navy">Grow your money</h2>
            <p className="mt-2 text-sm text-sidebar-foreground/55 lg:text-muted-foreground">
              Put your money to work with GrowthBridge Savings and Investments.
            </p>
            <Button asChild className="mt-5 bg-gold text-gold-foreground hover:bg-gold/90">
              <Link to="/finance">Explore options <ArrowRight /></Link>
            </Button>
          </section>

          <section className="grid grid-cols-2 gap-3">
            <Link to="/payments" className="flex items-center gap-3 rounded-2xl border border-sidebar-border bg-sidebar-accent/55 p-4 text-sm font-semibold text-sidebar-foreground lg:border-border lg:bg-card lg:text-navy">
              <Building2 className="size-5 text-emerald" /> Bank transfer
            </Link>
            <Link to="/payments" className="flex items-center gap-3 rounded-2xl border border-sidebar-border bg-sidebar-accent/55 p-4 text-sm font-semibold text-sidebar-foreground lg:border-border lg:bg-card lg:text-navy">
              <Receipt className="size-5 text-emerald" /> Pay bills
            </Link>
            <Link to="/payments" className="flex items-center gap-3 rounded-2xl border border-sidebar-border bg-sidebar-accent/55 p-4 text-sm font-semibold text-sidebar-foreground lg:border-border lg:bg-card lg:text-navy">
              <Plus className="size-5 text-gold" /> Add money
            </Link>
            <Link to="/payments" className="flex items-center gap-3 rounded-2xl border border-sidebar-border bg-sidebar-accent/55 p-4 text-sm font-semibold text-sidebar-foreground lg:border-border lg:bg-card lg:text-navy">
              <ArrowUpRight className="size-5 text-gold" /> Withdraw
            </Link>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}

function SummaryCard({ icon: Icon, label, value, hidden, loading }: { icon: typeof PiggyBank; label: string; value: string; hidden: boolean; loading: boolean }) {
  return (
    <div className="min-w-0 rounded-2xl border border-sidebar-border bg-sidebar-accent/55 p-3 lg:border-border lg:bg-card lg:p-4">
      <Icon className="size-5 text-emerald" />
      <p className="mt-3 truncate text-[0.6875rem] text-sidebar-foreground/45 lg:text-muted-foreground">{label}</p>
      {loading ? <Skeleton className="mt-1 h-4 w-16" /> : <p className="mt-1 truncate font-display text-sm font-bold text-sidebar-foreground lg:text-navy">{hidden ? "••••" : value}</p>}
    </div>
  );
}