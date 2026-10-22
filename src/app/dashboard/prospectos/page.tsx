import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProspectBoard } from "@/components/prospect-board";
import { ConvertToClientDialog, EditProspectDialog, NewProspectDialog } from "@/components/dialogs";
import { DeleteButton, InlineSelect } from "@/components/form-bits";
import { PageHeader } from "@/components/page-header";
import { deleteProspect, setProspectStage } from "@/lib/actions/crm";
import { requireStaff } from "@/lib/auth";
import { CHANNELS, label, STAGES, type Prospect } from "@/lib/crm";
import { limaDate } from "@/lib/dates";
import { formatPhone } from "@/lib/phone";

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
  const { data: linked } = await supabase.from("clients").select("prospect_id").not("prospect_id", "is", null);
  const converted = new Set((linked ?? []).map((c) => c.prospect_id as string));
  const today = limaDate();

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
          <ProspectBoard prospects={rows} converted={converted} today={today} />
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
                  <TableHead className="w-24" />
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
                        <div className="text-xs text-muted-foreground">{p.contact_email ?? formatPhone(p.contact_phone)}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{label(CHANNELS, p.channel)}</Badge>
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
                        <div className="flex items-center gap-1">
                          {p.stage === "ganado" && !converted.has(p.id) && <ConvertToClientDialog prospectId={p.id} company={p.company} />}
                          <EditProspectDialog prospect={p} />
                          <DeleteButton action={deleteProspect.bind(null, p.id)} label={`Eliminar ${p.company}`} confirm={`¿Eliminar a ${p.company} y sus reuniones? No se puede deshacer.`} />
                        </div>
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
