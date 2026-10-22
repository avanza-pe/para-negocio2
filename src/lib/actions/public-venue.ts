"use server";

import { z } from "zod";
import { limaLocalToISO } from "@/lib/dates";
import { mailConfigured, sendMail } from "@/lib/mail";
import { esc } from "@/lib/notify";
import { clientIp, currentOrigin, rateLimiter } from "@/lib/origin";
import { formatPhone, normalizePhone } from "@/lib/phone";
import { sendTelegram } from "@/lib/telegram";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ActionState } from "./types";

const tooMany = rateLimiter(5, 10 * 60 * 1000);

const schema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre").max(80),
  phone: z
    .string()
    .trim()
    .max(30)
    .refine((v) => normalizePhone(v), "Escribe un celular válido"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Elige la fecha"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Elige la hora"),
  party_size: z.coerce.number().int().min(1, "Mínimo 1").max(50, "Para más de 50 personas escríbenos"),
  notes: z.string().trim().max(300).optional(),
  consent: z.literal("on", { error: "Acepta que usemos tus datos para la reserva" }),
  website: z.string().max(0).optional(), // honeypot
});

/** Reserva desde la carta pública. Se guarda y se avisa al local al instante (correo y/o Telegram). */
export async function submitReservation(slug: string, _: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  const r = parsed.data;

  const when = limaLocalToISO(`${r.date}T${r.time}`);
  if (!when) return { fieldErrors: { date: ["Fecha no válida"] } };
  const ms = new Date(when).getTime() - Date.now();
  if (ms < -5 * 60 * 1000) return { fieldErrors: { time: ["Esa hora ya pasó"] } };
  if (ms > 120 * 864e5) return { fieldErrors: { date: ["Reservamos con hasta 4 meses de anticipación"] } };

  if (slug === "demo") return { ok: true }; // la demo no guarda nada
  if (tooMany(await clientIp())) return { error: "Demasiadas reservas seguidas. Escríbenos por WhatsApp." };

  const db = createAdminClient();
  const { data: venue } = await db
    .from("venues")
    .select("id, name, accepts_reservations, notify_email, telegram_chat_id, owner_token")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (!venue || !venue.accepts_reservations) return { error: "Este local no está recibiendo reservas en línea." };

  // Tope por local: evita que un bot llene el panel del dueño.
  const { count } = await db
    .from("reservations")
    .select("id", { count: "exact", head: true })
    .eq("venue_id", venue.id)
    .gte("created_at", new Date(Date.now() - 10 * 60 * 1000).toISOString());
  if ((count ?? 0) >= 20) return { error: "Estamos recibiendo muchas reservas. Escríbenos por WhatsApp." };

  const phone = normalizePhone(r.phone)!;
  const { error } = await db.from("reservations").insert({
    venue_id: venue.id,
    name: r.name,
    phone,
    party_size: r.party_size,
    reserved_for: when,
    notes: r.notes || null,
  });
  if (error) return { error: "No pudimos guardar tu reserva. Intenta de nuevo o escríbenos por WhatsApp." };
  await db.from("venue_events").insert({ venue_id: venue.id, kind: "reservation" });

  const human = new Date(when).toLocaleString("es-PE", { timeZone: "America/Lima", dateStyle: "full", timeStyle: "short" });
  const panel = `${await currentOrigin()}/panel/${venue.owner_token}`;
  const text = `Nueva reserva en ${venue.name}\n${r.name} · ${formatPhone(phone)}\n${r.party_size} persona(s) · ${human}${r.notes ? `\nNotas: ${r.notes}` : ""}\n\nConfírmala aquí: ${panel}`;
  await Promise.allSettled([
    venue.telegram_chat_id ? sendTelegram(text, venue.telegram_chat_id) : Promise.resolve(false),
    venue.notify_email && mailConfigured()
      ? sendMail({
          to: venue.notify_email,
          subject: `Nueva reserva: ${r.name} · ${r.party_size} pers. · ${human}`,
          html: `<p><b>${esc(r.name)}</b> (${esc(formatPhone(phone))}) reservó para <b>${r.party_size}</b> el <b>${esc(human)}</b>.</p>${r.notes ? `<p>Notas: ${esc(r.notes)}</p>` : ""}<p><a href="${panel}">Confirmar o cancelar desde tu panel</a></p>`,
        })
      : Promise.resolve(false),
  ]);
  return { ok: true };
}
