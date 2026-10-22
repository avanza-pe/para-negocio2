import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, MessageCircle, Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComboChart, HBars } from "@/components/dash/charts";
import { DeleteButton, InlineSelect } from "@/components/form-bits";
import { PageHeader } from "@/components/page-header";
import { AiMenuDialog } from "@/components/ai-ui";
import {
  CategoryControls,
  CopyField,
  ImportMenuDialog,
  MenuItemDialog,
  MenuItemRow,
  NewCategoryForm,
  RecordMetricsForm,
  RotateTokenButton,
  VenueForm,
} from "@/components/venue-ui";
import { deleteVenue, setReservationStatus } from "@/lib/actions/venues";
import { aiConfigured } from "@/lib/ai";
import { requireStaff } from "@/lib/auth";
import { label, RESERVATION_STATUS, VENUE_KINDS, type Reservation, type Venue } from "@/lib/crm";
import { addDays, daysAgoISO, limaDate } from "@/lib/dates";
import { reservationConfirmMessage } from "@/lib/menu";
import { formatPhone, waLink } from "@/lib/phone";
import { qrSvg } from "@/lib/qr";
import { SITE } from "@/lib/site";
import { loadMenu, venueStats } from "@/lib/venues";

// Las acciones con IA pueden tardar (los planes gratis responden más lento).
export const maxDuration = 120;

export const metadata = { title: "Local" };

