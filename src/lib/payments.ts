import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { addDays, addMonths, monthLabel, monthStart } from "@/lib/dates";
import { mapMpStatus, type MpPayment } from "@/lib/mercadopago";
import { esc, notifyTeam } from "@/lib/notify";
import { isMonthly } from "@/lib/offer";
import { SITE } from "@/lib/site";

const pen = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" });

export const isPaymentToken = (t: string) => /^[0-9a-f]{32}$/.test(t);

type PaymentRow = { id: string; client_id: string | null; concept: string; amount_pen: number; period: string | null };

/**
 * Marca un cobro como pagado UNA sola vez (update condicional) y aplica sus efectos:
 * cliente "pagado" y, si el cobro es del mes de renovación, renovación +1 mes. Avisa al equipo.
 * Devuelve false si ya estaba pagado (webhook repetido o pago manual previo).
 */
export async function markPaid(
  db: SupabaseClient,
  paymentId: string,
  fields: { method: string; mp_payment_id?: string; mp_status?: string; mp_status_detail?: string; payer_email?: string | null },
) {
  const { data: rows } = await db
    .from("payments")
    .update({ ...fields, status: "pagado", paid_at: new Date().toISOString() })
    .eq("id", paymentId)
    .neq("status", "pagado")
    .select("id, client_id, concept, amount_pen, period");
  const p = rows?.[0] as PaymentRow | undefined;
  if (!p) return false;

  let clientName = "Sin cliente";
  if (p.client_id) {
    const { data: client } = await db.from("clients").select("name, renewal_date").eq("id", p.client_id).single();
    clientName = client?.name ?? clientName;
    const advance = p.period && client?.renewal_date && monthStart(client.renewal_date) === p.period;
    await db
      .from("clients")
      .update({ payment_status: "pagado", ...(advance ? { renewal_date: addMonths(client.renewal_date, 1) } : {}) })
      .eq("id", p.client_id);
  }

  await db.from("automation_runs").insert({ flow: "G_cobro", trigger: fields.method, action: `cobro pagado ${pen.format(Number(p.amount_pen))}`, status: "ok", ref_id: p.id });
  await notifyTeam({
    subject: `Pago recibido: ${clientName} · ${pen.format(Number(p.amount_pen))}`,
    html: `<p><b>${esc(clientName)}</b> pagó <b>${pen.format(Number(p.amount_pen))}</b> (${esc(p.concept)}) con ${esc(fields.method)}.</p><p><a href="${SITE.url}/dashboard/cobros">Ver cobros</a></p>`,
    text: `${clientName} pagó ${pen.format(Number(p.amount_pen))} (${p.concept}) con ${fields.method}.`,
  }).catch(() => {});
  return true;
}

/**
 * Aplica un pago de Mercado Pago (consultado a su API, nunca confiando en el cuerpo del webhook) a
 * nuestro cobro identificado por external_reference. Idempotente.
 */
export async function applyMpPayment(db: SupabaseClient, mpPayment: MpPayment) {
  const ref = mpPayment.external_reference;
  if (!ref || !/^[0-9a-f-]{36}$/.test(ref)) return "sin_referencia" as const;

  const { data: row } = await db.from("payments").select("id, amount_pen, status").eq("id", ref).maybeSingle();
  if (!row) return "no_encontrado" as const;

  const status = mapMpStatus(mpPayment.status);
  const mpFields = {
    mp_payment_id: String(mpPayment.id),
    mp_status: mpPayment.status,
    mp_status_detail: mpPayment.status_detail,
  };

  if (status === "pagado") {
    // Defensa: el monto aprobado debe cubrir el cobro (en soles).
    if (mpPayment.currency_id !== "PEN" || Number(mpPayment.transaction_amount) + 0.001 < Number(row.amount_pen)) {
      await db.from("payments").update({ ...mpFields, notes: "Monto o moneda no coinciden: revisar a mano" }).eq("id", row.id);
      await db.from("automation_runs").insert({ flow: "G_cobro", trigger: "mercadopago", action: "monto no coincide", status: "error", error: `${mpPayment.currency_id} ${mpPayment.transaction_amount}`, ref_id: row.id });
      return "monto_invalido" as const;
    }
    await markPaid(db, row.id, { ...mpFields, method: mpPayment.payment_method_id === "yape" ? "yape_mp" : "mercadopago", payer_email: mpPayment.payer?.email ?? null });
    return "pagado" as const;
  }

  if (status === "reembolsado") {
    await db.from("payments").update({ ...mpFields, status }).eq("id", row.id);
  } else if (row.status !== "pagado") {
    // Un intento rechazado o vencido NO cierra el cobro: queda pendiente para reintentar con otro medio.
    await db.from("payments").update(mpFields).eq("id", row.id);
  }
  return status;
}

/**
 * Flujo G (cron diario): crea el cobro del mes a los clientes con servicio mensual cuya renovación
 * cae en los próximos `daysAhead` días. El índice único (cliente, mes) evita duplicados.
 * No envía nada al cliente: el equipo recibe el enlace en el resumen y decide cuándo mandarlo.
 */
export async function createRecurringPayments(db: SupabaseClient, today: string, daysAhead = 5) {
  const { data: clients } = await db
    .from("clients")
    .select("id, name, service, price_pen, renewal_date, contact_email")
    .not("renewal_date", "is", null)
    .lte("renewal_date", addDays(today, daysAhead))
    .gt("price_pen", 0);

  let created = 0;
  for (const c of clients ?? []) {
    if (!isMonthly(c.service)) continue;
    const period = monthStart(c.renewal_date)!;
    const { error } = await db.from("payments").insert({
      client_id: c.id,
      concept: `${c.service} · ${monthLabel(period)}`,
      amount_pen: c.price_pen,
      period,
      due_date: c.renewal_date,
      payer_email: c.contact_email,
    });
    if (!error) created++;
  }
  if (created) await db.from("automation_runs").insert({ flow: "G_cobro", trigger: "cron diario", action: `crear ${created} cobros del mes`, status: "ok" });
  return created;
}

/** Clientes con un cobro vencido pasan a "vencido" (se ve en Clientes y en Hoy). */
export async function flagOverdueClients(db: SupabaseClient, today: string) {
  const { data } = await db.from("payments").select("client_id").eq("status", "pendiente").lt("due_date", today).not("client_id", "is", null);
  const ids = [...new Set((data ?? []).map((r) => r.client_id as string))];
  if (ids.length) await db.from("clients").update({ payment_status: "vencido" }).in("id", ids).neq("payment_status", "vencido");
  return ids.length;
}
