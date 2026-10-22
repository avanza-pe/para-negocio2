import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicMenuView } from "@/components/menu-public";
import { SITE } from "@/lib/site";
import { getPublicMenu } from "@/lib/venues";

export async function generateMetadata({ params }: PageProps<"/m/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const menu = await getPublicMenu(slug);
  if (!menu) return { title: "Carta no encontrada", robots: { index: false } };
  const { venue } = menu;
  const description = venue.tagline ?? `Carta, pedidos por WhatsApp y reservas de ${venue.name}${venue.district ? ` en ${venue.district}` : ""}.`;
  return {
    title: { absolute: `${venue.name} · Carta` },
    description,
    alternates: { canonical: `/m/${venue.slug}` },
    openGraph: { title: `${venue.name} · Carta`, description, url: `${SITE.url}/m/${venue.slug}`, type: "website", locale: "es_PE" },
    robots: menu.demo ? { index: false, follow: true } : { index: true, follow: true },
  };
}

/** Carta pública del local: /m/<slug>. Pedido por WhatsApp, reservas, reseñas y Yape. */
export default async function MenuPage({ params }: PageProps<"/m/[slug]">) {
  const { slug } = await params;
  const menu = await getPublicMenu(slug);
  if (!menu) notFound();
  const { venue, categories } = menu;

  // Datos estructurados (schema.org) para que Google entienda la carta del local.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": venue.kind === "cafeteria" ? "CafeOrCoffeeShop" : venue.kind === "pasteleria" ? "Bakery" : venue.kind === "bar" ? "BarOrPub" : "Restaurant",
    name: venue.name,
    url: `${SITE.url}/m/${venue.slug}`,
    ...(venue.tagline ? { description: venue.tagline } : {}),
    ...(venue.address ? { address: { "@type": "PostalAddress", streetAddress: venue.address, addressLocality: venue.district ?? venue.city, addressRegion: venue.city, addressCountry: "PE" } } : {}),
    ...(venue.whatsapp ? { telephone: `+${venue.whatsapp}` } : {}),
    acceptsReservations: venue.accepts_reservations,
    currenciesAccepted: "PEN",
    hasMenu: {
      "@type": "Menu",
      hasMenuSection: categories.map((c) => ({
        "@type": "MenuSection",
        name: c.name,
        hasMenuItem: c.items.map((i) => ({
          "@type": "MenuItem",
          name: i.name,
          ...(i.description ? { description: i.description } : {}),
          offers: { "@type": "Offer", price: i.price_pen.toFixed(2), priceCurrency: "PEN", availability: i.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" },
        })),
      })),
    },
  };

  return (
    <>
      {!menu.demo && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />}
      <PublicMenuView menu={menu} poweredBy={SITE.name} />
    </>
  );
}
