import "server-only";

/** Envío transaccional con la API de Brevo (https://developers.brevo.com). Devuelve false si no está configurado. */
export async function sendMail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const { BREVO_API_KEY, BREVO_SENDER_EMAIL, BREVO_SENDER_NAME } = process.env;
  if (!BREVO_API_KEY || !BREVO_SENDER_EMAIL) return false;

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": BREVO_API_KEY, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      sender: { name: BREVO_SENDER_NAME || "AVANZA", email: BREVO_SENDER_EMAIL },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`Brevo respondió ${res.status}`);
  return true;
}
