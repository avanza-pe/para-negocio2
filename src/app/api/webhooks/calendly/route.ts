import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Flujo B (automático). Requiere un plan de Calendly con webhooks.
// Cabecera: Calendly-Webhook-Signature: t=<timestamp>,v1=<hmac sha256 de "t.body">

function validSignature(header: string | null, body: string, key: string) {
  if (!header) return false;
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=") as [string, string]));
  const { t, v1 } = parts;
  if (!t || !v1) return false;
  const sentAtMs = Number(t) > 1e12 ? Number(t) : Number(t) * 1000; // t puede venir en segundos o milisegundos
  if (!Number.isFinite(sentAtMs) || Math.abs(Date.now() - sentAtMs) > 5 * 60 * 1000) return false;
  const expected = createHmac("sha256", key).update(`${t}.${body}`).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(v1);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  const key = process.env.CALENDLY_WEBHOOK_SIGNING_KEY;
  if (!key) return NextResponse.json({ error: "Webhook no configurado" }, { status: 503 });

  const body = await request.text();
  if (!validSignature(request.headers.get("calendly-webhook-signature"), body, key)) {
    return NextResponse.json({ error: "Firma no válida" }, { status: 401 });
  }

  const event = JSON.parse(body) as {
    event: string;
    payload: {
      email?: string;
      name?: string;
      uri?: string;
      scheduled_event?: { uri?: string; start_time?: string };
    };
  };
  const p = event.payload;
  const externalId = p.scheduled_event?.uri ?? p.uri;
  const db = createAdminClient();

  try {
    if (event.event === "invitee.created" && p.email && p.scheduled_event?.start_time && externalId) {
      const email = p.email.trim().toLowerCase();
      let { data: prospect } = await db.from("prospects").select("id").ilike("contact_email", email).maybeSingle();
      if (!prospect) {
        const created = await db
          .from("prospects")
          .insert({ company: p.name ?? email, contact_name: p.name ?? null, contact_email: email, channel: "calendly", consent: true })
          .select("id")
          .single();
        prospect = created.data;
      }
      if (!prospect) throw new Error("No se pudo resolver el prospecto");

      const startsAt = p.scheduled_event.start_time;
      const { error } = await db.from("meetings").insert({
        prospect_id: prospect.id,
        starts_at: startsAt,
        source: "calendly",
        external_id: externalId,
      });
      if (error && error.code !== "23505") throw error;

      await db
        .from("prospects")
        .update({
          stage: "reunion_agendada",
          last_interaction_at: new Date().toISOString(),
          next_action: "Preparar la reunión: revisar web y redes del prospecto",
          next_action_at: startsAt.slice(0, 10),
        })
        .eq("id", prospect.id);
      await db.from("automation_runs").insert({ flow: "B_reserva", trigger: "calendly invitee.created", action: "registrar reunión + tarea", status: error ? "duplicado" : "ok", ref_id: prospect.id });
    } else if (event.event === "invitee.canceled" && externalId) {
      await db.from("meetings").update({ status: "cancelada" }).eq("external_id", externalId);
      await db.from("automation_runs").insert({ flow: "B_reserva", trigger: "calendly invitee.canceled", action: "cancelar reunión", status: "ok" });
    }
  } catch (e) {
    await db.from("automation_runs").insert({ flow: "B_reserva", trigger: event.event, action: "webhook", status: "error", error: e instanceof Error ? e.message : String(e) });
    return NextResponse.json({ error: "Error procesando el evento" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
