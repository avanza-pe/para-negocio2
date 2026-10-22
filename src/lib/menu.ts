/**
 * Lógica pura de la carta digital (sin servidor ni base): se usa en el navegador y en el servidor,
 * y se prueba en menu.test.ts.
 */

/** "Café Aurora & Co." → "cafe-aurora-co" (válido para /m/<slug>). */
export function slugify(name: string) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " y ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/g, "");
}

export const RESERVED_SLUGS = ["demo", "admin", "api"];
export const isValidSlug = (s: string) => /^[a-z0-9]([a-z0-9-]{0,46}[a-z0-9])?$/.test(s) && !RESERVED_SLUGS.includes(s);

/** Precio en soles con formato peruano. */
export const soles = (n: number) => new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(n);

/** Texto legible (negro o blanco) sobre un color de marca #rrggbb. */
export function readableText(hex: string) {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) return "#ffffff";
  const [r, g, b] = m.slice(1).map((h) => {
    const c = parseInt(h, 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.45 ? "#111111" : "#ffffff";
}

// ───────── Importar carta desde texto ─────────
export type ParsedMenu = { name: string; items: { name: string; price: number; description: string | null }[] }[];

// Precio al final de la línea, separado del nombre (así "Promo 2x1" no se lee como S/ 1).
const PRICE_RE = /(?:^|[\s.·…_\-–—:|])(?:S\/\.?\s*)?(\d{1,4}(?:[.,]\d{1,2})?)\s*(?:soles)?\s*$/i;

/**
 * Convierte una carta pegada como texto (de un PDF, WhatsApp o foto transcrita) en categorías e ítems.
 * Formato flexible:
 *   CAFÉS                         ← línea sin precio = categoría (también "# Cafés" o "Cafés:")
 *   Espresso ..... S/ 7           ← nombre + precio al final
 *   Latte - con leche de avena - 13.50   ← nombre - descripción - precio
 *   Con leche de avena y canela  ← línea larga sin precio tras un plato = su descripción
 * Las líneas que no se entienden se devuelven en `skipped` para revisarlas a mano.
 */
export function parseMenuText(text: string): { categories: ParsedMenu; skipped: string[] } {
  const categories: ParsedMenu = [];
  const skipped: string[] = [];
  let current: ParsedMenu[number] | null = null;

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/\t/g, " ").replace(/\s+/g, " ").trim();
    if (!line) continue;

    const priceMatch = PRICE_RE.exec(line);
    if (!priceMatch) {
      const explicitCategory = /^#/.test(line) || /:$/.test(line) || (line === line.toUpperCase() && /[A-ZÁÉÍÓÚÑ]/.test(line));
      const lastItem = current?.items[current.items.length - 1];
      if (!explicitCategory && lastItem && (line.length > 25 || /^[a-záéíóúñ]/.test(line) || line.includes(","))) {
        lastItem.description = [lastItem.description, line].filter(Boolean).join(" ").slice(0, 300);
        continue;
      }
      const name = line.replace(/^#+\s*/, "").replace(/:$/, "").trim();
      if (name.length >= 2 && name.length <= 60) {
        current = { name: titleCase(name), items: [] };
        categories.push(current);
      } else skipped.push(raw);
      continue;
    }

    const price = Number(priceMatch[1].replace(",", "."));
    const head = line
      .slice(0, priceMatch.index)
      .replace(/(?:S\/\.?)\s*$/i, "")
      .replace(/[.·…_\-–—:|\s]+$/g, "")
      .trim();
    if (!head || !Number.isFinite(price)) {
      skipped.push(raw);
      continue;
    }
    const [name, ...rest] = head.split(/\s[-–—|]\s/);
    if (!current) {
      current = { name: "Carta", items: [] };
      categories.push(current);
    }
    current.items.push({ name: name.trim().slice(0, 120), price, description: rest.join(" - ").trim().slice(0, 300) || null });
  }
  return { categories: categories.filter((c) => c.items.length > 0), skipped };
}

function titleCase(s: string) {
  if (s !== s.toUpperCase()) return s;
  return s.charAt(0) + s.slice(1).toLowerCase();
}

// ───────── Pedido por WhatsApp ─────────
export type CartLine = { id: string; name: string; price: number; qty: number };
export type OrderDetails = {
  name: string;
  mode: "recojo" | "delivery" | "mesa";
  address?: string;
  table?: string;
  payment: "yape" | "efectivo" | "tarjeta" | "plin";
  notes?: string;
};

export const cartTotal = (lines: CartLine[]) => Math.round(lines.reduce((s, l) => s + l.price * l.qty, 0) * 100) / 100;

const MODE: Record<OrderDetails["mode"], string> = { recojo: "Para recoger", delivery: "Delivery", mesa: "En mesa" };
const PAY: Record<OrderDetails["payment"], string> = { yape: "Yape", plin: "Plin", efectivo: "Efectivo", tarjeta: "Tarjeta" };

/** Mensaje ordenado que llega al WhatsApp del local (lo que más tiempo ahorra al tomar pedidos). */
export function buildOrderMessage(venueName: string, lines: CartLine[], d: OrderDetails) {
  const items = lines.filter((l) => l.qty > 0).map((l) => `• ${l.qty} × ${l.name} — ${soles(l.price * l.qty)}`);
  return [
    `Hola ${venueName}, quiero hacer un pedido:`,
    "",
    ...items,
    "",
    `*Total: ${soles(cartTotal(lines))}*`,
    `Nombre: ${d.name}`,
    `Entrega: ${MODE[d.mode]}${d.mode === "delivery" && d.address ? ` — ${d.address}` : ""}${d.mode === "mesa" && d.table ? ` — mesa ${d.table}` : ""}`,
    `Pago: ${PAY[d.payment]}`,
    ...(d.notes ? [`Notas: ${d.notes}`] : []),
    "",
    "(Pedido enviado desde la carta digital)",
  ].join("\n");
}

/** Mensaje para confirmar una reserva al cliente desde el panel del dueño. */
export function reservationConfirmMessage(venueName: string, r: { name: string; party_size: number; reserved_for: string }) {
  const when = new Date(r.reserved_for).toLocaleString("es-PE", { timeZone: "America/Lima", weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
  return `Hola ${r.name}, te escribimos de ${venueName}: tu reserva para ${r.party_size} persona${r.party_size === 1 ? "" : "s"} el ${when} está confirmada. ¡Te esperamos!`;
}
