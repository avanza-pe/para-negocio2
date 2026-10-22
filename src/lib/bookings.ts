import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { limaDate } from "@/lib/dates";
import { esc, notifyTeam } from "@/lib/notify";

type Source = "calendly" | "calcom";

/**
 * Flujo B automático: una reserva en la agenda (Calendly o Cal.com) → prospecto (se crea si no existe),
 * reunión y tarea de preparación. Idempotente: el mismo evento dos veces queda como "duplicado".
 */
export async function registerBooking(
  db: SupabaseClient,
  { email, name, startsAt, externalId, source }: { email: string; name?: string | null; startsAt: string; externalId: string; source: Source },
) {
  const mail = email.trim().toLowerCase();
  let { data: prospect } = await db.from("prospects").select("id, company").eq("contact_email", mail).maybeSingle();
  if (!prospect) {
    const created = await db
      .from("prospects")
      .insert({ company: name || mail, contact_name: name || null, contact_email: mail, channel: source, consent: true })
      .select("id, company")
      .single();
    prospect = created.data;
  }
  if (!prospect) throw new Error("No se pudo resolver el prospecto");

  const { error } = await db.from("meetings").insert({ prospect_id: prospect.id, starts_at: startsAt, source, external_id: externalId });
  if (error && error.code !== "23505") throw error;
  const duplicate = Boolean(error);

  await db
    .from("prospects")
    .update({
      stage: "reunion_agendada",
      last_interaction_at: new Date().toISOString(),
      next_action: "Preparar la reunión: revisar web y redes del prospecto",
      next_action_at: limaDate(new Date(startsAt)),
    })
    .eq("id", prospect.id);
  await db.from("automation_runs").insert({
    flow: "B_reserva",
    trigger: `${source} reserva`,
    action: "registrar reunión + tarea",
    status: duplicate ? "duplicado" : "ok",
    ref_id: prospect.id,
  });

  if (!duplicate) {
    const when = new Date(startsAt).toLocaleString("es-PE", { timeZone: "America/Lima", dateStyle: "medium", timeStyle: "short" });
    await notifyTeam({
      subject: `Reunión agendada: ${prospect.company}`,
      html: `<p>${esc(prospect.company)} reservó un diagnóstico para el <b>${when}</b> (vía ${source}).</p>`,
      text: `${prospect.company} · ${when} (vía ${source})`,
    }).catch(() => {});
  }
  return duplicate ? "duplicado" : "ok";
}

export async function cancelBooking(db: SupabaseClient, externalId: string, source: Source) {
  await db.from("meetings").update({ status: "cancelada" }).eq("external_id", externalId);
  await db.from("automation_runs").insert({ flow: "B_reserva", trigger: `${source} cancelación`, action: "cancelar reunión", status: "ok" });
}
