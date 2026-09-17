import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  CreditCard,
  HelpCircle,
  Home,
  LifeBuoy,
  LogOut,
  PieChart,
  Receipt,
  Send,
  Settings,
  User,
} from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";

import logo from "@/assets/gbb-logo.png.asset.json";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type NavItem = {
  to: string;
  label: string;
  icon: typeof Home;
};

const primaryNav: NavItem[] = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/payments", label: "Payments", icon: Send },
  { to: "/finance", label: "Finance", icon: PieChart },
  { to: "/cards", label: "Cards", icon: CreditCard },
  { to: "/me", label: "Me", icon: User },
];

const desktopNav: NavItem[] = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/payments", label: "Payments", icon: Send },
  { to: "/finance", label: "Finance", icon: PieChart },
  { to: "/cards", label: "Cards", icon: CreditCard },
  { to: "/transactions", label: "Transactions", icon: Receipt },
  { to: "/help", label: "Support", icon: LifeBuoy },
  { to: "/me", label: "Settings", icon: Settings },
];

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function AppShell({
  children,
  firstName,
  title,
}: {
  children: ReactNode;
  firstName?: string | undefined;
  title?: string | undefined;
}) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Could not sign out", { description: error.message });
      return;
    }
    await navigate({ to: "/login" });
  }

  const initials = (firstName ?? "G").slice(0, 1).toUpperCase();

  return (
    <div className="min-h-screen bg-sidebar text-sidebar-foreground lg:bg-muted/40 lg:text-foreground">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar px-4 py-6 lg:flex">
        <Link to="/dashboard" className="flex items-center gap-3 px-2">
          <img
            src={logo.url}
            alt="GrowthBridge Bank"
            className="size-10 shrink-0 rounded-full object-cover"
            width={40}
            height={40}
          />
          <span className="min-w-0 leading-tight">
            <span className="block truncate font-display text-sm font-semibold text-sidebar-foreground">
              GrowthBridge Bank
            </span>
            <span className="text-[0.625rem] font-medium tracking-[0.24em] text-gold">GBB</span>
          </span>
        </Link>

        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {desktopNav.map((item) => {
            const active =
              pathname === item.to || (item.to !== "/dashboard" && pathname.startsWith(`${item.to}/`));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-emerald text-emerald-foreground"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                )}
              >
                <item.icon className="size-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <Button
          type="button"
          variant="ghost"
          onClick={handleSignOut}
          className="h-auto justify-start rounded-lg px-3 py-2.5 text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <LogOut className="size-4 shrink-0" />
          Sign out
        </Button>
      </aside>

      <div className="lg:pl-64">
        {/* Sticky header */}
        <header className="sticky top-0 z-30 border-b border-sidebar-border bg-sidebar/95 backdrop-blur lg:border-border/70 lg:bg-background/95">
          <div className="mx-auto grid max-w-5xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <img
                src={logo.url}
                alt="GrowthBridge Bank"
                className="size-9 shrink-0 rounded-full object-cover lg:hidden"
                width={36}
                height={36}
              />
              <div className="min-w-0">
                <p className="truncate text-xs text-sidebar-foreground/55 lg:text-muted-foreground">
                  {title ?? `${greeting()},`}
                </p>
                <p className="truncate font-display text-base font-semibold text-sidebar-foreground lg:text-navy">
                  {title ? "GrowthBridge Bank" : (firstName ?? "Customer")}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <Link
                to="/help"
                aria-label="Help"
                className="grid size-10 place-items-center rounded-full text-sidebar-foreground/65 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground lg:text-muted-foreground lg:hover:bg-muted lg:hover:text-navy"
              >
                <HelpCircle className="size-5" />
              </Link>
              <Link
                to="/me"
                aria-label="Notifications"
                className="grid size-10 place-items-center rounded-full text-sidebar-foreground/65 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground lg:text-muted-foreground lg:hover:bg-muted lg:hover:text-navy"
              >
                <Bell className="size-5" />
              </Link>
              <Link
                to="/me"
                aria-label="Profile"
                className="grid size-10 shrink-0 place-items-center rounded-full border border-sidebar-foreground/15 bg-sidebar-accent text-sm font-semibold text-sidebar-foreground"
              >
                {initials}
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 pb-28 pt-4 sm:px-6 lg:pb-12">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-sidebar-border bg-sidebar/95 backdrop-blur lg:hidden">
        <ul className="mx-auto grid max-w-md grid-cols-5">
          {primaryNav.map((item) => {
            const active = pathname === item.to;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "flex flex-col items-center gap-1 py-2.5 text-[0.6875rem] font-medium transition-colors",
                    active ? "text-emerald" : "text-sidebar-foreground/45",
                  )}
                >
                  <item.icon className={cn("size-5", active && "stroke-[2.4]")} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
