import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowDownToLine,
  Building2,
  HandCoins,
  Lightbulb,
  Plus,
  Receipt,
  Send,
  Smartphone,
  Wifi,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/dashboard/AppShell";
import { Panel, SectionTitle } from "@/components/dashboard/pieces";
import { useRequireAuth } from "@/components/dashboard/useRequireAuth";
import { useCustomerProfile } from "@/lib/customer-data";

export const Route = createFileRoute("/payments")({
  head: () => ({
    meta: [
      { title: "Payments | GrowthBridge Bank" },
      {
        name: "description",
        content: "Send money, request money, pay bills, buy airtime and data with GrowthBridge Bank.",
      },
      { property: "og:title", content: "Payments | GrowthBridge Bank" },
      {
        property: "og:description",
        content: "Move money safely with GrowthBridge Bank payments.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PaymentsPage,
});

const actions: { label: string; icon: LucideIcon; note: string }[] = [
  { label: "Send Money", icon: Send, note: "Send to another GrowthBridge customer" },
  { label: "Request Money", icon: HandCoins, note: "Ask someone to pay you" },
  { label: "Bank Transfer", icon: Building2, note: "Send to an external bank account" },
  { label: "Add Money", icon: Plus, note: "Top up your GrowthBridge balance" },
  { label: "Withdraw", icon: ArrowDownToLine, note: "Move money out to your bank" },
  { label: "Pay Bills", icon: Receipt, note: "Settle your recurring bills" },
  { label: "Airtime", icon: Smartphone, note: "Top up any mobile number" },
  { label: "Data", icon: Wifi, note: "Buy a data bundle" },
];

function PaymentsPage() {
  const ready = useRequireAuth();
  const profile = useCustomerProfile();

  if (!ready) return null;

  return (
    <AppShell firstName={profile.data?.first_name ?? undefined} title="Payments">
      <div className="space-y-6">
        <SectionTitle
          action={
            <Link to="/transactions" className="text-xs font-medium text-emerald-deep">
              History
            </Link>
          }
        >
          Move money
        </SectionTitle>

        <div className="grid gap-2 sm:grid-cols-2">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() =>
                toast.info(`${action.label} is not enabled on your account yet`, {
                  description:
                    "Your GrowthBridge team will activate this once your account review completes.",
                })
              }
              className="flex min-h-16 items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 text-left transition-colors hover:border-emerald/40 hover:bg-emerald-soft/40"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-emerald-soft text-emerald">
                <action.icon className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-navy">{action.label}</span>
                <span className="block truncate text-xs text-muted-foreground">{action.note}</span>
              </span>
            </button>
          ))}
        </div>

        <Panel>
          <p className="text-sm font-medium text-navy">Every payment is confirmed before it completes</p>
          <p className="mt-1 text-xs text-muted-foreground">
            You always review the details first, and a payment is only marked successful after our systems
            confirm it.
          </p>
        </Panel>
      </div>
    </AppShell>
  );
}
