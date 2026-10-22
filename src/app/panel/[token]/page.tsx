import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarCheck, ExternalLink, Eye, MessageCircle, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OwnerItemRow, OwnerReservationActions } from "@/components/owner-ui";
import { label, RESERVATION_STATUS, type Reservation } from "@/lib/crm";
import { addDays, limaDate } from "@/lib/dates";
import { SITE } from "@/lib/site";
import { getVenueByOwnerToken, loadMenu, venueStats } from "@/lib/venues";

export const metadata: Metadata = { title: "Panel del local", robots: { index: false, follow: false }, referrer: "no-referrer" };

const fmt = new Intl.DateTimeFormat("es-PE", { timeZone: "America/Lima", weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/**
 * Panel del dueño del restaurante, sin cuenta: /panel/<token>. Reservas, platos agotados y precios
 * desde el celular. El token (256 bits) se regenera desde el panel del equipo si se filtra.
 */
export default async function OwnerPanelPage({ params }: PageProps<"/panel/[token]">) {
  const { token } = await params;
  const found = await getVenueByOwnerToken(token);
  if (!found) notFound();
  const { db, venue } = found;

  const today = limaDate();
  const [{ data: reservations }, categories, stats] = await Promise.all([
    db
      .from("reservations")
      .select("*")
      .eq("venue_id", venue.id)
      .gte("reserved_for", new Date(`${today}T00:00:00-05:00`).toISOString())
      .lte("reserved_for", new Date(`${addDays(today, 14)}T23:59:59-05:00`).toISOString())
      .order("reserved_for")
      .limit(200),
    loadMenu(db, venue.id),
    venueStats(db, venue.id, new Date(`${addDays(today, -29)}T00:00:00-05:00`).toISOString()),
  ]);
  const rows = (reservations ?? []) as Reservation[];
  const pending = rows.filter((r) => r.status === "pendiente");
  const todays = rows.filter((r) => limaDate(new Date(r.reserved_for)) === today && r.status !== "cancelada");

  return (
    <main className="mx-auto grid w-full max-w-2xl gap-4 px-4 py-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Panel del local</p>
          <h1 className="font-heading text-2xl font-semibold">{venue.name}</h1>
        </div>
        <a href={`/m/${venue.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm underline underline-offset-2">
          Ver carta <ExternalLink className="size-3.5" />
        </a>
      </header>
      {!venue.published && <p className="rounded-xl bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">Tu carta aún no está publicada. Avísale a {SITE.name}.</p>}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { icon: CalendarCheck, value: todays.length, text: "reservas hoy" },
          { icon: Eye, value: stats.counts.view, text: "visitas (30 días)" },
          { icon: MessageCircle, value: stats.counts.whatsapp_order, text: "pedidos (30 días)" },
          { icon: Star, value: stats.counts.review_click, text: "clics a reseñas" },
        ].map((k) => (
          <Card key={k.text} size="sm">
            <CardContent className="text-center">
              <k.icon className="mx-auto size-4 text-muted-foreground" />
              <p className="font-heading text-2xl font-semibold tabular-nums">{k.value}</p>
              <p className="text-xs text-muted-foreground">{k.text}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reservas</CardTitle>
          <CardDescription>{pending.length ? `${pending.length} por confirmar. Confirma y avísale al cliente por WhatsApp.` : "Hoy y próximos 14 días."}</CardDescription>
        </CardHeader>
        <CardContent>
          {rows.length === 0 && <p className="text-sm text-muted-foreground">Sin reservas próximas.</p>}
          <ul className="grid gap-3">
            {rows.map((r) => (
              <li key={r.id} className="grid gap-2 rounded-xl border p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">
                      {r.name} · {r.party_size} pers.
                    </p>
                    <p className="text-sm text-muted-foreground">{fmt.format(new Date(r.reserved_for))}</p>
                    {r.notes && <p className="mt-1 text-xs">{r.notes}</p>}
                  </div>
                  <Badge variant={r.status === "pendiente" ? "default" : "outline"}>{label(RESERVATION_STATUS, r.status)}</Badge>
                </div>
                <OwnerReservationActions token={token} reservation={r} venueName={venue.name} />
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Carta: agotados y precios</CardTitle>
          <CardDescription>Toca «Disponible» para marcar «Agotado». Toca el precio para cambiarlo. Se actualiza al instante.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {categories.map((c) => (
            <section key={c.id}>
              <h2 className="text-sm font-semibold">{c.name}</h2>
              <ul>
                {c.items.map((it) => (
                  <OwnerItemRow key={it.id} token={token} item={it} />
                ))}
              </ul>
            </section>
          ))}
          {categories.length === 0 && <p className="text-sm text-muted-foreground">La carta aún no tiene platos.</p>}
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Este enlace es privado: no lo compartas. ¿Algo más? Escríbele a {SITE.name}.
      </p>
    </main>
  );
}
