import type { Metadata } from "next";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { requireStaff } from "@/lib/auth";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Panel", robots: { index: false, follow: false } };

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const { profile, user } = await requireStaff();
  return (
    <SidebarProvider>
      <AppSidebar siteName={SITE.name} userName={profile.full_name ?? user.email ?? ""} />
      <SidebarInset>
        <header className="flex h-12 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <span className="text-sm text-muted-foreground">Panel interno</span>
          <div className="ml-auto"><ThemeToggle /></div>
        </header>
        <div className="flex-1 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
