"use client";

import * as React from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { CreditCard, Loader2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/form-bits";
import { payWithYape } from "@/lib/actions/pay";
import type { ActionState } from "@/lib/actions/types";

type YapeTokenizer = { create: () => Promise<{ id: string }> };
type MercadoPagoCtor = new (publicKey: string, options?: { locale?: string }) => {
  yape: (options: { otp: string; phoneNumber: string }) => YapeTokenizer;
};
declare global {
  interface Window {
    MercadoPago?: MercadoPagoCtor;
  }
}

/**
 * Pago con Yape vía Mercado Pago: celular + código de aprobación (Yape → Menú → Código de aprobación).
 * El SDK de Mercado Pago convierte esos datos en un token de un solo uso; el servidor cobra el monto
 * guardado en la base con ese token. El código de aprobación nunca se guarda.
 */
export function YapeForm({ token, publicKey, defaultEmail }: { token: string; publicKey: string; defaultEmail?: string | null }) {
  const router = useRouter();
  const [sdkReady, setSdkReady] = React.useState(false);
  const [localError, setLocalError] = React.useState<string | null>(null);
  const [state, formAction, pending] = React.useActionState<ActionState, FormData>(payWithYape.bind(null, token), {});
  const [tokenizing, setTokenizing] = React.useState(false);

  React.useEffect(() => {
    if (state.ok) router.refresh();
  }, [state, router]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLocalError(null);
    const form = new FormData(e.currentTarget);
    const phoneNumber = String(form.get("phone") ?? "").replace(/\D/g, "");
    const otp = String(form.get("otp") ?? "").replace(/\D/g, "");
    if (!/^9\d{8}$/.test(phoneNumber)) return setLocalError("Escribe tu celular de 9 dígitos (el de tu Yape).");
    if (!/^\d{6}$/.test(otp)) return setLocalError("El código de aprobación tiene 6 dígitos.");
    if (!window.MercadoPago) return setLocalError("No se pudo cargar Mercado Pago. Recarga la página.");

    setTokenizing(true);
    try {
      const mp = new window.MercadoPago(publicKey, { locale: "es-PE" });
      const yapeToken = await mp.yape({ otp, phoneNumber }).create();
      const data = new FormData();
      data.set("yape_token", yapeToken.id);
      data.set("email", String(form.get("email") ?? ""));
      React.startTransition(() => formAction(data));
    } catch {
      setLocalError("No pudimos validar el código. Genera uno nuevo en Yape e inténtalo otra vez.");
    } finally {
      setTokenizing(false);
    }
  }

  const busy = pending || tokenizing;
  return (
    <form onSubmit={onSubmit} className="grid gap-3" noValidate>
      <Script src="https://sdk.mercadopago.com/js/v2" strategy="afterInteractive" onReady={() => setSdkReady(true)} />
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField label="Celular de tu Yape" name="phone" inputMode="numeric" autoComplete="tel-national" placeholder="987654321" maxLength={11} required />
        <TextField label="Código de aprobación" name="otp" inputMode="numeric" autoComplete="one-time-code" placeholder="6 dígitos" maxLength={6} required />
      </div>
      <TextField label="Correo (para tu comprobante)" name="email" type="email" autoComplete="email" defaultValue={defaultEmail ?? ""} required state={state} />
      <p className="text-xs text-muted-foreground">En tu app Yape: Menú → «Código de aprobación». Vence en pocos minutos.</p>
      {(localError || state.error) && (
        <p role="alert" className="text-sm text-destructive">
          {localError ?? state.error}
        </p>
      )}
      <Button type="submit" disabled={busy || !sdkReady} className="h-11 rounded-full bg-[#742284] text-white hover:bg-[#742284]/90">
        {busy ? <Loader2 className="animate-spin" /> : <Smartphone />} Pagar con Yape
      </Button>
    </form>
  );
}

export function CheckoutButton({ action }: { action: () => Promise<void> }) {
  const [pending, start] = React.useTransition();
  return (
    <Button variant="outline" className="h-11 w-full rounded-full" disabled={pending} onClick={() => start(() => action())}>
      {pending ? <Loader2 className="animate-spin" /> : <CreditCard />} Tarjeta u otros medios (Mercado Pago)
    </Button>
  );
}
