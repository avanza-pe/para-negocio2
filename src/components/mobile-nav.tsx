"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ListTodo, Menu, Target, Users } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/dashboard/prospectos", label: "Prospectos", icon: Target },
  { href: "/dashboard/hoy", label: "Hoy", icon: ListTodo },
  { href: "/dashboard/clientes", label: "Clientes", icon: Users },
];

/** Barra inferior para móvil (como la app del video). "Más" abre el menú completo. */
export function MobileNav() {
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();
  const active = (href: string) => (href === "/dashboard" ? pathname === href : pathname.startsWith(href));

  return (
    <nav
      aria-label="Navegación móvil"
      className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-2xl border bg-card/90 p-1.5 shadow-2xl shadow-black/30 backdrop-blur-xl md:hidden"
    >
      {ITEMS.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={active(href) ? "page" : undefined}
          className={cn(
            "flex min-w-14 flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[11px] text-muted-foreground transition-colors",
            active(href) && "bg-primary/15 font-medium text-primary",
          )}
        >
          <Icon className="size-5" />
          {label}
        </Link>
      ))}
      <button
        type="button"
        onClick={toggleSidebar}
        className="flex min-w-14 flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[11px] text-muted-foreground"
      >
        <Menu className="size-5" />
        Más
      </button>
    </nav>
  );
}
