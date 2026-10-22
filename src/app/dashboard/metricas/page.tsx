import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { NewMetricDialog } from "@/components/dialogs";
import { PageHeader } from "@/components/page-header";
import { requireStaff } from "@/lib/auth";
import type { Metric } from "@/lib/crm";

export const metadata = { title: "Métricas" };

const n = (v: number | null) => (v === null ? "—" : v.toLocaleString("es-PE"));

export default async function MetricsPage() {
  const { supabase } = await requireStaff();
  const [{ data }, { data: clients }] = await Promise.all([
    supabase.from("metrics").select("*, clients(name)").order("period", { ascending: false }).overrideTypes<Metric[]>(),
    supabase.from("clients").select("id, name").order("name"),
  ]);
  const rows = data ?? [];

  return (
    <>
      <PageHeader title="Métricas" description="Solo datos verificables. Nunca inventes métricas en un reporte.">
        <NewMetricDialog clients={(clients ?? []).map((c) => ({ value: c.id, label: c.name }))} />
      </PageHeader>
      <Card className="overflow-x-auto p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Periodo</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Posts</TableHead>
              <TableHead>Alcance</TableHead>
              <TableHead>Reproducc.</TableHead>
              <TableHead>Clics</TableHead>
              <TableHead>Leads</TableHead>
              <TableHead>Fuente</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  Sin métricas registradas.
                </TableCell>
              </TableRow>
            )}
            {rows.map((m) => (
              <TableRow key={m.id}>
                <TableCell>{m.period.slice(0, 7)}</TableCell>
                <TableCell className="font-medium">{m.clients?.name}</TableCell>
                <TableCell>{n(m.posts)}</TableCell>
                <TableCell>{n(m.reach)}</TableCell>
                <TableCell>{n(m.views)}</TableCell>
                <TableCell>{n(m.clicks)}</TableCell>
                <TableCell>{n(m.leads)}</TableCell>
                <TableCell>{m.source ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
