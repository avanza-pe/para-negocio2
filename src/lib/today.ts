import type { SupabaseClient } from "@supabase/supabase-js";

export type TodayData = {
  actions: { id: string; company: string; next_action: string | null; next_action_at: string }[];
  meetings: { id: string; starts_at: string; company: string }[];
  deliverables: { id: string; piece: string; due_date: string; client: string }[];
  unpaid: { id: string; name: string; payment_status: string; renewal_date: string | null }[];
};

/** Lo que requiere atención hoy. Solo lectura: el seguimiento nunca envía mensajes a prospectos. */
export async function getToday(db: SupabaseClient): Promise<TodayData> {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  const [actions, meetings, deliverables, unpaid] = await Promise.all([
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
      .lte("starts_at", endOfDay.toISOString())
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
  ]);

  type Rel<T> = T | T[] | null;
  const one = <T,>(v: Rel<T>) => (Array.isArray(v) ? v[0] : v);

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
    unpaid: (unpaid.data ?? []) as TodayData["unpaid"],
  };
}

export const todayCount = (t: TodayData) => t.actions.length + t.meetings.length + t.deliverables.length + t.unpaid.length;
