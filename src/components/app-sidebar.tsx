"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, CalendarClock, FilePen, FileText, FolderKanban, ListTodo, Sparkles, LayoutDashboard, LineChart, LogOut, Target, Users } from "lucide-react";
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
import { Logo } from "@/components/logo";
import { logout } from "@/lib/actions/auth";

const NAV = [
  { href: "/dashboard", label: "Resumen", icon: LayoutDashboard },
  { href: "/dashboard/hoy", label: "Hoy", icon: ListTodo },
  { href: "/dashboard/prospectos", label: "Prospectos", icon: Target },
  { href: "/dashboard/reuniones", label: "Reuniones", icon: CalendarClock },
  { href: "/dashboard/propuestas", label: "Propuestas", icon: FilePen },
  { href: "/dashboard/clientes", label: "Clientes", icon: Users },
  { href: "/dashboard/produccion", label: "Producción", icon: Sparkles },
  { href: "/dashboard/entregas", label: "Entregas", icon: FolderKanban },
  { href: "/dashboard/reportes", label: "Reportes", icon: FileText },
  { href: "/dashboard/metricas", label: "Métricas", icon: LineChart },
  { href: "/dashboard/automatizaciones", label: "Automatizaciones", icon: Bot },
];

export function AppSidebar({ siteName, userName }: { siteName: string; userName: string }) {
  const pathname = usePathname();
  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-3" aria-label={siteName}>
        <Logo />
      </SidebarHeader>
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
