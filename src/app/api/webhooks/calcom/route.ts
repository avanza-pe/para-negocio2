import { NextResponse, type NextRequest } from "next/server";
import { cancelBooking, registerBooking } from "@/lib/bookings";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyCalcomSignature } from "@/lib/webhooks";

// Flujo B (automático) con Cal.com: alternativa gratuita y open source a Calendly.
// Cal.com → Settings → Developer → Webhooks: URL https://TU-DOMINIO/api/webhooks/calcom,
// eventos Booking Created / Rescheduled / Cancelled y un "secret" (= CALCOM_WEBHOOK_SECRET).
type CalPayload = {
  uid?: string;
  startTime?: string;
  rescheduleUid?: string;
  attendees?: { email?: string; name?: string }[];
};

export async function POST(request: NextRequest) {
  const secret = process.env.CALCOM_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook no configurado" }, { status: 503 });

  const body = await request.text();
  if (!verifyCalcomSignature(request.headers.get("x-cal-signature-256"), body, secret)) {
    return NextResponse.json({ error: "Firma no válida" }, { status: 401 });
  }

  let event: { triggerEvent?: string; payload?: CalPayload };
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "JSON no válido" }, { status: 400 });
  }
  const trigger = event.triggerEvent ?? "";
  const p = event.payload ?? {};
  const attendee = p.attendees?.[0];
  const db = createAdminClient();

  try {
    if ((trigger === "BOOKING_CREATED" || trigger === "BOOKING_RESCHEDULED") && p.uid && p.startTime && attendee?.email) {
      if (p.rescheduleUid) await cancelBooking(db, `calcom:${p.rescheduleUid}`, "calcom");
      await registerBooking(db, { email: attendee.email, name: attendee.name, startsAt: p.startTime, externalId: `calcom:${p.uid}`, source: "calcom" });
    } else if (trigger === "BOOKING_CANCELLED" && p.uid) {
      await cancelBooking(db, `calcom:${p.uid}`, "calcom");
    }
  } catch (e) {
    await db.from("automation_runs").insert({ flow: "B_reserva", trigger, action: "webhook cal.com", status: "error", error: e instanceof Error ? e.message : String(e) });
    return NextResponse.json({ error: "Error procesando el evento" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
