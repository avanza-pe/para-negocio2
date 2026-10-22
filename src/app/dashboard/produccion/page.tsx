import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NewContentDialog } from "@/components/dialogs";
import { InlineSelect } from "@/components/form-bits";
import { PageHeader } from "@/components/page-header";
import { CopyPromptButton, GenerateButton } from "@/components/production-actions";
import { briefToText, fullPrompt } from "@/lib/ai";
import { deleteContentItem, setContentStatus } from "@/lib/actions/content";
import { requireStaff } from "@/lib/auth";
import { CONTENT_STATUS, type ClientBrief, type ContentItem } from "@/lib/crm";
import { cn } from "@/lib/utils";

export const metadata = { title: "Producción" };

export default async function ProductionPage({ searchParams }: PageProps<"/dashboard/produccion">) {
  const { cliente } = await searchParams;
  const { supabase } = await requireStaff();

  const { data: clients } = await supabase.from("clients").select("id, name, service").order("name");
  const list = clients ?? [];
  const selected = list.find((c) => c.id === cliente) ?? list[0];

  let items: ContentItem[] = [];
  let prompt = "";
  if (selected) {
    const [{ data }, { data: brief }] = await Promise.all([
      supabase
        .from("content_items")
        .select("*")
        .eq("client_id", selected.id)
        .order("scheduled_for", { ascending: true, nullsFirst: false })
        .order("created_at"),
      supabase.from("client_briefs").select("*").eq("client_id", selected.id).maybeSingle(),
    ]);
    items = (data ?? []) as ContentItem[];
    prompt = fullPrompt(briefToText(selected.name, selected.service, brief as ClientBrief | null));
  }

  const aiEnabled = Boolean(process.env.ANTHROPIC_API_KEY);
  const options = list.map((c) => ({ value: c.id, label: c.name }));

  return (
    <>
      <PageHeader title="Producción" description="Calendario de contenido por cliente. La IA solo propone: una persona aprueba antes de publicar.">
        {options.length > 0 && <NewContentDialog clients={options} defaultClient={selected?.id} />}
      </PageHeader>

      {list.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Aún no hay clientes. Convierte un prospecto ganado desde Prospectos.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {list.map((c) => (
              <Link
                key={c.id}
                href={`/dashboard/produccion?cliente=${c.id}`}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm transition-colors hover:bg-accent",
                  c.id === selected?.id && "border-primary bg-primary/10 text-primary",
                )}
              >
                {c.name}
              </Link>
            ))}
          </div>

          {selected && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <GenerateButton clientId={selected.id} enabled={aiEnabled} />
              <CopyPromptButton prompt={prompt} />
              {!aiEnabled && <span className="text-xs text-muted-foreground">Generación automática desactivada (sin ANTHROPIC_API_KEY).</span>}
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {items.length === 0 && (
              <p className="text-sm text-muted-foreground md:col-span-2 xl:col-span-3">Sin contenidos para este cliente todavía.</p>
            )}
            {items.map((it) => (
              <Card key={it.id}>
                <CardContent className="grid gap-2 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1.5">
                      {it.pillar && <Badge variant="secondary">{it.pillar}</Badge>}
                      {it.format && <Badge variant="outline">{it.format}</Badge>}
                      {it.ai_generated && <Badge variant="outline">IA</Badge>}
                    </div>
                    <form action={deleteContentItem.bind(null, it.id)}>
                      <Button type="submit" variant="ghost" size="icon-sm" aria-label="Eliminar contenido">
                        <Trash2 />
                      </Button>
                    </form>
                  </div>
                  {it.hook && <p className="font-medium">{it.hook}</p>}
                  {it.copy && <p className="whitespace-pre-line text-muted-foreground">{it.copy}</p>}
                  {it.visual_idea && <p className="text-xs"><span className="text-muted-foreground">Visual:</span> {it.visual_idea}</p>}
                  <p className="text-xs text-muted-foreground">
                    {[it.objective && `Objetivo: ${it.objective}`, it.cta && `CTA: ${it.cta}`, it.metric && `Métrica: ${it.metric}`, it.scheduled_for]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <InlineSelect id={it.id} value={it.status} options={CONTENT_STATUS} action={setContentStatus} className="mt-1 w-40" />
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </>
  );
}
