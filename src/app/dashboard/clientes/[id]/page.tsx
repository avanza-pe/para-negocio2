import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Sparkles, UtensilsCrossed } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EditClientDialog } from "@/components/dialogs";
import { DeleteButton } from "@/components/form-bits";
import { BriefForm, TaskList } from "@/components/onboarding-ui";
import { PageHeader } from "@/components/page-header";
import { MonthlyPaymentButton, PayLinkActions } from "@/components/payments-ui";
import { PersonaCard, PersonasToolbar } from "@/components/personas-ui";
import { deleteClientRecord } from "@/lib/actions/crm";
import { aiConfigured } from "@/lib/ai";
import { requireStaff } from "@/lib/auth";
import { isGastro, label, PAY_STATUS, PAYMENT_STATUS, type Client, type ClientBrief, type OnboardingTask, type Payment, type Persona } from "@/lib/crm";
import { formatPhone, waLink } from "@/lib/phone";

// Las acciones con IA (sugerir personas) pueden tardar en los planes gratis.
export const maxDuration = 120;

export const metadata = { title: "Cliente" };

const pen = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" });

export default async function ClientDetailPage({ params }: PageProps<"/dashboard/clientes/[id]">) {
  const { id } = await params;
  const { supabase } = await requireStaff();

  const { data } = await supabase.from("clients").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const client = data as Client;

  const [{ data: tasks }, { data: brief }, { data: personas }, { data: payments }, { data: venues }] = await Promise.all([
    supabase.from("onboarding_tasks").select("id, title, done, position").eq("client_id", id).order("position").overrideTypes<OnboardingTask[]>(),
    supabase.from("client_briefs").select("*").eq("client_id", id).maybeSingle(),
    supabase.from("client_personas").select("*").eq("client_id", id).order("created_at"),
    supabase.from("payments").select("*").eq("client_id", id).order("created_at", { ascending: false }).limit(12),
    supabase.from("venues").select("id, name, slug, published").eq("client_id", id),
  ]);
  const done = (tasks ?? []).filter((t) => t.done).length;
  const total = tasks?.length ?? 0;
  const gastro = isGastro(client.sector ?? (brief as ClientBrief | null)?.sector, client.service);

  return (
    <>
      <Link href="/dashboard/clientes" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Clientes
      </Link>
      <PageHeader title={client.name} description={`${client.service} · ${pen.format(Number(client.price_pen))}${client.renewal_date ? ` · próximo cobro ${client.renewal_date}` : ""}`}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">Pago: {label(PAYMENT_STATUS, client.payment_status)}</Badge>
          {client.contact_phone && (
            <a href={waLink(client.contact_phone, `Hola ${client.contact ?? client.name}`)} target="_blank" rel="noopener noreferrer" className="text-sm underline underline-offset-2">
              WhatsApp {formatPhone(client.contact_phone)}
            </a>
          )}
          {client.folder_url && (
            <a href={client.folder_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm underline underline-offset-2">
              Carpeta <ExternalLink className="size-3.5" />
            </a>
          )}
          <Button size="sm" variant="outline" nativeButton={false} render={<Link href={`/dashboard/produccion?cliente=${client.id}`} />}>
            <Sparkles /> Contenido
          </Button>
          <MonthlyPaymentButton clientId={client.id} />
          <EditClientDialog client={client} />
          <DeleteButton
            action={deleteClientRecord.bind(null, client.id)}
            label="Eliminar cliente"
            confirm={`¿Eliminar a ${client.name} con su checklist, brief, personas, contenido, entregas y reportes? No se puede deshacer.`}
          />
        </div>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <div className="grid content-start gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Checklist de onboarding</CardTitle>
              <CardDescription>
                {done} de {total} completadas
              </CardDescription>
              <Progress value={total ? (done / total) * 100 : 0} className="mt-2" />
            </CardHeader>
            <CardContent>
              <TaskList tasks={tasks ?? []} />
            </CardContent>
          </Card>

          {(gastro || (venues ?? []).length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UtensilsCrossed className="size-4 text-primary" /> Locales y carta digital
                </CardTitle>
                <CardDescription>Carta con pedidos por WhatsApp, reservas y QR.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2 text-sm">
                {(venues ?? []).map((v) => (
                  <Link key={v.id} href={`/dashboard/locales/${v.id}`} className="flex items-center justify-between rounded-lg border p-2.5 hover:bg-accent">
                    {v.name} <Badge variant={v.published ? "secondary" : "outline"}>{v.published ? `/m/${v.slug}` : "Borrador"}</Badge>
                  </Link>
                ))}
                {(venues ?? []).length === 0 && (
                  <Button size="sm" variant="outline" className="w-fit" nativeButton={false} render={<Link href="/dashboard/locales" />}>
                    Crear su carta digital
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Cobros</CardTitle>
              <CardDescription>Últimos enlaces de pago de este cliente.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              {(payments ?? []).length === 0 && <p className="text-muted-foreground">Sin cobros. Usa «Cobro del mes».</p>}
              {((payments ?? []) as Payment[]).map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-2 rounded-lg border p-2.5">
                  <span className="min-w-0">
                    <span className="block truncate">{p.concept}</span>
                    <span className="text-xs text-muted-foreground">
                      {pen.format(Number(p.amount_pen))} · {label(PAY_STATUS, p.status)}
                    </span>
                  </span>
                  {p.status === "pendiente" && <PayLinkActions token={p.public_token} concept={p.concept} amount={Number(p.amount_pen)} client={client.contact ?? client.name} phone={client.contact_phone} />}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid content-start gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Buyer personas</CardTitle>
              <CardDescription>A quién le habla la marca. La IA las usa para repartir y escribir el contenido.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <PersonasToolbar clientId={client.id} aiEnabled={aiConfigured()} gastro={gastro} />
              {(personas ?? []).length === 0 && <p className="text-sm text-muted-foreground">Sin personas todavía.</p>}
              <div className="grid gap-2 sm:grid-cols-2">
                {((personas ?? []) as Persona[]).map((p) => (
                  <PersonaCard key={p.id} persona={p} clientId={client.id} />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Brief del cliente</CardTitle>
              <CardDescription>Si falta un dato, déjalo vacío y márcalo [POR CONFIRMAR] en el texto.</CardDescription>
            </CardHeader>
            <CardContent>
              <BriefForm clientId={client.id} brief={(brief as ClientBrief | null) ?? null} />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
