import { Link } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function SectionTitle({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="font-display text-base font-semibold text-navy">{children}</h2>
      {action}
    </div>
  );
}

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-2xl border border-border/70 bg-card p-4 shadow-sm", className)}>
      {children}
    </div>
  );
}

export function TileGrid({ children, cols = 4 }: { children: ReactNode; cols?: 3 | 4 }) {
  return (
    <div className={cn("grid gap-2", cols === 4 ? "grid-cols-4" : "grid-cols-3")}>{children}</div>
  );
}

export function Tile({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="flex min-h-[5.5rem] flex-col items-center justify-center gap-2 rounded-xl px-1 py-3 text-center transition-colors hover:bg-emerald-soft"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-emerald-soft text-emerald">
        <Icon className="size-5" />
      </span>
      <span className="text-[0.6875rem] font-medium leading-tight text-navy">{label}</span>
    </Link>
  );
}

export function StatusPill({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const tone =
    normalized === "completed" || normalized === "active" || normalized === "verified" || normalized === "available"
      ? "bg-emerald-soft text-emerald-deep"
      : normalized === "failed" || normalized === "rejected" || normalized === "reversed" || normalized === "cancelled"
        ? "bg-destructive/10 text-destructive"
        : "bg-warning/15 text-warning-foreground";

  const label =
    normalized === "completed" ? "Successful" : status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ");

  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[0.6875rem] font-medium", tone)}>{label}</span>
  );
}

export function LoadError({ onRetry, message }: { onRetry: () => void; message?: string }) {
  return (
    <Panel className="flex flex-col items-center gap-3 py-8 text-center">
      <AlertCircle className="size-6 text-destructive" />
      <p className="text-sm text-muted-foreground">
        {message ?? "We couldn't load this right now. Please try again."}
      </p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Retry
      </Button>
    </Panel>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-3">
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3 w-2/5" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-3 w-16 shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="py-8 text-center">
      <p className="text-sm font-medium text-navy">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
