import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden p-6 text-center">
      <div aria-hidden className="bg-grid absolute inset-0 -z-10" />
      <div aria-hidden className="glow absolute left-1/2 top-0 -z-10 h-72 w-[36rem] -translate-x-1/2 opacity-60 blur-3xl" />
      <div className="grid justify-items-center gap-5">
        <Logo />
        <p className="font-heading text-7xl font-semibold text-gradient">404</p>
        <h1 className="text-2xl font-semibold">Esta página no existe</h1>
        <p className="max-w-sm text-muted-foreground">Puede que el enlace esté mal escrito o que la página se haya movido.</p>
        <Button className="rounded-full" nativeButton={false} render={<Link href="/" />}>
          Volver al inicio
        </Button>
      </div>
    </main>
  );
}
