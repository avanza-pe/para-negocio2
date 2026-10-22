"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireStaff } from "@/lib/auth";
import { ONBOARDING_CHECKLIST } from "@/lib/crm";
import type { ActionState } from "./types";

const convertSchema = z.object({
  prospect_id: z.uuid(),
  service: z.string().trim().min(2, "Elige un servicio").max(120),
  price_pen: z.coerce.number().min(0).max(1_000_000),
});

/** Flujo C: prospecto Ganado → cliente + checklist + brief vacío. No envía contratos ni mensajes. */
export async function convertToClient(_: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireStaff();
  const parsed = convertSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };

  const { data: prospect } = await supabase
    .from("prospects")
    .select("id, company, contact_name, contact_email, sector, stage")
    .eq("id", parsed.data.prospect_id)
    .single();
  if (!prospect) return { error: "No se encontró el prospecto" };

  const today = new Date();
  const renewal = new Date(today);
  renewal.setMonth(renewal.getMonth() + 1);

  const { data: client, error } = await supabase
    .from("clients")
    .insert({
      prospect_id: prospect.id,
      name: prospect.company,
      contact: [prospect.contact_name, prospect.contact_email].filter(Boolean).join(" · ") || null,
      service: parsed.data.service,
      price_pen: parsed.data.price_pen,
      start_date: today.toISOString().slice(0, 10),
      renewal_date: renewal.toISOString().slice(0, 10),
    })
    .select("id")
    .single();
  if (error || !client) {
    return { error: error?.code === "23505" ? "Este prospecto ya es cliente" : "No se pudo crear el cliente" };
  }

  await supabase
    .from("onboarding_tasks")
    .insert(ONBOARDING_CHECKLIST.map((title, position) => ({ client_id: client.id, title, position })));
  await supabase.from("client_briefs").insert({ client_id: client.id, sector: prospect.sector });
  await supabase.from("prospects").update({ stage: "ganado", next_action: null, next_action_at: null }).eq("id", prospect.id);
  await supabase.from("automation_runs").insert({
    flow: "C_onboarding",
    trigger: "prospecto ganado",
    action: "crear cliente + checklist + brief",
    status: "ok",
    ref_id: client.id,
  });

  revalidatePath("/dashboard", "layout");
  redirect(`/dashboard/clientes/${client.id}`);
}

export async function setTaskDone(id: string, done: boolean) {
  const { supabase } = await requireStaff();
  const parsed = z.object({ id: z.uuid(), done: z.boolean() }).safeParse({ id, done });
  if (!parsed.success) return;
  await supabase
    .from("onboarding_tasks")
    .update({ done: parsed.data.done, done_at: parsed.data.done ? new Date().toISOString() : null })
    .eq("id", parsed.data.id);
  revalidatePath("/dashboard", "layout");
}

const opt = (max = 1000) => z.string().trim().max(max).optional().transform((v) => v || null);
const briefSchema = z.object({
  client_id: z.uuid(),
  sector: opt(120),
  audience: opt(),
  offer: opt(),
  tone: opt(200),
  differentiators: opt(),
  location: opt(200),
  cta: opt(200),
  references_text: opt(),
  restrictions: opt(),
  approver: opt(160),
  access_notes: opt(),
});

export async function saveBrief(_: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireStaff();
  const parsed = briefSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  const { error } = await supabase
    .from("client_briefs")
    .upsert({ ...parsed.data, updated_at: new Date().toISOString() });
  if (error) return { error: "No se pudo guardar el brief" };
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}
