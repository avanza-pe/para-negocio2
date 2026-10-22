import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="font-semibold tracking-tight">
            {SITE.name}
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <Link href="/#servicios" className="hover:text-foreground">Servicios</Link>
            <Link href="/#proceso" className="hover:text-foreground">Cómo trabajamos</Link>
            <Link href="/#planes" className="hover:text-foreground">Planes</Link>
            <Link href="/#contacto" className="hover:text-foreground">Contacto</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/login" />}>
              Equipo
            </Button>
            <Button size="sm" nativeButton={false} render={<Link href="/#contacto" />}>
              Agenda un diagnóstico
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-8 text-sm text-muted-foreground">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {SITE.name}. Lima, Perú.</p>
          <div className="flex gap-4">
            <Link href="/privacidad" className="hover:text-foreground">Privacidad</Link>
            <Link href="/condiciones" className="hover:text-foreground">Condiciones</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
