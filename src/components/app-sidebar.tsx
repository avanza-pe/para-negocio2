"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  CalendarClock,
  FilePen,
  FileText,
  FolderKanban,
  LayoutDashboard,
  LineChart,
  ListTodo,
  LogOut,
  Receipt,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/logo";
import { logout } from "@/lib/actions/auth";

// Agrupado por el flujo de trabajo: vender → atender → producir → medir.
const NAV = [
  {
    label: "Día a día",
    items: [
      { href: "/dashboard", label: "Resumen", icon: LayoutDashboard },
      { href: "/dashboard/hoy", label: "Hoy", icon: ListTodo },
    ],
  },
  {
    label: "Ventas",
    items: [
      { href: "/dashboard/prospectos", label: "Prospectos", icon: Target },
      { href: "/dashboard/reuniones", label: "Reuniones", icon: CalendarClock },
      { href: "/dashboard/propuestas", label: "Propuestas", icon: FilePen },
    ],
  },
  {
    label: "Clientes",
    items: [
      { href: "/dashboard/clientes", label: "Clientes", icon: Users },
      { href: "/dashboard/locales", label: "Locales y cartas", icon: UtensilsCrossed },
      { href: "/dashboard/cobros", label: "Cobros", icon: Receipt },
    ],
  },
  {
    label: "Producción",
    items: [
      { href: "/dashboard/produccion", label: "Contenido", icon: Sparkles },
      { href: "/dashboard/entregas", label: "Entregas", icon: FolderKanban },
      { href: "/dashboard/metricas", label: "Métricas", icon: LineChart },
      { href: "/dashboard/reportes", label: "Reportes", icon: FileText },
    ],
  },
  {
    label: "Sistema",
    items: [
      { href: "/dashboard/automatizaciones", label: "Automatizaciones", icon: Bot },
      { href: "/dashboard/configuracion", label: "Configuración", icon: Settings },
      { href: "/dashboard/equipo", label: "Equipo", icon: ShieldCheck, admin: true },
    ],
  },
];

export function AppSidebar({ siteName, userName, isAdmin }: { siteName: string; userName: string; isAdmin: boolean }) {
  const pathname = usePathname();
  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-3" aria-label={siteName}>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        {NAV.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items
                  .filter((i) => !("admin" in i && i.admin) || isAdmin)
                  .map(({ href, label, icon: Icon }) => (
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
        ))}
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
