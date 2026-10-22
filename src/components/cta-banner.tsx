import Link from "next/link";
import { ArrowRight, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site";

export function CtaBanner() {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border bg-gradient-to-br from-violet-600 via-indigo-600 to-fuchsia-600 px-6 py-14 text-center text-white shadow-2xl shadow-violet-600/20 sm:px-12">
      <div aria-hidden className="absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,#fff3_1px,transparent_1px),linear-gradient(to_bottom,#fff3_1px,transparent_1px)] [background-size:36px_36px] [mask-image:radial-gradient(ellipse_at_center,#000,transparent_75%)]" />
      <div className="relative mx-auto max-w-2xl">
        <h2 className="text-3xl font-semibold text-balance sm:text-5xl">¿Listo para que tu negocio avance?</h2>
        <p className="mt-4 text-white/80 text-pretty">
          Cuéntanos tu objetivo y te decimos con honestidad cómo podemos ayudarte. 15 minutos, sin costo.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button size="lg" className="h-11 rounded-full bg-white px-6 text-base text-violet-700 hover:bg-white/90" nativeButton={false} render={<a href={SITE.bookingUrl || "#contacto"} />}>
            <CalendarCheck /> Agenda un diagnóstico
          </Button>
          <Button size="lg" variant="outline" className="h-11 rounded-full border-white/40 bg-transparent px-6 text-base text-white hover:bg-white/10 hover:text-white" nativeButton={false} render={<Link href="/#contacto" />}>
            Solicitar propuesta <ArrowRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
