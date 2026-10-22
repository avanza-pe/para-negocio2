import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrackLead } from "@/components/analytics";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "¡Gracias!", robots: { index: false } };

export default function ThanksPage() {
  return (
    <section className="mx-auto max-w-xl px-4 py-24 text-center">
      <TrackLead />
      <CheckCircle2 className="mx-auto size-12 text-primary" />
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">¡Recibimos tu consulta!</h1>
      <p className="mt-3 text-muted-foreground">
        Te escribiremos pronto con una propuesta. Si quieres avanzar más rápido, reserva una llamada de 15 minutos.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        {SITE.bookingUrl && (
          <Button nativeButton={false} render={<a href={SITE.bookingUrl} />}>
            <CalendarCheck /> Reserva una llamada
          </Button>
        )}
        <Button variant="outline" nativeButton={false} render={<Link href="/" />}>
          Volver al inicio
        </Button>
      </div>
    </section>
  );
}
