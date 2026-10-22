import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarCheck,
  Check,
  Clapperboard,
  MessageCircle,
  QrCode,
  Smartphone,
  Star,
  UtensilsCrossed,
  Wallet,
  X,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BentoCard, BentoGrid } from "@/components/bento";
import { ContactGlobe } from "@/components/contact-globe";
import { HeroStage, Reveal } from "@/components/motion";
import { Pricing } from "@/components/pricing";
import { GASTRO_PACKAGES, SITE } from "@/lib/site";

const TITLE = "Carta digital, pedidos por WhatsApp y reservas para restaurantes y cafeterías";
const DESCRIPTION =
  "Carta con QR, pedidos ordenados por WhatsApp sin comisión, reservas, Yape y reseñas en Google para restaurantes, cafeterías y pastelerías en Perú. Desde S/ 39 al mes.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/restaurantes" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE.url}/restaurantes`, type: "website", locale: "es_PE" },
};

const PAINS = [
  { icon: Wallet, title: "Comisiones que se comen el margen", text: "Las apps de delivery cobran un porcentaje de cada pedido; gremios del sector han reportado entre 20% y 30%." },
  { icon: MessageCircle, title: "Pedidos desordenados por WhatsApp", text: "Audios, capturas de la carta y cuentas a mano: errores, demoras y clientes que se cansan." },
  { icon: UtensilsCrossed, title: "Carta en PDF o foto vieja", text: "Precios desactualizados, platos que ya no existen y nada que Google pueda leer." },
  { icon: Star, title: "Comida buena, pocas reseñas", text: "Los clientes contentos no dejan reseña si nadie se lo pide en el momento justo." },
];

const STEPS = [
  { n: "1", title: "Nos mandas tu carta", text: "Foto, PDF o lo que tengas. La cargamos con IA y la revisamos a mano: en 24 horas tienes tu carta con tu marca." },
  { n: "2", title: "Ponemos tu QR en todos lados", text: "Mesas, mostrador, Instagram, Google y estados de WhatsApp. Te damos la hoja lista para imprimir." },
  { n: "3", title: "Recibes pedidos y reservas ordenados", text: "Llegan a tu WhatsApp con el total calculado. Confirmas reservas y marcas «agotado» desde tu celular." },
];

const COMPARE = [
  ["Comisión por pedido", "Un porcentaje de cada venta", "0%: mensualidad fija"],
  ["El contacto del cliente", "Queda en la app", "Te escribe a tu WhatsApp"],
  ["Cambiar precios o marcar agotado", "Según la plataforma", "Al instante desde tu celular"],
  ["Reservas y reseñas en Google", "No", "Sí, incluidas"],
  ["Clientes nuevos que no te conocen", "Sí: es su fuerte", "Con contenido y Google, más lento"],
];

const FAQ = [
  { q: "¿Necesito instalar una app o tener computadora?", a: "No. Tu carta es una página web y tu panel funciona desde un enlace privado en el celular." },
  { q: "¿Cobran comisión por pedido?", a: "No. Pagas una mensualidad fija. Los pedidos llegan a tu WhatsApp y el pago es directo a ti (Yape, Plin, efectivo o tarjeta)." },
  { q: "¿Y si ya estoy en Rappi o PedidosYa?", a: "Sigue ahí: las apps te traen clientes nuevos. Tu carta propia sirve para que los que ya te conocen pidan directo y sin comisión." },
  { q: "¿Cómo me pagan mis clientes?", a: "Tu número de Yape aparece en la carta y en el pedido. Tú confirmas el pago en el chat, como ya lo haces, pero con el total ya calculado." },
  { q: "¿Qué necesitan de mí para empezar?", a: "Tu carta (foto o PDF), logo o colores, el WhatsApp de pedidos, tu número de Yape, horarios y zonas de delivery." },
  { q: "¿Puedo cambiar precios yo mismo?", a: "Sí. Desde tu panel cambias precios y marcas platos agotados. Para cambios grandes de carta nos escribes y lo hacemos." },
];

export default function RestaurantsPage() {
  return (
    <>
      <HeroStage className="relative px-4 pb-12 pt-16 text-center sm:pt-24">
        <div className="mx-auto max-w-4xl">
          <div data-hero>
            <Badge variant="secondary" className="mb-6 gap-1.5 rounded-full px-3 py-1">
              <UtensilsCrossed className="size-3.5" /> Restaurantes, cafeterías y pastelerías
            </Badge>
          </div>
          <h1 data-hero className="text-balance text-4xl font-semibold leading-[1.05] sm:text-6xl">
            Más pedidos y reservas,{" "}
            <span className="font-serif-display text-gradient pr-1 text-[1.12em] font-normal italic">sin comisión</span> por cada venta
          </h1>
          <p data-hero className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-pretty">
            Carta digital con QR, pedidos ordenados por WhatsApp, reservas, Yape y reseñas en Google. Y el contenido de tus platos para redes, hecho con IA y revisado por personas.
          </p>
          <div data-hero className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" className="h-11 rounded-full px-6 text-base" nativeButton={false} render={<a href="/m/demo" target="_blank" rel="noopener noreferrer" />}>
              <Smartphone /> Prueba la carta demo
            </Button>
            <Button size="lg" variant="outline" className="h-11 rounded-full px-6 text-base" nativeButton={false} render={<a href="#contacto" />}>
              Quiero mi carta <ArrowRight />
            </Button>
          </div>
          <p data-hero className="mt-5 text-sm text-muted-foreground">Desde S/ 39 al mes · Lista en 24 horas · Sin contratos largos</p>
        </div>
      </HeroStage>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <Reveal>
          <h2 className="text-3xl font-semibold sm:text-4xl">Lo que le pasa a casi todo restaurante</h2>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {PAINS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.05}>
              <div className="flex h-full gap-4 rounded-3xl border bg-card/70 p-6 backdrop-blur">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-destructive/10 text-destructive">
                  <p.icon className="size-5" />
                </span>
                <div>
                  <h3 className="font-semibold">{p.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{p.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="como-funciona" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16">
        <Reveal>
          <h2 className="text-3xl font-semibold sm:text-4xl">Así funciona</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">Tú cocinas. Nosotros dejamos lista la parte digital.</p>
        </Reveal>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {STEPS.map((s) => (
            <li key={s.n} className="rounded-3xl border bg-card/70 p-6 backdrop-blur">
              <span className="grid size-9 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">{s.n}</span>
              <h3 className="mt-4 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <Reveal>
          <h2 className="text-3xl font-semibold sm:text-4xl">Todo lo que incluye</h2>
        </Reveal>
        <Reveal delay={0.05} className="mt-8">
          <BentoGrid>
            <BentoCard className="md:col-span-3 md:row-span-2">
              <QrCode className="size-6 text-primary" />
              <h3 className="mt-4 text-xl font-semibold">Carta digital con QR</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">Con tu marca, fotos, etiquetas (vegano, picante, nuevo) y «agotado» al instante. Google la entiende: ayuda a que te encuentren.</p>
              <Button variant="outline" className="mt-6 w-fit rounded-full" nativeButton={false} render={<a href="/m/demo" target="_blank" rel="noopener noreferrer" />}>
                Ver demo
              </Button>
            </BentoCard>
            <BentoCard className="md:col-span-3">
              <MessageCircle className="size-6 text-primary" />
              <h3 className="mt-4 text-xl font-semibold">Pedido armado → tu WhatsApp</h3>
              <p className="mt-1 text-sm text-muted-foreground">El cliente elige platos, recojo, delivery o mesa, y forma de pago. Te llega un mensaje claro con el total.</p>
            </BentoCard>
            <BentoCard className="md:col-span-3">
              <CalendarCheck className="size-6 text-primary" />
              <h3 className="mt-4 text-xl font-semibold">Reservas con aviso al instante</h3>
              <p className="mt-1 text-sm text-muted-foreground">Te avisamos por Telegram o correo y confirmas con un toque; el cliente recibe la confirmación por WhatsApp.</p>
            </BentoCard>
            <BentoCard className="md:col-span-2">
              <Star className="size-6 text-primary" />
              <h3 className="mt-4 text-lg font-semibold">Más reseñas en Google</h3>
              <p className="mt-1 text-sm text-muted-foreground">Botón y QR de reseñas en la carta y en las mesas.</p>
            </BentoCard>
            <BentoCard className="md:col-span-2">
              <Clapperboard className="size-6 text-primary" />
              <h3 className="mt-4 text-lg font-semibold">Contenido de tus platos</h3>
              <p className="mt-1 text-sm text-muted-foreground">Posts y reels con calendario de fechas gastronómicas del Perú.</p>
            </BentoCard>
            <BentoCard className="md:col-span-2">
              <BarChart3 className="size-6 text-primary" />
              <h3 className="mt-4 text-lg font-semibold">Números reales</h3>
              <p className="mt-1 text-sm text-muted-foreground">Visitas, pedidos y reservas de tu carta en un reporte mensual.</p>
            </BentoCard>
          </BentoGrid>
        </Reveal>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16">
        <Reveal>
          <h2 className="text-3xl font-semibold sm:text-4xl">Apps de delivery vs. tu carta propia</h2>
          <p className="mt-3 text-muted-foreground">No se trata de salir de las apps: úsalas para que te descubran y tu carta para que te vuelvan a pedir directo.</p>
        </Reveal>
        <div className="mt-8 overflow-x-auto rounded-3xl border bg-card/70 backdrop-blur">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-4 font-medium" />
                <th className="p-4 font-medium text-muted-foreground">Apps de delivery</th>
                <th className="p-4 font-medium text-primary">Carta digital {SITE.name}</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE.map(([row, app, ours], i) => (
                <tr key={row} className="border-b last:border-0">
                  <td className="p-4 font-medium">{row}</td>
                  <td className="p-4 text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      {i === COMPARE.length - 1 ? <Check className="size-4 text-emerald-500" /> : <X className="size-4 text-destructive" />} {app}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5">
                      {i === COMPARE.length - 1 ? <X className="size-4 text-muted-foreground" /> : <Check className="size-4 text-emerald-500" />} {ours}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="planes" className="scroll-mt-24 border-y bg-muted/30 py-20 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <div className="mb-4 text-center">
              <h2 className="text-3xl font-semibold sm:text-4xl">Planes para tu local</h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">Precios de lanzamiento. Todo queda por escrito en la propuesta.</p>
            </div>
          </Reveal>
          <Pricing packages={GASTRO_PACKAGES} grouped={false} cta="/restaurantes#contacto" />
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-20">
        <h2 className="mb-6 text-3xl font-semibold sm:text-4xl">Preguntas de dueños de restaurantes</h2>
        <Accordion>
          {FAQ.map((f) => (
            <AccordionItem key={f.q} value={f.q}>
              <AccordionTrigger className="py-5 text-left text-base">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <p className="mt-6 text-sm text-muted-foreground">
          ¿Tu negocio no es gastronómico? Mira nuestros <Link href="/#servicios" className="underline underline-offset-2">servicios para pymes</Link>.
        </p>
      </section>

      <section id="contacto" className="mx-auto max-w-6xl scroll-mt-24 px-4 pb-28">
        <ContactGlobe
          title="Quiero mi carta digital"
          text="Déjanos tus datos y te mostramos tu carta funcionando en una llamada de 15 minutos. Sin costo."
          form={{ interest: "Carta digital (restaurantes)", defaultSector: "Restaurante", submitLabel: "Quiero mi carta" }}
        />
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          }).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
