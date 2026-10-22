"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
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
  consent: z.literal("on", { error: "Debes aceptar la política de privacidad" }),
  website: z.string().max(0).optional(), // honeypot: los bots lo llenan
});

// Anti-abuso del formulario público (además del campo trampa): límite por IP en memoria
// y un tope global por ventana de tiempo, calculado en la base.
const WINDOW_MS = 10 * 60 * 1000;
const PER_IP = 5;
const GLOBAL_MAX = 60;
const hits = new Map<string, number[]>();

function tooManyFromIp(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // evita crecimiento sin límite
  return recent.length > PER_IP;
}

/** Flujo A del informe: formulario → fila en CRM → aviso. Maneja campos vacíos y duplicados. */
export async function submitLead(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = leadSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };

  const lead = parsed.data;
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "desconocida";
  if (tooManyFromIp(ip)) return { error: "Demasiados envíos seguidos. Intenta de nuevo en unos minutos." };

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
      contact_phone: lead.contact_phone || null,
      sector: lead.sector || null,
      message: lead.message || null,
      channel: "web",
      stage: "nuevo",
      consent: true,
      next_action: "Responder consulta y ofrecer diagnóstico de 15 min",
      next_action_at: new Date().toISOString().slice(0, 10),
    })
    .select("id")
    .single();

  if (error) {
    const duplicate = error.code === "23505";
    await db.from("automation_runs").insert({
      flow: "A_lead_entrante",
      trigger: "formulario web",
      action: "insertar prospecto",
      status: duplicate ? "duplicado" : "error",
      error: duplicate ? null : error.message,
    });
    // Un duplicado no es error para quien escribe: ya tenemos su contacto.
    if (!duplicate) {
      return { error: "No pudimos enviar tu consulta. Intenta de nuevo o escríbenos por WhatsApp." };
    }
  } else {
    await db.from("automation_runs").insert({
      flow: "A_lead_entrante",
      trigger: "formulario web",
      action: "insertar prospecto + aviso",
      status: "ok",
      ref_id: data.id,
    });
    await notifyNewLead({ ...lead, message: lead.message }).catch(() => {});
  }
  redirect("/gracias");
}
