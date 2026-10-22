import {
  ArrowRight,
  Bot,
  CalendarCheck,
  Check,
  Clapperboard,
  LayoutTemplate,
  Megaphone,
  MessageCircle,
  Palette,
  ShieldCheck,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HeroPreview } from "@/components/hero-preview";
import { LeadForm } from "@/components/lead-form";
import { Marquee } from "@/components/marquee";
import { Reveal } from "@/components/motion";
import { FAQ, PACKAGES, PROCESS, SITE, TOOLS, whatsappLink } from "@/lib/site";

const FACTS = [
  { value: "15 min", label: "diagnóstico sin costo" },
  { value: "100%", label: "entregas revisadas por una persona" },
  { value: "1 ronda", label: "de cambios incluida en el plan inicial" },
  { value: "0", label: "ventas prometidas: solo métricas reales" },
];

const SAMPLES = [
  { title: "Calendario de contenido", sector: "Restaurante", tone: "from-violet-500/30 to-fuchsia-500/20" },
  { title: "Reel de lanzamiento", sector: "Tienda de ropa", tone: "from-sky-500/30 to-emerald-500/20" },
  { title: "Campaña de temporada", sector: "Clínica dental", tone: "from-amber-500/30 to-rose-500/20" },
];

export default function HomePage() {
  const wa = whatsappLink();

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b">
        <div className="bg-grid absolute inset-0 -z-10" aria-hidden />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 lg:grid-cols-[1.15fr_1fr] lg:py-28">
          <div>
            <Reveal>
              <Badge variant="secondary" className="mb-5 gap-1.5 px-3 py-1">
                <span className="size-1.5 rounded-full bg-emerald-500" /> Marketing digital con IA · Perú
              </Badge>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="text-4xl font-semibold text-balance sm:text-6xl">
                Contenido y automatización para que tu negocio{" "}
                <span className="text-gradient">convierta más consultas</span> en oportunidades
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 max-w-xl text-lg text-muted-foreground text-pretty">
                Producimos contenido, videos y automatizaciones con IA. Una persona revisa cada entrega antes de que llegue a ti.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" className="h-11 px-5 text-base" nativeButton={false} render={<a href={SITE.bookingUrl || "#contacto"} />}>
                  <CalendarCheck /> Agenda un diagnóstico de 15 min
                </Button>
                <Button size="lg" variant="outline" className="h-11 px-5 text-base" nativeButton={false} render={<a href="#contacto" />}>
                  Solicita una propuesta <ArrowRight />
                </Button>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <HeroPreview />
          </Reveal>
        </div>
        <div className="border-t bg-background/60 py-4">
          <Marquee items={TOOLS} />
        </div>
      </section>

      {/* HECHOS */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <dl className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {FACTS.map((f, i) => (
            <Reveal key={f.label} delay={i * 0.05}>
              <dt className="font-heading text-4xl font-semibold text-gradient">{f.value}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{f.label}</dd>
            </Reveal>
          ))}
        </dl>
      </section>

      {/* SERVICIOS · BENTO */}
      <section id="servicios" className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-20">
        <Reveal>
          <h2 className="text-3xl font-semibold sm:text-4xl">Todo lo que tu marca necesita para mostrarse y vender</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">Cinco servicios, un solo proceso claro.</p>
        </Reveal>
        <div className="mt-10 grid gap-4 md:grid-cols-6">
          {[
            { icon: Palette, title: "Contenido para redes", text: "Piezas gráficas, copies y calendario editorial alineados a tu marca.", span: "md:col-span-3" },
            { icon: Clapperboard, title: "Videos publicitarios", text: "Reels y videos cortos editados para captar atención en los primeros segundos.", span: "md:col-span-3" },
            { icon: Megaphone, title: "Campañas creativas", text: "Ideas y creatividades para lanzamientos, promociones y fechas clave.", span: "md:col-span-2" },
            { icon: Bot, title: "Automatización de leads", text: "Formulario, CRM y avisos para que ninguna consulta se pierda.", span: "md:col-span-2" },
            { icon: LayoutTemplate, title: "Landing pages", text: "Una página clara y rápida que convierte visitas en conversaciones.", span: "md:col-span-2" },
          ].map(({ icon: Icon, title, text, span }, i) => (
            <Reveal key={title} delay={i * 0.05} className={span}>
              <Card className="group h-full transition-all hover:-translate-y-0.5 hover:shadow-lg hover:ring-primary/30">
                <CardContent className="flex h-full flex-col gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="text-sm text-muted-foreground">{text}</p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* PROCESO */}
      <section id="proceso" className="scroll-mt-20 border-y bg-muted/40 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <h2 className="text-3xl font-semibold sm:text-4xl">Cómo trabajamos</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">De la primera conversación a la medición, siempre con tu aprobación.</p>
          </Reveal>
          <ol className="mt-10 grid gap-4 md:grid-cols-5">
            {PROCESS.map((step, i) => (
              <Reveal key={step} delay={i * 0.06}>
                <li className="relative h-full rounded-2xl border bg-card p-5">
                  <span className="font-heading text-3xl font-semibold text-primary/70">0{i + 1}</span>
                  <p className="mt-2 font-medium">{step}</p>
                </li>
              </Reveal>
            ))}
          </ol>
          <Reveal>
            <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="size-4 text-primary" /> Nada se publica ni se entrega sin aprobación humana.
            </p>
          </Reveal>
        </div>
      </section>

      {/* PORTAFOLIO */}
      <section id="portafolio" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20">
        <Reveal>
          <h2 className="text-3xl font-semibold sm:text-4xl">Portafolio</h2>
          <p className="mt-3 text-muted-foreground">Muestras conceptuales de nuestro trabajo propio. No son resultados de clientes.</p>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {SAMPLES.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.06}>
              <Card className="overflow-hidden p-0">
                <div className={`grid aspect-[4/3] place-items-center bg-gradient-to-br ${s.tone}`}>
                  <span className="rounded-full bg-background/70 px-3 py-1 text-xs backdrop-blur">Muestra · {s.sector}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">Muestra conceptual</p>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* PLANES */}
      <section id="planes" className="scroll-mt-20 border-y bg-muted/40 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <h2 className="text-3xl font-semibold sm:text-4xl">Planes de lanzamiento</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Precios orientativos de lanzamiento. La inversión publicitaria en Meta/TikTok se cobra aparte.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PACKAGES.map((p, i) => {
              const featured = "featured" in p && p.featured;
              return (
                <Reveal key={p.name} delay={i * 0.05}>
                  <Card className={`relative h-full ${featured ? "ring-2 ring-primary shadow-xl shadow-primary/10" : ""}`}>
                    {featured && (
                      <Badge className="absolute -top-2.5 left-4">Más elegido</Badge>
                    )}
                    <CardContent className="flex h-full flex-col gap-4">
                      <div>
                        <h3 className="font-semibold">{p.name}</h3>
                        <p className="mt-2">
                          <span className="font-heading text-3xl font-semibold">{p.price}</span>{" "}
                          <span className="text-sm text-muted-foreground">{p.unit}</span>
                        </p>
                      </div>
                      <ul className="grid gap-2 text-sm">
                        {p.items.map((it) => (
                          <li key={it} className="flex gap-2">
                            <Check className="mt-0.5 size-4 shrink-0 text-primary" /> {it}
                          </li>
                        ))}
                      </ul>
                      <Button
                        variant={featured ? "default" : "outline"}
                        className="mt-auto w-full"
                        nativeButton={false}
                        render={<a href="#contacto" />}
                      >
                        Quiero este plan
                      </Button>
                    </CardContent>
                  </Card>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-4 py-20">
        <Reveal>
          <h2 className="text-3xl font-semibold sm:text-4xl">Preguntas frecuentes</h2>
        </Reveal>
        <Accordion className="mt-8">
          {FAQ.map((f) => (
            <AccordionItem key={f.q} value={f.q}>
              <AccordionTrigger className="text-left text-base">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* CONTACTO */}
      <section id="contacto" className="relative scroll-mt-20 overflow-hidden border-t">
        <div className="glow absolute left-1/2 top-0 -z-10 h-80 w-[40rem] -translate-x-1/2 opacity-60 blur-3xl" aria-hidden />
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 lg:grid-cols-2">
          <Reveal>
            <h2 className="text-3xl font-semibold sm:text-4xl">Cuéntanos sobre tu negocio</h2>
            <p className="mt-3 text-muted-foreground">
              Te respondemos con una propuesta breve adaptada a tu marca. Sin compromiso.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {SITE.bookingUrl && (
                <Button variant="outline" nativeButton={false} render={<a href={SITE.bookingUrl} />}>
                  <CalendarCheck /> Reserva una llamada
                </Button>
              )}
              {wa && (
                <Button variant="outline" nativeButton={false} render={<a href={wa} target="_blank" rel="noopener noreferrer" />}>
                  <MessageCircle /> WhatsApp
                </Button>
              )}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <Card className="shadow-xl">
              <CardContent>
                <LeadForm />
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </section>
    </>
  );
}
