import { AlertCircle, Search } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function AdminHeader({ title, description, actions }: { title: string; description: string; actions?: ReactNode }) { return <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h1 className="font-display text-2xl font-semibold text-navy sm:text-3xl">{title}</h1><p className="mt-1 text-sm text-muted-foreground">{description}</p></div>{actions}</div>; }
export function AdminPanel({ children, className }: { children: ReactNode; className?: string }) { return <section className={cn("overflow-hidden rounded-lg border bg-card shadow-sm", className)}>{children}</section>; }
export function StatusBadge({ status }: { status?: string | null }) { const s=(status??"unknown").toLowerCase(); const good=["active","approved","verified","completed","successful","paid","closed"].includes(s); const bad=["rejected","failed","frozen","defaulted","cancelled"].includes(s); return <Badge variant="outline" className={cn("whitespace-nowrap capitalize", good&&"border-success/30 bg-success/10 text-success", bad&&"border-destructive/30 bg-destructive/10 text-destructive", !good&&!bad&&"border-warning/40 bg-warning/10 text-warning-foreground")}>{s.replace(/_/g," ")}</Badge>; }
export function Money({ amount, currency="USD" }: { amount: unknown; currency?: string }) { const n=Number(amount??0); return <span className="tabular-nums">{new Intl.NumberFormat("en-US",{style:"currency",currency:currency||"USD"}).format(Number.isFinite(n)?n:0)}</span>; }
export function DateTime({ value }: { value?: string | null }) { if(!value)return <span>—</span>; const d=new Date(value); return <span className="whitespace-nowrap">{Number.isNaN(d.valueOf())?"—":d.toLocaleString([], {dateStyle:"medium",timeStyle:"short"})}</span>; }
export function SearchBox({ value, onChange, placeholder="Search" }: { value:string; onChange:(v:string)=>void; placeholder?:string }) { return <label className="relative block w-full sm:w-80"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input value={value} onChange={(e)=>onChange(e.target.value)} placeholder={placeholder} className="pl-9"/><span className="sr-only">{placeholder}</span></label>; }
export function PageLoading() { return <div className="space-y-4"><Skeleton className="h-20 w-full"/><Skeleton className="h-64 w-full"/></div>; }
export function PageError({ retry }: { retry:()=>void }) { return <AdminPanel className="flex flex-col items-center gap-3 p-10 text-center"><AlertCircle className="size-7 text-destructive"/><p className="text-sm text-muted-foreground">This information could not be loaded.</p><Button variant="outline" onClick={retry}>Try again</Button></AdminPanel>; }
export function EmptyRows({ message="No records found." }: { message?:string }) { return <div className="p-10 text-center text-sm text-muted-foreground">{message}</div>; }
