import "server-only";

/**
 * Mercado Pago (Perú) por REST. Dos caminos:
 *  - Yape vía Mercado Pago (Checkout API): el navegador genera un token con celular + código de
 *    aprobación de la app Yape (SDK JS) y el servidor crea el pago con payment_method_id "yape".
 *  - Checkout Pro: link de pago de Mercado Pago (tarjetas y los medios que tenga tu cuenta).
 * Sin costo fijo: Mercado Pago cobra comisión por venta aprobada (ver docs/apis-gratis.md).
 */
const API = "https://api.mercadopago.com";

export const mpConfigured = () => Boolean(process.env.MP_ACCESS_TOKEN);
export const yapeViaMpEnabled = () => Boolean(process.env.MP_ACCESS_TOKEN && process.env.NEXT_PUBLIC_MP_PUBLIC_KEY);

export class MpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function mp<T>(path: string, init: RequestInit & { idempotencyKey?: string } = {}): Promise<T> {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new MpError(503, "Falta MP_ACCESS_TOKEN");
  const { idempotencyKey, headers, ...rest } = init;
  const res = await fetch(`${API}${path}`, {
    ...rest,
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      ...(idempotencyKey ? { "x-idempotency-key": idempotencyKey } : {}),
      ...headers,
    },
    signal: AbortSignal.timeout(20_000),
  });
  const json = (await res.json().catch(() => ({}))) as T & { message?: string };
  if (!res.ok) throw new MpError(res.status, json?.message ?? `Mercado Pago respondió ${res.status}`);
  return json;
}

export type MpPayment = {
  id: number;
  status: string;
  status_detail: string;
  external_reference: string | null;
  transaction_amount: number;
  currency_id: string;
  payment_method_id: string;
  payer?: { email?: string | null };
  date_approved: string | null;
};

/** Link de Checkout Pro. `external_reference` = id de nuestro cobro (así el webhook lo encuentra). */
export function createPreference({
  paymentId,
  token,
  title,
  amount,
  payerEmail,
  origin,
}: {
  paymentId: string;
  token: string;
  title: string;
  amount: number;
  payerEmail?: string | null;
  origin: string;
}) {
  const back = `${origin}/pagar/${token}`;
  const https = origin.startsWith("https://"); // Mercado Pago rechaza auto_return y notification_url sin https
  return mp<{ id: string; init_point: string }>("/checkout/preferences", {
    method: "POST",
    body: JSON.stringify({
      items: [{ id: paymentId, title: title.slice(0, 250), quantity: 1, unit_price: amount, currency_id: "PEN" }],
      external_reference: paymentId,
      ...(payerEmail ? { payer: { email: payerEmail } } : {}),
      back_urls: { success: `${back}?estado=ok`, pending: `${back}?estado=pendiente`, failure: `${back}?estado=error` },
      ...(https ? { auto_return: "approved", notification_url: `${origin}/api/webhooks/mercadopago` } : {}),
      statement_descriptor: (process.env.MP_STATEMENT_DESCRIPTOR || "AUMENTA").slice(0, 22),
    }),
  });
}

/** Cobro con Yape (token de un solo uso generado en el navegador). El monto viene de la base, nunca del cliente. */
export function createYapePayment({
  yapeToken,
  amount,
  description,
  email,
  paymentId,
  origin,
}: {
  yapeToken: string;
  amount: number;
  description: string;
  email: string;
  paymentId: string;
  origin: string;
}) {
  return mp<MpPayment>("/v1/payments", {
    method: "POST",
    idempotencyKey: `${paymentId}-${yapeToken}`.slice(0, 64),
    body: JSON.stringify({
      token: yapeToken,
      transaction_amount: amount,
      description: description.slice(0, 250),
      installments: 1,
      payment_method_id: "yape",
      payer: { email },
      external_reference: paymentId,
      ...(origin.startsWith("https://") ? { notification_url: `${origin}/api/webhooks/mercadopago` } : {}),
    }),
  });
}

export const getMpPayment = (id: string | number) => mp<MpPayment>(`/v1/payments/${encodeURIComponent(String(id))}`);

/** Estado de Mercado Pago → estado de nuestro cobro. */
export function mapMpStatus(status: string): "pendiente" | "pagado" | "rechazado" | "cancelado" | "reembolsado" {
  switch (status) {
    case "approved":
      return "pagado";
    case "rejected":
      return "rechazado";
    case "cancelled":
      return "cancelado";
    case "refunded":
    case "charged_back":
      return "reembolsado";
    default:
      return "pendiente"; // pending, in_process, authorized, in_mediation
  }
}

/** Mensajes claros para los rechazos más comunes de Yape/tarjeta. */
export function rejectionMessage(detail: string | null | undefined) {
  const map: Record<string, string> = {
    cc_rejected_insufficient_amount: "Saldo insuficiente.",
    cc_rejected_call_for_authorize: "El pago necesita autorización: revisa tu app Yape o tu banco.",
    cc_rejected_other_reason: "El pago fue rechazado. Intenta con otro medio.",
    cc_rejected_max_attempts: "Llegaste al máximo de intentos. Espera un momento e inténtalo de nuevo.",
    cc_rejected_card_type_not_allowed: "Este medio de pago no está permitido para este cobro.",
    cc_amount_rate_limit_exceeded: "Superaste el límite de monto de Yape. Intenta con otro medio.",
  };
  return (detail && map[detail]) || "El pago fue rechazado. Revisa el código de aprobación o intenta con otro medio.";
}
