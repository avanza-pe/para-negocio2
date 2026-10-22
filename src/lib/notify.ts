import "server-only";
import { sendMail } from "@/lib/mail";
import { sendTelegram } from "@/lib/telegram";
import { SITE } from "@/lib/site";

type Lead = { company: string; contact_name: string; contact_email: string; contact_phone?: string; message?: string };

export const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** Aviso interno al equipo por correo (Brevo) y Telegram. Lo que no esté configurado se omite. */
export async function notifyTeam({ subject, html, text }: { subject: string; html: string; text: string }) {
  const to = process.env.NOTIFY_EMAIL_TO;
  await Promise.allSettled([to ? sendMail({ to, subject, html }) : Promise.resolve(false), sendTelegram(`${subject}\n\n${text}`)]);
}

/** Aviso de lead nuevo (o repetido). El lead ya está guardado: si el aviso falla no se pierde nada. */
export async function notifyNewLead(lead: Lead, { repeated = false } = {}) {
  const subject = `${repeated ? "Lead repetido" : "Nuevo lead"}: ${lead.company}`;
  const contact = [lead.contact_email, lead.contact_phone].filter(Boolean).join(" · ");
  await notifyTeam({
    subject,
    html: `<p><b>${esc(lead.contact_name)}</b> (${esc(contact)}) de <b>${esc(lead.company)}</b></p><p>${esc(lead.message ?? "")}</p><p><a href="${SITE.url}/dashboard/prospectos">Abrir prospectos</a></p>`,
    text: `${lead.contact_name} (${contact})\n${lead.message ?? ""}\n${SITE.url}/dashboard/prospectos`,
  });
}
