import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, BanknoteArrowDown, BanknoteArrowUp, FileCheck2, Gauge, HandCoins, Landmark, LogOut, Menu, ReceiptText, ScrollText, Send, Users, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import logo from "@/assets/gbb-logo.png.asset.json";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const nav = [
  ["/admin/dashboard", "Dashboard", Gauge], ["/admin/users", "Customers", Users],
  ["/admin/kyc", "KYC reviews", FileCheck2], ["/admin/deposits", "Deposits", BanknoteArrowDown],
  ["/admin/withdrawals", "Withdrawals", BanknoteArrowUp], ["/admin/transfers", "Transfers", Send],
  ["/admin/loans", "Loans", HandCoins], ["/admin/transactions", "Transactions", ReceiptText],
  ["/admin/audit-logs", "Audit logs", ScrollText],
] as const;

export function AdminShell({ children, email, roles }: { children: ReactNode; email?: string | null; roles: string[] }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  async function signOut() {
    await queryClient.cancelQueries(); queryClient.clear();
    const { error } = await supabase.auth.signOut();
    if (error) { toast.error("Could not sign out"); return; }
    await navigate({ to: "/admin/login", replace: true });
  }
  const sidebar = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-20 items-center gap-3 border-b border-sidebar-border px-5">
        <img src={logo.url} alt="GrowthBridge Bank" className="size-10 rounded-full object-cover" />
        <div className="min-w-0"><p className="truncate font-display text-sm font-semibold">GrowthBridge Bank</p><p className="text-xs font-medium text-gold">ADMIN PORTAL</p></div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {nav.map(([to, label, Icon]) => {
          const active = pathname === to;
          return <Link key={to} to={to} onClick={() => setOpen(false)} className={cn("flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors", active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground")}><Icon className="size-4" />{label}</Link>;
        })}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <div className="mb-2 px-3"><p className="truncate text-xs font-medium">{email ?? "Authorized staff"}</p><p className="mt-1 truncate text-[0.6875rem] capitalize text-sidebar-foreground/55">{roles.join(" · ").replace(/_/g, " ")}</p></div>
        <Button variant="ghost" onClick={signOut} className="w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"><LogOut className="size-4" />Sign out</Button>
      </div>
    </div>
  );
  return <div className="min-h-screen bg-muted/40">
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-sidebar-border lg:block">{sidebar}</aside>
    {open && <div className="fixed inset-0 z-50 lg:hidden"><div className="absolute inset-0 bg-foreground/50" onClick={() => setOpen(false)} /><aside className="relative h-full w-72 shadow-xl">{sidebar}<Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="absolute right-2 top-2 text-sidebar-foreground"><X className="size-5" /></Button></aside></div>}
    <div className="lg:pl-64"><header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur sm:px-6"><div className="flex items-center gap-3"><Button variant="ghost" size="icon" onClick={() => setOpen(true)} className="lg:hidden"><Menu className="size-5" /><span className="sr-only">Open menu</span></Button><div><p className="font-display text-base font-semibold text-navy">Operations Console</p><p className="text-xs text-muted-foreground">Secure staff workspace</p></div></div><BadgeCheck className="size-5 text-emerald" /></header><main className="mx-auto max-w-[90rem] p-4 sm:p-6 lg:p-8">{children}</main></div>
  </div>;
}
