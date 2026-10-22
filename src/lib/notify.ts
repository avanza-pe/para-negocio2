import "server-only";
import { Resend } from "resend";

type Lead = { company: string; contact_name: string; contact_email: string; message?: string };

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** Aviso interno por correo. Si falta configuración no hace nada (el lead ya está guardado). */
export async function notifyNewLead(lead: Lead) {
  const { RESEND_API_KEY, NOTIFY_EMAIL_TO, NOTIFY_EMAIL_FROM } = process.env;
  if (!RESEND_API_KEY || !NOTIFY_EMAIL_TO) return;
  await new Resend(RESEND_API_KEY).emails.send({
    from: NOTIFY_EMAIL_FROM || "onboarding@resend.dev",
    to: NOTIFY_EMAIL_TO,
    subject: `Nuevo lead: ${lead.company}`,
    html: `<p><b>${esc(lead.contact_name)}</b> (${esc(lead.contact_email)}) de <b>${esc(lead.company)}</b></p><p>${esc(lead.message ?? "")}</p>`,
  });
}
