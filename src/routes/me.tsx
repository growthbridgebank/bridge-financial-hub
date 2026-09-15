import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  ChevronRight,
  LifeBuoy,
  LogOut,
  ShieldCheck,
  Sliders,
  UserRound,
  BadgeCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/dashboard/AppShell";
import { Panel, SectionTitle, StatusPill } from "@/components/dashboard/pieces";
import { useRequireAuth } from "@/components/dashboard/useRequireAuth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useCustomerProfile } from "@/lib/customer-data";

export const Route = createFileRoute("/me")({
  head: () => ({
    meta: [
      { title: "My Profile | GrowthBridge Bank" },
      {
        name: "description",
        content: "Manage your GrowthBridge Bank profile, security, verification and notification settings.",
      },
      { property: "og:title", content: "My Profile | GrowthBridge Bank" },
      {
        property: "og:description",
        content: "Your GrowthBridge Bank account settings and security controls.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MePage,
});

const rows: { label: string; icon: LucideIcon }[] = [
  { label: "Personal Information", icon: UserRound },
  { label: "Account Settings", icon: Sliders },
  { label: "Security", icon: ShieldCheck },
  { label: "KYC / Verification", icon: BadgeCheck },
  { label: "Notifications", icon: Bell },
];

function MePage() {
  const ready = useRequireAuth();
  const navigate = useNavigate();
  const profile = useCustomerProfile();

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Could not sign out", { description: error.message });
      return;
    }
    await navigate({ to: "/login" });
  }

  if (!ready) return null;

  return (
    <AppShell firstName={profile.data?.first_name ?? undefined} title="My Profile">
      <div className="space-y-6">
        <Panel className="flex items-center gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-full bg-emerald text-lg font-semibold text-emerald-foreground">
            {(profile.data?.first_name ?? "G").slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            {profile.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-40" />
              </div>
            ) : (
              <>
                <p className="truncate font-display text-base font-semibold text-navy">
                  {profile.data?.first_name} {profile.data?.last_name}
                </p>
                <p className="truncate text-xs text-muted-foreground">{profile.data?.email}</p>
                <div className="mt-2">
                  <StatusPill status={profile.data?.kyc_status ?? "unverified"} />
                </div>
              </>
            )}
          </div>
        </Panel>

        <section>
          <SectionTitle>Account</SectionTitle>
          <Panel className="p-0">
            <ul className="divide-y divide-border/70">
              {rows.map((row) => (
                <li key={row.label}>
                  <button
                    type="button"
                    onClick={() => toast.info(`${row.label} is coming to your app soon`)}
                    className="flex min-h-14 w-full items-center gap-3 px-4 text-left"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-emerald-soft text-emerald">
                      <row.icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-navy">
                      {row.label}
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  </button>
                </li>
              ))}
              <li>
                <Link to="/help" className="flex min-h-14 w-full items-center gap-3 px-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-emerald-soft text-emerald">
                    <LifeBuoy className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-navy">
                    Help &amp; Support
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            </ul>
          </Panel>
        </section>

        <Button variant="outline" className="min-h-12 w-full" onClick={handleSignOut}>
          <LogOut className="size-4" />
          Log out
        </Button>
      </div>
    </AppShell>
  );
}
