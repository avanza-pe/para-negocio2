import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PrintButton } from "@/components/print-button";
import { requireStaff } from "@/lib/auth";
import { qrSvg } from "@/lib/qr";
import { SITE } from "@/lib/site";

export const metadata = { title: "QR para mesas" };

/** Hoja A4 con 4 tarjetas de QR para mesas, mostrador y vitrina. Imprimir → Guardar como PDF. */
export default async function VenueQrPage({ params }: PageProps<"/dashboard/locales/[id]/qr">) {
  const { id } = await params;
  const { supabase } = await requireStaff();
  const { data: venue } = await supabase.from("venues").select("id, name, slug, accent_color, google_review_url").eq("id", id).maybeSingle();
  if (!venue) notFound();

  const url = `${SITE.url}/m/${venue.slug}`;
  const [menuQr, reviewQr] = await Promise.all([qrSvg(url), venue.google_review_url ? qrSvg(venue.google_review_url) : Promise.resolve(null)]);
  const cards = [
    { title: "Mira la carta", sub: "y pide por WhatsApp", qr: menuQr, foot: url.replace(/^https?:\/\//, "") },
    { title: "Mira la carta", sub: "y reserva tu mesa", qr: menuQr, foot: url.replace(/^https?:\/\//, "") },
    ...(reviewQr
      ? [
          { title: "¿Te gustó?", sub: "Déjanos tu reseña en Google", qr: reviewQr, foot: "¡Gracias por tu visita!" },
          { title: "¿Te gustó?", sub: "Déjanos tu reseña en Google", qr: reviewQr, foot: "¡Gracias por tu visita!" },
        ]
      : [
          { title: "Pide sin esperar", sub: "Carta, Yape y delivery", qr: menuQr, foot: url.replace(/^https?:\/\//, "") },
          { title: "Pide sin esperar", sub: "Carta, Yape y delivery", qr: menuQr, foot: url.replace(/^https?:\/\//, "") },
        ]),
  ];

  return (
    <>
      <div data-print-hide className="mb-4 flex items-center justify-between">
        <Link href={`/dashboard/locales/${venue.id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> {venue.name}
        </Link>
        <PrintButton />
      </div>
      <p data-print-hide className="mb-4 text-sm text-muted-foreground">
        Imprime en A4 y corta por las líneas. Prueba cada QR con tu celular antes de plastificar.{!venue.google_review_url && " Agrega el enlace de reseñas en Datos para incluir tarjetas de reseñas."}
      </p>
      <div data-print-sheet className="mx-auto grid max-w-[210mm] grid-cols-2 border border-dashed bg-white text-black">
        {cards.map((c, i) => (
          <div key={i} className="grid aspect-[105/148] content-center justify-items-center gap-3 border border-dashed p-6 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: venue.accent_color }}>
              {venue.name}
            </p>
            <p className="font-heading text-3xl font-semibold leading-tight">{c.title}</p>
            <p className="text-sm">{c.sub}</p>
            <div className="w-40" dangerouslySetInnerHTML={{ __html: c.qr }} />
            <p className="text-[10px] text-neutral-500">{c.foot}</p>
          </div>
        ))}
      </div>
    </>
  );
}
