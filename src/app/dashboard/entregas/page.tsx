import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { NewDeliverableDialog } from "@/components/dialogs";
import { InlineSelect } from "@/components/form-bits";
import { PageHeader } from "@/components/page-header";
import { setDeliverableStatus } from "@/lib/actions/crm";
import { requireStaff } from "@/lib/auth";
import { DELIVERABLE_STATUS, type Deliverable } from "@/lib/crm";

export const metadata = { title: "Entregas" };

export default async function DeliverablesPage() {
  const { supabase } = await requireStaff();
  const [{ data }, { data: clients }] = await Promise.all([
    supabase
      .from("deliverables")
      .select("*, clients(name)")
      .order("due_date", { ascending: true, nullsFirst: false })
      .overrideTypes<Deliverable[]>(),
    supabase.from("clients").select("id, name").order("name"),
  ]);
  const rows = data ?? [];

  return (
    <>
      <PageHeader title="Entregas" description="Nada se entrega ni se publica sin aprobación humana.">
        <NewDeliverableDialog clients={(clients ?? []).map((c) => ({ value: c.id, label: c.name }))} />
      </PageHeader>
      <Card className="overflow-x-auto p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Pieza</TableHead>
              <TableHead>Formato</TableHead>
              <TableHead>Fecha límite</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Revisiones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Sin entregas todavía.
                </TableCell>
              </TableRow>
            )}
            {rows.map((d) => (
              <TableRow key={d.id}>
                <TableCell>{d.clients?.name}</TableCell>
                <TableCell className="font-medium">
                  {d.link ? (
                    <a href={d.link} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                      {d.piece}
                    </a>
                  ) : (
                    d.piece
                  )}
                </TableCell>
                <TableCell>{d.format ?? "—"}</TableCell>
                <TableCell>{d.due_date ?? "—"}</TableCell>
                <TableCell>
                  <InlineSelect id={d.id} value={d.status} options={DELIVERABLE_STATUS} action={setDeliverableStatus} className="w-40" />
                </TableCell>
                <TableCell>{d.revisions_left}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
