import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, type ReactNode } from "react";
import { getAdminSession } from "@/lib/admin.functions";
import { AdminShell } from "./AdminShell";
import { PageLoading } from "./AdminUI";

export function AdminGuard({ children }: { children: ReactNode }) {
  const navigate=useNavigate(); const getSession=useServerFn(getAdminSession);
  const query=useQuery({queryKey:["admin-session"],queryFn:()=>getSession(),retry:false,staleTime:60_000});
  useEffect(()=>{ if(query.isError) void navigate({to:"/admin/login",search:{reason:"unauthorized"},replace:true}); },[query.isError,navigate]);
  if(query.isLoading) return <div className="min-h-screen bg-muted/40 p-6"><div className="mx-auto max-w-4xl"><PageLoading/></div></div>;
  if(!query.data) return null;
  return <AdminShell email={query.data.email} roles={query.data.roles}>{children}</AdminShell>;
}
