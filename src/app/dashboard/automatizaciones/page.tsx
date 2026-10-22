import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { requireStaff } from "@/lib/auth";
import type { AutomationRun } from "@/lib/crm";

export const metadata = { title: "Automatizaciones" };

const FLOWS = [
  { id: "A", name: "Lead entrante", state: "Activa", detail: "Formulario web → prospecto en CRM → aviso por correo (si Resend está configurado)." },
  { id: "B", name: "Reserva", state: "Manual", detail: "Registra la reunión a mano o conecta el webhook de tu agenda." },
  { id: "C", name: "Onboarding", state: "Plantilla", detail: "Al marcar Ganado: carpeta, checklist y brief (ver docs/plantillas.md)." },
  { id: "D", name: "Producción", state: "Semana 2", detail: "Brief completo → entregables + borrador de calendario con IA y aprobación humana." },
  { id: "E", name: "Seguimiento", state: "Panel", detail: "El resumen muestra acciones vencidas. Sin mensajes automáticos no solicitados." },
  { id: "F", name: "Reporte", state: "Semana 2", detail: "Borrador con métricas registradas; nunca se inventan datos." },
];

const variant = { ok: "secondary", error: "destructive", duplicado: "outline" } as const;

export default async function AutomationsPage() {
  const { supabase } = await requireStaff();
  const { data } = await supabase
    .from("automation_runs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50)
    .overrideTypes<AutomationRun[]>();

  return (
    <>
      <PageHeader title="Automatizaciones" description="Estado de los flujos A–F del informe y registro de ejecuciones." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FLOWS.map((f) => (
          <Card key={f.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {f.id}. {f.name} <Badge variant="outline">{f.state}</Badge>
              </CardTitle>
              <CardDescription>{f.detail}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <h2 className="mt-8 mb-3 text-lg font-semibold">Últimas ejecuciones</h2>
      <Card className="overflow-x-auto p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Flujo</TableHead>
              <TableHead>Acción</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Error</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data ?? []).length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
                  Sin ejecuciones. Envía un lead de prueba desde la web.
                </TableCell>
              </TableRow>
            )}
            {(data ?? []).map((r) => (
              <TableRow key={r.id}>
                <TableCell>{new Date(r.created_at).toLocaleString("es-PE")}</TableCell>
                <TableCell>{r.flow}</TableCell>
                <TableCell>{r.action}</TableCell>
                <TableCell>
                  <Badge variant={variant[r.status as keyof typeof variant] ?? "outline"}>{r.status}</Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{r.error}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
