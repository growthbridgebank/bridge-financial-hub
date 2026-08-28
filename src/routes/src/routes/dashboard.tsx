import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  CreditCard,
  Landmark,
  LogOut,
  PiggyBank,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard | GrowthBridge Bank" },
      {
        name: "description",
        content: "View your GrowthBridge Bank accounts, balances, cards, investments, and recent activity.",
      },
    ],
  }),
  component: DashboardPage,
});

type Profile = {
  first_name: string;
  last_name: string;
  email: string;
  username: string | null;
  kyc_status: string;
};

type Account = {
  id: string;
  display_name: string;
  type: string;
  current_cents: number;
  available_cents: number;
  currency: string;
  status: string;
};

type Transaction = {
  id: string;
  amount_cents: number;
  description: string | null;
  merchant_name: string | null;
  occurred_at: string;
  status: string;
};

function formatMoney(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function DashboardPage() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadDashboard(showRefresh = false) {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        await navigate({ to: "/login" });
        return;
      }

      const [profileResult, accountsResult, transactionsResult] =
        await Promise.all([
          supabase
            .from("profiles")
            .select(
              "first_name,last_name,email,username,kyc_status",
            )
            .eq("id", user.id)
            .maybeSingle(),

          supabase
            .from("accounts")
            .select(
              "id,display_name,type,current_cents,available_cents,currency,status",
            )
            .eq("user_id", user.id)
            .order("opened_at", { ascending: false }),

          supabase
            .from("transactions")
            .select(
              "id,amount_cents,description,merchant_name,occurred_at,status",
            )
            .eq("user_id", user.id)
            .order("occurred_at", { ascending: false })
            .limit(5),
        ]);

      if (profileResult.error) {
        throw profileResult.error;
      }

      if (accountsResult.error) {
        throw accountsResult.error;
      }

      if (transactionsResult.error) {
        throw transactionsResult.error;
      }

      setProfile(profileResult.data as Profile | null);
      setAccounts((accountsResult.data ?? []) as Account[]);
      setTransactions((transactionsResult.data ?? []) as Transaction[]);
    } catch (error) {
      console.error("Dashboard loading error:", error);

      toast.error("Unable to load your dashboard", {
        description:
          error instanceof Error
            ? error.message
            : "Please try again.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error("Could not sign out", {
        description: error.message,
      });
      return;
    }

    toast.success("You have been signed out.");
    await navigate({ to: "/login" });
  }

  const totalBalance = accounts.reduce(
    (total, account) => total + account.current_cents,
    0,
  );

  const firstName = profile?.first_name || "Customer";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 size-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
          <p className="text-sm text-muted-foreground">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Landmark className="size-5" />
            </div>

            <div>
              <p className="font-display text-lg font-bold">
                GrowthBridge
              </p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Bank
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => void loadDashboard(true)}
              disabled={refreshing}
              aria-label="Refresh dashboard"
            >
              <RefreshCw
                className={`size-4 ${refreshing ? "animate-spin" : ""}`}
              />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleSignOut()}
            >
              <LogOut className="mr-2 size-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        {/* Welcome */}
        <div className="mb-8">
          <p className="text-sm text-muted-foreground">
            Welcome back
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
            Hello, {firstName}
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Here's an overview of your GrowthBridge financial accounts.
          </p>
        </div>

        {/* Security / KYC status */}
        <div className="mb-8 flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary">
              <ShieldCheck className="size-5 text-primary" />
            </div>

            <div>
              <h2 className="font-semibold">Account security</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                KYC status:{" "}
                <span className="font-medium capitalize text-foreground">
                  {profile?.kyc_status || "pending"}
                </span>
              </p>
            </div>
          </div>

          <Link to="/security-overview">
            <Button variant="outline" size="sm">
              Security settings
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </Link>
        </div>

        {/* Total balance */}
        <section className="mb-8">
          <div className="rounded-2xl bg-primary p-6 text-primary-foreground shadow-elevated sm:p-8">
            <p className="text-sm text-primary-foreground/70">
              Total account balance
            </p>

            <p className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
              {formatMoney(totalBalance)}
            </p>

            <p className="mt-3 text-xs text-primary-foreground/60">
              Combined balance across your GrowthBridge accounts
            </p>
          </div>
        </section>

        {/* Quick actions */}
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold">
            Quick actions
          </h2>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              to="/checking"
              className="group rounded-xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card"
            >
              <Wallet className="size-6 text-primary" />
              <h3 className="mt-4 font-semibold">Checking</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                View your everyday account.
              </p>
              <ArrowRight className="mt-4 size-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              to="/savings"
              className="group rounded-xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card"
            >
              <PiggyBank className="size-6 text-primary" />
              <h3 className="mt-4 font-semibold">Savings</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Build your savings goals.
              </p>
              <ArrowRight className="mt-4 size-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              to="/investing"
              className="group rounded-xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card"
            >
              <TrendingUp className="size-6 text-primary" />
              <h3 className="mt-4 font-semibold">Investments</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Track your investment portfolio.
              </p>
              <ArrowRight className="mt-4 size-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              to="/cards-overview"
              className="group rounded-xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card"
            >
              <CreditCard className="size-6 text-primary" />
              <h3 className="mt-4 font-semibold">Cards</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage your GBB cards.
              </p>
              <ArrowRight className="mt-4 size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </section>

        {/* Accounts */}
        <section className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Your accounts
            </h2>

            <Link
              to="/checking"
              className="text-sm font-medium underline underline-offset-4"
            >
              View all
            </Link>
          </div>

          {accounts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
              <Landmark className="mx-auto size-8 text-muted-foreground" />

              <h3 className="mt-3 font-semibold">
                No accounts yet
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Your accounts will appear here once they are created.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="rounded-xl border border-border bg-card p-5 shadow-card"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">
                        {account.display_name}
                      </p>

                      <p className="mt-1 text-xs capitalize text-muted-foreground">
                        {account.type.replaceAll("_", " ")}
                      </p>
                    </div>

                    <span className="rounded-full bg-secondary px-2.5 py-1 text-xs capitalize">
                      {account.status}
                    </span>
                  </div>

                  <p className="mt-6 text-2xl font-semibold">
                    {formatMoney(
                      account.current_cents,
                      account.currency,
                    )}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Available:{" "}
                    {formatMoney(
                      account.available_cents,
                      account.currency,
                    )}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent transactions */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Recent activity
            </h2>

            <Link
              to="/personal"
              className="text-sm font-medium underline underline-offset-4"
            >
              View activity
            </Link>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-card">
            {transactions.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No transactions yet.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between gap-4 p-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {transaction.merchant_name ||
                          transaction.description ||
                          "Transaction"}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(transaction.occurred_at)} ·{" "}
                        <span className="capitalize">
                          {transaction.status}
                        </span>
                      </p>
                    </div>

                    <p
                      className={`shrink-0 font-semibold ${
                        transaction.amount_cents < 0
                          ? "text-destructive"
                          : "text-foreground"
                      }`}
                    >
                      {transaction.amount_cents < 0 ? "" : "+"}
                      {formatMoney(transaction.amount_cents)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
