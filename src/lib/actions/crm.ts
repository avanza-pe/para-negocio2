"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireStaff } from "@/lib/auth";
import { DELIVERABLE_STATUS, PAYMENT_STATUS, STAGES } from "@/lib/crm";
import type { ActionState } from "./types";

const opt = (max = 200) =>
  z.string().trim().max(max).optional().transform((v) => v || null);
const optDate = z.string().optional().transform((v) => v || null);
const optInt = z
  .string()
  .optional()
  .transform((v) => (v ? Number(v) : null))
  .pipe(z.number().int().min(0).nullable());
const oneOf = (list: readonly { value: string }[]) =>
  z.enum(list.map((i) => i.value) as [string, ...string[]]);

const fail = (e: z.ZodError): ActionState => ({ fieldErrors: z.flattenError(e).fieldErrors });
const refresh = () => revalidatePath("/dashboard", "layout");

// ───────── Prospectos ─────────
const prospectSchema = z.object({
  company: z.string().trim().min(2, "Requerido").max(120),
  sector: opt(80),
  city: opt(80),
  web_social: opt(200),
  contact_name: opt(80),
  contact_email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.union([z.literal(""), z.email("Correo no válido")]))
    .optional()
    .transform((v) => v || null),
  contact_phone: opt(30),
  channel: z.string().trim().min(1).max(40).default("manual"),
  next_action: opt(200),
  next_action_at: optDate,
  consent: z.string().optional().transform((v) => v === "on"),
  notes: opt(1000),
});

export async function createProspect(_: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireStaff();
  const parsed = prospectSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(parsed.error);
  const { error } = await supabase.from("prospects").insert(parsed.data);
  if (error) {
    return { error: error.code === "23505" ? "Ya existe un prospecto con ese correo" : "No se pudo guardar" };
  }
  refresh();
  return { ok: true };
}

export async function setProspectStage(id: string, stage: string) {
  const { supabase } = await requireStaff();
  const parsed = z.object({ id: z.uuid(), stage: oneOf(STAGES) }).safeParse({ id, stage });
  if (!parsed.success) return;
  await supabase
    .from("prospects")
    .update({ stage: parsed.data.stage, last_interaction_at: new Date().toISOString() })
    .eq("id", parsed.data.id);
  refresh();
}

export async function deleteProspect(id: string) {
  const { supabase } = await requireStaff();
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return;
  await supabase.from("prospects").delete().eq("id", parsed.data);
  refresh();
}

// ───────── Clientes ─────────
const clientSchema = z.object({
  name: z.string().trim().min(2, "Requerido").max(120),
  contact: opt(160),
  service: z.string().trim().min(2, "Requerido").max(120),
  price_pen: z.coerce.number().min(0).max(1_000_000),
  start_date: optDate,
  renewal_date: optDate,
  folder_url: opt(300),
  owner: opt(80),
});

export async function createClientRecord(_: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireStaff();
  const parsed = clientSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(parsed.error);
  const { error } = await supabase.from("clients").insert(parsed.data);
  if (error) return { error: "No se pudo guardar" };
  refresh();
  return { ok: true };
}

export async function setPaymentStatus(id: string, status: string) {
  const { supabase } = await requireStaff();
  const parsed = z.object({ id: z.uuid(), status: oneOf(PAYMENT_STATUS) }).safeParse({ id, status });
  if (!parsed.success) return;
  await supabase.from("clients").update({ payment_status: parsed.data.status }).eq("id", parsed.data.id);
  refresh();
}

// ───────── Entregas ─────────
const deliverableSchema = z.object({
  client_id: z.uuid("Elige un cliente"),
  piece: z.string().trim().min(2, "Requerido").max(160),
  format: opt(60),
  due_date: optDate,
  link: opt(300),
  revisions_left: z.coerce.number().int().min(0).max(20).default(1),
});

export async function createDeliverable(_: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireStaff();
  const parsed = deliverableSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(parsed.error);
  const { error } = await supabase.from("deliverables").insert(parsed.data);
  if (error) return { error: "No se pudo guardar" };
  refresh();
  return { ok: true };
}

export async function setDeliverableStatus(id: string, status: string) {
  const { supabase } = await requireStaff();
  const parsed = z.object({ id: z.uuid(), status: oneOf(DELIVERABLE_STATUS) }).safeParse({ id, status });
  if (!parsed.success) return;
  await supabase
    .from("deliverables")
    .update({ status: parsed.data.status, approved: ["aprobado", "entregado"].includes(parsed.data.status) })
    .eq("id", parsed.data.id);
  refresh();
}

// ───────── Métricas ─────────
const metricSchema = z.object({
  client_id: z.uuid("Elige un cliente"),
  period: z.string().min(1, "Requerido"),
  posts: optInt,
  reach: optInt,
  views: optInt,
  clicks: optInt,
  leads: optInt,
  source: opt(120),
  notes: opt(500),
});

export async function createMetric(_: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireStaff();
  const parsed = metricSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(parsed.error);
  const { error } = await supabase.from("metrics").insert(parsed.data);
  if (error) return { error: "No se pudo guardar" };
  refresh();
  return { ok: true };
}
