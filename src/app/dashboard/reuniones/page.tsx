import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { NewMeetingDialog } from "@/components/dialogs";
import { InlineSelect } from "@/components/form-bits";
import { PageHeader } from "@/components/page-header";
import { setMeetingStatus } from "@/lib/actions/meetings";
import { requireStaff } from "@/lib/auth";
import { MEETING_STATUS, type Meeting } from "@/lib/crm";

export const metadata = { title: "Reuniones" };

const fmt = new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Lima" });

const isPast = (iso: string) => new Date(iso).getTime() < Date.now();

export default async function MeetingsPage() {
  const { supabase } = await requireStaff();
  const [{ data }, { data: prospects }] = await Promise.all([
    supabase
      .from("meetings")
      .select("*, prospects(company, contact_name)")
      .order("starts_at", { ascending: true })
      .overrideTypes<Meeting[]>(),
    supabase.from("prospects").select("id, company").not("stage", "in", "(ganado,perdido)").order("company"),
  ]);
  const rows = data ?? [];

  return (
    <>
      <PageHeader title="Reuniones" description="Diagnósticos de 15 minutos. Horas en zona America/Lima.">
        <NewMeetingDialog prospects={(prospects ?? []).map((p) => ({ value: p.id, label: p.company }))} />
      </PageHeader>
      <Card className="overflow-x-auto p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Prospecto</TableHead>
              <TableHead>Origen</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Notas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Sin reuniones. Agéndalas desde aquí o conecta el webhook de Calendly.
                </TableCell>
              </TableRow>
            )}
            {rows.map((m) => {
              const past = isPast(m.starts_at);
              return (
                <TableRow key={m.id} className={past && m.status === "programada" ? "bg-destructive/5" : undefined}>
                  <TableCell className="whitespace-nowrap">{fmt.format(new Date(m.starts_at))}</TableCell>
                  <TableCell>
                    <div className="font-medium">{m.prospects?.company}</div>
                    <div className="text-xs text-muted-foreground">{m.prospects?.contact_name}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{m.source}</Badge>
                  </TableCell>
                  <TableCell>
                    <InlineSelect id={m.id} value={m.status} options={MEETING_STATUS} action={setMeetingStatus} className="w-36" />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{m.notes}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
