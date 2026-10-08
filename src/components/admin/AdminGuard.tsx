import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { createContext, useContext, useEffect, type ReactNode } from "react";
import { getAdminSession } from "@/lib/admin.functions";
import { AdminShell } from "./AdminShell";
import { PageLoading } from "./AdminUI";

const AdminPermissionsContext = createContext({ canAct: false });

export function useAdminPermissions() {
  return useContext(AdminPermissionsContext);
}

export function AdminGuard({ children }: { children: ReactNode }) {
  const navigate=useNavigate(); const getSession=useServerFn(getAdminSession);
  const query=useQuery({queryKey:["admin-session"],queryFn:()=>getSession(),retry:false,staleTime:60_000});
  useEffect(()=>{ if(query.isError) void navigate({to:"/admin/login",search:{reason:"unauthorized"},replace:true}); },[query.isError,navigate]);
  if(query.isLoading) return <div className="min-h-screen bg-muted/40 p-6"><div className="mx-auto max-w-4xl"><PageLoading/></div></div>;
  if(!query.data) return null;
  return <AdminPermissionsContext.Provider value={{ canAct: query.data.canAct }}><AdminShell email={query.data.email} roles={query.data.roles}>{children}</AdminShell></AdminPermissionsContext.Provider>;
}
