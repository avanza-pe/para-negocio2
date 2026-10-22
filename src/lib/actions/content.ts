"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { briefToText, generateContentItems } from "@/lib/ai";
import { requireStaff } from "@/lib/auth";
import { CONTENT_STATUS, type ClientBrief } from "@/lib/crm";
import type { ActionState } from "./types";

const refresh = () => revalidatePath("/dashboard", "layout");
const DAILY_LIMIT = Number(process.env.AI_DAILY_LIMIT ?? 5);

/** Flujo D: genera un borrador de calendario con IA. Siempre queda en "borrador": un humano lo aprueba. */
export async function generateCalendar(clientId: string): Promise<ActionState> {
  const { supabase } = await requireStaff();
  const id = z.uuid().safeParse(clientId);
  if (!id.success) return { error: "Cliente no válido" };
  if (!process.env.ANTHROPIC_API_KEY) return { error: "La generación con IA no está configurada. Usa «Copiar prompt»." };

  // Límite de gasto: máximo de generaciones por día (AI_DAILY_LIMIT, por defecto 5)
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  const { count } = await supabase
    .from("automation_runs")
    .select("id", { count: "exact", head: true })
    .eq("flow", "D_produccion")
    .gte("created_at", since.toISOString());
  if ((count ?? 0) >= DAILY_LIMIT) return { error: `Límite diario de generaciones alcanzado (${DAILY_LIMIT}).` };

  const { data: client } = await supabase.from("clients").select("id, name, service").eq("id", id.data).single();
  if (!client) return { error: "No se encontró el cliente" };
  const { data: brief } = await supabase.from("client_briefs").select("*").eq("client_id", id.data).maybeSingle();
  const b = brief as ClientBrief | null;
  if (!b || !(b.audience && b.offer)) return { error: "Completa al menos público y oferta en el brief antes de generar." };

  try {
    const items = await generateContentItems(briefToText(client.name, client.service, b));
    const { error } = await supabase
      .from("content_items")
      .insert(items.map((it) => ({ ...it, client_id: client.id, ai_generated: true, status: "borrador" })));
    if (error) throw new Error("No se pudieron guardar los contenidos");
    await supabase.from("automation_runs").insert({ flow: "D_produccion", trigger: "botón manual", action: `generar ${items.length} contenidos`, status: "ok", ref_id: client.id });
    refresh();
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error desconocido";
    await supabase.from("automation_runs").insert({ flow: "D_produccion", trigger: "botón manual", action: "generar calendario", status: "error", error: msg, ref_id: client.id });
    return { error: "No se pudo generar el calendario. Intenta de nuevo o usa «Copiar prompt»." };
  }
}

const opt = (max = 500) => z.string().trim().max(max).optional().transform((v) => v || null);
const itemSchema = z.object({
  client_id: z.uuid("Elige un cliente"),
  pillar: opt(120),
  format: opt(60),
  objective: opt(300),
  hook: opt(300),
  copy: opt(1500),
  cta: opt(200),
  metric: opt(200),
  scheduled_for: z.string().optional().transform((v) => v || null),
});

export async function createContentItem(_: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireStaff();
  const parsed = itemSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  const { error } = await supabase.from("content_items").insert(parsed.data);
  if (error) return { error: "No se pudo guardar" };
  refresh();
  return { ok: true };
}

/** Regla de aprobación humana: solo se puede marcar "publicado" si antes estuvo "aprobado". */
export async function setContentStatus(id: string, status: string) {
  const { supabase } = await requireStaff();
  const parsed = z
    .object({ id: z.uuid(), status: z.enum(CONTENT_STATUS.map((s) => s.value) as [string, ...string[]]) })
    .safeParse({ id, status });
  if (!parsed.success) return;
  if (parsed.data.status === "publicado") {
    const { data } = await supabase.from("content_items").select("status").eq("id", parsed.data.id).single();
    if (data?.status !== "aprobado") return;
  }
  await supabase.from("content_items").update({ status: parsed.data.status }).eq("id", parsed.data.id);
  refresh();
}

export async function deleteContentItem(id: string) {
  const { supabase } = await requireStaff();
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return;
  await supabase.from("content_items").delete().eq("id", parsed.data);
  refresh();
}
