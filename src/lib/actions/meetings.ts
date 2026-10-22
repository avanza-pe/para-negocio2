"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireStaff } from "@/lib/auth";
import { MEETING_STATUS } from "@/lib/crm";
import type { ActionState } from "./types";

const meetingSchema = z.object({
  prospect_id: z.uuid("Elige un prospecto"),
  starts_at: z.string().min(1, "Elige fecha y hora"),
  notes: z.string().trim().max(500).optional().transform((v) => v || null),
});

/** Flujo B (manual): registra la reunión, mueve el prospecto y deja la tarea de preparación. */
export async function createMeeting(_: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireStaff();
  const parsed = meetingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };

  // El campo datetime-local no trae zona horaria: se interpreta como hora de Lima (UTC-5, sin horario de verano).
  const startsAt = new Date(`${parsed.data.starts_at}:00-05:00`);
  if (Number.isNaN(startsAt.getTime())) return { fieldErrors: { starts_at: ["Fecha no válida"] } };

  const { error } = await supabase.from("meetings").insert({
    prospect_id: parsed.data.prospect_id,
    starts_at: startsAt.toISOString(),
    notes: parsed.data.notes,
    source: "manual",
  });
  if (error) return { error: "No se pudo guardar la reunión" };

  await supabase
    .from("prospects")
    .update({
      stage: "reunion_agendada",
      last_interaction_at: new Date().toISOString(),
      next_action: "Preparar la reunión: revisar web y redes del prospecto",
      next_action_at: startsAt.toISOString().slice(0, 10),
    })
    .eq("id", parsed.data.prospect_id);
  await supabase.from("automation_runs").insert({
    flow: "B_reserva",
    trigger: "reunión manual",
    action: "registrar reunión + tarea de preparación",
    status: "ok",
    ref_id: parsed.data.prospect_id,
  });

  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

export async function setMeetingStatus(id: string, status: string) {
  const { supabase } = await requireStaff();
  const parsed = z
    .object({ id: z.uuid(), status: z.enum(MEETING_STATUS.map((s) => s.value) as [string, ...string[]]) })
    .safeParse({ id, status });
  if (!parsed.success) return;
  await supabase.from("meetings").update({ status: parsed.data.status }).eq("id", parsed.data.id);
  revalidatePath("/dashboard", "layout");
}
