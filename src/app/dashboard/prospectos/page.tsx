import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProspectBoard } from "@/components/prospect-board";
import { NewProspectDialog } from "@/components/dialogs";
import { InlineSelect } from "@/components/form-bits";
import { PageHeader } from "@/components/page-header";
import { deleteProspect, setProspectStage } from "@/lib/actions/crm";
import { requireStaff } from "@/lib/auth";
import { STAGES, type Prospect } from "@/lib/crm";

export const metadata = { title: "Prospectos" };

export default async function ProspectsPage() {
  const { supabase } = await requireStaff();
  const { data } = await supabase
    .from("prospects")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500)
    .overrideTypes<Prospect[]>();
  const rows = data ?? [];
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <PageHeader title="Prospectos" description="Pipeline comercial. Cada prospecto activo necesita una próxima acción.">
        <NewProspectDialog />
      </PageHeader>
      <Tabs defaultValue="tablero">
        <TabsList className="mb-4">
          <TabsTrigger value="tablero">Tablero</TabsTrigger>
          <TabsTrigger value="tabla">Tabla</TabsTrigger>
        </TabsList>
        <TabsContent value="tablero">
          <ProspectBoard prospects={rows} />
        </TabsContent>
        <TabsContent value="tabla">
      <Card className="overflow-x-auto p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empresa</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Canal</TableHead>
              <TableHead>Etapa</TableHead>
              <TableHead>Próxima acción</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Aún no hay prospectos. Los del formulario web aparecen aquí solos.
                </TableCell>
              </TableRow>
            )}
            {rows.map((p) => {
              const active = !["ganado", "perdido"].includes(p.stage);
              const overdue = active && p.next_action_at && p.next_action_at <= today;
              return (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="font-medium">{p.company}</div>
                    <div className="text-xs text-muted-foreground">{[p.sector, p.city].filter(Boolean).join(" · ")}</div>
                  </TableCell>
                  <TableCell>
                    <div>{p.contact_name}</div>
                    <div className="text-xs text-muted-foreground">{p.contact_email ?? p.contact_phone}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{p.channel}</Badge>
                  </TableCell>
                  <TableCell>
                    <InlineSelect id={p.id} value={p.stage} options={STAGES} action={setProspectStage} className="w-40" />
                  </TableCell>
                  <TableCell>
                    {p.next_action ? (
                      <>
                        <div className="text-sm">{p.next_action}</div>
                        <div className={`text-xs ${overdue ? "text-destructive" : "text-muted-foreground"}`}>
                          {p.next_action_at}
                        </div>
                      </>
                    ) : active ? (
                      <span className="text-xs text-destructive">Sin próxima acción</span>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <form action={deleteProspect.bind(null, p.id)}>
                      <Button type="submit" variant="ghost" size="icon-sm" aria-label={`Eliminar ${p.company}`}>
                        <Trash2 />
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
