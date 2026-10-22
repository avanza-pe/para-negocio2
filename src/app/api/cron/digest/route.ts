import { NextResponse, type NextRequest } from "next/server";
import { limaDate } from "@/lib/dates";
import { esc, notifyTeam } from "@/lib/notify";
import { createRecurringPayments, flagOverdueClients } from "@/lib/payments";
import { SITE } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/admin";
import { getToday, todayCount } from "@/lib/today";

const pen = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" });

// Flujos E y G (cron diario, vercel.json, 08:00 Lima). Vercel lo llama con "Authorization: Bearer $CRON_SECRET".
// 1) Crea los cobros del mes de los clientes que renuevan pronto. 2) Marca clientes con cobros vencidos.
// 3) Envía el resumen del día al equipo (correo + Telegram). NUNCA escribe a prospectos ni clientes.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const db = createAdminClient();
  const today = limaDate();
  const created = await createRecurringPayments(db, today).catch(() => 0);
  const overdue = await flagOverdueClients(db, today).catch(() => 0);
  // Limpieza: eventos de cartas de más de 13 meses (los reportes usan los últimos 12).
  await db.from("venue_events").delete().lt("created_at", new Date(Date.now() - 400 * 864e5).toISOString());

  const t = await getToday(db);
  const total = todayCount(t);

  let status: "ok" | "error" = "ok";
  let error: string | null = null;

  if (total > 0) {
    const li = (items: string[]) => (items.length ? `<ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>` : "<p>—</p>");
    const lines = (items: string[]) => (items.length ? items.map((i) => `• ${i}`).join("\n") : "—");
    const actions = t.actions.map((a) => `${a.company}: ${a.next_action ?? "definir próxima acción"} (${a.next_action_at})`);
    const meetings = t.meetings.map((m) => `${m.company} · ${new Date(m.starts_at).toLocaleString("es-PE", { timeZone: "America/Lima" })}`);
    const deliverables = t.deliverables.map((d) => `${d.piece} (${d.client}) · ${d.due_date}`);
    const payments = t.payments.map((p) => `${p.client} · ${pen.format(p.amount_pen)} · ${p.concept} → ${SITE.url}/pagar/${p.public_token}`);
    const unpaid = t.unpaid.map((c) => `${c.name} · ${c.payment_status}`);
    error = await notifyTeam({
      subject: `${SITE.name} · ${total} pendientes hoy`,
      html: [
        "<h2>Resumen del día</h2>",
        created ? `<p>Se crearon <b>${created}</b> cobros del mes. Revísalos y envíalos desde <a href="${SITE.url}/dashboard/cobros">Cobros</a>.</p>` : "",
        "<h3>Próximas acciones</h3>",
        li(actions.map(esc)),
        "<h3>Reuniones</h3>",
        li(meetings.map(esc)),
        "<h3>Entregas por vencer</h3>",
        li(deliverables.map(esc)),
        "<h3>Cobros por enviar o vencidos</h3>",
        li(payments.map(esc)),
        "<h3>Clientes con pago pendiente</h3>",
        li(unpaid.map(esc)),
      ].join(""),
      text: [
        created ? `${created} cobros del mes creados.` : "",
        `Acciones:\n${lines(actions)}`,
        `Reuniones:\n${lines(meetings)}`,
        `Entregas:\n${lines(deliverables)}`,
        `Cobros:\n${lines(payments)}`,
        `Clientes por cobrar:\n${lines(unpaid)}`,
      ]
        .filter(Boolean)
        .join("\n\n"),
    });
    if (error) status = "error";
  }

  await db.from("automation_runs").insert({ flow: "E_seguimiento", trigger: "cron diario", action: `resumen (${total} pendientes, ${created} cobros, ${overdue} vencidos)`, status, error });
  return NextResponse.json({ ok: status === "ok", pendientes: total, cobros_creados: created, clientes_vencidos: overdue });
}
