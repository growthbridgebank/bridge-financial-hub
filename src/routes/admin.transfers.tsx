import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { DecisionDialog } from "@/components/admin/DecisionDialog";
import { AdminHeader, AdminPanel, DateTime, EmptyRows, Money, PageError, PageLoading, StatusBadge } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { listTransfers, reviewTransfer } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/transfers")({
  head: () => ({
    meta: [
      { title: "Transfers | GBB Admin" },
      { name: "description", content: "Review GrowthBridge Bank transfer requests." },
      { property: "og:title", content: "Transfers | GBB Admin" },
      { property: "og:description", content: "Review GrowthBridge Bank transfer requests." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TransfersPage,
});

function TransfersPage() {
  const [status, setStatus] = useState("pending");
  const list = useServerFn(listTransfers);
  const review = useServerFn(reviewTransfer);
  const qc = useQueryClient();

  const q = useQuery({ queryKey: ["admin-transfers", status], queryFn: () => list({ data: { status } }) });
  const m = useMutation({
    mutationFn: (v: { id: string; approve: boolean; reason: string }) => review({ data: v }),
    onSuccess: async () => {
      toast.success("Transfer decision recorded");
      await qc.invalidateQueries({ queryKey: ["admin-transfers"] });
      await qc.invalidateQueries({ queryKey: ["admin-overview"] });
    },
    onError: () => toast.error("Decision could not be completed"),
  });

  return (
    <>
      <AdminHeader
        title="Transfers"
        description="Approve or reject customer transfer instructions."
        actions={
          <Tabs value={status} onValueChange={setStatus}>
            <TabsList>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />
      {q.isLoading ? (
        <PageLoading />
      ) : q.isError ? (
        <PageError retry={() => void q.refetch()} />
      ) : (
        <AdminPanel>
          {!q.data?.length ? (
            <EmptyRows message="No transfers in this view." />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Memo</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Decision</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {q.data.map((r: any) => {
                    const actionable = ["pending", "processing"].includes(r.status);
                    return (
                      <TableRow key={r.id}>
                        <TableCell>
                          <p className="font-medium">{r.customer}</p>
                          <p className="text-xs text-muted-foreground">{r.customerEmail}</p>
                        </TableCell>
                        <TableCell>
                          <p>{r.memo || "Transfer"}</p>
                          <p className="text-xs text-muted-foreground">{r.provider_reference || "—"}</p>
                        </TableCell>
                        <TableCell className="font-medium"><Money amount={r.amount} /></TableCell>
                        <TableCell><DateTime value={r.created_at} /></TableCell>
                        <TableCell><StatusBadge status={r.status} /></TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            {actionable && (
                              <>
                                <DecisionDialog
                                  trigger={<Button size="sm">Approve</Button>}
                                  title="Approve this transfer?"
                                  description="The secured database routine moves the funds and records the decision."
                                  confirmLabel="Approve"
                                  busy={m.isPending}
                                  onConfirm={async (reason) => {
                                    await m.mutateAsync({ id: r.id, approve: true, reason });
                                  }}
                                />
                                <DecisionDialog
                                  trigger={<Button size="sm" variant="destructive">Reject</Button>}
                                  title="Reject this transfer?"
                                  description="A reason is required and will be stored with the audit record."
                                  confirmLabel="Reject"
                                  destructive
                                  reasonRequired
                                  busy={m.isPending}
                                  onConfirm={async (reason) => {
                                    await m.mutateAsync({ id: r.id, approve: false, reason });
                                  }}
                                />
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </AdminPanel>
      )}
    </>
  );
}
