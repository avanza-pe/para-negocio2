"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { aiConfigured, briefToText, suggestPersonas } from "@/lib/ai";
import { requireStaff } from "@/lib/auth";
import type { ClientBrief } from "@/lib/crm";
import { limaStartOfDayISO } from "@/lib/dates";
import { GASTRO_PERSONAS } from "@/lib/personas";
import type { ActionState } from "./types";

const DAILY_LIMIT = Number(process.env.AI_DAILY_LIMIT ?? 5);
const opt = (max = 500) => z.string().trim().max(max).optional().transform((v) => v || null);
const refresh = (clientId: string) => revalidatePath(`/dashboard/clientes/${clientId}`);

const personaSchema = z.object({
  client_id: z.uuid(),
  name: z.string().trim().min(3, "Ponle un nombre descriptivo").max(80),
  profile: opt(),
  goals: opt(),
  pains: opt(),
  channels: opt(),
  objections: opt(),
  message: opt(),
});

export async function savePersona(_: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireStaff();
  const id = formData.get("id");
  const parsed = personaSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  const { error } =
    typeof id === "string" && id
      ? await supabase.from("client_personas").update(parsed.data).eq("id", id)
      : await supabase.from("client_personas").insert(parsed.data);
  if (error) return { error: "No se pudo guardar (¿corriste la migración 0010?)" };
  refresh(parsed.data.client_id);
  return { ok: true };
}

export async function deletePersona(id: string, clientId: string) {
  const { supabase } = await requireStaff();
  if (!z.uuid().safeParse(id).success) return;
  await supabase.from("client_personas").delete().eq("id", id);
  refresh(clientId);
}

/** Agrega las plantillas gastronómicas que el cliente aún no tenga (por nombre). */
export async function addGastroPersonas(clientId: string): Promise<ActionState> {
  const { supabase } = await requireStaff();
  if (!z.uuid().safeParse(clientId).success) return { error: "Cliente no válido" };
  const { data: existing } = await supabase.from("client_personas").select("name").eq("client_id", clientId);
  const have = new Set((existing ?? []).map((p) => p.name));
  const rows = GASTRO_PERSONAS.filter((p) => !have.has(p.name)).map((p) => ({ ...p, client_id: clientId }));
  if (!rows.length) return { error: "Ya tiene todas las plantillas" };
  const { error } = await supabase.from("client_personas").insert(rows);
  if (error) return { error: "No se pudo guardar (¿corriste la migración 0010?)" };
  refresh(clientId);
  return { ok: true };
}

/** La IA propone 3 personas a partir del brief. Quedan marcadas como IA para revisarlas. */
export async function suggestPersonasAI(clientId: string): Promise<ActionState> {
  const { supabase } = await requireStaff();
  if (!z.uuid().safeParse(clientId).success) return { error: "Cliente no válido" };
  if (!aiConfigured()) return { error: "Configura una IA (Gemini o Groq son gratis) en Configuración" };

  const { count } = await supabase
    .from("automation_runs")
    .select("id", { count: "exact", head: true })
    .in("flow", ["D_produccion", "D_personas", "H_carta_ia"])
    .gte("created_at", limaStartOfDayISO());
  if ((count ?? 0) >= DAILY_LIMIT * 3) return { error: "Límite diario de uso de IA alcanzado" };

  const [{ data: client }, { data: brief }] = await Promise.all([
    supabase.from("clients").select("name, service").eq("id", clientId).single(),
    supabase.from("client_briefs").select("*").eq("client_id", clientId).maybeSingle(),
  ]);
  if (!client) return { error: "No se encontró el cliente" };
  const b = brief as ClientBrief | null;
  if (!b?.sector && !b?.offer) return { error: "Completa al menos rubro y oferta en el brief" };

  try {
    const personas = await suggestPersonas(briefToText(client.name, client.service, b));
    const { error } = await supabase.from("client_personas").insert(personas.map((p) => ({ ...p, client_id: clientId, ai_generated: true })));
    if (error) throw new Error("No se pudieron guardar");
    await supabase.from("automation_runs").insert({ flow: "D_personas", trigger: "botón manual", action: `sugerir ${personas.length} personas`, status: "ok", ref_id: clientId });
    refresh(clientId);
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error desconocido";
    await supabase.from("automation_runs").insert({ flow: "D_personas", trigger: "botón manual", action: "sugerir personas", status: "error", error: msg, ref_id: clientId });
    return { error: `No se pudieron sugerir (${msg})` };
  }
}
