import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FunnelChart } from "@/components/funnel-chart";
import { PageHeader } from "@/components/page-header";
import { requireStaff } from "@/lib/auth";
import { STAGES } from "@/lib/crm";

const pen = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", maximumFractionDigits: 0 });

export default async function DashboardPage() {
  const { supabase } = await requireStaff();
  const today = new Date().toISOString().slice(0, 10);

  const [prospects, clients, due] = await Promise.all([
    supabase.from("prospects").select("stage"),
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

  const kpis = [
    { label: "Prospectos", value: total },
    { label: "Reuniones agendadas", value: counts.reunion_agendada },
    { label: "Clientes ganados", value: won },
    { label: "Conversión", value: `${conversion}%` },
    { label: "Facturación recurrente", value: pen.format(mrr) },
    { label: "Pagos por cobrar", value: unpaid },
  ];

  return (
    <>
      <PageHeader title="Resumen" description="Estado comercial de la agencia en un vistazo." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardHeader>
              <CardDescription>{k.label}</CardDescription>
              <CardTitle className="text-3xl">{k.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
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
