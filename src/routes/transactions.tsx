import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownToLine, ArrowUpRight, Search } from "lucide-react";
import { useMemo, useState } from "react";

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
import { Input } from "@/components/ui/input";
import {
  primaryCurrency,
  useCustomerAccounts,
  useCustomerProfile,
  useCustomerTransactions,
} from "@/lib/customer-data";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/transactions")({
  head: () => ({
    meta: [
      { title: "Transactions | GrowthBridge Bank" },
      {
        name: "description",
        content: "Search and review your full GrowthBridge Bank transaction history.",
      },
      { property: "og:title", content: "Transactions | GrowthBridge Bank" },
      {
        property: "og:description",
        content: "Your complete GrowthBridge Bank activity, searchable and filterable.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TransactionsPage,
});

const filters = ["all", "credit", "debit"] as const;

function TransactionsPage() {
  const ready = useRequireAuth();
  const profile = useCustomerProfile();
  const accounts = useCustomerAccounts();
  const transactions = useCustomerTransactions(100);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");

  const currency = primaryCurrency(accounts.data);
  const money = (cents: number) => formatMoney(cents, currency);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return (transactions.data ?? []).filter((txn) => {
      if (filter !== "all" && txn.direction !== filter) return false;
      if (!term) return true;
      return (
        txn.description.toLowerCase().includes(term) ||
        (txn.merchant ?? "").toLowerCase().includes(term) ||
        txn.type.toLowerCase().includes(term) ||
        (txn.provider_reference ?? "").toLowerCase().includes(term)
      );
    });
  }, [transactions.data, query, filter]);

  if (!ready) return null;

  return (
    <AppShell firstName={profile.data?.first_name ?? undefined} title="Transactions">
      <div className="space-y-4">
        <SectionTitle>Transaction history</SectionTitle>

        <div className="space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search description, merchant or reference"
              className="h-11 pl-9"
              aria-label="Search transactions"
            />
          </div>

          <div className="flex gap-2">
            {filters.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={cn(
                  "min-h-9 rounded-full px-4 text-xs font-medium capitalize transition-colors",
                  filter === item
                    ? "bg-emerald text-emerald-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {item === "credit" ? "Money in" : item === "debit" ? "Money out" : "All"}
              </button>
            ))}
          </div>
        </div>

        <Panel>
          {transactions.isError ? (
            <LoadError onRetry={() => void transactions.refetch()} />
          ) : transactions.isLoading ? (
            <ListSkeleton rows={6} />
          ) : visible.length === 0 ? (
            <EmptyState
              title="Nothing to show"
              description="No transactions match this search or filter yet."
            />
          ) : (
            <ul className="divide-y divide-border/70">
              {visible.map((txn) => (
                <li key={txn.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span
                    className={cn(
                      "grid size-10 shrink-0 place-items-center rounded-full",
                      txn.direction === "credit"
                        ? "bg-emerald-soft text-emerald-deep"
                        : "bg-muted text-navy",
                    )}
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
                      className={cn(
                        "text-sm font-semibold",
                        txn.direction === "credit" ? "text-emerald-deep" : "text-navy",
                      )}
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
      </div>
    </AppShell>
  );
}
