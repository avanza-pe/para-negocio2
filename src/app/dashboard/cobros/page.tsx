import Link from "next/link";
import { CircleCheck, Clock, ExternalLink, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DeleteButton, InlineSelect } from "@/components/form-bits";
import { PageHeader } from "@/components/page-header";
import { MarkPaidSelect, NewPaymentDialog, PayLinkActions } from "@/components/payments-ui";
import { deletePayment, setPaymentRecordStatus } from "@/lib/actions/payments";
import { requireStaff } from "@/lib/auth";
import { label, PAY_METHODS, PAY_STATUS, type Payment } from "@/lib/crm";
import { limaDate } from "@/lib/dates";
import { mpConfigured, yapeViaMpEnabled } from "@/lib/mercadopago";
import { SITE } from "@/lib/site";

export const metadata = { title: "Cobros" };

const pen = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" });
const variant = { pendiente: "outline", pagado: "secondary", rechazado: "destructive", cancelado: "outline", reembolsado: "destructive" } as const;

export default async function PaymentsPage() {
  const { supabase } = await requireStaff();
  const [{ data, error }, { data: clients }] = await Promise.all([
    supabase.from("payments").select("*, clients(name, contact_phone)").order("created_at", { ascending: false }).limit(200),
    supabase.from("clients").select("id, name").order("name"),
  ]);
  const rows = (data ?? []) as Payment[];
  const today = limaDate();
  const monthPrefix = today.slice(0, 7);

  const pending = rows.filter((p) => p.status === "pendiente");
  const overdue = pending.filter((p) => p.due_date && p.due_date < today);
  const paidThisMonth = rows.filter((p) => p.status === "pagado" && p.paid_at && p.paid_at.slice(0, 7) === monthPrefix);

  const channels = [
    { on: yapeViaMpEnabled(), text: "Yape vía Mercado Pago" },
    { on: mpConfigured(), text: "Tarjeta (Checkout Pro)" },
    { on: Boolean(SITE.yapeNumber), text: "Yape/Plin directo" },
  ];

  return (
    <>
      <PageHeader title="Cobros" description="Enlaces de pago para tus clientes. Mercado Pago confirma solo; Yape/Plin directo y transferencias se marcan a mano.">
        <NewPaymentDialog clients={(clients ?? []).map((c) => ({ value: c.id, label: c.name }))} />
      </PageHeader>

      {error && (
        <Card className="mb-4 border-destructive/40">
          <CardContent className="text-sm text-destructive">
            No se pudo leer la tabla de cobros. ¿Ya corriste <code>supabase/migrations/0008_payments.sql</code>?
          </CardContent>
        </Card>
      )}

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Por cobrar", value: pen.format(pending.reduce((s, p) => s + Number(p.amount_pen), 0)), sub: `${pending.length} cobros`, icon: Clock },
          { label: "Vencidos", value: String(overdue.length), sub: pen.format(overdue.reduce((s, p) => s + Number(p.amount_pen), 0)), icon: Wallet },
          { label: "Cobrado este mes", value: pen.format(paidThisMonth.reduce((s, p) => s + Number(p.amount_pen), 0)), sub: `${paidThisMonth.length} pagos`, icon: CircleCheck },
        ].map((k) => (
          <Card key={k.label} size="sm">
            <CardContent className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-lg bg-primary/15 text-primary">
                <k.icon className="size-4" />
              </span>
              <span>
                <span className="block font-heading text-xl font-semibold leading-none">{k.value}</span>
                <span className="text-xs text-muted-foreground">
                  {k.label} · {k.sub}
                </span>
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        Medios activos:
        {channels.map((c) => (
          <Badge key={c.text} variant={c.on ? "secondary" : "outline"} className={c.on ? undefined : "opacity-60"}>
            {c.on ? "✓" : "✗"} {c.text}
          </Badge>
        ))}
        <Link href="/dashboard/configuracion" className="underline underline-offset-2">
          Configurar
        </Link>
      </div>

      <Card className="overflow-x-auto p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente / concepto</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Vence</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Enlace</TableHead>
              <TableHead>Registrar</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Sin cobros. Crea uno o usa «Cobro del mes» desde la ficha de un cliente (el resumen diario también los crea antes de cada renovación).
                </TableCell>
              </TableRow>
            )}
            {rows.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="font-medium">{p.clients?.name ?? "Sin cliente"}</div>
                  <div className="text-xs text-muted-foreground">{p.concept}</div>
                </TableCell>
                <TableCell className="tabular-nums">{pen.format(Number(p.amount_pen))}</TableCell>
                <TableCell className={p.status === "pendiente" && p.due_date && p.due_date < today ? "text-destructive" : undefined}>{p.due_date ?? "—"}</TableCell>
                <TableCell>
                  {p.status === "pagado" ? (
                    <div>
                      <Badge variant={variant.pagado}>Pagado</Badge>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {label(PAY_METHODS, p.method ?? "")} · {p.paid_at ? new Date(p.paid_at).toLocaleDateString("es-PE", { timeZone: "America/Lima" }) : ""}
                      </div>
                    </div>
                  ) : (
                    <>
                      <InlineSelect id={p.id} value={p.status} options={PAY_STATUS.filter((s) => s.value !== "pagado")} action={setPaymentRecordStatus} className="w-32" />
                      {p.mp_status && p.mp_status !== "approved" && <div className="mt-1 text-xs text-muted-foreground">MP: {p.mp_status_detail ?? p.mp_status}</div>}
                    </>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <PayLinkActions token={p.public_token} concept={p.concept} amount={Number(p.amount_pen)} client={p.clients?.name} phone={p.clients?.contact_phone} />
                    <a href={`/pagar/${p.public_token}`} target="_blank" rel="noopener noreferrer" aria-label="Abrir página de pago" className="p-1 text-muted-foreground hover:text-foreground">
                      <ExternalLink className="size-4" />
                    </a>
                  </div>
                </TableCell>
                <TableCell>{p.status === "pendiente" ? <MarkPaidSelect id={p.id} /> : null}</TableCell>
                <TableCell>
                  {p.status !== "pagado" && <DeleteButton action={deletePayment.bind(null, p.id)} label="Eliminar cobro" confirm={`¿Eliminar el cobro «${p.concept}»? El enlace dejará de funcionar.`} />}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
