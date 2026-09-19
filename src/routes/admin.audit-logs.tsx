import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useDeferredValue, useState } from "react";
import { AdminHeader, AdminPanel, DateTime, EmptyRows, PageError, PageLoading, SearchBox } from "@/components/admin/AdminUI";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listAuditLogs } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/audit-logs")({
  head: () => ({
    meta: [
      { title: "Audit Logs | GBB Admin" },
      { name: "description", content: "Permanent record of GrowthBridge Bank administrator actions." },
      { property: "og:title", content: "Audit Logs | GBB Admin" },
      { property: "og:description", content: "Permanent record of GrowthBridge Bank administrator actions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuditLogsPage,
});

function AuditLogsPage() {
  const [search, setSearch] = useState("");
  const term = useDeferredValue(search);
  const list = useServerFn(listAuditLogs);
  const q = useQuery({ queryKey: ["admin-audit", term], queryFn: () => list({ data: { search: term } }) });

  return (
    <>
      <AdminHeader
        title="Audit logs"
        description="Read-only history of every administrator decision."
        actions={<SearchBox value={search} onChange={setSearch} placeholder="Search action, staff or record" />}
      />
      {q.isLoading ? (
        <PageLoading />
      ) : q.isError ? (
        <PageError retry={() => void q.refetch()} />
      ) : (
        <AdminPanel>
          {!q.data?.length ? (
            <EmptyRows message="No administrator actions recorded yet." />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Record</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>When</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {q.data.map((r: any) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium capitalize">{String(r.action || "action").replace(/_/g, " ")}</TableCell>
                      <TableCell>{r.actor_email || "Authorized staff"}</TableCell>
                      <TableCell>
                        <p className="capitalize">{r.entity || "—"}</p>
                        <p className="max-w-52 truncate text-xs text-muted-foreground">{r.entity_id || r.target_user_id || ""}</p>
                      </TableCell>
                      <TableCell className="max-w-64"><p className="truncate">{r.reason || "—"}</p></TableCell>
                      <TableCell><DateTime value={r.created_at} /></TableCell>
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
