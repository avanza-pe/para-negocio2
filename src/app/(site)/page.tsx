import { ArrowRight, Bot, CalendarCheck, Clapperboard, LayoutTemplate, Megaphone, Palette, Play, ShieldCheck } from "lucide-react";
import { AnalyticsBento, type BentoData } from "@/components/analytics-bento";
import { BentoCard, BentoGrid } from "@/components/bento";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ContactGlobe } from "@/components/contact-globe";
import { CtaBanner } from "@/components/cta-banner";
import { FaqSection } from "@/components/faq-section";
import { HeroCollage } from "@/components/hero-collage";
import { Marquee } from "@/components/marquee";
import { HeroStage, Reveal } from "@/components/motion";
import { Pricing } from "@/components/pricing";
import { ProcessSteps } from "@/components/process-steps";
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

function IconBadge({ icon: Icon }: { icon: typeof Palette }) {
  return (
    <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
      <Icon className="size-5" />
    </span>
  );
}

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <HeroStage className="relative px-4 pb-12 pt-16 text-center sm:pt-24">
        <div className="mx-auto max-w-4xl">
          <div data-hero>
            <Badge variant="secondary" className="mb-6 gap-1.5 rounded-full px-3 py-1">
              <span className="size-1.5 rounded-full bg-cyan-400" /> Marketing digital con IA · Perú
            </Badge>
          </div>
          <h1 data-hero className="text-balance text-5xl font-semibold leading-[1.05] sm:text-7xl">
            Haz que tu negocio{" "}
            <span className="font-serif-display text-gradient pr-1 text-[1.12em] font-normal italic">avance</span> con contenido y automatización con IA
          </h1>
          <p data-hero className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-pretty">
            Producimos contenido, videos y automatizaciones con IA. Una persona revisa cada entrega antes de que llegue a ti.
          </p>
          <div data-hero className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" className="h-11 rounded-full px-6 text-base" nativeButton={false} render={<a href={SITE.bookingUrl || "#contacto"} />}>
              <CalendarCheck /> Agenda un diagnóstico de 15 min
            </Button>
            <Button size="lg" variant="outline" className="h-11 rounded-full px-6 text-base" nativeButton={false} render={<a href="#contacto" />}>
              Solicita una propuesta <ArrowRight />
            </Button>
          </div>
          <p data-hero className="mt-5 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="size-4 text-cyan-400" /> Diagnóstico sin costo · Nada se publica sin tu aprobación
          </p>
        </div>
        <HeroCollage />
      </HeroStage>

      {/* HERRAMIENTAS REALES */}
      <section aria-label="Herramientas que usamos" className="border-y bg-background/50 py-5 backdrop-blur">
        <p className="mb-3 text-center text-xs uppercase tracking-widest text-muted-foreground">Herramientas con las que producimos y medimos</p>
        <Marquee items={[...TOOLS, ...TOOLS]} />
      </section>

      {/* SERVICIOS · BENTO */}
      <section id="servicios" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-24">
        <Reveal>
          <h2 className="text-3xl font-semibold sm:text-4xl">Todo lo que tu marca necesita para mostrarse y vender</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">Cinco servicios, un solo proceso claro.</p>
        </Reveal>
        <Reveal delay={0.05} className="mt-10">
          <BentoGrid>
            <BentoCard className="md:col-span-3 md:row-span-2">
              <IconBadge icon={Palette} />
              <h3 className="mt-4 text-xl font-semibold">Contenido para redes</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">Piezas gráficas, copies y calendario editorial alineados a tu marca.</p>
              <div aria-hidden className="mt-6 grid flex-1 grid-cols-7 content-end gap-1.5">
                {Array.from({ length: 28 }).map((_, i) => (
                  <span key={i} className={`aspect-square rounded-md ${[2, 5, 9, 12, 16, 19, 23, 26].includes(i) ? "bg-gradient-to-br from-cyan-400 to-blue-600" : "bg-muted"}`} />
                ))}
              </div>
            </BentoCard>

            <BentoCard className="md:col-span-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <IconBadge icon={Clapperboard} />
                  <h3 className="mt-4 text-xl font-semibold">Videos publicitarios</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Reels y videos cortos editados para captar atención en los primeros segundos.</p>
                </div>
                <span aria-hidden className="mt-2 hidden aspect-[9/14] w-20 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-600 via-violet-600 to-fuchsia-500 text-white sm:grid">
                  <Play className="size-5 fill-current" />
                </span>
              </div>
            </BentoCard>

            <BentoCard className="md:col-span-3">
              <IconBadge icon={Megaphone} />
              <h3 className="mt-4 text-xl font-semibold">Campañas creativas</h3>
              <p className="mt-1 text-sm text-muted-foreground">Ideas y creatividades para lanzamientos, promociones y fechas clave.</p>
            </BentoCard>

            <BentoCard className="md:col-span-3">
              <IconBadge icon={Bot} />
              <h3 className="mt-4 text-xl font-semibold">Automatización de leads</h3>
              <p className="mt-1 text-sm text-muted-foreground">Formulario, CRM y avisos para que ninguna consulta se pierda.</p>
              <div aria-hidden className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                {["Formulario", "CRM", "Aviso"].map((s, i) => (
                  <span key={s} className="flex items-center gap-2">
                    <span className="rounded-full border bg-background/60 px-2.5 py-1">{s}</span>
                    {i < 2 && <ArrowRight className="size-3.5 text-primary" />}
                  </span>
                ))}
              </div>
            </BentoCard>

            <BentoCard className="md:col-span-3">
              <IconBadge icon={LayoutTemplate} />
              <h3 className="mt-4 text-xl font-semibold">Landing pages</h3>
              <p className="mt-1 text-sm text-muted-foreground">Una página clara y rápida que convierte visitas en conversaciones.</p>
            </BentoCard>
          </BentoGrid>
        </Reveal>
      </section>

      {/* PROCESO */}
      <section id="proceso" className="scroll-mt-24 border-y bg-muted/30 py-24 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <h2 className="text-3xl font-semibold sm:text-4xl">Cómo trabajamos</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">De la primera conversación a la medición, siempre con tu aprobación.</p>
          </Reveal>
          <ProcessSteps steps={PROCESS} />
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
            <Reveal key={s.title} delay={i * 0.08}>
              <Card className="overflow-hidden bg-card/70 p-0 backdrop-blur transition-transform duration-300 hover:-translate-y-1">
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
