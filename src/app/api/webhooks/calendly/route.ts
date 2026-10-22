import { NextResponse, type NextRequest } from "next/server";
import { cancelBooking, registerBooking } from "@/lib/bookings";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyCalendlySignature } from "@/lib/webhooks";

// Flujo B (automático) con Calendly. Requiere un plan de Calendly con webhooks (pago).
// Alternativa gratis: Cal.com → /api/webhooks/calcom.
export async function POST(request: NextRequest) {
  const key = process.env.CALENDLY_WEBHOOK_SIGNING_KEY;
  if (!key) return NextResponse.json({ error: "Webhook no configurado" }, { status: 503 });

  const body = await request.text();
  if (!verifyCalendlySignature(request.headers.get("calendly-webhook-signature"), body, key)) {
    return NextResponse.json({ error: "Firma no válida" }, { status: 401 });
  }

  let event: {
    event: string;
    payload: { email?: string; name?: string; uri?: string; scheduled_event?: { uri?: string; start_time?: string } };
  };
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "JSON no válido" }, { status: 400 });
  }
  const p = event.payload ?? {};
  const externalId = p.scheduled_event?.uri ?? p.uri;
  const db = createAdminClient();

  try {
    if (event.event === "invitee.created" && p.email && p.scheduled_event?.start_time && externalId) {
      await registerBooking(db, { email: p.email, name: p.name, startsAt: p.scheduled_event.start_time, externalId, source: "calendly" });
    } else if (event.event === "invitee.canceled" && externalId) {
      await cancelBooking(db, externalId, "calendly");
    }
  } catch (e) {
    await db.from("automation_runs").insert({ flow: "B_reserva", trigger: event.event, action: "webhook calendly", status: "error", error: e instanceof Error ? e.message : String(e) });
    return NextResponse.json({ error: "Error procesando el evento" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
