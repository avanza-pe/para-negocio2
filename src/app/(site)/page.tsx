import { ArrowRight, Bot, CalendarCheck, Clapperboard, LayoutTemplate, Megaphone, Palette, Play, ShieldCheck } from "lucide-react";
import { BentoCard, BentoGrid } from "@/components/bento";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContactGlobe } from "@/components/contact-globe";
import { CtaBanner } from "@/components/cta-banner";
import { FaqSection } from "@/components/faq-section";
import { HeroCollage } from "@/components/hero-collage";
import { ImageStream } from "@/components/image-stream";
import { HeroStage, Reveal } from "@/components/motion";
import { Pricing } from "@/components/pricing";
import { ProcessSteps } from "@/components/process-steps";
import { PROCESS, SITE } from "@/lib/site";

function IconBadge({ icon: Icon }: { icon: typeof Palette }) {
  return (
    <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
      <Icon className="size-5" />
    </span>
  );
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: SITE.name,
  description: SITE.description,
  url: SITE.url,
  areaServed: "PE",
  serviceType: ["Marketing digital", "Contenido para redes sociales", "Automatización de leads", "Landing pages"],
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\u003c") }} />
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

      {/* SEGUNDA SECCIÓN · STREAM DE PIEZAS */}
      <section aria-labelledby="stream-title" className="relative overflow-hidden py-16 sm:py-24">
        <Reveal>
          <div className="mx-auto mb-4 max-w-3xl px-4 text-center">
            <h2 id="stream-title" className="text-3xl font-semibold text-balance sm:text-5xl">
              Del brief a tu feed, <span className="font-serif-display text-gradient italic font-normal">sin parar</span>
            </h2>
            <p className="mt-4 text-muted-foreground text-pretty">
              Reels, posts, stories y anuncios producidos con IA y revisados por una persona. Ejemplos ilustrativos de las piezas que entregamos.
            </p>
          </div>
        </Reveal>
        <ImageStream />
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

      {/* CONTACTO */}
      <section id="contacto" className="mx-auto max-w-6xl scroll-mt-24 px-4 pb-28">
        <ContactGlobe />
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <Reveal>
          <CtaBanner />
        </Reveal>
      </section>
    </>
  );
}
