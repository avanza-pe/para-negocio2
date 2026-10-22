"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireStaff } from "@/lib/auth";
import { limaDate, monthLabel, monthStart } from "@/lib/dates";
import { MANUAL_PAY_METHODS, PAY_STATUS } from "@/lib/crm";
import { markPaid } from "@/lib/payments";
import type { ActionState } from "./types";

const refresh = () => revalidatePath("/dashboard", "layout");
const opt = (max = 200) => z.string().trim().max(max).optional().transform((v) => v || null);

const paymentSchema = z.object({
  client_id: z.union([z.literal(""), z.uuid()]).optional().transform((v) => v || null),
  concept: z.string().trim().min(3, "Describe el cobro").max(200),
  amount_pen: z.coerce.number().positive("Monto mayor a 0").max(100_000),
  due_date: z.string().optional().transform((v) => v || null),
  period: z
    .string()
    .optional()
    .transform((v) => (v ? monthStart(v) : null)),
  payer_email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.union([z.literal(""), z.email("Correo no válido")]))
    .optional()
    .transform((v) => v || null),
  notes: opt(500),
});

/** Crea un cobro con enlace público /pagar/<token> (Yape vía Mercado Pago, tarjeta o Yape/Plin directo). */
export async function createPayment(_: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireStaff();
  const parsed = paymentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  const { error } = await supabase.from("payments").insert(parsed.data);
  if (error) {
    return { error: error.code === "23505" ? "Ese cliente ya tiene un cobro activo para ese mes" : "No se pudo crear el cobro" };
  }
  refresh();
  return { ok: true };
}

/** Cobro del mes desde la ficha del cliente: monto y servicio del cliente, mes de su próxima renovación. */
export async function createMonthlyPayment(clientId: string): Promise<ActionState> {
  const { supabase } = await requireStaff();
  const id = z.uuid().safeParse(clientId);
  if (!id.success) return { error: "Cliente no válido" };
  const { data: c } = await supabase.from("clients").select("id, name, service, price_pen, renewal_date, contact_email").eq("id", id.data).single();
  if (!c) return { error: "No se encontró el cliente" };
  if (!(Number(c.price_pen) > 0)) return { error: "El cliente no tiene precio: edítalo primero" };

  const due = c.renewal_date ?? limaDate();
  const period = monthStart(due)!;
  const { error } = await supabase.from("payments").insert({
    client_id: c.id,
    concept: `${c.service} · ${monthLabel(period)}`,
    amount_pen: c.price_pen,
    period,
    due_date: due,
    payer_email: c.contact_email,
  });
  if (error) return { error: error.code === "23505" ? "Ya existe un cobro activo de ese mes" : "No se pudo crear el cobro" };
  refresh();
  return { ok: true };
}

/** Pago confirmado a mano (Yape/Plin directo, transferencia, efectivo): revisa la constancia antes. */
export async function markPaymentPaid(id: string, method: string) {
  const { supabase } = await requireStaff();
  const parsed = z
    .object({ id: z.uuid(), method: z.enum(MANUAL_PAY_METHODS.map((m) => m.value) as [string, ...string[]]) })
    .safeParse({ id, method });
  if (!parsed.success) return;
  await markPaid(supabase, parsed.data.id, { method: parsed.data.method });
  refresh();
}

export async function setPaymentRecordStatus(id: string, status: string) {
  const { supabase } = await requireStaff();
  const parsed = z
    .object({ id: z.uuid(), status: z.enum(PAY_STATUS.map((s) => s.value) as [string, ...string[]]) })
    .safeParse({ id, status });
  if (!parsed.success) return;
  // "pagado" se registra con un método (markPaymentPaid) o lo confirma Mercado Pago.
  if (parsed.data.status === "pagado") return;
  await supabase.from("payments").update({ status: parsed.data.status, ...(parsed.data.status === "pendiente" ? { paid_at: null } : {}) }).eq("id", parsed.data.id);
  refresh();
}

export async function deletePayment(id: string) {
  const { supabase } = await requireStaff();
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return;
  await supabase.from("payments").delete().eq("id", parsed.data).neq("status", "pagado");
  refresh();
}
