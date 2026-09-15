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
  LayoutGrid,
  Lightbulb,
  PiggyBank,
  Plus,
  Receipt,
  Send,
  Signal,
  Smartphone,
  TrendingUp,
  Wifi,
} from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/dashboard/AppShell";
import {
  EmptyState,
  ListSkeleton,
  LoadError,
  Panel,
  SectionTitle,
  StatusPill,
  Tile,
  TileGrid,
} from "@/components/dashboard/pieces";
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
      { title: "Dashboard | GrowthBridge Bank" },
      {
        name: "description",
        content:
          "Your GrowthBridge Bank dashboard: balance, quick transfers, services, savings, investments, and recent activity.",
      },
      { property: "og:title", content: "Dashboard | GrowthBridge Bank" },
      {
        property: "og:description",
        content: "Manage your GrowthBridge Bank money in one clean, secure place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const ready = useRequireAuth();
  const [hidden, setHidden] = useState(false);

  const profile = useCustomerProfile();
  const accounts = useCustomerAccounts();
  const transactions = useCustomerTransactions(6);
  const rewards = useCustomerRewards();

  const currency = primaryCurrency(accounts.data);
  const spendingAccounts = (accounts.data ?? []).filter(
    (account) => account.type === "checking",
  );
  const availableCents = (spendingAccounts.length ? spendingAccounts : (accounts.data ?? []))
    .reduce((total, account) => total + (account.available_cents ?? 0), 0);

  const savingsCents = sumAccounts(accounts.data, "savings");
  const investmentCents = sumAccounts(accounts.data, "investment");
  const rewardsCents = (rewards.data ?? [])
    .filter((reward) => reward.status === "available")
    .reduce((total, reward) => total + (reward.amount_cents ?? 0), 0);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayInflowCents = (transactions.data ?? [])
    .filter(
      (txn) =>
        txn.direction === "credit" &&
        txn.status === "completed" &&
        new Date(txn.posted_at) >= todayStart,
    )
    .reduce((total, txn) => total + Math.abs(txn.amount_cents), 0);

  const money = (cents: number) => formatMoney(cents, currency);

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-muted/40">
        <div className="size-9 animate-spin rounded-full border-4 border-muted border-t-emerald" />
      </div>
    );
  }

  return (
    <AppShell firstName={profile.data?.first_name ?? undefined}>
      <div className="space-y-6">
        {/* Balance card */}
        <section>
          {accounts.isError ? (
            <LoadError onRetry={() => void accounts.refetch()} />
          ) : (
            <div className="overflow-hidden rounded-3xl bg-[var(--gradient-emerald)] p-5 text-emerald-foreground shadow-[var(--shadow-elevated)]">
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-foreground/75">
                  Available balance
                </p>
                <button
                  type="button"
                  onClick={() => setHidden((value) => !value)}
                  aria-label={hidden ? "Show balance" : "Hide balance"}
                  className="grid size-7 place-items-center rounded-full bg-white/15"
                >
                  {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>

              {accounts.isLoading ? (
                <Skeleton className="mt-3 h-9 w-48 bg-white/25" />
              ) : (
                <p className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                  {hidden ? "••••••" : money(availableCents)}
                </p>
              )}

              <div className="mt-5 grid grid-cols-2 gap-2">
                <Link
                  to="/transactions"
                  className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white/15 px-3 text-sm font-medium backdrop-blur transition-colors hover:bg-white/25"
                >
                  Transaction History
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  to="/payments"
                  className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gold px-3 text-sm font-semibold text-gold-foreground transition-opacity hover:opacity-90"
                >
                  <Plus className="size-4" />
                  Add Money
                </Link>
              </div>
            </div>
          )}

          <div className="mt-2 flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-xs text-muted-foreground">Business service</p>
              <p className="truncate text-sm font-medium text-navy">Today&apos;s money in</p>
            </div>
            {transactions.isLoading ? (
              <Skeleton className="h-4 w-20 shrink-0" />
            ) : (
              <p className="shrink-0 font-display text-sm font-semibold text-emerald-deep">
                {hidden ? "••••" : money(todayInflowCents)}
              </p>
            )}
          </div>
        </section>

        {/* Quick actions */}
        <section>
          <Panel>
            <TileGrid>
              <Tile to="/payments" icon={Send} label="To GBB User" />
              <Tile to="/payments" icon={Building2} label="To Bank" />
              <Tile to="/payments" icon={ArrowDownToLine} label="Withdraw" />
              <Tile to="/payments" icon={Plus} label="Add Money" />
            </TileGrid>
          </Panel>
        </section>

        {/* Services */}
        <section>
          <SectionTitle>Services</SectionTitle>
          <Panel>
            <TileGrid>
              <Tile to="/payments" icon={Smartphone} label="Airtime" />
              <Tile to="/payments" icon={Wifi} label="Data" />
              <Tile to="/payments" icon={Receipt} label="Pay Bills" />
              <Tile to="/payments" icon={Lightbulb} label="Electricity" />
              <Tile to="/finance" icon={PiggyBank} label="Savings" />
              <Tile to="/finance" icon={TrendingUp} label="Investments" />
              <Tile to="/cards" icon={CreditCard} label="Cards" />
              <Tile to="/me" icon={LayoutGrid} label="More" />
            </TileGrid>
          </Panel>
        </section>

        {/* Financial overview */}
        <section>
          <SectionTitle>Financial overview</SectionTitle>
          <div className="grid grid-cols-3 gap-2">
            <OverviewCard
              label="Savings"
              icon={PiggyBank}
              value={money(savingsCents)}
              loading={accounts.isLoading}
              hidden={hidden}
            />
            <OverviewCard
              label="Investments"
              icon={TrendingUp}
              value={money(investmentCents)}
              loading={accounts.isLoading}
              hidden={hidden}
            />
            <OverviewCard
              label="Rewards"
              icon={Gift}
              value={money(rewardsCents)}
              loading={rewards.isLoading}
              hidden={hidden}
            />
          </div>
        </section>

        {/* Recent transactions */}
        <section>
          <SectionTitle
            action={
              <Link
                to="/transactions"
                className="flex items-center gap-1 text-xs font-medium text-emerald-deep"
              >
                View all <ArrowRight className="size-3.5" />
              </Link>
            }
          >
            Recent transactions
          </SectionTitle>

          <Panel>
            {transactions.isError ? (
              <LoadError onRetry={() => void transactions.refetch()} />
            ) : transactions.isLoading ? (
              <ListSkeleton />
            ) : (transactions.data ?? []).length === 0 ? (
              <EmptyState
                title="No transactions yet"
                description="Your activity will appear here once money moves in or out."
              />
            ) : (
              <ul className="divide-y divide-border/70">
                {(transactions.data ?? []).map((txn) => (
                  <li key={txn.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <span
                      className={
                        txn.direction === "credit"
                          ? "grid size-10 shrink-0 place-items-center rounded-full bg-emerald-soft text-emerald-deep"
                          : "grid size-10 shrink-0 place-items-center rounded-full bg-muted text-navy"
                      }
                    >
                      {txn.direction === "credit" ? (
                        <ArrowDownToLine className="size-4" />
                      ) : (
                        <ArrowUpRight className="size-4" />
                      )}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-navy">
                        {txn.merchant || txn.description}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {txn.type.replace(/_/g, " ")} ·{" "}
                        {new Date(txn.posted_at).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p
                        className={
                          txn.direction === "credit"
                            ? "text-sm font-semibold text-emerald-deep"
                            : "text-sm font-semibold text-navy"
                        }
                      >
                        {txn.direction === "credit" ? "+" : "-"}
                        {money(Math.abs(txn.amount_cents))}
                      </p>
                      <div className="mt-1">
                        <StatusPill status={txn.status} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </section>

        {/* Promotion */}
        <section>
          <div className="rounded-2xl border border-gold/40 bg-[var(--gradient-gold)] p-5">
            <p className="font-display text-lg font-semibold text-navy">Grow your money</p>
            <p className="mt-1 max-w-md text-sm text-navy/80">
              Put your money to work with GrowthBridge Savings and Investments.
            </p>
            <Button asChild className="mt-4 min-h-11 bg-navy text-primary-foreground hover:bg-navy-deep">
              <Link to="/finance">
                Explore options <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function OverviewCard({
  label,
  value,
  icon: Icon,
  loading,
  hidden,
}: {
  label: string;
  value: string;
  icon: typeof Signal;
  loading: boolean;
  hidden: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-3">
      <span className="grid size-8 place-items-center rounded-full bg-emerald-soft text-emerald">
        <Icon className="size-4" />
      </span>
      <p className="mt-2 text-[0.6875rem] text-muted-foreground">{label}</p>
      {loading ? (
        <Skeleton className="mt-1 h-4 w-16" />
      ) : (
        <p className="truncate font-display text-sm font-semibold text-navy">
          {hidden ? "••••" : value}
        </p>
      )}
    </div>
  );
}
