import { CalendarCheck, MessageCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { FAQ, SITE, whatsappLink } from "@/lib/site";

/** FAQ en dos columnas: introducción + contacto a la izquierda, acordeón a la derecha. */
export function FaqSection() {
  const wa = whatsappLink();
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
      <div className="lg:sticky lg:top-28 lg:self-start">
        <h2 className="text-3xl font-semibold sm:text-4xl">Preguntas frecuentes</h2>
        <p className="mt-3 text-muted-foreground">
          Lo que más nos preguntan antes de empezar. Si tu duda no está aquí, escríbenos.
        </p>
        <div className="mt-6 rounded-2xl border bg-card/70 p-5 backdrop-blur">
          <p className="font-medium">¿Prefieres hablarlo?</p>
          <p className="mt-1 text-sm text-muted-foreground">Un diagnóstico de 15 minutos, sin costo ni compromiso.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" className="rounded-full" nativeButton={false} render={<a href={SITE.bookingUrl || "#contacto"} />}>
              <CalendarCheck /> Agendar
            </Button>
            {wa && (
              <Button size="sm" variant="outline" className="rounded-full" nativeButton={false} render={<a href={wa} target="_blank" rel="noopener noreferrer" />}>
                <MessageCircle /> WhatsApp
              </Button>
            )}
          </div>
        </div>
      </div>
      <Accordion>
        {FAQ.map((f) => (
          <AccordionItem key={f.q} value={f.q}>
            <AccordionTrigger className="py-5 text-left text-base">{f.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
