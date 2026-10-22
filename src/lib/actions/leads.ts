"use server";

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

/** Flujo A del informe: formulario → fila en CRM → aviso. Maneja campos vacíos y duplicados. */
export async function submitLead(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = leadSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };

  const lead = parsed.data;
  const db = createAdminClient();

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
