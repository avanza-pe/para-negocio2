import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { NewProposalDialog } from "@/components/dialogs";
import { InlineSelect } from "@/components/form-bits";
import { PageHeader } from "@/components/page-header";
import { deleteProposal, setProposalStatus } from "@/lib/actions/proposals";
import { requireStaff } from "@/lib/auth";
import { PROPOSAL_STATUS, type Proposal } from "@/lib/crm";

export const metadata = { title: "Propuestas" };

const pen = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", maximumFractionDigits: 0 });

export default async function ProposalsPage() {
  const { supabase } = await requireStaff();
  const [{ data }, { data: prospects }] = await Promise.all([
    supabase.from("proposals").select("*").order("created_at", { ascending: false }).limit(100),
    supabase.from("prospects").select("id, company").not("stage", "in", "(ganado,perdido)").order("company"),
  ]);
  const rows = (data ?? []) as Proposal[];

  return (
    <>
      <PageHeader title="Propuestas" description="Crea la propuesta del prospecto, imprímela y sigue su estado. El prospecto avanza de etapa solo.">
        <NewProposalDialog prospects={(prospects ?? []).map((p) => ({ value: p.id, label: p.company }))} />
      </PageHeader>
      <Card className="overflow-x-auto p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Paquete</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Vigencia</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Aún no hay propuestas. Crea una desde un prospecto.
                </TableCell>
              </TableRow>
            )}
            {rows.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <Link href={`/dashboard/propuestas/${p.id}`} className="font-medium underline-offset-2 hover:underline">
                    {p.client_name}
                  </Link>
                  <div className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString("es-PE")}</div>
                </TableCell>
                <TableCell>{p.package}</TableCell>
                <TableCell>
                  {pen.format(Number(p.price_pen))} <span className="text-xs text-muted-foreground">{p.price_unit}</span>
                </TableCell>
                <TableCell>{p.validity_days} días</TableCell>
                <TableCell>
                  <InlineSelect id={p.id} value={p.status} options={PROPOSAL_STATUS} action={setProposalStatus} className="w-32" />
                </TableCell>
                <TableCell>
                  <form action={deleteProposal.bind(null, p.id)}>
                    <Button type="submit" variant="ghost" size="icon-sm" aria-label={`Eliminar propuesta de ${p.client_name}`}>
                      <Trash2 />
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
