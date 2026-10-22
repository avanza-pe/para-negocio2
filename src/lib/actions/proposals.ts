"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireStaff } from "@/lib/auth";
import { PROPOSAL_STATUS } from "@/lib/crm";
import { PACKAGES } from "@/lib/site";
import type { ActionState } from "./types";

const refresh = () => revalidatePath("/dashboard", "layout");

const schema = z.object({
  prospect_id: z.uuid("Elige un prospecto"),
  package: z.string().trim().min(2, "Elige un paquete").max(120),
  price_pen: z.coerce.number().min(0).max(1_000_000),
  validity_days: z.coerce.number().int().min(1).max(90).default(7),
  revisions: z.coerce.number().int().min(0).max(20).default(1),
  timeline: z.string().trim().max(200).optional().transform((v) => v || null),
  notes: z.string().trim().max(800).optional().transform((v) => v || null),
});

// El paquete elegido trae su alcance desde la oferta (src/lib/site.ts). La propuesta puede editarse en BD si hace falta.
const findPackage = (name: string) => PACKAGES.find((p) => name.toLowerCase().startsWith(p.name.toLowerCase().split(" ")[0]) && name.toLowerCase().includes(p.name.toLowerCase().split(" ").slice(-1)[0]));

/** Crea un borrador de propuesta desde la plantilla del informe. Nada se envía: se imprime/comparte a mano. */
export async function createProposal(_: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireStaff();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };

  const { data: prospect } = await supabase.from("prospects").select("company").eq("id", parsed.data.prospect_id).single();
  if (!prospect) return { error: "No se encontró el prospecto" };

  const pkg = findPackage(parsed.data.package) ?? PACKAGES.find((p) => p.name === parsed.data.package);
  const includes = pkg ? pkg.items.join("\n") : "A definir con el cliente [POR CONFIRMAR]";

  const { data, error } = await supabase
    .from("proposals")
    .insert({
      prospect_id: parsed.data.prospect_id,
      client_name: prospect.company,
      title: `Propuesta · ${parsed.data.package}`,
      package: parsed.data.package,
      price_pen: parsed.data.price_pen,
      price_unit: pkg?.unit ?? "al mes",
      validity_days: parsed.data.validity_days,
      includes,
      exclusions: "Inversión publicitaria en Meta/TikTok (se paga aparte), fotografía y producción presencial, y todo lo no listado en «Incluye».",
      client_materials: "Logo, colores de marca, fotos/videos propios y accesos con permisos mínimos (nunca contraseñas personales).",
      revisions: parsed.data.revisions,
      timeline: parsed.data.timeline,
      payment_terms: "Transferencia bancaria, Yape o Plin. El trabajo inicia al confirmarse el primer pago.",
      notes: parsed.data.notes,
    })
    .select("id")
    .single();
  if (error || !data) return { error: "No se pudo crear la propuesta" };

  refresh();
  redirect(`/dashboard/propuestas/${data.id}`);
}

/** Enviada → el prospecto pasa a "Propuesta enviada". Aceptada → pasa a "Ganado" (luego se convierte en cliente). */
export async function setProposalStatus(id: string, status: string) {
  const { supabase } = await requireStaff();
  const parsed = z
    .object({ id: z.uuid(), status: z.enum(PROPOSAL_STATUS.map((s) => s.value) as [string, ...string[]]) })
    .safeParse({ id, status });
  if (!parsed.success) return;

  const { data: proposal } = await supabase.from("proposals").update({ status: parsed.data.status }).eq("id", parsed.data.id).select("prospect_id").single();
  if (proposal?.prospect_id) {
    const map: Record<string, string> = { enviada: "propuesta_enviada", aceptada: "ganado", rechazada: "perdido" };
    const stage = map[parsed.data.status];
    if (stage) {
      await supabase
        .from("prospects")
        .update({ stage, last_interaction_at: new Date().toISOString(), ...(stage === "perdido" ? { lost_reason: "Propuesta rechazada" } : {}) })
        .eq("id", proposal.prospect_id);
    }
  }
  refresh();
}

export async function deleteProposal(id: string) {
  const { supabase } = await requireStaff();
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return;
  await supabase.from("proposals").delete().eq("id", parsed.data);
  refresh();
}
