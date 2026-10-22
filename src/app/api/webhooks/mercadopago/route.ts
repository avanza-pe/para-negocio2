import { NextResponse, type NextRequest } from "next/server";
import { getMpPayment, MpError } from "@/lib/mercadopago";
import { applyMpPayment } from "@/lib/payments";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyMercadoPagoSignature } from "@/lib/webhooks";

// Flujo G (automático): Mercado Pago avisa cambios de pago. Configurar en Tus integraciones →
// Webhooks: URL https://TU-DOMINIO/api/webhooks/mercadopago, evento "Pagos", y copiar la
// "clave secreta" a MP_WEBHOOK_SECRET. El estado real se consulta a la API (el cuerpo no se usa como verdad).
export async function POST(request: NextRequest) {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret || !process.env.MP_ACCESS_TOKEN) return NextResponse.json({ error: "Webhook no configurado" }, { status: 503 });

  const url = request.nextUrl;
  const body = (await request.json().catch(() => ({}))) as { type?: string; action?: string; data?: { id?: string | number } };
  const type = url.searchParams.get("type") ?? url.searchParams.get("topic") ?? body.type ?? "";
  const dataId = url.searchParams.get("data.id") ?? (body.data?.id !== undefined ? String(body.data.id) : null);

  const valid = verifyMercadoPagoSignature({
    xSignature: request.headers.get("x-signature"),
    xRequestId: request.headers.get("x-request-id"),
    dataId,
    secret,
  });
  if (!valid) return NextResponse.json({ error: "Firma no válida" }, { status: 401 });

  // Solo nos interesan pagos; el resto (merchant_order, etc.) se confirma para que no reintente.
  if (type !== "payment" || !dataId) return NextResponse.json({ ok: true, ignored: type });

  const db = createAdminClient();
  try {
    const payment = await getMpPayment(dataId);
    const result = await applyMpPayment(db, payment);
    return NextResponse.json({ ok: true, result });
  } catch (e) {
    await db.from("automation_runs").insert({ flow: "G_cobro", trigger: "webhook mercadopago", action: `pago ${dataId}`, status: "error", error: e instanceof Error ? e.message : String(e) });
    // 404 de MP (pago de prueba borrado, otra cuenta): no tiene sentido que reintente.
    const status = e instanceof MpError && e.status === 404 ? 200 : 500;
    return NextResponse.json({ error: "Error procesando el pago" }, { status });
  }
}
