import { CheckCircle2, CircleDashed } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { requireStaff } from "@/lib/auth";
import { aiProvider, PROVIDER_LABEL } from "@/lib/ai";
import { mpConfigured, yapeViaMpEnabled } from "@/lib/mercadopago";
import { telegramConfigured } from "@/lib/telegram";
import { mailConfigured } from "@/lib/mail";

export const metadata = { title: "Configuración" };

/** Estado de cada integración. Solo muestra si está configurada: nunca muestra claves. */
export default async function SettingsPage() {
  await requireStaff();
  const ai = aiProvider();
  const groups = [
    {
      title: "Cobros",
      items: [
        { name: "Yape vía Mercado Pago", on: yapeViaMpEnabled(), env: "MP_ACCESS_TOKEN + NEXT_PUBLIC_MP_PUBLIC_KEY + MP_WEBHOOK_SECRET", note: "Comisión de Mercado Pago por venta aprobada. Sin costo fijo." },
        { name: "Tarjeta (Checkout Pro)", on: mpConfigured(), env: "MP_ACCESS_TOKEN", note: "Mismo acceso que arriba." },
        { name: "Yape/Plin directo", on: Boolean(process.env.NEXT_PUBLIC_YAPE_NUMBER), env: "NEXT_PUBLIC_YAPE_NUMBER, NEXT_PUBLIC_YAPE_NAME", note: "Sin comisión. Se confirma a mano." },
      ],
    },
    {
      title: "Inteligencia artificial",
      items: [
        { name: ai ? `Activa: ${PROVIDER_LABEL[ai.provider]} · ${ai.model}` : "Sin IA configurada", on: Boolean(ai), env: "GEMINI_API_KEY o GROQ_API_KEY (gratis)", note: "Gemini y Groq tienen plan gratis con límites. Claude (ANTHROPIC_API_KEY) es de pago." },
      ],
    },
    {
      title: "Avisos al equipo",
      items: [
        { name: "Correo (Brevo, plan gratis)", on: mailConfigured(), env: "BREVO_API_KEY, BREVO_SENDER_EMAIL, NOTIFY_EMAIL_TO", note: "300 correos al día en el plan gratis." },
        { name: "Telegram (bot gratis)", on: telegramConfigured(), env: "TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID", note: "Avisos instantáneos de leads, reservas y pagos." },
      ],
    },
    {
      title: "Agenda",
      items: [
        { name: "Cal.com (gratis)", on: Boolean(process.env.CALCOM_WEBHOOK_SECRET), env: "CALCOM_WEBHOOK_SECRET", note: "Webhook: /api/webhooks/calcom" },
        { name: "Calendly (plan de pago)", on: Boolean(process.env.CALENDLY_WEBHOOK_SIGNING_KEY), env: "CALENDLY_WEBHOOK_SIGNING_KEY", note: "Webhook: /api/webhooks/calendly" },
      ],
    },
    {
      title: "Automatización",
      items: [{ name: "Resumen diario y cobros del mes", on: Boolean(process.env.CRON_SECRET), env: "CRON_SECRET", note: "Vercel Cron, 08:00 hora de Lima." }],
    },
  ];

  return (
    <>
      <PageHeader title="Configuración" description="Qué está activo. Las claves se ponen en las variables de entorno de Vercel, nunca en el panel." />
      <div className="grid gap-4 md:grid-cols-2">
        {groups.map((g) => (
          <Card key={g.title}>
            <CardHeader>
              <CardTitle>{g.title}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {g.items.map((i) => (
                <div key={i.name} className="grid gap-1 text-sm">
                  <p className="flex items-center gap-2 font-medium">
                    {i.on ? <CheckCircle2 className="size-4 text-emerald-500" /> : <CircleDashed className="size-4 text-muted-foreground" />}
                    {i.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{i.note}</p>
                  {!i.on && <p className="text-xs">Variables: <code>{i.env}</code></p>}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
      <CardDescription className="mt-6 block text-xs">Guía completa: docs/apis-gratis.md</CardDescription>
    </>
  );
}
