import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { DecisionDialog } from "@/components/admin/DecisionDialog";
import { AdminHeader, AdminPanel, DateTime, EmptyRows, PageError, PageLoading, StatusBadge } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { listKyc, reviewKyc } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/kyc")({
  head: () => ({
    meta: [
      { title: "KYC Reviews | GBB Admin" },
      { name: "description", content: "Review GrowthBridge Bank customer identity verifications." },
      { property: "og:title", content: "KYC Reviews | GBB Admin" },
      { property: "og:description", content: "Review GrowthBridge Bank customer identity verifications." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: KycPage,
});

function KycPage() {
  const [status, setStatus] = useState("pending");
  const list = useServerFn(listKyc);
  const review = useServerFn(reviewKyc);
  const qc = useQueryClient();

  const q = useQuery({ queryKey: ["admin-kyc", status], queryFn: () => list({ data: { status } }) });
  const m = useMutation({
    mutationFn: (v: { userId: string; decision: "verified" | "rejected" | "in_review"; reason: string }) =>
      review({ data: v }),
    onSuccess: async () => {
      toast.success("Verification decision recorded");
      await qc.invalidateQueries({ queryKey: ["admin-kyc"] });
      await qc.invalidateQueries({ queryKey: ["admin-overview"] });
    },
    onError: () => toast.error("Decision could not be completed"),
  });

  return (
    <>
      <AdminHeader
        title="KYC reviews"
        description="Approve or reject customer identity verification."
        actions={
          <Tabs value={status} onValueChange={setStatus}>
            <TabsList>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="verified">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
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
            <EmptyRows message="No verification records in this view." />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last review</TableHead>
                    <TableHead className="text-right">Decision</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {q.data.map((r: any) => {
                    const pending = ["unverified", "pending", "in_review"].includes(r.kyc_status);
                    return (
                      <TableRow key={r.id}>
                        <TableCell>
                          <p className="font-medium">{r.customer}</p>
                          <p className="text-xs text-muted-foreground">{r.country || "—"}</p>
                        </TableCell>
                        <TableCell>
                          <p>{r.customerEmail}</p>
                          <p className="text-xs text-muted-foreground">{r.phone || "—"}</p>
                        </TableCell>
                        <TableCell><StatusBadge status={r.kyc_status} /></TableCell>
                        <TableCell>
                          <DateTime value={r.kyc_reviewed_at} />
                          {r.kyc_note && <p className="max-w-56 truncate text-xs text-muted-foreground">{r.kyc_note}</p>}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            {pending && (
                              <>
                                <DecisionDialog
                                  trigger={<Button size="sm">Approve</Button>}
                                  title="Approve this verification?"
                                  description="The customer will be marked verified and this decision is recorded in the audit log."
                                  confirmLabel="Approve"
                                  busy={m.isPending}
                                  onConfirm={async (reason) => {
                                    await m.mutateAsync({ userId: r.id, decision: "verified", reason });
                                  }}
                                />
                                <DecisionDialog
                                  trigger={<Button size="sm" variant="destructive">Reject</Button>}
                                  title="Reject this verification?"
                                  description="A reason is required and will be stored with the audit record."
                                  confirmLabel="Reject"
                                  destructive
                                  reasonRequired
                                  busy={m.isPending}
                                  onConfirm={async (reason) => {
                                    await m.mutateAsync({ userId: r.id, decision: "rejected", reason });
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
