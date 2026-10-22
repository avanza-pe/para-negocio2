"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireStaff } from "@/lib/auth";
import { REPORT_STATUS } from "@/lib/crm";
import type { ActionState } from "./types";

const refresh = () => revalidatePath("/dashboard", "layout");

const num = (v: number | null) => (v === null || v === undefined ? "sin dato" : v.toLocaleString("es-PE"));

/** Flujo F: arma el borrador SOLO con las filas de `metrics`. Todo lo que falta se marca "sin dato". */
export async function generateReport(_: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireStaff();
  const parsed = z
    .object({ client_id: z.uuid("Elige un cliente"), period: z.string().regex(/^\d{4}-\d{2}$/, "Elige un mes") })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };

  const period = `${parsed.data.period}-01`;
  const { data: client } = await supabase.from("clients").select("name, service").eq("id", parsed.data.client_id).single();
  if (!client) return { error: "No se encontró el cliente" };

  const { data: rows } = await supabase
    .from("metrics")
    .select("posts, reach, views, clicks, leads, source, notes")
    .eq("client_id", parsed.data.client_id)
    .eq("period", period);

  if (!rows?.length) {
    return { error: "No hay métricas registradas para ese mes. Regístralas primero en Métricas." };
  }

  const sum = (k: "posts" | "reach" | "views" | "clicks" | "leads") => {
    const vals = rows.map((r) => r[k]).filter((v): v is number => typeof v === "number");
    return vals.length ? vals.reduce((a, b) => a + b, 0) : null;
  };
  const sources = [...new Set(rows.map((r) => r.source).filter(Boolean))].join(", ") || "sin dato";
  const notes = rows.map((r) => r.notes).filter(Boolean).join(" · ");

  const body = [
    `REPORTE MENSUAL · ${client.name}`,
    `Periodo: ${parsed.data.period} · Servicio: ${client.service}`,
    "",
    `Publicaciones: ${num(sum("posts"))}`,
    `Alcance: ${num(sum("reach"))}`,
    `Reproducciones: ${num(sum("views"))}`,
    `Clics: ${num(sum("clicks"))}`,
    `Leads / consultas: ${num(sum("leads"))}`,
    "",
    `Fuente de los datos: ${sources}`,
    notes ? `Observaciones: ${notes}` : "Observaciones: —",
    "",
    "Nota: solo se incluyen datos registrados y verificables. «sin dato» significa que no se registró.",
  ].join("\n");

  const { error } = await supabase
    .from("reports")
    .upsert({ client_id: parsed.data.client_id, period, body, status: "borrador" }, { onConflict: "client_id,period" });
  if (error) return { error: "No se pudo guardar el reporte" };
  await supabase.from("automation_runs").insert({ flow: "F_reporte", trigger: "botón manual", action: `borrador ${parsed.data.period}`, status: "ok", ref_id: parsed.data.client_id });
  refresh();
  return { ok: true };
}

export async function setReportStatus(id: string, status: string) {
  const { supabase } = await requireStaff();
  const parsed = z
    .object({ id: z.uuid(), status: z.enum(REPORT_STATUS.map((s) => s.value) as [string, ...string[]]) })
    .safeParse({ id, status });
  if (!parsed.success) return;
  // "enviado" exige haber sido aprobado antes (revisión humana).
  if (parsed.data.status === "enviado") {
    const { data } = await supabase.from("reports").select("status").eq("id", parsed.data.id).single();
    if (data?.status !== "aprobado") return;
  }
  await supabase.from("reports").update({ status: parsed.data.status }).eq("id", parsed.data.id);
  refresh();
}
