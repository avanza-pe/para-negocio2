import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BriefForm, TaskList } from "@/components/onboarding-ui";
import { PageHeader } from "@/components/page-header";
import { requireStaff } from "@/lib/auth";
import { label, PAYMENT_STATUS, type Client, type ClientBrief, type OnboardingTask } from "@/lib/crm";

export const metadata = { title: "Cliente" };

export default async function ClientDetailPage({ params }: PageProps<"/dashboard/clientes/[id]">) {
  const { id } = await params;
  const { supabase } = await requireStaff();

  const { data } = await supabase.from("clients").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const client = data as Client;

  const [{ data: tasks }, { data: brief }] = await Promise.all([
    supabase.from("onboarding_tasks").select("id, title, done, position").eq("client_id", id).order("position").overrideTypes<OnboardingTask[]>(),
    supabase.from("client_briefs").select("*").eq("client_id", id).maybeSingle(),
  ]);
  const done = (tasks ?? []).filter((t) => t.done).length;
  const total = tasks?.length ?? 0;

  return (
    <>
      <Link href="/dashboard/clientes" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Clientes
      </Link>
      <PageHeader title={client.name} description={`${client.service} · S/ ${Number(client.price_pen).toLocaleString("es-PE")}`}>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Pago: {label(PAYMENT_STATUS, client.payment_status)}</Badge>
          {client.folder_url && (
            <a href={client.folder_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm underline underline-offset-2">
              Carpeta <ExternalLink className="size-3.5" />
            </a>
          )}
        </div>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
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
    </>
  );
}