const fmt = new Intl.DateTimeFormat("es-PE", { timeZone: "America/Lima", weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default async function VenuePage({ params }: PageProps<"/dashboard/locales/[id]">) {
  const { id } = await params;
  const { supabase } = await requireStaff();
  const { data } = await supabase.from("venues").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const venue = data as Venue;

  const today = limaDate();
  const from14 = addDays(today, -13);
  const [categories, { data: reservations }, { data: clients }, stats] = await Promise.all([
    loadMenu(supabase, venue.id),
    supabase
      .from("reservations")
      .select("*")
      .eq("venue_id", venue.id)
      .gte("reserved_for", daysAgoISO(7))
      .order("reserved_for")
      .limit(200),
    supabase.from("clients").select("id, name").order("name"),
    venueStats(supabase, venue.id, new Date(`${from14}T00:00:00-05:00`).toISOString()),
  ]);
  const catOptions = categories.map((c) => ({ value: c.id, label: c.name }));
  const clientOptions = (clients ?? []).map((c) => ({ value: c.id, label: c.name }));
  const publicUrl = `${SITE.url}/m/${venue.slug}`;
  const qr = await qrSvg(publicUrl);
  const items = categories.flatMap((c) => c.items);
  const soldOut = items.filter((i) => !i.available).length;

  const days = Array.from({ length: 14 }, (_, i) => addDays(from14, i));
  const perDay = (kind: string) => days.map((d) => stats.events.filter((e) => e.kind === kind && limaDate(new Date(e.created_at)) === d).length);
  const rows = (reservations ?? []) as Reservation[];

  return (
    <>
      <Link href="/dashboard/locales" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Locales
      </Link>
      <PageHeader title={venue.name} description={`${label(VENUE_KINDS, venue.kind)} · /m/${venue.slug} · ${items.length} platos${soldOut ? ` (${soldOut} agotados)` : ""}`}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={venue.published ? "secondary" : "outline"}>{venue.published ? "Publicada" : "Borrador: no visible"}</Badge>
          <Button size="sm" variant="outline" nativeButton={false} render={<a href={`/m/${venue.slug}`} target="_blank" rel="noopener noreferrer" />}>
            <ExternalLink /> Ver carta
          </Button>
          <DeleteButton action={deleteVenue.bind(null, venue.id)} label="Eliminar local" confirm={`¿Eliminar ${venue.name}, su carta, reservas y estadísticas? No se puede deshacer.`} />
        </div>
      </PageHeader>

      <Tabs defaultValue="carta">
        <TabsList className="mb-4 flex-wrap">
          <TabsTrigger value="carta">Carta</TabsTrigger>
          <TabsTrigger value="reservas">Reservas{rows.some((r) => r.status === "pendiente") ? " •" : ""}</TabsTrigger>
          <TabsTrigger value="datos">Datos</TabsTrigger>
          <TabsTrigger value="qr">QR y enlaces</TabsTrigger>
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="carta" className="grid gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <NewCategoryForm venueId={venue.id} />
            {catOptions.length > 0 && <MenuItemDialog venueId={venue.id} categories={catOptions} defaultCategory={catOptions[0].value} />}
            <ImportMenuDialog venueId={venue.id} />
            <AiMenuDialog venueId={venue.id} enabled={aiConfigured()} />
          </div>
          {categories.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                Crea una categoría o importa la carta completa pegándola como texto (lo más rápido).
              </CardContent>
            </Card>
          )}
          {categories.map((c, i) => (
            <Card key={c.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2">
                  <span>
                    {c.name} <span className="text-sm font-normal text-muted-foreground">· {c.items.length}</span>
                  </span>
                  <CategoryControls category={c} venueId={venue.id} first={i === 0} last={i === categories.length - 1} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid gap-2">
                  {c.items.length === 0 && <li className="text-sm text-muted-foreground">Sin platos.</li>}
                  {c.items.map((it) => (
                    <MenuItemRow key={it.id} item={it} venueId={venue.id} categories={catOptions} />
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="reservas">
          <Card className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Personas</TableHead>
                  <TableHead>Notas</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-20 text-center text-muted-foreground">
                      Sin reservas recientes. Llegan solas desde la carta (pestaña Datos → «Recibir reservas»).
                    </TableCell>
                  </TableRow>
                )}
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="whitespace-nowrap">{fmt.format(new Date(r.reserved_for))}</TableCell>
                    <TableCell>
                      <div className="font-medium">{r.name}</div>
                      <div className="text-xs text-muted-foreground">{formatPhone(r.phone)}</div>
                    </TableCell>
                    <TableCell>{r.party_size}</TableCell>
                    <TableCell className="max-w-56 text-xs text-muted-foreground">{r.notes}</TableCell>
                    <TableCell>
                      <InlineSelect id={r.id} value={r.status} options={RESERVATION_STATUS} action={setReservationStatus} className="w-32" />
                    </TableCell>
                    <TableCell>
                      <a href={waLink(r.phone, reservationConfirmMessage(venue.name, r))} target="_blank" rel="noopener noreferrer" aria-label={`Confirmar a ${r.name} por WhatsApp`} className="inline-flex p-1 text-muted-foreground hover:text-foreground">
                        <MessageCircle className="size-4" />
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="datos">
          <Card>
            <CardContent>
              <VenueForm venue={venue} clients={clientOptions} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qr" className="grid gap-4 lg:grid-cols-[18rem_1fr]">
          <Card>
            <CardContent className="grid justify-items-center gap-3">
              <div className="w-56 rounded-xl bg-white p-2" dangerouslySetInnerHTML={{ __html: qr }} role="img" aria-label={`QR de ${publicUrl}`} />
              <Button variant="outline" size="sm" nativeButton={false} render={<Link href={`/dashboard/locales/${venue.id}/qr`} />}>
                <Printer /> Imprimir QR para mesas
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Enlaces</CardTitle>
              <CardDescription>El enlace del dueño es privado: quien lo tenga puede confirmar reservas y marcar platos agotados.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <CopyField label="Carta pública (para Instagram, Google y WhatsApp)" value={`/m/${venue.slug}`} />
              <CopyField label="Panel del dueño (privado)" value={`/panel/${venue.owner_token}`} />
              <div className="flex flex-wrap gap-2">
                <RotateTokenButton venueId={venue.id} />
                <Button size="sm" variant="outline" nativeButton={false} render={<a href={`/panel/${venue.owner_token}`} target="_blank" rel="noopener noreferrer" />}>
                  <ExternalLink /> Abrir panel del dueño
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="grid gap-4">
          <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Últimos 14 días</CardTitle>
                <CardDescription>Visitas a la carta y pedidos enviados por WhatsApp</CardDescription>
              </CardHeader>
              <CardContent>
                <ComboChart labels={days.map((d) => d.slice(8))} bars={perDay("view")} line={perDay("whatsapp_order")} barLabel="Visitas" lineLabel="Pedidos" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
                <CardDescription>Clics registrados (sin datos personales)</CardDescription>
              </CardHeader>
              <CardContent>
                <HBars
                  items={[
                    { name: "Pedidos WhatsApp", value: stats.counts.whatsapp_order },
                    { name: "Reservas", value: stats.counts.reservation },
                    { name: "Reseñas Google", value: stats.counts.review_click },
                    { name: "Cómo llegar", value: stats.counts.maps },
                    { name: "Consultas WhatsApp", value: stats.counts.call },
                    { name: "Instagram", value: stats.counts.instagram },
                  ].filter((i) => i.value > 0)}
                />
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Registrar en Métricas del cliente</CardTitle>
              <CardDescription>Pasa visitas, pedidos y reservas del mes a Métricas (fuente «Carta digital») para el reporte mensual.</CardDescription>
            </CardHeader>
            <CardContent>
              <RecordMetricsForm venueId={venue.id} defaultMonth={today.slice(0, 7)} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
