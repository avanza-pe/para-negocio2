import Link from "next/link";
import { CalendarCheck, ExternalLink, Eye, MessageCircle, UtensilsCrossed } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { NewVenueDialog } from "@/components/venue-ui";
import { requireStaff } from "@/lib/auth";
import { label, VENUE_KINDS } from "@/lib/crm";
import { daysAgoISO } from "@/lib/dates";

export const metadata = { title: "Locales y cartas" };

export default async function VenuesPage() {
  const { supabase } = await requireStaff();
  const since = daysAgoISO(30);
  const now = daysAgoISO(0);
  const [{ data: venues, error }, { data: clients }, { data: events }, { data: pending }, { data: items }] = await Promise.all([
    supabase.from("venues").select("id, slug, name, kind, district, published, clients(name)").order("created_at", { ascending: false }),
    supabase.from("clients").select("id, name").order("name"),
    supabase.from("venue_events").select("venue_id, kind").gte("created_at", since).limit(50_000),
    supabase.from("reservations").select("venue_id").eq("status", "pendiente").gte("reserved_for", now),
    supabase.from("menu_items").select("venue_id"),
  ]);

  const count = <T extends { venue_id: string }>(rows: T[] | null, id: string, f: (r: T) => boolean = () => true) =>
    (rows ?? []).filter((r) => r.venue_id === id && f(r)).length;

  return (
    <>
      <PageHeader title="Locales y cartas" description="Restaurantes y cafeterías: carta digital con pedidos por WhatsApp, reservas, QR y enlace privado para el dueño.">
        <div className="flex gap-2">
          <Button variant="outline" nativeButton={false} render={<a href="/m/demo" target="_blank" rel="noopener noreferrer" />}>
            <Eye /> Ver demo
          </Button>
          <NewVenueDialog clients={(clients ?? []).map((c) => ({ value: c.id, label: c.name }))} />
        </div>
      </PageHeader>

      {error && (
        <Card className="mb-4 border-destructive/40">
          <CardContent className="text-sm text-destructive">
            No se pudo leer la tabla de locales. ¿Ya corriste <code>supabase/migrations/0009_venues.sql</code>?
          </CardContent>
        </Card>
      )}

      {(venues ?? []).length === 0 ? (
        <Card>
          <CardContent className="grid justify-items-center gap-3 py-12 text-center">
            <UtensilsCrossed className="size-8 text-muted-foreground" />
            <p className="max-w-md text-sm text-muted-foreground">
              Aún no hay locales. Crea uno, pega su carta como texto y publícalo: en 15 minutos el restaurante tiene carta con QR, pedidos por WhatsApp y reservas.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {(venues ?? []).map((v) => {
            const client = (Array.isArray(v.clients) ? v.clients[0] : v.clients) as { name: string } | null;
            return (
              <Card key={v.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2">
                    <Link href={`/dashboard/locales/${v.id}`} className="underline-offset-2 hover:underline">
                      {v.name}
                    </Link>
                    <Badge variant={v.published ? "secondary" : "outline"}>{v.published ? "Publicada" : "Borrador"}</Badge>
                  </CardTitle>
                  <CardDescription>
                    {[label(VENUE_KINDS, v.kind), v.district, client?.name].filter(Boolean).join(" · ")} · {count(items, v.id)} platos
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <Stat icon={Eye} value={count(events, v.id, (e) => e.kind === "view")} label="visitas 30d" />
                    <Stat icon={MessageCircle} value={count(events, v.id, (e) => e.kind === "whatsapp_order")} label="pedidos 30d" />
                    <Stat icon={CalendarCheck} value={count(pending, v.id)} label="reservas por confirmar" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" nativeButton={false} render={<Link href={`/dashboard/locales/${v.id}`} />}>
                      Gestionar
                    </Button>
                    {v.published && (
                      <Button size="sm" variant="outline" nativeButton={false} render={<a href={`/m/${v.slug}`} target="_blank" rel="noopener noreferrer" />}>
                        <ExternalLink /> Ver carta
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}

function Stat({ icon: Icon, value, label }: { icon: typeof Eye; value: number; label: string }) {
  return (
    <div className="rounded-xl bg-muted p-2">
      <Icon className="mx-auto size-3.5 text-muted-foreground" />
      <p className="font-heading text-lg font-semibold tabular-nums">{value}</p>
      <p className="text-muted-foreground">{label}</p>
    </div>
  );
}
