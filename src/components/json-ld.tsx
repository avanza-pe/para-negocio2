import { FAQ, PACKAGES, SERVICES_LIST, SITE, whatsappLink } from "@/lib/site";

/** Datos estructurados (schema.org) para buscadores: organización, sitio, servicios y preguntas frecuentes. */
export function JsonLd() {
  const wa = whatsappLink();
  const graph = [
    {
      "@type": "Organization",
      "@id": `${SITE.url}/#organization`,
      name: SITE.name,
      url: SITE.url,
      logo: `${SITE.url}/icon.svg`,
      description: SITE.description,
      areaServed: { "@type": "Country", name: "Perú" },
      ...(SITE.contactEmail ? { email: SITE.contactEmail } : {}),
      ...(wa ? { sameAs: [wa] } : {}),
    },
    {
      "@type": "WebSite",
      "@id": `${SITE.url}/#website`,
      url: SITE.url,
      name: SITE.name,
      inLanguage: "es-PE",
      publisher: { "@id": `${SITE.url}/#organization` },
    },
    {
      "@type": "ProfessionalService",
      "@id": `${SITE.url}/#service`,
      name: SITE.name,
      url: SITE.url,
      description: SITE.description,
      areaServed: "PE",
      provider: { "@id": `${SITE.url}/#organization` },
      serviceType: SERVICES_LIST.map((s) => s.title),
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Planes de lanzamiento",
        itemListElement: PACKAGES.map((p) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: p.name, description: p.items.join(", ") },
        })),
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c") }}
    />
  );
}
