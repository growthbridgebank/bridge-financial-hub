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
import { listLoans, reviewLoan } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/loans")({
  head: () => ({
    meta: [
      { title: "Loans | GBB Admin" },
      { name: "description", content: "Review GrowthBridge Bank loan applications." },
      { property: "og:title", content: "Loans | GBB Admin" },
      { property: "og:description", content: "Review GrowthBridge Bank loan applications." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoansPage,
});

function LoansPage() {
  const [status, setStatus] = useState("pending");
  const list = useServerFn(listLoans);
  const review = useServerFn(reviewLoan);
  const qc = useQueryClient();

  const q = useQuery({ queryKey: ["admin-loans", status], queryFn: () => list({ data: { status } }) });
  const m = useMutation({
    mutationFn: (v: { id: string; status: "under_review" | "approved" | "rejected" | "disbursed" | "repaying" | "closed"; reason: string }) =>
      review({ data: v }),
    onSuccess: async () => {
      toast.success("Loan decision recorded");
      await qc.invalidateQueries({ queryKey: ["admin-loans"] });
      await qc.invalidateQueries({ queryKey: ["admin-overview"] });
    },
    onError: () => toast.error("Decision could not be completed"),
  });

  return (
    <>
      <AdminHeader
        title="Loans"
        description="Assess and decide customer loan applications."
        actions={
          <Tabs value={status} onValueChange={setStatus}>
            <TabsList>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
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
            <EmptyRows message="No loan applications in this view." />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Decision</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {q.data.map((r: any) => {
                    const open = ["pending", "under_review"].includes(r.status);
                    const approved = r.status === "approved";
                    return (
                      <TableRow key={r.id}>
                        <TableCell>
                          <p className="font-medium">{r.customer}</p>
                          <p className="text-xs text-muted-foreground">{r.customerEmail}</p>
                        </TableCell>
                        <TableCell>
                          <p>{r.purpose || "Personal loan"}</p>
                          <p className="text-xs text-muted-foreground">{r.reference || "—"}</p>
                        </TableCell>
                        <TableCell className="font-medium"><Money amount={r.amount} /></TableCell>
                        <TableCell className="whitespace-nowrap">{r.term_months ? `${r.term_months} mo` : "—"}</TableCell>
                        <TableCell><DateTime value={r.created_at} /></TableCell>
                        <TableCell><StatusBadge status={r.status} /></TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            {open && (
                              <>
                                <DecisionDialog
                                  trigger={<Button size="sm">Approve</Button>}
                                  title="Approve this loan application?"
                                  description="The decision is applied by the secured database routine and recorded in the audit log."
                                  confirmLabel="Approve"
                                  busy={m.isPending}
                                  onConfirm={async (reason) => {
                                    await m.mutateAsync({ id: r.id, status: "approved", reason });
                                  }}
                                />
                                <DecisionDialog
                                  trigger={<Button size="sm" variant="destructive">Reject</Button>}
                                  title="Reject this loan application?"
                                  description="A reason is required and will be stored with the audit record."
                                  confirmLabel="Reject"
                                  destructive
                                  reasonRequired
                                  busy={m.isPending}
                                  onConfirm={async (reason) => {
                                    await m.mutateAsync({ id: r.id, status: "rejected", reason });
                                  }}
                                />
                              </>
                            )}
                            {approved && (
                              <DecisionDialog
                                trigger={<Button size="sm" variant="outline">Mark disbursed</Button>}
                                title="Mark this loan as disbursed?"
                                description="Use this once the funds have been released to the customer."
                                confirmLabel="Mark disbursed"
                                busy={m.isPending}
                                onConfirm={async (reason) => {
                                  await m.mutateAsync({ id: r.id, status: "disbursed", reason });
                                }}
                              />
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
