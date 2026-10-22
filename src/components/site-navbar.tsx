"use client";

import Link from "next/link";
import * as React from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme";
import { cn } from "@/lib/utils";

const LINKS = [
  { id: "servicios", label: "Servicios" },
  { id: "proceso", label: "Proceso" },
  { id: "planes", label: "Planes" },
  { id: "faq", label: "FAQ" },
  { id: "contacto", label: "Contacto" },
];

/** Barra flotante con scroll-spy: resalta la sección visible. */
export function SiteNavbar() {
  const [active, setActive] = React.useState<string>("");
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    const els = LINKS.map((l) => document.getElementById(l.id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <header className="fixed inset-x-0 top-3 z-50 px-3">
      <div
        className={cn(
          "mx-auto flex h-14 max-w-5xl items-center justify-between rounded-full border px-4 transition-all duration-300",
          scrolled ? "bg-background/75 shadow-lg shadow-black/10 backdrop-blur-xl" : "bg-background/40 backdrop-blur-md",
        )}
      >
        <Link href="/" aria-label="AVANZA, inicio">
          <Logo />
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.id}
              href={`/#${l.id}`}
              aria-current={active === l.id ? "location" : undefined}
              className={cn(
                "relative rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground",
                active === l.id && "bg-accent text-accent-foreground",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex" nativeButton={false} render={<Link href="/login" />}>
            Equipo
          </Button>
          <Button size="sm" className="hidden rounded-full sm:inline-flex" nativeButton={false} render={<Link href="/#contacto" />}>
            Agenda un diagnóstico
          </Button>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menú" onClick={() => setOpen(true)}>
            <Menu />
          </Button>
        </div>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-72">
          <SheetTitle className="px-4 pt-4">
            <Logo />
          </SheetTitle>
          <nav className="mt-4 grid gap-1 px-2" aria-label="Menú móvil">
            {LINKS.map((l) => (
              <Link
                key={l.id}
                href={`/#${l.id}`}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2 text-base hover:bg-accent",
                  active === l.id && "bg-accent text-accent-foreground",
                )}
              >
                {l.label}
              </Link>
            ))}
            <Link href="/login" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-base text-muted-foreground hover:bg-accent">
              Equipo
            </Link>
          </nav>
          <div className="mt-4 px-4">
            <Button className="w-full rounded-full" nativeButton={false} render={<Link href="/#contacto" onClick={() => setOpen(false)} />}>
              Agenda un diagnóstico
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
