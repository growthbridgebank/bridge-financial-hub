import { createFileRoute } from "@tanstack/react-router";
import { Landmark, PiggyBank, Target, TrendingUp } from "lucide-react";

import { AppShell } from "@/components/dashboard/AppShell";
import {
  EmptyState,
  ListSkeleton,
  LoadError,
  Panel,
  SectionTitle,
  StatusPill,
} from "@/components/dashboard/pieces";
import { useRequireAuth } from "@/components/dashboard/useRequireAuth";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  primaryCurrency,
  sumAccounts,
  useCustomerAccounts,
  useCustomerGoals,
  useCustomerInvestments,
  useCustomerLoans,
  useCustomerProfile,
} from "@/lib/customer-data";
import { formatMoney } from "@/lib/money";

export const Route = createFileRoute("/finance")({
  head: () => ({
    meta: [
      { title: "Finance | GrowthBridge Bank" },
      {
        name: "description",
        content: "Track your GrowthBridge savings, investments, financial goals and loans in one place.",
      },
      { property: "og:title", content: "Finance | GrowthBridge Bank" },
      {
        property: "og:description",
        content: "Savings, investments, goals and loans at GrowthBridge Bank.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FinancePage,
});

function FinancePage() {
  const ready = useRequireAuth();
  const profile = useCustomerProfile();
  const accounts = useCustomerAccounts();
  const goals = useCustomerGoals();
  const investments = useCustomerInvestments();
  const loans = useCustomerLoans();

  const currency = primaryCurrency(accounts.data);
  const money = (cents: number) => formatMoney(cents, currency);

  const portfolioCents = (investments.data ?? []).reduce(
    (total, row) => total + ((row as { portfolio_value_cents?: number }).portfolio_value_cents ?? 0),
    0,
  );

  if (!ready) return null;

  return (
    <AppShell firstName={profile.data?.first_name ?? undefined} title="Finance">
      <div className="space-y-6">
        <div className="grid gap-2 sm:grid-cols-2">
          <SummaryCard
            icon={PiggyBank}
            label="Savings"
            value={money(sumAccounts(accounts.data, "savings"))}
            loading={accounts.isLoading}
          />
          <SummaryCard
            icon={TrendingUp}
            label="Investments"
            value={money(portfolioCents || sumAccounts(accounts.data, "investment"))}
            loading={investments.isLoading || accounts.isLoading}
          />
        </div>

        <section>
          <SectionTitle>Savings accounts</SectionTitle>
          <Panel>
            {accounts.isError ? (
              <LoadError onRetry={() => void accounts.refetch()} />
            ) : accounts.isLoading ? (
              <ListSkeleton rows={2} />
            ) : (accounts.data ?? []).filter((a) => a.type === "savings").length === 0 ? (
              <EmptyState
                title="No savings account yet"
                description="Open a GrowthBridge savings account to start earning."
              />
            ) : (
              <ul className="divide-y divide-border/70">
                {(accounts.data ?? [])
                  .filter((account) => account.type === "savings")
                  .map((account) => (
                    <li key={account.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-navy">{account.display_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {account.apy ? `${account.apy}% APY` : "Savings"}
                        </p>
                      </div>
                      <p className="shrink-0 font-display text-sm font-semibold text-navy">
                        {money(account.current_cents)}
                      </p>
                    </li>
                  ))}
              </ul>
            )}
          </Panel>
        </section>

        <section>
          <SectionTitle>Financial goals</SectionTitle>
          <Panel>
            {goals.isError ? (
              <LoadError onRetry={() => void goals.refetch()} />
            ) : goals.isLoading ? (
              <ListSkeleton rows={2} />
            ) : (goals.data ?? []).length === 0 ? (
              <EmptyState
                title="No goals yet"
                description="Set a target and track your progress toward it."
              />
            ) : (
              <ul className="space-y-4">
                {(goals.data ?? []).map((goal) => {
                  const pct = goal.target_cents
                    ? Math.min(100, Math.round((goal.current_cents / goal.target_cents) * 100))
                    : 0;
                  return (
                    <li key={goal.id}>
                      <div className="flex items-center justify-between gap-3">
                        <p className="min-w-0 truncate text-sm font-medium text-navy">{goal.name}</p>
                        <p className="shrink-0 text-xs text-muted-foreground">
                          {money(goal.current_cents)} / {money(goal.target_cents)}
                        </p>
                      </div>
                      <Progress value={pct} className="mt-2 h-2" />
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        </section>

        <section>
          <SectionTitle>Loans</SectionTitle>
          <Panel>
            {loans.isError ? (
              <LoadError onRetry={() => void loans.refetch()} />
            ) : loans.isLoading ? (
              <ListSkeleton rows={2} />
            ) : (loans.data ?? []).length === 0 ? (
              <EmptyState title="No loans" description="You have no loan applications on file." />
            ) : (
              <ul className="divide-y divide-border/70">
                {(loans.data ?? []).map((loan) => {
                  const row = loan as {
                    id: string;
                    amount_cents: number;
                    purpose: string;
                    status: string;
                    term_months: number;
                  };
                  return (
                    <li key={row.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-navy">{row.purpose}</p>
                        <p className="text-xs text-muted-foreground">{row.term_months} months</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-display text-sm font-semibold text-navy">
                          {money(row.amount_cents)}
                        </p>
                        <div className="mt-1">
                          <StatusPill status={row.status} />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        </section>
      </div>
    </AppShell>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: typeof Landmark;
  label: string;
  value: string;
  loading: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4">
      <span className="grid size-10 place-items-center rounded-full bg-emerald-soft text-emerald">
        <Icon className="size-5" />
      </span>
      <p className="mt-3 text-xs text-muted-foreground">{label}</p>
      {loading ? (
        <Skeleton className="mt-1 h-6 w-28" />
      ) : (
        <p className="font-display text-xl font-semibold text-navy">{value}</p>
      )}
    </div>
  );
}
