import { createHmac, timingSafeEqual } from "node:crypto";

/** Verificación de firmas de webhooks (HMAC-SHA256). Funciones puras: se prueban en webhooks.test.ts. */

const hmacHex = (key: string, message: string) => createHmac("sha256", key).update(message).digest("hex");

function safeEqualHex(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Cabecera "k1=v1,k2=v2" → objeto (los valores pueden contener "="). */
function parseHeader(header: string) {
  const out: Record<string, string> = {};
  for (const part of header.split(",")) {
    const i = part.indexOf("=");
    if (i > 0) out[part.slice(0, i).trim().toLowerCase()] = part.slice(i + 1).trim();
  }
  return out;
}

/**
 * Calendly: `Calendly-Webhook-Signature: t=<timestamp>,v1=<hmac("t.body")>`.
 * Rechaza firmas con más de 5 minutos (evita reenvíos).
 */
export function verifyCalendlySignature(header: string | null, body: string, key: string, now = Date.now()) {
  if (!header) return false;
  const { t, v1 } = parseHeader(header);
  if (!t || !v1) return false;
  const sentAtMs = Number(t) > 1e12 ? Number(t) : Number(t) * 1000; // t puede venir en segundos o milisegundos
  if (!Number.isFinite(sentAtMs) || Math.abs(now - sentAtMs) > 5 * 60 * 1000) return false;
  return safeEqualHex(hmacHex(key, `${t}.${body}`), v1);
}

/** Cal.com: `X-Cal-Signature-256: <hmac(body) en hex>`. */
export function verifyCalcomSignature(header: string | null, body: string, secret: string) {
  if (!header) return false;
  return safeEqualHex(hmacHex(secret, body), header.trim().toLowerCase());
}

/**
 * Mercado Pago: `x-signature: ts=<segundos>,v1=<hmac>` y `x-request-id`.
 * Manifest (según el SDK oficial): "id:<data.id>;request-id:<x-request-id>;ts:<ts>;" omitiendo los
 * pares que no vengan. data.id va en minúsculas (los ids alfanuméricos se firman así).
 */
export function verifyMercadoPagoSignature({
  xSignature,
  xRequestId,
  dataId,
  secret,
}: {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string | null;
  secret: string;
}) {
  if (!xSignature) return false;
  const { ts, v1 } = parseHeader(xSignature);
  if (!ts || !v1 || !/^\d+$/.test(ts)) return false;
  const parts: string[] = [];
  if (dataId) parts.push(`id:${dataId.toLowerCase()}`);
  if (xRequestId) parts.push(`request-id:${xRequestId}`);
  parts.push(`ts:${ts}`);
  return safeEqualHex(hmacHex(secret, `${parts.join(";")};`), v1);
}
