import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useDeferredValue, useState } from "react";
import { AdminHeader, AdminPanel, DateTime, EmptyRows, Money, PageError, PageLoading, SearchBox, StatusBadge } from "@/components/admin/AdminUI";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listLedger } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/transactions")({
  head: () => ({
    meta: [
      { title: "Transactions | GBB Admin" },
      { name: "description", content: "Full GrowthBridge Bank transaction ledger." },
      { property: "og:title", content: "Transactions | GBB Admin" },
      { property: "og:description", content: "Full GrowthBridge Bank transaction ledger." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TransactionsPage,
});

const STATUSES = ["all", "pending", "processing", "completed", "failed", "reversed", "cancelled"];
const TYPES = ["all", "deposit", "withdrawal", "transfer", "payment", "reward", "fee", "adjustment", "trade"];
const DIRECTIONS = ["all", "credit", "debit"];

function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [direction, setDirection] = useState("all");
  const term = useDeferredValue(search);
  const list = useServerFn(listLedger);

  const q = useQuery({
    queryKey: ["admin-ledger", "all", term, status, type, direction],
    queryFn: () => list({ data: { search: term, status, type, direction } }),
  });

  return (
    <>
      <AdminHeader title="Transactions" description="Complete ledger across all customer accounts." />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <SearchBox value={search} onChange={setSearch} placeholder="Search description, merchant or reference" />
        <Filter label="Status" value={status} onChange={setStatus} options={STATUSES} />
        <Filter label="Type" value={type} onChange={setType} options={TYPES} />
        <Filter label="Direction" value={direction} onChange={setDirection} options={DIRECTIONS} />
      </div>
      {q.isLoading ? (
        <PageLoading />
      ) : q.isError ? (
        <PageError retry={() => void q.refetch()} />
      ) : (
        <AdminPanel>
          {!q.data?.length ? (
            <EmptyRows message="No transactions match these filters." />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {q.data.map((r: any) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <p className="font-medium">{r.customer}</p>
                        <p className="text-xs text-muted-foreground">{r.customerEmail}</p>
                      </TableCell>
                      <TableCell>
                        <p>{r.description || r.merchant || r.type}</p>
                        <p className="text-xs text-muted-foreground">{r.reference || "—"}</p>
                      </TableCell>
                      <TableCell className="capitalize whitespace-nowrap">{r.type} · {r.direction}</TableCell>
                      <TableCell className="font-medium">
                        <span className={r.direction === "credit" ? "text-success" : ""}>
                          {r.direction === "credit" ? "+" : "−"} <Money amount={r.amount} />
                        </span>
                      </TableCell>
                      <TableCell><DateTime value={r.created_at} /></TableCell>
                      <TableCell><StatusBadge status={r.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </AdminPanel>
      )}
    </>
  );
}

function Filter({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full sm:w-44" aria-label={label}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o} className="capitalize">
            {o === "all" ? `All ${label.toLowerCase()}` : o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
