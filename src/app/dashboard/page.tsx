import Link from "next/link";
import { CalendarClock, CircleDollarSign, Handshake, Percent, Target, Wallet } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsBento, type BentoData } from "@/components/analytics-bento";
import { FunnelChart } from "@/components/funnel-chart";
import { PageHeader } from "@/components/page-header";
import { requireStaff } from "@/lib/auth";
import { STAGES } from "@/lib/crm";

const pen = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", maximumFractionDigits: 0 });

export default async function DashboardPage() {
  const { supabase } = await requireStaff();
  const today = new Date().toISOString().slice(0, 10);

  const [prospects, clients, due] = await Promise.all([
    supabase.from("prospects").select("stage, channel, sector, created_at"),
    supabase.from("clients").select("price_pen, payment_status"),
    supabase
      .from("prospects")
      .select("id, company, next_action, next_action_at")
      .not("stage", "in", "(ganado,perdido)")
      .lte("next_action_at", today)
      .order("next_action_at")
      .limit(8),
  ]);

  const counts = Object.fromEntries(STAGES.map((s) => [s.value, 0]));
  for (const p of prospects.data ?? []) counts[p.stage] = (counts[p.stage] ?? 0) + 1;

  const total = prospects.data?.length ?? 0;
  const won = counts.ganado;
  const mrr = (clients.data ?? []).reduce((sum, c) => sum + Number(c.price_pen), 0);
  const unpaid = (clients.data ?? []).filter((c) => c.payment_status !== "pagado").length;
  const conversion = total ? ((won / total) * 100).toFixed(1) : "0.0";

  // Bento con datos reales: últimos 6 meses
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - (5 - i));
    return { key: d.toISOString().slice(0, 7), label: d.toLocaleDateString("es-PE", { month: "short" }) };
  });
  const perMonth = (pred: (p: { channel: string }) => boolean) =>
    months.map((m) => (prospects.data ?? []).filter((p) => p.created_at.slice(0, 7) === m.key && pred(p)).length);
  const sectorCount = new Map<string, number>();
  for (const p of prospects.data ?? []) {
    const k = p.sector?.trim() || "Sin rubro";
    sectorCount.set(k, (sectorCount.get(k) ?? 0) + 1);
  }
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);
  const reached = (stages: string[]) => stages.reduce((s, k) => s + (counts[k] ?? 0), 0);
  const bento: BentoData = {
    labels: months.map((m) => m.label),
    line: perMonth(() => true),
    lineLabel: "Prospectos nuevos",
    waveA: perMonth((p) => p.channel === "web"),
    waveALabel: "Web",
    waveB: perMonth((p) => p.channel !== "web"),
    waveBLabel: "Otros canales",
    categories: [...sectorCount].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([name, value]) => ({ name, value })),
    radar: [
      { name: "Contactados", value: pct(reached(["contactado", "respondio", "reunion_agendada", "propuesta_enviada", "ganado"])) },
      { name: "Respondieron", value: pct(reached(["respondio", "reunion_agendada", "propuesta_enviada", "ganado"])) },
      { name: "Reunión", value: pct(reached(["reunion_agendada", "propuesta_enviada", "ganado"])) },
      { name: "Propuesta", value: pct(reached(["propuesta_enviada", "ganado"])) },
      { name: "Ganados", value: pct(won) },
    ],
  };

  const kpis = [
    { label: "Prospectos", value: total, icon: Target, tone: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
    { label: "Reuniones agendadas", value: counts.reunion_agendada, icon: CalendarClock, tone: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
    { label: "Clientes ganados", value: won, icon: Handshake, tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
    { label: "Conversión", value: `${conversion}%`, icon: Percent, tone: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
    { label: "Facturación recurrente", value: pen.format(mrr), icon: CircleDollarSign, tone: "bg-primary/10 text-primary" },
    { label: "Pagos por cobrar", value: unpaid, icon: Wallet, tone: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  ];

  return (
    <>
      <PageHeader title="Resumen" description="Estado comercial de la agencia en un vistazo." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardHeader className="flex-row items-start justify-between">
              <div>
                <CardDescription>{k.label}</CardDescription>
                <CardTitle className="mt-1 font-heading text-3xl">{k.value}</CardTitle>
              </div>
              <span className={`grid size-10 place-items-center rounded-xl ${k.tone}`}>
                <k.icon className="size-5" />
              </span>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="mt-4">
        <AnalyticsBento data={bento} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pipeline</CardTitle>
            <CardDescription>Prospectos por etapa</CardDescription>
          </CardHeader>
          <CardContent>
            <FunnelChart data={STAGES.map((s) => ({ stage: s.label, total: counts[s.value] }))} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acciones para hoy</CardTitle>
            <CardDescription>Próximas acciones vencidas o de hoy</CardDescription>
          </CardHeader>
          <CardContent>
            {due.data?.length ? (
              <ul className="grid gap-3 text-sm">
                {due.data.map((p) => (
                  <li key={p.id} className="flex justify-between gap-3">
                    <span>
                      <span className="font-medium">{p.company}</span>
                      <span className="block text-muted-foreground">{p.next_action ?? "Definir próxima acción"}</span>
                    </span>
                    <span className="shrink-0 text-muted-foreground">{p.next_action_at}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nada pendiente. Revisa{" "}
                <Link href="/dashboard/prospectos" className="underline underline-offset-2">
                  prospectos
                </Link>
                .
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
