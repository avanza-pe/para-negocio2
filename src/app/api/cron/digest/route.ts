import { NextResponse, type NextRequest } from "next/server";
import { sendMail } from "@/lib/mail";
import { createAdminClient } from "@/lib/supabase/admin";
import { getToday, todayCount } from "@/lib/today";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

// Flujo E: resumen diario para el equipo. Lo invoca Vercel Cron (vercel.json) con
// "Authorization: Bearer $CRON_SECRET". NUNCA escribe a prospectos ni clientes.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const db = createAdminClient();
  const t = await getToday(db);
  const total = todayCount(t);
  const to = process.env.NOTIFY_EMAIL_TO;

  let status: "ok" | "error" = "ok";
  let error: string | null = null;

  if (total > 0 && to) {
    const li = (items: string[]) => (items.length ? `<ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>` : "<p>—</p>");
    try {
      await sendMail({
        to,
        subject: `AVANZA · ${total} pendientes hoy`,
        html: [
          "<h2>Resumen del día</h2>",
          "<h3>Próximas acciones</h3>",
          li(t.actions.map((a) => `<b>${esc(a.company)}</b>: ${esc(a.next_action ?? "definir próxima acción")} (${a.next_action_at})`)),
          "<h3>Reuniones</h3>",
          li(t.meetings.map((m) => `${esc(m.company)} · ${new Date(m.starts_at).toLocaleString("es-PE", { timeZone: "America/Lima" })}`)),
          "<h3>Entregas por vencer</h3>",
          li(t.deliverables.map((d) => `${esc(d.piece)} (${esc(d.client)}) · ${d.due_date}`)),
          "<h3>Pagos pendientes</h3>",
          li(t.unpaid.map((c) => `${esc(c.name)} · ${esc(c.payment_status)}`)),
        ].join(""),
      });
    } catch (e) {
      status = "error";
      error = e instanceof Error ? e.message : String(e);
    }
  }

  await db.from("automation_runs").insert({ flow: "E_seguimiento", trigger: "cron diario", action: `resumen (${total} pendientes)`, status, error });
  return NextResponse.json({ ok: status === "ok", pendientes: total });
}
