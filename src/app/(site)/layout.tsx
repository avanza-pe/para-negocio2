import Link from "next/link";
import { Logo } from "@/components/logo";
import { SiteBackground } from "@/components/site-background";
import { SiteNavbar } from "@/components/site-navbar";
import { SITE } from "@/lib/site";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteBackground />
      <SiteNavbar />
      <main className="flex-1 pt-20">{children}</main>
      <footer className="border-t bg-background/60 py-10 text-sm text-muted-foreground backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid gap-2">
            <Logo className="text-foreground" />
            <p>© {new Date().getFullYear()} {SITE.name}. Lima, Perú.</p>
          </div>
          <div className="flex gap-5">
            <Link href="/privacidad" className="hover:text-foreground">Privacidad</Link>
            <Link href="/condiciones" className="hover:text-foreground">Condiciones</Link>
            <Link href="/login" className="hover:text-foreground">Equipo</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
