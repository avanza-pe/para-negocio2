import type { Metadata } from "next";
import Link from "next/link";
import { Bell } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { requireStaff } from "@/lib/auth";
import { SITE } from "@/lib/site";
import { getToday, todayCount } from "@/lib/today";

export const metadata: Metadata = { title: "Panel", robots: { index: false, follow: false } };

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const { profile, user, supabase } = await requireStaff();
  const pending = todayCount(await getToday(supabase));
  const display = profile.full_name ?? user.email ?? "";
  const initials = display.split(/\s+/).map((p: string) => p[0]).join("").slice(0, 2).toUpperCase() || "A";

  return (
    <SidebarProvider>
      <AppSidebar siteName={SITE.name} userName={display} isAdmin={profile.role === "admin"} />
      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur-xl md:px-5">
          <SidebarTrigger className="hidden md:inline-flex" />
          <span className="text-sm font-medium md:hidden">{SITE.name}</span>
          <div className="ml-auto flex items-center gap-1.5">
            <Button variant="ghost" size="icon" className="relative" aria-label={`Pendientes de hoy: ${pending}`} nativeButton={false} render={<Link href="/dashboard/hoy" />}>
              <Bell />
              {pending > 0 && <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-rose-500 text-[10px] font-medium text-white">{pending > 9 ? "9+" : pending}</span>}
            </Button>
            <ThemeToggle />
            <Button size="sm" className="hidden rounded-full sm:inline-flex" nativeButton={false} render={<Link href="/dashboard/prospectos" />}>
              Prospectos
            </Button>
            <span aria-label={display} className="grid size-8 place-items-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
              {initials}
            </span>
          </div>
        </header>
        <div className="flex-1 p-3 pb-28 md:p-6 md:pb-6">{children}</div>
      </SidebarInset>
      <MobileNav />
    </SidebarProvider>
  );
}
