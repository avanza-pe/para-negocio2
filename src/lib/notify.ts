import "server-only";
import { sendMail } from "@/lib/mail";

type Lead = { company: string; contact_name: string; contact_email: string; message?: string };

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** Aviso interno por correo (Brevo). Si falta configuración no hace nada: el lead ya está guardado. */
export async function notifyNewLead(lead: Lead) {
  const to = process.env.NOTIFY_EMAIL_TO;
  if (!to) return;
  await sendMail({
    to,
    subject: `Nuevo lead: ${lead.company}`,
    html: `<p><b>${esc(lead.contact_name)}</b> (${esc(lead.contact_email)}) de <b>${esc(lead.company)}</b></p><p>${esc(lead.message ?? "")}</p>`,
  });
}
