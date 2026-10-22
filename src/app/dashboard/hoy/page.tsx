import { CalendarClock, CircleDollarSign, FolderKanban, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { requireStaff } from "@/lib/auth";
import { getToday, todayCount } from "@/lib/today";

export const metadata = { title: "Hoy" };

const hour = new Intl.DateTimeFormat("es-PE", { hour: "2-digit", minute: "2-digit", timeZone: "America/Lima" });

export default async function TodayPage() {
  const { supabase } = await requireStaff();
  const t = await getToday(supabase);
  const total = todayCount(t);

  const blocks = [
    {
      title: "Próximas acciones",
      icon: Target,
      empty: "Sin acciones vencidas.",
      rows: t.actions.map((a) => ({ key: a.id, main: a.company, sub: a.next_action ?? "Definir próxima acción", right: a.next_action_at })),
    },
    {
      title: "Reuniones",
      icon: CalendarClock,
      empty: "Sin reuniones pendientes hoy.",
      rows: t.meetings.map((m) => ({ key: m.id, main: m.company, sub: "Diagnóstico", right: hour.format(new Date(m.starts_at)) })),
    },
    {
      title: "Entregas por vencer",
      icon: FolderKanban,
      empty: "Sin entregas vencidas.",
      rows: t.deliverables.map((d) => ({ key: d.id, main: d.piece, sub: d.client, right: d.due_date })),
    },
    {
      title: "Pagos pendientes",
      icon: CircleDollarSign,
      empty: "Todo al día.",
      rows: t.unpaid.map((c) => ({ key: c.id, main: c.name, sub: c.payment_status, right: c.renewal_date ?? "" })),
    },
  ];

  return (
    <>
      <PageHeader
        title="Hoy"
        description={total ? `${total} cosas requieren tu atención. Nada se envía automáticamente a prospectos.` : "Todo al día. Buen trabajo."}
      />
      <div className="grid gap-4 md:grid-cols-2">
        {blocks.map(({ title, icon: Icon, empty, rows }) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon className="size-4 text-primary" /> {title}
              </CardTitle>
              <CardDescription>{rows.length}</CardDescription>
            </CardHeader>
            <CardContent>
              {rows.length === 0 ? (
                <p className="text-sm text-muted-foreground">{empty}</p>
              ) : (
                <ul className="grid gap-3 text-sm">
                  {rows.map((r) => (
                    <li key={r.key} className="flex justify-between gap-3">
                      <span>
                        <span className="font-medium">{r.main}</span>
                        <span className="block text-muted-foreground">{r.sub}</span>
                      </span>
                      <span className="shrink-0 text-muted-foreground">{r.right}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
