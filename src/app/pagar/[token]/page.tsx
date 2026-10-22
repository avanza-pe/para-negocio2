import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CircleCheck, Lock, MessageCircle, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { CheckoutButton, YapeForm } from "@/components/pay-ui";
import { startCheckout } from "@/lib/actions/pay";
import { mpConfigured, yapeViaMpEnabled } from "@/lib/mercadopago";
import { isPaymentToken } from "@/lib/payments";
import { formatPhone } from "@/lib/phone";
import { SITE, whatsappLink } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Pagar", robots: { index: false, follow: false } };

const pen = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" });

const BANNERS: Record<string, { tone: string; text: string }> = {
  ok: { tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300", text: "Mercado Pago aprobó tu pago. En unos segundos se verá confirmado aquí." },
  pendiente: { tone: "bg-amber-500/10 text-amber-700 dark:text-amber-300", text: "Tu pago está pendiente en Mercado Pago. Te avisaremos cuando se acredite." },
  error: { tone: "bg-destructive/10 text-destructive", text: "El pago no se completó. Puedes intentarlo de nuevo con otro medio." },
  "no-disponible": { tone: "bg-destructive/10 text-destructive", text: "Ese medio no está disponible. Usa otra opción." },
  espera: { tone: "bg-amber-500/10 text-amber-700 dark:text-amber-300", text: "Demasiados intentos seguidos. Espera unos minutos." },
};

/** Página pública de un cobro: /pagar/<token>. El monto sale de la base; nada se decide en el navegador. */
export default async function PayPage({ params, searchParams }: PageProps<"/pagar/[token]">) {
  const { token } = await params;
  const { estado } = await searchParams;
  if (!isPaymentToken(token)) notFound();

  const db = createAdminClient();
  const { data: p } = await db
    .from("payments")
    .select("concept, amount_pen, status, paid_at, payer_email, due_date, clients(name)")
    .eq("public_token", token)
    .maybeSingle();
  if (!p) notFound();

  const client = (Array.isArray(p.clients) ? p.clients[0] : p.clients) as { name: string } | null;
  const amount = Number(p.amount_pen);
  const banner = typeof estado === "string" ? BANNERS[estado] : undefined;
  const yape = yapeViaMpEnabled() && SITE.mpPublicKey;
  const wa = whatsappLink(`Hola, pagué «${p.concept}» (${pen.format(amount)}) por Yape/Plin directo. Te envío la constancia. Código: ${token.slice(0, 8)}`);

  return (
    <main className="mx-auto grid min-h-dvh w-full max-w-lg content-center gap-4 px-4 py-10">
      <div className="flex justify-center">
        <Logo />
      </div>

      <Card className="rounded-3xl">
        <CardContent className="grid gap-5">
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{client?.name ?? "Cobro"}</p>
            <h1 className="mt-1 text-lg font-medium">{p.concept}</h1>
            <p className="mt-2 font-heading text-4xl font-semibold tabular-nums">{pen.format(amount)}</p>
            {p.due_date && p.status === "pendiente" && <p className="mt-1 text-xs text-muted-foreground">Vence el {p.due_date}</p>}
          </div>

          {banner && p.status === "pendiente" && <p className={`rounded-xl px-3 py-2 text-sm ${banner.tone}`}>{banner.text}</p>}

          {p.status === "pagado" && (
            <div className="grid justify-items-center gap-2 rounded-2xl bg-emerald-500/10 p-6 text-center text-emerald-700 dark:text-emerald-300">
              <CircleCheck className="size-10" />
              <p className="font-medium">Pago recibido</p>
              {p.paid_at && <p className="text-sm">{new Date(p.paid_at).toLocaleString("es-PE", { timeZone: "America/Lima", dateStyle: "long", timeStyle: "short" })}</p>}
              <p className="text-sm">¡Gracias! Ya puedes cerrar esta página.</p>
            </div>
          )}

          {["cancelado", "rechazado", "reembolsado"].includes(p.status) && (
            <p className="rounded-xl bg-muted px-3 py-2 text-center text-sm text-muted-foreground">Este cobro ya no está activo. Si crees que es un error, escríbenos.</p>
          )}

          {p.status === "pendiente" && (
            <div className="grid gap-5">
              {yape && (
                <section className="grid gap-3">
                  <h2 className="text-sm font-semibold">Paga con Yape</h2>
                  <YapeForm token={token} publicKey={SITE.mpPublicKey!} defaultEmail={p.payer_email} />
                </section>
              )}

              {mpConfigured() && <CheckoutButton action={startCheckout.bind(null, token)} />}

              {SITE.yapeNumber && (
                <section className="grid gap-2 rounded-2xl border border-dashed p-4 text-sm">
                  <h2 className="font-semibold">{yape || mpConfigured() ? "¿Prefieres Yape o Plin directo?" : "Paga con Yape o Plin"}</h2>
                  <p>
                    Envía <b>{pen.format(amount)}</b> al <b className="tabular-nums">{formatPhone(SITE.yapeNumber)}</b>
                    {SITE.yapeName && <> a nombre de <b>{SITE.yapeName}</b></>} y mándanos la constancia.
                  </p>
                  {wa && (
                    <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-medium text-primary underline-offset-2 hover:underline">
                      <MessageCircle className="size-4" /> Enviar constancia por WhatsApp
                    </a>
                  )}
                  <p className="text-xs text-muted-foreground">Lo confirmamos a mano en horario de atención.</p>
                </section>
              )}

              {!yape && !mpConfigured() && !SITE.yapeNumber && (
                <p className="text-center text-sm text-muted-foreground">Aún no hay medios de pago configurados. Escríbenos y te ayudamos.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        {mpConfigured() ? <Lock className="size-3.5" /> : <ShieldCheck className="size-3.5" />}
        {mpConfigured() ? "Pagos procesados por Mercado Pago. No guardamos tus datos de pago." : `${SITE.name} · Lima, Perú`}
      </p>
    </main>
  );
}
