import "server-only";
import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { MenuCategory, MenuItem, PublicVenue, Venue } from "@/lib/crm";
import { SITE } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/admin";

export type PublicMenu = { venue: PublicVenue; categories: (MenuCategory & { items: MenuItem[] })[]; demo?: boolean };

// Columnas públicas: nunca owner_token, notify_email, telegram_chat_id ni client_id.
const PUBLIC_COLUMNS =
  "id, slug, name, kind, tagline, whatsapp, address, district, city, maps_url, hours_text, instagram, tiktok, google_review_url, yape_number, yape_name, accepts_orders, accepts_reservations, delivery_note, accent_color";

export const isOwnerToken = (t: string) => /^[0-9a-f]{64}$/.test(t);

/** Carta publicada por slug (o la demo). null si no existe o no está publicada. `cache`: metadata y página comparten la consulta. */
export const getPublicMenu = cache(async (slug: string): Promise<PublicMenu | null> => {
  if (slug === "demo") return DEMO_MENU();
  if (!/^[a-z0-9-]{1,48}$/.test(slug)) return null;
  try {
    const db = createAdminClient();
    const { data: venue } = await db.from("venues").select(PUBLIC_COLUMNS).eq("slug", slug).eq("published", true).maybeSingle();
    if (!venue) return null;
    return { venue: venue as PublicVenue, categories: await loadMenu(db, venue.id as string) };
  } catch (e) {
    console.error("getPublicMenu", e); // configuración incompleta (service role): mejor 404 que 500 en una página pública
    return null;
  }
});

export async function loadMenu(db: SupabaseClient, venueId: string) {
  const [{ data: cats }, { data: items }] = await Promise.all([
    db.from("menu_categories").select("id, venue_id, name, position").eq("venue_id", venueId).order("position").order("created_at"),
    db
      .from("menu_items")
      .select("id, venue_id, category_id, name, description, price_pen, available, tags, position, image_url")
      .eq("venue_id", venueId)
      .order("position")
      .order("created_at"),
  ]);
  return ((cats ?? []) as MenuCategory[]).map((c) => ({
    ...c,
    items: ((items ?? []) as MenuItem[]).filter((i) => i.category_id === c.id).map((i) => ({ ...i, price_pen: Number(i.price_pen) })),
  }));
}

/** Local del dueño a partir de su enlace privado /panel/<token>. */
export async function getVenueByOwnerToken(token: string) {
  if (!isOwnerToken(token)) return null;
  const db = createAdminClient();
  const { data } = await db.from("venues").select("*").eq("owner_token", token).maybeSingle();
  return data ? { db, venue: data as Venue } : null;
}

export const VENUE_EVENT_KINDS = ["view", "whatsapp_order", "reservation", "review_click", "call", "maps", "instagram"] as const;
export type VenueEventKind = (typeof VENUE_EVENT_KINDS)[number];

/** Conteo de eventos por tipo en un rango (métricas verificables del local). */
export async function venueStats(db: SupabaseClient, venueId: string, fromISO: string, toISO?: string) {
  let q = db.from("venue_events").select("kind, created_at").eq("venue_id", venueId).gte("created_at", fromISO).limit(50_000);
  if (toISO) q = q.lt("created_at", toISO);
  const { data } = await q;
  const counts = Object.fromEntries(VENUE_EVENT_KINDS.map((k) => [k, 0])) as Record<VenueEventKind, number>;
  for (const e of data ?? []) counts[e.kind as VenueEventKind] = (counts[e.kind as VenueEventKind] ?? 0) + 1;
  return { counts, events: (data ?? []) as { kind: VenueEventKind; created_at: string }[] };
}

// ───────── Carta de demostración (/m/demo): sirve para vender sin tocar la base ─────────
function DEMO_MENU(): PublicMenu {
  const venue: PublicVenue = {
    id: "demo",
    slug: "demo",
    name: "Café Aurora",
    kind: "cafeteria",
    tagline: "Café de especialidad y desayunos peruanos · carta de demostración",
    // Los pedidos de la demo llegan al WhatsApp de la agencia: así el prospecto ve cómo llegarían a su local.
    whatsapp: SITE.whatsapp ?? null,
    address: "Av. Grau 000 (dirección de ejemplo)",
    district: "Barranco",
    city: "Lima",
    maps_url: null,
    hours_text: "Lun–Sáb 8:00–21:00 · Dom 9:00–18:00",
    instagram: null,
    tiktok: null,
    google_review_url: null,
    yape_number: null,
    yape_name: null,
    accepts_orders: true,
    accepts_reservations: true,
    delivery_note: "Delivery en Barranco y Chorrillos · S/ 5 · Pago con Yape al recibir",
    accent_color: "#7c5cf2",
  };
  const cat = (id: string, name: string, items: [string, number, string | null, string[]?, boolean?][]) => ({
    id,
    venue_id: "demo",
    name,
    position: 0,
    items: items.map(([n, price, description, tags = [], available = true], i) => ({
      id: `${id}-${i}`,
      venue_id: "demo",
      category_id: id,
      name: n,
      description,
      price_pen: price,
      available,
      tags,
      position: i,
      image_url: null,
    })),
  });
  return {
    demo: true,
    venue,
    categories: [
      cat("cafes", "Cafés", [
        ["Espresso", 7, "Blend de Villa Rica y Chanchamayo", ["Recomendado"]],
        ["Americano", 8, null],
        ["Capuccino", 11, "Con leche entera o de avena"],
        ["Latte de vainilla", 13, null, ["Nuevo"]],
        ["Café pasado de olla", 9, "Con canela y chancaca"],
      ]),
      cat("desayunos", "Desayunos", [
        ["Pan con chicharrón", 18, "Con camote frito y sarza criolla", ["Recomendado"]],
        ["Tamal con sarza", 14, "Tamal de cerdo, sarza y pan", []],
        ["Tostadas con palta y huevo", 19, "Pan de masa madre", ["Vegetariano"]],
        ["Bowl de açaí", 22, "Granola, plátano y fresas", ["Vegano"]],
      ]),
      cat("sanguches", "Sánguches", [
        ["Triple clásico", 12, "Palta, tomate y huevo"],
        ["Butifarra", 16, "Jamón del país y sarza", ["Para compartir"]],
        ["Pan con pollo", 15, "Pollo deshilachado y mayonesa de la casa"],
      ]),
      cat("postres", "Postres", [
        ["Alfajores (3 unid.)", 9, "Manjar blanco de la casa"],
        ["Torta de chocolate", 14, null],
        ["Pie de limón", 13, null, [], false],
      ]),
      cat("bebidas", "Bebidas", [
        ["Chicha morada", 8, "Jarra personal"],
        ["Limonada frozen", 10, null],
        ["Jugo de papaya", 11, null],
      ]),
    ],
  };
}
