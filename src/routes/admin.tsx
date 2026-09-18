import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { AdminGuard } from "@/components/admin/AdminGuard";
export const Route=createFileRoute("/admin")({component:AdminLayout});
function AdminLayout(){const pathname=useRouterState({select:(s)=>s.location.pathname}); if(pathname==="/admin/login") return <Outlet/>; return <AdminGuard><Outlet/></AdminGuard>;}
