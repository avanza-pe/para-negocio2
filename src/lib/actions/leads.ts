"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { limaDate } from "@/lib/dates";
import { clientIp, rateLimiter } from "@/lib/origin";
import { normalizePhone } from "@/lib/phone";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyNewLead } from "@/lib/notify";
import type { ActionState } from "./types";

const leadSchema = z.object({
  company: z.string().trim().min(2, "Cuéntanos el nombre de tu negocio").max(120),
  contact_name: z.string().trim().min(2, "Escribe tu nombre").max(80),
  contact_email: z.string().trim().toLowerCase().email("Correo no válido").max(160),
  contact_phone: z.string().trim().max(30).optional(),
  sector: z.string().trim().max(80).optional(),
  message: z.string().trim().max(1000).optional(),
  interest: z.string().trim().max(60).optional(), // página de origen, ej. "Carta digital (restaurantes)"
  consent: z.literal("on", { error: "Debes aceptar la política de privacidad" }),
  website: z.string().max(0).optional(), // honeypot: los bots lo llenan
});

// Anti-abuso del formulario público (además del campo trampa): límite por IP en memoria
// y un tope global por ventana de tiempo, calculado en la base.
const WINDOW_MS = 10 * 60 * 1000;
const GLOBAL_MAX = 60;
const tooManyFromIp = rateLimiter(5, WINDOW_MS);

/** Flujo A del informe: formulario → fila en CRM → aviso. Maneja campos vacíos y duplicados. */
export async function submitLead(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = leadSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };

  const lead = parsed.data;
  if (tooManyFromIp(await clientIp())) return { error: "Demasiados envíos seguidos. Intenta de nuevo en unos minutos." };

  const db = createAdminClient();
  const { count } = await db
    .from("automation_runs")
    .select("id", { count: "exact", head: true })
    .eq("flow", "A_lead_entrante")
    .gte("created_at", new Date(Date.now() - WINDOW_MS).toISOString());
  if ((count ?? 0) >= GLOBAL_MAX) return { error: "Estamos recibiendo muchas solicitudes. Escríbenos por WhatsApp o inténtalo en unos minutos." };

  const { data, error } = await db
    .from("prospects")
    .insert({
      company: lead.company,
      contact_name: lead.contact_name,
      contact_email: lead.contact_email,
      contact_phone: normalizePhone(lead.contact_phone),
      sector: lead.sector || null,
      message: lead.message || null,
      notes: lead.interest ? `Interés: ${lead.interest}` : null,
      channel: "web",
      stage: "nuevo",
      consent: true,
      next_action: "Responder consulta y ofrecer diagnóstico de 15 min",
      next_action_at: limaDate(),
      last_interaction_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    const duplicate = error.code === "23505";
    // Un duplicado no es error para quien escribe: ya tenemos su contacto. Se reactiva el prospecto
    // existente (próxima acción hoy + mensaje nuevo en notas) para que nadie quede sin respuesta.
    if (duplicate) await reactivateProspect(db, lead.contact_email, lead.message);
    await db.from("automation_runs").insert({
      flow: "A_lead_entrante",
      trigger: "formulario web",
      action: duplicate ? "lead repetido: reactivar prospecto + aviso" : "insertar prospecto",
      status: duplicate ? "duplicado" : "error",
      error: duplicate ? null : error.message,
    });
    if (!duplicate) {
      return { error: "No pudimos enviar tu consulta. Intenta de nuevo o escríbenos por WhatsApp." };
    }
    await notifyNewLead(lead, { repeated: true }).catch(() => {});
  } else {
    await db.from("automation_runs").insert({
      flow: "A_lead_entrante",
      trigger: "formulario web",
      action: "insertar prospecto + aviso",
      status: "ok",
      ref_id: data.id,
    });
    await notifyNewLead(lead).catch(() => {});
  }
  redirect("/gracias");
}

async function reactivateProspect(db: ReturnType<typeof createAdminClient>, email: string, message?: string) {
  const { data: existing } = await db.from("prospects").select("id, stage, notes").eq("contact_email", email).maybeSingle();
  if (!existing) return;
  const stamp = `[${limaDate()}] Volvió a escribir por la web${message ? `: ${message}` : ""}`;
  await db
    .from("prospects")
    .update({
      next_action: "Volvió a escribir: responder hoy",
      next_action_at: limaDate(),
      last_interaction_at: new Date().toISOString(),
      notes: [existing.notes, stamp].filter(Boolean).join("\n").slice(-4000),
      // Si estaba perdido o en pausa, vuelve al pipeline activo.
      ...(["perdido", "seguimiento_futuro"].includes(existing.stage) ? { stage: "respondio" } : {}),
    })
    .eq("id", existing.id);
}
