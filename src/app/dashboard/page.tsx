import Link from "next/link";
import { ArrowRight, CalendarClock, CircleDollarSign, Handshake, Percent, Target, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, ComboChart, Gauge, HBars, MiniCalendar } from "@/components/dash/charts";
import { LogoMark } from "@/components/logo";
import { requireStaff } from "@/lib/auth";
import { getToday, todayCount } from "@/lib/today";
import { STAGES } from "@/lib/crm";

const pen = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", maximumFractionDigits: 0 });

export default async function DashboardPage() {
  const { supabase, profile } = await requireStaff();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [prospects, clients, meetings, today] = await Promise.all([
    supabase.from("prospects").select("stage, channel, sector, created_at"),
    supabase.from("clients").select("name, service, price_pen, payment_status, start_date"),
    supabase.from("meetings").select("starts_at").gte("starts_at", monthStart),
    getToday(supabase),
  ]);

  const rows = prospects.data ?? [];
  const cl = clients.data ?? [];
  const counts = Object.fromEntries(STAGES.map((s) => [s.value, 0])) as Record<string, number>;
  for (const p of rows) counts[p.stage] = (counts[p.stage] ?? 0) + 1;

  const total = rows.length;
  const won = counts.ganado;
  const mrr = cl.reduce((s, c) => s + Number(c.price_pen), 0);
  const unpaid = cl.filter((c) => c.payment_status !== "pagado").length;
  const conversion = total ? Math.round((won / total) * 100) : 0;
  const pending = todayCount(today);

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, label: d.toLocaleDateString("es-PE", { month: "short" }) };
  });
  const perMonth = (dates: string[]) => months.map((m) => dates.filter((d) => d.slice(0, 7) === m.key).length);
  const newProspects = perMonth(rows.map((p) => p.created_at));
  const newClients = perMonth(cl.map((c) => c.start_date).filter(Boolean) as string[]);
  const cumulative = newProspects.reduce<number[]>((acc, v) => [...acc, (acc[acc.length - 1] ?? 0) + v], []);

  const sectors = new Map<string, number>();
  for (const p of rows) {
    const k = p.sector?.trim() || "Sin rubro";
    sectors.set(k, (sectors.get(k) ?? 0) + 1);
  }
  const topSectors = [...sectors].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, value]) => ({ name, value }));
  const meetingDays = (meetings.data ?? []).map((m) => new Date(m.starts_at as string).getDate());

  const kpis = [
    { label: "Prospectos", value: total, icon: Target, bar: Math.min(total * 5, 100) },
    { label: "Clientes ganados", value: won, icon: Handshake, bar: Math.min(won * 20, 100) },
    { label: "Facturación recurrente", value: pen.format(mrr), icon: CircleDollarSign, bar: Math.min(mrr / 30, 100) },
  ];
  const name = (profile.full_name ?? "equipo").split(" ")[0];

  return (
    <div className="grid gap-4 xl:grid-cols-[19rem_1fr]">
      {/* Columna izquierda: calendario + clientes (como en el video) */}
      <div className="order-2 grid content-start gap-4 xl:order-1">
        <Card>
          <CardContent>
            <MiniCalendar date={now} marked={meetingDays} />
            <Button variant="outline" className="mt-4 w-full rounded-full" nativeButton={false} render={<Link href="/dashboard/reuniones" />}>
              Ver reuniones
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clientes</CardTitle>
            <CardDescription>Servicios activos</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {cl.length === 0 && <p className="text-sm text-muted-foreground">Aún no hay clientes.</p>}
            {cl.slice(0, 4).map((c) => (
              <Link key={c.name} href="/dashboard/clientes" className="flex items-center gap-3 rounded-xl border p-3 text-sm transition-colors hover:bg-accent">
                <span className="grid size-9 place-items-center rounded-lg bg-primary/15 text-primary">{c.name.slice(0, 1).toUpperCase()}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{c.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{c.service}</span>
                </span>
                <ArrowRight className="size-4 text-muted-foreground" />
              </Link>
            ))}
            <div className="grid grid-cols-2 gap-2 pt-1 text-center text-xs">
              <div className="rounded-xl bg-muted p-3">
                <p className="font-heading text-xl font-semibold">{conversion}%</p>
                <p className="text-muted-foreground">Conversión</p>
              </div>
              <div className="rounded-xl bg-muted p-3">
                <p className="font-heading text-xl font-semibold">{unpaid}</p>
                <p className="text-muted-foreground">Por cobrar</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Columna principal */}
      <div className="order-1 grid min-w-0 content-start gap-4 xl:order-2">
        <Card className="relative overflow-hidden">
          <div aria-hidden className="absolute -right-10 -top-16 size-64 rounded-full bg-primary/25 blur-3xl" />
          <CardContent className="relative flex items-center justify-between gap-4">
            <div className="max-w-md">
              <h1 className="text-2xl font-semibold sm:text-3xl">Hola, {name}</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {pending > 0 ? `Tienes ${pending} cosas que requieren atención hoy.` : "Todo al día. Buen trabajo."} Revisa el pipeline y avanza.
              </p>
              <Button className="mt-4 rounded-full" nativeButton={false} render={<Link href="/dashboard/hoy" />}>
                Ver mi día
              </Button>
            </div>
            <div aria-hidden className="hidden size-28 shrink-0 rotate-6 place-items-center rounded-3xl bg-gradient-to-br from-primary/60 to-primary/10 ring-1 ring-primary/30 sm:grid">
              <LogoMark className="h-12 text-white" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {kpis.map((k) => (
            <Card key={k.label}>
              <CardContent>
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <k.icon className="size-3.5" /> {k.label}
                </p>
                <p className="mt-1 font-heading text-3xl font-semibold tabular-nums">{k.value}</p>
                <div className="mt-3 h-1 rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${k.bar}%` }} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Prospectos y clientes</CardTitle>
            <CardDescription>Últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ComboChart labels={months.map((m) => m.label)} bars={newProspects} line={newClients} barLabel="Prospectos nuevos" lineLabel="Clientes nuevos" />
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Crecimiento del pipeline</CardTitle>
              <CardDescription>Prospectos acumulados</CardDescription>
            </CardHeader>
            <CardContent>
              <AreaChart labels={months.map((m) => m.label)} values={cumulative} valueLabel="Prospectos acumulados" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Conversión</CardTitle>
              <CardDescription>Prospectos que llegan a cliente</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <Gauge value={conversion} label="de ganados" />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Por rubro</CardTitle>
              <CardDescription>De dónde vienen tus prospectos</CardDescription>
            </CardHeader>
            <CardContent>
              <HBars items={topSectors} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Pipeline</CardTitle>
              <CardDescription>Prospectos por etapa</CardDescription>
            </CardHeader>
            <CardContent>
              <HBars items={STAGES.filter((s) => counts[s.value] > 0).map((s) => ({ name: s.label, value: counts[s.value] }))} />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Reuniones agendadas", value: counts.reunion_agendada, icon: CalendarClock },
            { label: "Propuestas enviadas", value: counts.propuesta_enviada, icon: Percent },
            { label: "Pagos por cobrar", value: unpaid, icon: Wallet },
            { label: "Pendientes hoy", value: pending, icon: Target },
          ].map((k) => (
            <Card key={k.label} size="sm">
              <CardContent className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-lg bg-primary/15 text-primary">
                  <k.icon className="size-4" />
                </span>
                <span>
                  <span className="block font-heading text-xl font-semibold leading-none">{k.value}</span>
                  <span className="text-xs text-muted-foreground">{k.label}</span>
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
