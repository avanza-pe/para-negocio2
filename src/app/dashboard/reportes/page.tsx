import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NewReportDialog } from "@/components/dialogs";
import { InlineSelect } from "@/components/form-bits";
import { PageHeader } from "@/components/page-header";
import { PrintButton } from "@/components/print-button";
import { setReportStatus } from "@/lib/actions/reports";
import { requireStaff } from "@/lib/auth";
import { REPORT_STATUS } from "@/lib/crm";

export const metadata = { title: "Reportes" };

type Report = { id: string; period: string; body: string; status: string; clients: { name: string } | null };

export default async function ReportsPage() {
  const { supabase } = await requireStaff();
  const [{ data }, { data: clients }] = await Promise.all([
    supabase.from("reports").select("id, period, body, status, clients(name)").order("period", { ascending: false }).limit(60),
    supabase.from("clients").select("id, name").order("name"),
  ]);
  const reports = (data ?? []) as unknown as Report[];

  return (
    <>
      <PageHeader title="Reportes" description="Borradores armados solo con métricas registradas. Un humano los aprueba antes de enviarlos.">
        <NewReportDialog clients={(clients ?? []).map((c) => ({ value: c.id, label: c.name }))} />
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-2">
        {reports.length === 0 && (
          <Card className="lg:col-span-2">
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Sin reportes. Registra métricas de un cliente y genera el borrador del mes.
            </CardContent>
          </Card>
        )}
        {reports.map((r) => (
          <Card key={r.id} className="print:break-inside-avoid">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2">
                {r.clients?.name} <Badge variant="outline">{r.period.slice(0, 7)}</Badge>
              </CardTitle>
              <CardDescription>Estado</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <pre className="whitespace-pre-wrap rounded-lg bg-muted p-3 font-sans text-sm">{r.body}</pre>
              <div className="flex flex-wrap items-center gap-2 print:hidden">
                <InlineSelect id={r.id} value={r.status} options={REPORT_STATUS} action={setReportStatus} className="w-36" />
                <PrintButton />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
