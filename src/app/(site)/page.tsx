import { ArrowRight, CalendarCheck, Check, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadForm } from "@/components/lead-form";
import { PACKAGES, PROCESS, SERVICES_LIST, SITE, whatsappLink } from "@/lib/site";

const SAMPLES = [
  { title: "Calendario de contenido", sector: "Restaurante" },
  { title: "Reel de lanzamiento", sector: "Tienda de ropa" },
  { title: "Campaña de temporada", sector: "Clínica dental" },
];

export default function HomePage() {
  const wa = whatsappLink();

  return (
    <>
      <section className="border-b bg-gradient-to-b from-muted/50 to-background">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <Badge variant="secondary" className="mb-4">Marketing digital con IA · Perú</Badge>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
            {SITE.tagline}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground text-pretty">
            Producimos contenido, videos y automatizaciones con IA, y una persona revisa cada entrega antes de que llegue a ti.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" className="h-11 px-5 text-base" render={<a href={SITE.bookingUrl || "#contacto"} />}>
              <CalendarCheck /> Agenda un diagnóstico de 15 minutos
            </Button>
            <Button size="lg" variant="outline" className="h-11 px-5 text-base" render={<a href="#contacto" />}>
              Solicita una propuesta <ArrowRight />
            </Button>
          </div>
        </div>
      </section>

      <section id="servicios" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-16">
        <h2 className="text-2xl font-semibold tracking-tight">Servicios</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES_LIST.map((s) => (
            <Card key={s.title}>
              <CardHeader>
                <CardTitle>{s.title}</CardTitle>
                <CardDescription>{s.text}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section id="proceso" className="border-y bg-muted/30 py-16 scroll-mt-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-semibold tracking-tight">Cómo trabajamos</h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-5">
            {PROCESS.map((step, i) => (
              <li key={step} className="rounded-xl border bg-background p-4">
                <span className="text-sm text-muted-foreground">Paso {i + 1}</span>
                <p className="mt-1 font-medium">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="portafolio" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-semibold tracking-tight">Portafolio</h2>
        <p className="mt-2 text-muted-foreground">Muestras conceptuales de nuestro trabajo propio. No son resultados de clientes.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {SAMPLES.map((s) => (
            <Card key={s.title}>
              <div className="mx-4 grid aspect-video place-items-center rounded-lg bg-muted text-sm text-muted-foreground">
                Muestra · {s.sector}
              </div>
              <CardHeader>
                <CardTitle>{s.title}</CardTitle>
                <CardDescription>Muestra conceptual</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section id="planes" className="border-y bg-muted/30 py-16 scroll-mt-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-semibold tracking-tight">Planes de lanzamiento</h2>
          <p className="mt-2 text-muted-foreground">
            Precios orientativos de lanzamiento. La inversión publicitaria en Meta/TikTok se cobra aparte.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PACKAGES.map((p) => (
              <Card key={p.name} className={"featured" in p && p.featured ? "ring-2 ring-primary" : ""}>
                <CardHeader>
                  <CardTitle>{p.name}</CardTitle>
                  <CardDescription>
                    <span className="text-2xl font-semibold text-foreground">{p.price}</span> {p.unit}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="grid gap-2 text-sm">
                    {p.items.map((it) => (
                      <li key={it} className="flex gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" /> {it}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="contacto" className="mx-auto grid max-w-6xl scroll-mt-16 gap-10 px-4 py-16 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Cuéntanos sobre tu negocio</h2>
          <p className="mt-2 text-muted-foreground">
            Te respondemos con una propuesta breve adaptada a tu marca. Sin compromiso.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {SITE.bookingUrl && (
              <Button variant="outline" render={<a href={SITE.bookingUrl} />}>
                <CalendarCheck /> Reserva una llamada
              </Button>
            )}
            {wa && (
              <Button variant="outline" render={<a href={wa} target="_blank" rel="noopener noreferrer" />}>
                <MessageCircle /> WhatsApp
              </Button>
            )}
          </div>
        </div>
        <Card>
          <CardContent>
            <LeadForm />
          </CardContent>
        </Card>
      </section>
    </>
  );
}
