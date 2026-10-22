import { ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { NewClientDialog } from "@/components/dialogs";
import { InlineSelect } from "@/components/form-bits";
import { PageHeader } from "@/components/page-header";
import { setPaymentStatus } from "@/lib/actions/crm";
import { requireStaff } from "@/lib/auth";
import { PAYMENT_STATUS, type Client } from "@/lib/crm";

export const metadata = { title: "Clientes" };

const pen = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", maximumFractionDigits: 0 });

export default async function ClientsPage() {
  const { supabase } = await requireStaff();
  const { data } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false })
    .overrideTypes<Client[]>();
  const rows = data ?? [];

  return (
    <>
      <PageHeader title="Clientes" description="Servicio contratado, renovación y estado de pago.">
        <NewClientDialog />
      </PageHeader>
      <Card className="overflow-x-auto p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Servicio</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Renovación</TableHead>
              <TableHead>Pago</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Sin clientes todavía.
                </TableCell>
              </TableRow>
            )}
            {rows.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.contact}</div>
                </TableCell>
                <TableCell>{c.service}</TableCell>
                <TableCell>{pen.format(Number(c.price_pen))}</TableCell>
                <TableCell>{c.renewal_date ?? "—"}</TableCell>
                <TableCell>
                  <InlineSelect id={c.id} value={c.payment_status} options={PAYMENT_STATUS} action={setPaymentStatus} className="w-32" />
                </TableCell>
                <TableCell>{c.owner ?? "—"}</TableCell>
                <TableCell>
                  {c.folder_url && (
                    <a href={c.folder_url} target="_blank" rel="noopener noreferrer" aria-label={`Carpeta de ${c.name}`}>
                      <ExternalLink className="size-4" />
                    </a>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
