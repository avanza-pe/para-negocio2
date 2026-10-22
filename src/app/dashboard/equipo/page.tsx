import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InlineSelect } from "@/components/form-bits";
import { PageHeader } from "@/components/page-header";
import { setUserRole } from "@/lib/actions/team";
import { requireStaff } from "@/lib/auth";

export const metadata = { title: "Equipo" };

const ROLES = [
  { value: "admin", label: "Administrador" },
  { value: "member", label: "Miembro" },
  { value: "pending", label: "Pendiente" },
] as const;

export default async function TeamPage() {
  const { supabase, user, profile } = await requireStaff();
  if (profile.role !== "admin") redirect("/dashboard");

  const { data } = await supabase.from("profiles").select("id, full_name, role, created_at").order("created_at");
  const rows = data ?? [];
  const pending = rows.filter((r) => r.role === "pending").length;

  return (
    <>
      <PageHeader
        title="Equipo"
        description={pending ? `${pending} persona${pending === 1 ? "" : "s"} esperando aprobación.` : "Quién puede entrar al panel. Solo los administradores ven esta página."}
      />
      <Card className="overflow-x-auto p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Alta</TableHead>
              <TableHead>Rol</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">
                  {r.full_name ?? "Sin nombre"} {r.id === user.id && <Badge variant="secondary">Tú</Badge>}
                </TableCell>
                <TableCell>{new Date(r.created_at).toLocaleDateString("es-PE")}</TableCell>
                <TableCell>
                  {r.id === user.id ? (
                    <Badge>Administrador</Badge>
                  ) : (
                    <InlineSelect id={r.id} value={r.role} options={ROLES} action={setUserRole} className="w-40" />
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
