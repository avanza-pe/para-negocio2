import "server-only";
import { headers } from "next/headers";
import { publicEnv } from "@/lib/env";

/** Origen real de la petición (funciona en local, en Vercel y en previews sin depender de una variable). */
export async function currentOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return publicEnv.NEXT_PUBLIC_SITE_URL;
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/** IP del visitante para límites anti-abuso (Vercel la pone primera en x-forwarded-for). */
export async function clientIp() {
  return (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "desconocida";
}

/** Límite simple en memoria por clave y ventana (por instancia; complementa los topes en la base). */
export function rateLimiter(max: number, windowMs: number) {
  const hits = new Map<string, number[]>();
  return (key: string) => {
    const now = Date.now();
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    recent.push(now);
    hits.set(key, recent);
    if (hits.size > 5000) hits.clear(); // evita crecimiento sin límite
    return recent.length > max;
  };
}
