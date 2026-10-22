"use client";

import * as React from "react";
import Script from "next/script";
import { Button } from "@/components/ui/button";

const KEY = "avz-consent";
type Consent = "granted" | "denied" | null;
type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window {
    gtag?: Gtag;
    dataLayer?: unknown[];
  }
}

const read = (): Consent => {
  try {
    const v = localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
};

const subscribe = (cb: () => void) => {
  window.addEventListener("avz-consent", cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener("avz-consent", cb);
    window.removeEventListener("storage", cb);
  };
};

/** GA4 solo se carga si hay NEXT_PUBLIC_GA_ID y el visitante acepta. Eventos: formulario, agenda y WhatsApp. */
export function Analytics({ gaId }: { gaId?: string }) {
  // "unknown" en el servidor (evita desajustes de hidratación); luego granted | denied | none.
  const state = React.useSyncExternalStore(subscribe, () => read() ?? "none", () => "unknown");
  const consent: Consent = state === "granted" || state === "denied" ? state : null;
  const ready = state !== "unknown";

  React.useEffect(() => {
    if (consent !== "granted") return;
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a");
      const href = a?.getAttribute("href") ?? "";
      if (!href || !window.gtag) return;
      if (href.includes("wa.me")) window.gtag("event", "click_whatsapp");
      else if (/calendly|cal\.com|appointments/.test(href)) window.gtag("event", "click_agenda");
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [consent]);

  if (!gaId) return null;

  const choose = (v: "granted" | "denied") => {
    try {
      localStorage.setItem(KEY, v);
    } catch {}
    window.dispatchEvent(new Event("avz-consent"));
  };

  return (
    <>
      {consent === "granted" && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','${gaId}',{anonymize_ip:true});`}
          </Script>
        </>
      )}
      {ready && consent === null && (
        <div role="dialog" aria-label="Preferencias de cookies" className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-xl rounded-2xl border bg-card/95 p-4 shadow-2xl backdrop-blur-xl">
          <p className="text-sm text-muted-foreground">
            Usamos analítica (Google Analytics) para mejorar la web, solo si aceptas. Puedes rechazarla sin perder nada.{" "}
            <a href="/privacidad" className="underline underline-offset-2">
              Más información
            </a>
            .
          </p>
          <div className="mt-3 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => choose("denied")}>
              Rechazar
            </Button>
            <Button size="sm" onClick={() => choose("granted")}>
              Aceptar
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

/** Evento de conversión: se dispara en la página /gracias si hay consentimiento. */
export function TrackLead() {
  React.useEffect(() => {
    if (read() === "granted") window.gtag?.("event", "generate_lead");
  }, []);
  return null;
}
