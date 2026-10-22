import type { SupabaseClient } from "@supabase/supabase-js";
import { limaDate, limaEndOfDayISO } from "@/lib/dates";

export type TodayData = {
  actions: { id: string; company: string; next_action: string | null; next_action_at: string }[];
  meetings: { id: string; starts_at: string; company: string }[];
  deliverables: { id: string; piece: string; due_date: string; client: string }[];
  unpaid: { id: string; name: string; payment_status: string; renewal_date: string | null }[];
  payments: { id: string; concept: string; amount_pen: number; due_date: string | null; client: string; public_token: string }[];
};

/** Lo que requiere atención hoy (hora de Lima). Solo lectura: el seguimiento nunca envía mensajes a prospectos. */
export async function getToday(db: SupabaseClient): Promise<TodayData> {
  const today = limaDate();

  const [actions, meetings, deliverables, unpaid, payments] = await Promise.all([
    db
      .from("prospects")
      .select("id, company, next_action, next_action_at")
      .not("stage", "in", "(ganado,perdido)")
      .lte("next_action_at", today)
      .order("next_action_at")
      .limit(50),
    db
      .from("meetings")
      .select("id, starts_at, prospects(company)")
      .eq("status", "programada")
      .lte("starts_at", limaEndOfDayISO(today))
      .order("starts_at")
      .limit(50),
    db
      .from("deliverables")
      .select("id, piece, due_date, clients(name)")
      .not("status", "in", "(aprobado,entregado)")
      .not("due_date", "is", null)
      .lte("due_date", today)
      .order("due_date")
      .limit(50),
    db.from("clients").select("id, name, payment_status, renewal_date").neq("payment_status", "pagado").limit(50),
    // Si la migración 0008 aún no se corrió, la consulta falla y simplemente queda vacía.
    db
      .from("payments")
      .select("id, client_id, concept, amount_pen, due_date, public_token, clients(name)")
      .eq("status", "pendiente")
      .or(`due_date.is.null,due_date.lte.${today}`)
      .order("due_date", { nullsFirst: true })
      .limit(50),
  ]);

  type Rel<T> = T | T[] | null;
  const one = <T,>(v: Rel<T>) => (Array.isArray(v) ? v[0] : v);

  // Un cliente con un cobro pendiente ya aparece en "payments": no se cuenta dos veces.
  const withPayment = new Set((payments.data ?? []).map((p) => p.client_id as string | null));

  return {
    actions: (actions.data ?? []) as TodayData["actions"],
    meetings: (meetings.data ?? []).map((m) => ({
      id: m.id as string,
      starts_at: m.starts_at as string,
      company: one(m.prospects as Rel<{ company: string }>)?.company ?? "—",
    })),
    deliverables: (deliverables.data ?? []).map((d) => ({
      id: d.id as string,
      piece: d.piece as string,
      due_date: d.due_date as string,
      client: one(d.clients as Rel<{ name: string }>)?.name ?? "—",
    })),
    unpaid: ((unpaid.data ?? []) as TodayData["unpaid"]).filter((c) => !withPayment.has(c.id)),
    payments: (payments.data ?? []).map((p) => ({
      id: p.id as string,
      concept: p.concept as string,
      amount_pen: Number(p.amount_pen),
      due_date: p.due_date as string | null,
      public_token: p.public_token as string,
      client: one(p.clients as Rel<{ name: string }>)?.name ?? "—",
    })),
  };
}

export const todayCount = (t: TodayData) =>
  t.actions.length + t.meetings.length + t.deliverables.length + t.unpaid.length + t.payments.length;
