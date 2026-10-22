"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createPreference, createYapePayment, mapMpStatus, MpError, mpConfigured, rejectionMessage, yapeViaMpEnabled } from "@/lib/mercadopago";
import { clientIp, currentOrigin, rateLimiter } from "@/lib/origin";
import { applyMpPayment, isPaymentToken } from "@/lib/payments";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ActionState } from "./types";

// Página pública /pagar/<token>. Todo se resuelve en el servidor con service_role a partir del token;
// el navegador solo aporta el token de Yape y el correo del pagador.
const tooMany = rateLimiter(8, 10 * 60 * 1000);

async function pendingPayment(token: string) {
  if (!isPaymentToken(token)) return null;
  const db = createAdminClient();
  const { data } = await db
    .from("payments")
    .select("id, concept, amount_pen, status, payer_email, mp_preference_id, public_token, clients(name)")
    .eq("public_token", token)
    .maybeSingle();
  return data && data.status === "pendiente" ? { db, payment: data } : null;
}

/** Yape vía Mercado Pago: el navegador generó `yape_token` con celular + código de aprobación. */
export async function payWithYape(token: string, _: ActionState, formData: FormData): Promise<ActionState> {
  if (!yapeViaMpEnabled()) return { error: "Pago con Yape no disponible. Usa otra opción." };
  const parsed = z
    .object({
      yape_token: z.string().trim().min(8).max(200),
      email: z.string().trim().toLowerCase().email("Correo no válido").max(160),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors, error: "Revisa los datos" };
  if (tooMany(await clientIp())) return { error: "Demasiados intentos. Espera unos minutos." };

  const found = await pendingPayment(token);
  if (!found) return { error: "Este cobro ya no está pendiente. Recarga la página." };
  const { db, payment } = found;

  try {
    const mp = await createYapePayment({
      yapeToken: parsed.data.yape_token,
      amount: Number(payment.amount_pen),
      description: payment.concept,
      email: parsed.data.email,
      paymentId: payment.id,
      origin: await currentOrigin(),
    });
    await applyMpPayment(db, mp);
    const status = mapMpStatus(mp.status);
    if (status === "pagado") return { ok: true };
    if (status === "pendiente") return { error: "Tu pago está en revisión. Te confirmaremos en unos minutos." };
    return { error: rejectionMessage(mp.status_detail) };
  } catch (e) {
    await db.from("automation_runs").insert({ flow: "G_cobro", trigger: "yape mercadopago", action: "crear pago", status: "error", error: e instanceof Error ? e.message : String(e), ref_id: payment.id });
    const expired = e instanceof MpError && e.status === 400;
    return { error: expired ? "El código de aprobación venció o no es válido. Genera uno nuevo en Yape e inténtalo otra vez." : "No pudimos procesar el pago. Intenta de nuevo o usa otra opción." };
  }
}

/** Checkout Pro: crea (o reutiliza) la preferencia y redirige a Mercado Pago. */
export async function startCheckout(token: string) {
  if (!mpConfigured()) redirect(`/pagar/${token}?estado=no-disponible`);
  if (tooMany(await clientIp())) redirect(`/pagar/${token}?estado=espera`);
  const found = await pendingPayment(token);
  if (!found) redirect(`/pagar/${token}`);
  const { db, payment } = found;

  let url: string;
  try {
    const pref = await createPreference({
      paymentId: payment.id,
      token: payment.public_token,
      title: payment.concept,
      amount: Number(payment.amount_pen),
      payerEmail: payment.payer_email,
      origin: await currentOrigin(),
    });
    await db.from("payments").update({ mp_preference_id: pref.id }).eq("id", payment.id);
    url = pref.init_point;
  } catch (e) {
    await db.from("automation_runs").insert({ flow: "G_cobro", trigger: "checkout pro", action: "crear preferencia", status: "error", error: e instanceof Error ? e.message : String(e), ref_id: payment.id });
    redirect(`/pagar/${token}?estado=error`);
  }
  redirect(url);
}
