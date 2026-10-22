import { ArrowRight, Bot, CalendarCheck, Clapperboard, LayoutTemplate, Megaphone, Palette, ShieldCheck } from "lucide-react";
import { AnalyticsBento, type BentoData } from "@/components/analytics-bento";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ContactGlobe } from "@/components/contact-globe";
import { CtaBanner } from "@/components/cta-banner";
import { FaqSection } from "@/components/faq-section";
import { HeroCollage } from "@/components/hero-collage";
import { Marquee } from "@/components/marquee";
import { Reveal } from "@/components/motion";
import { Pricing } from "@/components/pricing";
import { PROCESS, SITE, TOOLS } from "@/lib/site";

const SAMPLE: BentoData = {
  labels: ["Mes 1", "Mes 2", "Mes 3", "Mes 4", "Mes 5", "Mes 6"],
  line: [12, 18, 15, 26, 31, 42],
  lineLabel: "Consultas generadas (ejemplo)",
  waveA: [10, 14, 12, 20, 24, 30],
  waveALabel: "Orgánico",
  waveB: [4, 6, 9, 8, 14, 18],
  waveBLabel: "Campañas",
  categories: [
    { name: "Reels", value: 38 },
    { name: "Posts", value: 29 },
    { name: "Stories", value: 18 },
    { name: "Landing", value: 12 },
  ],
  radar: [
    { name: "Alcance", value: 70 },
    { name: "Clics", value: 55 },
    { name: "Consultas", value: 80 },
    { name: "Cierres", value: 40 },
    { name: "Retención", value: 60 },
  ],
};

const SAMPLES = [
  { title: "Calendario de contenido", sector: "Restaurante", tone: "from-cyan-500/30 to-blue-600/20" },
  { title: "Reel de lanzamiento", sector: "Tienda de ropa", tone: "from-blue-600/30 to-fuchsia-500/20" },
  { title: "Campaña de temporada", sector: "Clínica dental", tone: "from-fuchsia-500/30 to-amber-400/20" },
];

const SERVICES = [
  { icon: Palette, title: "Contenido para redes", text: "Piezas gráficas, copies y calendario editorial alineados a tu marca.", span: "md:col-span-3" },
  { icon: Clapperboard, title: "Videos publicitarios", text: "Reels y videos cortos editados para captar atención en los primeros segundos.", span: "md:col-span-3" },
  { icon: Megaphone, title: "Campañas creativas", text: "Ideas y creatividades para lanzamientos, promociones y fechas clave.", span: "md:col-span-2" },
  { icon: Bot, title: "Automatización de leads", text: "Formulario, CRM y avisos para que ninguna consulta se pierda.", span: "md:col-span-2" },
  { icon: LayoutTemplate, title: "Landing pages", text: "Una página clara y rápida que convierte visitas en conversaciones.", span: "md:col-span-2" },
];

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative px-4 pb-12 pt-16 text-center sm:pt-24">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <Badge variant="secondary" className="mb-6 gap-1.5 rounded-full px-3 py-1">
              <span className="size-1.5 rounded-full bg-cyan-400" /> Marketing digital con IA · Perú
            </Badge>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="text-balance text-5xl font-semibold leading-[1.05] sm:text-7xl">
              Haz que tu negocio{" "}
              <span className="font-serif-display text-gradient pr-1 text-[1.12em] font-normal italic">avance</span> con contenido y automatización con IA
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-pretty">
              Producimos contenido, videos y automatizaciones con IA. Una persona revisa cada entrega antes de que llegue a ti.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button size="lg" className="h-11 rounded-full px-6 text-base" nativeButton={false} render={<a href={SITE.bookingUrl || "#contacto"} />}>
                <CalendarCheck /> Agenda un diagnóstico de 15 min
              </Button>
              <Button size="lg" variant="outline" className="h-11 rounded-full px-6 text-base" nativeButton={false} render={<a href="#contacto" />}>
                Solicita una propuesta <ArrowRight />
              </Button>
            </div>
            <p className="mt-5 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="size-4 text-cyan-400" /> Diagnóstico sin costo · Nada se publica sin tu aprobación
            </p>
          </Reveal>
        </div>
        <Reveal delay={0.25}>
          <HeroCollage />
        </Reveal>
      </section>

      {/* HERRAMIENTAS REALES */}
      <section aria-label="Herramientas que usamos" className="border-y bg-background/50 py-5 backdrop-blur">
        <p className="mb-3 text-center text-xs uppercase tracking-widest text-muted-foreground">Herramientas con las que producimos y medimos</p>
        <Marquee items={[...TOOLS, ...TOOLS]} />
      </section>

      {/* SERVICIOS */}
      <section id="servicios" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-24">
        <Reveal>
          <h2 className="text-3xl font-semibold sm:text-4xl">Todo lo que tu marca necesita para mostrarse y vender</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">Cinco servicios, un solo proceso claro.</p>
        </Reveal>
        <div className="mt-10 grid gap-4 md:grid-cols-6">
          {SERVICES.map(({ icon: Icon, title, text, span }, i) => (
            <Reveal key={title} delay={i * 0.05} className={span}>
              <Card className="group h-full bg-card/70 backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-lg hover:ring-primary/30">
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
      <section id="proceso" className="scroll-mt-24 border-y bg-muted/30 py-24 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <h2 className="text-3xl font-semibold sm:text-4xl">Cómo trabajamos</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">De la primera conversación a la medición, siempre con tu aprobación.</p>
          </Reveal>
          <ol className="mt-10 grid gap-4 md:grid-cols-5">
            {PROCESS.map((step, i) => (
              <Reveal key={step} delay={i * 0.06}>
                <li className="h-full rounded-2xl border bg-card/80 p-5">
                  <span className="font-heading text-3xl font-semibold text-gradient">0{i + 1}</span>
                  <p className="mt-2 font-medium">{step}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* MÉTRICAS · BENTO */}
      <section id="metricas" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-24">
        <Reveal>
          <h2 className="text-3xl font-semibold sm:text-4xl">Medimos lo que importa</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Reportamos la métrica del objetivo que contratamos juntos, solo con datos verificables. Esto es un ejemplo ilustrativo del tipo de reporte.
          </p>
        </Reveal>
        <Reveal delay={0.1} className="mt-10">
          <AnalyticsBento data={SAMPLE} sample />
        </Reveal>
      </section>

      {/* PORTAFOLIO */}
      <section id="portafolio" className="mx-auto max-w-6xl scroll-mt-24 px-4 pb-24">
        <Reveal>
          <h2 className="text-3xl font-semibold sm:text-4xl">Portafolio</h2>
          <p className="mt-3 text-muted-foreground">Muestras conceptuales de nuestro trabajo propio. No son resultados de clientes.</p>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {SAMPLES.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.06}>
              <Card className="overflow-hidden bg-card/70 p-0 backdrop-blur">
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
      <section id="planes" className="scroll-mt-24 border-y bg-muted/30 py-24 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-semibold sm:text-4xl">Planes de lanzamiento</h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">Elige cómo quieres empezar. Todo queda por escrito en la propuesta.</p>
            </div>
          </Reveal>
          <Pricing />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-24">
        <FaqSection />
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <Reveal>
          <CtaBanner />
        </Reveal>
      </section>

      {/* CONTACTO */}
      <section id="contacto" className="mx-auto max-w-6xl scroll-mt-24 px-4 pb-28">
        <ContactGlobe />
      </section>
    </>
  );
}
