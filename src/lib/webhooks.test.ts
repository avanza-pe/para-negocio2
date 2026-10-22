import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyCalcomSignature, verifyCalendlySignature, verifyMercadoPagoSignature } from "@/lib/webhooks";

const hmac = (key: string, msg: string) => createHmac("sha256", key).update(msg).digest("hex");

describe("firmas de webhooks", () => {
  it("Calendly: acepta firma válida y rechaza cuerpo alterado o firma vieja", () => {
    const now = 1_700_000_000_000;
    const body = '{"event":"invitee.created"}';
    const t = String(now / 1000);
    const header = `t=${t},v1=${hmac("k", `${t}.${body}`)}`;
    expect(verifyCalendlySignature(header, body, "k", now)).toBe(true);
    expect(verifyCalendlySignature(header, body + " ", "k", now)).toBe(false);
    expect(verifyCalendlySignature(header, body, "k", now + 6 * 60 * 1000)).toBe(false);
    expect(verifyCalendlySignature(null, body, "k", now)).toBe(false);
  });

  it("Cal.com: HMAC del cuerpo en hexadecimal", () => {
    const body = '{"triggerEvent":"BOOKING_CREATED"}';
    expect(verifyCalcomSignature(hmac("s", body), body, "s")).toBe(true);
    expect(verifyCalcomSignature(hmac("otra", body), body, "s")).toBe(false);
  });

  it("Mercado Pago: manifest id;request-id;ts; con id en minúsculas", () => {
    const ts = "1700000000";
    const manifest = `id:abc123;request-id:req-1;ts:${ts};`;
    const xSignature = `ts=${ts},v1=${hmac("secret", manifest)}`;
    expect(verifyMercadoPagoSignature({ xSignature, xRequestId: "req-1", dataId: "ABC123", secret: "secret" })).toBe(true);
    expect(verifyMercadoPagoSignature({ xSignature, xRequestId: "req-2", dataId: "ABC123", secret: "secret" })).toBe(false);
    expect(verifyMercadoPagoSignature({ xSignature: `ts=${ts}`, xRequestId: "req-1", dataId: "abc123", secret: "secret" })).toBe(false);
  });
});
