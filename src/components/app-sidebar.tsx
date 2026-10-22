"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, FolderKanban, LayoutDashboard, LineChart, LogOut, Target, Users } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { logout } from "@/lib/actions/auth";

const NAV = [
  { href: "/dashboard", label: "Resumen", icon: LayoutDashboard },
  { href: "/dashboard/prospectos", label: "Prospectos", icon: Target },
  { href: "/dashboard/clientes", label: "Clientes", icon: Users },
  { href: "/dashboard/entregas", label: "Entregas", icon: FolderKanban },
  { href: "/dashboard/metricas", label: "Métricas", icon: LineChart },
  { href: "/dashboard/automatizaciones", label: "Automatizaciones", icon: Bot },
];

export function AppSidebar({ siteName, userName }: { siteName: string; userName: string }) {
  const pathname = usePathname();
  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-3 font-semibold tracking-tight">{siteName}</SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map(({ href, label, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    isActive={href === "/dashboard" ? pathname === href : pathname.startsWith(href)}
                    render={<Link href={href} />}
                  >
                    <Icon />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <p className="truncate px-2 text-xs text-muted-foreground">{userName}</p>
        <form action={logout}>
          <SidebarMenuButton type="submit">
            <LogOut />
            <span>Cerrar sesión</span>
          </SidebarMenuButton>
        </form>
      </SidebarFooter>
    </Sidebar>
  );
}
