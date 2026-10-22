import { NextResponse, type NextRequest } from "next/server";
import { rateLimiter } from "@/lib/origin";
import { createAdminClient } from "@/lib/supabase/admin";

// Métricas de la carta pública (sin datos personales): visitas y clics. Se llama con navigator.sendBeacon.
// Las reservas se registran en el servidor al guardarse (no por aquí).
const KINDS = new Set(["view", "whatsapp_order", "review_click", "call", "maps", "instagram"]);
const tooMany = rateLimiter(30, 10 * 60 * 1000);

export async function POST(request: NextRequest, ctx: RouteContext<"/api/m/[slug]/event">) {
  const { slug } = await ctx.params;
  const kind = (await request.text().catch(() => "")).trim();
  if (slug === "demo" || !KINDS.has(kind) || !/^[a-z0-9-]{1,48}$/.test(slug)) return new NextResponse(null, { status: 204 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "?";
  if (tooMany(`${ip}:${slug}:${kind}`)) return new NextResponse(null, { status: 204 });

  const db = createAdminClient();
  const { data: venue } = await db.from("venues").select("id").eq("slug", slug).eq("published", true).maybeSingle();
  if (venue) await db.from("venue_events").insert({ venue_id: venue.id, kind });
  return new NextResponse(null, { status: 204 });
}
