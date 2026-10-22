"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { aiConfigured, structureMenu } from "@/lib/ai";
import { requireStaff } from "@/lib/auth";
import { MENU_TAGS, RESERVATION_STATUS, VENUE_KINDS } from "@/lib/crm";
import { limaDate, limaStartOfDayISO, monthStart } from "@/lib/dates";
import { isValidSlug, parseMenuText, slugify } from "@/lib/menu";
import { normalizePhone } from "@/lib/phone";
import { createAdminClient } from "@/lib/supabase/admin";
import { venueStats } from "@/lib/venues";
import type { ActionState } from "./types";

const refresh = (id?: string) => {
  revalidatePath("/dashboard/locales", "layout");
  if (id) revalidatePath(`/dashboard/locales/${id}`);
};
const opt = (max = 200) => z.string().trim().max(max).optional().transform((v) => v || null);
const optUrl = z
  .string()
  .trim()
  .max(500)
  .optional()
  .refine((v) => !v || /^https:\/\//.test(v), "Debe empezar con https://")
  .transform((v) => v || null);
const optPhone = z
  .string()
  .trim()
  .max(30)
  .optional()
  .refine((v) => !v || normalizePhone(v), "Número no válido")
  .transform((v) => normalizePhone(v));
const bool = z
  .string()
  .optional()
  .transform((v) => v === "on");
const fail = (e: z.ZodError): ActionState => ({ fieldErrors: z.flattenError(e).fieldErrors });

// ───────── Locales ─────────
const createSchema = z.object({
  name: z.string().trim().min(2, "Requerido").max(80),
  slug: z.string().trim().toLowerCase().max(48).optional(),
  kind: z.enum(VENUE_KINDS.map((k) => k.value) as [string, ...string[]]),
  client_id: z.union([z.literal(""), z.uuid()]).optional().transform((v) => v || null),
  whatsapp: optPhone,
});

/** Crea el local con una carta vacía (no publicada) y lleva a su ficha para cargar la carta. */
export async function createVenue(_: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireStaff();
  const parsed = createSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(parsed.error);
  const slug = parsed.data.slug || slugify(parsed.data.name);
  if (!isValidSlug(slug)) return { fieldErrors: { slug: ["Solo minúsculas, números y guiones (2–48)"] } };

  const { data, error } = await supabase
    .from("venues")
    .insert({ ...parsed.data, slug })
    .select("id")
    .single();
  if (error || !data) return { error: error?.code === "23505" ? "Ese enlace ya está en uso: elige otro" : "No se pudo crear el local" };
  await supabase.from("automation_runs").insert({ flow: "H_carta", trigger: "panel", action: `crear local ${slug}`, status: "ok", ref_id: data.id });
  refresh();
  redirect(`/dashboard/locales/${data.id}`);
}

const updateSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(2, "Requerido").max(80),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .refine(isValidSlug, "Solo minúsculas, números y guiones (2–48)"),
  kind: z.enum(VENUE_KINDS.map((k) => k.value) as [string, ...string[]]),
  client_id: z.union([z.literal(""), z.uuid()]).optional().transform((v) => v || null),
  tagline: opt(160),
  whatsapp: optPhone,
  address: opt(200),
  district: opt(80),
  city: z.string().trim().min(2).max(80).default("Lima"),
  maps_url: optUrl,
  hours_text: opt(200),
  instagram: opt(120),
  tiktok: opt(120),
  google_review_url: optUrl,
  yape_number: optPhone,
  yape_name: opt(80),
  delivery_note: opt(200),
  accent_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color no válido"),
  accepts_orders: bool,
  accepts_reservations: bool,
  published: bool,
  notify_email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.union([z.literal(""), z.email("Correo no válido")]))
    .optional()
    .transform((v) => v || null),
  telegram_chat_id: z
    .string()
    .trim()
    .max(40)
    .optional()
    .refine((v) => !v || /^-?\d+$/.test(v), "El chat id de Telegram es un número")
    .transform((v) => v || null),
});

export async function updateVenue(_: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireStaff();
  const parsed = updateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(parsed.error);
  const { id, ...data } = parsed.data;
  if (data.published && data.accepts_orders && !data.whatsapp) {
    return { fieldErrors: { whatsapp: ["Para recibir pedidos publicados hace falta el WhatsApp del local"] } };
  }
  const { error } = await supabase.from("venues").update(data).eq("id", id);
  if (error) return { error: error.code === "23505" ? "Ese enlace ya está en uso: elige otro" : "No se pudo guardar" };
  refresh(id);
  revalidatePath(`/m/${data.slug}`);
  return { ok: true };
}

export async function deleteVenue(id: string) {
  const { supabase } = await requireStaff();
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return;
  await supabase.from("venues").delete().eq("id", parsed.data);
  refresh();
  redirect("/dashboard/locales");
}

/** Nuevo enlace privado para el dueño (el anterior deja de funcionar al instante). */
export async function rotateOwnerToken(id: string) {
  const { supabase } = await requireStaff();
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return;
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const token = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  await supabase.from("venues").update({ owner_token: token }).eq("id", parsed.data);
  refresh(parsed.data);
}

// ───────── Carta ─────────
export async function createCategory(venueId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireStaff();
  const parsed = z.object({ venue_id: z.uuid(), name: z.string().trim().min(2, "Requerido").max(60) }).safeParse({ venue_id: venueId, name: formData.get("name") });
  if (!parsed.success) return fail(parsed.error);
  const { count } = await supabase.from("menu_categories").select("id", { count: "exact", head: true }).eq("venue_id", venueId);
  const { error } = await supabase.from("menu_categories").insert({ ...parsed.data, position: count ?? 0 });
  if (error) return { error: "No se pudo crear la categoría" };
  refresh(venueId);
  return { ok: true };
}

export async function renameCategory(id: string, venueId: string, name: string) {
  const { supabase } = await requireStaff();
  const parsed = z.object({ id: z.uuid(), name: z.string().trim().min(2).max(60) }).safeParse({ id, name });
  if (!parsed.success) return;
  await supabase.from("menu_categories").update({ name: parsed.data.name }).eq("id", parsed.data.id);
  refresh(venueId);
}

/** Sube o baja una categoría intercambiando su posición con la vecina. */
export async function moveCategory(id: string, venueId: string, dir: 1 | -1) {
  const { supabase } = await requireStaff();
  if (!z.uuid().safeParse(id).success || !z.uuid().safeParse(venueId).success) return;
  const { data } = await supabase.from("menu_categories").select("id, position").eq("venue_id", venueId).order("position").order("created_at");
  const list = data ?? [];
  const i = list.findIndex((c) => c.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  await Promise.all(list.map((c, position) => supabase.from("menu_categories").update({ position }).eq("id", c.id)));
  refresh(venueId);
}

export async function deleteCategory(id: string, venueId: string) {
  const { supabase } = await requireStaff();
  if (!z.uuid().safeParse(id).success) return;
  await supabase.from("menu_categories").delete().eq("id", id);
  refresh(venueId);
}

const itemSchema = z.object({
  venue_id: z.uuid(),
  category_id: z.uuid("Elige una categoría"),
  name: z.string().trim().min(2, "Requerido").max(120),
  description: opt(300),
  price_pen: z.coerce.number().min(0, "Precio no válido").max(99_999),
  tags: z.array(z.enum(MENU_TAGS)).default([]),
  available: bool,
  image_url: optUrl,
});

const itemFromForm = (formData: FormData) => ({ ...Object.fromEntries(formData), tags: formData.getAll("tags") });

export async function saveMenuItem(_: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireStaff();
  const id = formData.get("id");
  const parsed = itemSchema.safeParse(itemFromForm(formData));
  if (!parsed.success) return fail(parsed.error);

  const photo = formData.get("photo");
  let image_url = parsed.data.image_url;
  if (photo instanceof File && photo.size > 0) {
    const uploaded = await uploadPhoto(parsed.data.venue_id, photo);
    if ("error" in uploaded) return { fieldErrors: { photo: [uploaded.error] } };
    image_url = uploaded.url;
  }

  const row = { ...parsed.data, image_url };
  const { error } =
    typeof id === "string" && id
      ? await supabase.from("menu_items").update(row).eq("id", id)
      : await supabase.from("menu_items").insert({
          ...row,
          position: (await supabase.from("menu_items").select("id", { count: "exact", head: true }).eq("category_id", row.category_id)).count ?? 0,
        });
  if (error) return { error: "No se pudo guardar el plato" };
  refresh(parsed.data.venue_id);
  return { ok: true };
}

/** Foto del plato a Supabase Storage (bucket público "menu", creado por la migración 0009). */
async function uploadPhoto(venueId: string, file: File): Promise<{ url: string } | { error: string }> {
  const types: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
  const ext = types[file.type];
  if (!ext) return { error: "Usa JPG, PNG o WebP" };
  if (file.size > 2 * 1024 * 1024) return { error: "Máximo 2 MB (comprime la foto antes)" };
  const admin = createAdminClient();
  const path = `${venueId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await admin.storage.from("menu").upload(path, file, { contentType: file.type, cacheControl: "31536000" });
  if (error) return { error: "No se pudo subir la foto (¿existe el bucket «menu»?)" };
  return { url: admin.storage.from("menu").getPublicUrl(path).data.publicUrl };
}

export async function toggleMenuItem(id: string, venueId: string, available: boolean) {
  const { supabase } = await requireStaff();
  if (!z.uuid().safeParse(id).success) return;
  await supabase.from("menu_items").update({ available }).eq("id", id);
  refresh(venueId);
}

export async function deleteMenuItem(id: string, venueId: string) {
  const { supabase } = await requireStaff();
  if (!z.uuid().safeParse(id).success) return;
  await supabase.from("menu_items").delete().eq("id", id);
  refresh(venueId);
}

/** Importa una carta pegada como texto (ver parseMenuText). Agrega; no borra lo que ya existe. */
export async function importMenuText(venueId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireStaff();
  if (!z.uuid().safeParse(venueId).success) return { error: "Local no válido" };
  const text = String(formData.get("text") ?? "").slice(0, 20_000);
  const { categories } = parseMenuText(text);
  if (!categories.length) return { error: "No encontré platos con precio. Revisa el formato del ejemplo." };
  return insertParsedMenu(supabase, venueId, categories);
}

/**
 * Carta con IA: desde una foto de la carta o texto desordenado (OCR, PDF copiado). La IA solo transcribe;
 * el resultado se revisa en la pestaña Carta antes de publicar.
 */
export async function importMenuWithAI(venueId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireStaff();
  if (!z.uuid().safeParse(venueId).success) return { error: "Local no válido" };
  if (!aiConfigured()) return { error: "Configura una IA (Gemini o Groq son gratis) en Configuración" };

  const text = String(formData.get("text") ?? "").trim().slice(0, 15_000);
  const photo = formData.get("photo");
  let image: { mime: string; base64: string } | undefined;
  if (photo instanceof File && photo.size > 0) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(photo.type)) return { fieldErrors: { photo: ["Usa JPG, PNG o WebP"] } };
    if (photo.size > 2.5 * 1024 * 1024) return { fieldErrors: { photo: ["Máximo 2.5 MB"] } };
    image = { mime: photo.type, base64: Buffer.from(await photo.arrayBuffer()).toString("base64") };
  }
  if (!text && !image) return { error: "Sube una foto de la carta o pega el texto" };

  const { count } = await supabase
    .from("automation_runs")
    .select("id", { count: "exact", head: true })
    .eq("flow", "H_carta_ia")
    .gte("created_at", limaStartOfDayISO());
  if ((count ?? 0) >= Number(process.env.AI_DAILY_LIMIT ?? 5) * 2) return { error: "Límite diario de uso de IA alcanzado" };

  try {
    const categories = await structureMenu({ text, image });
    if (!categories.length) throw new Error("no encontré platos con precio");
    await supabase.from("automation_runs").insert({ flow: "H_carta_ia", trigger: image ? "foto" : "texto", action: `transcribir ${categories.reduce((s, c) => s + c.items.length, 0)} platos`, status: "ok", ref_id: venueId });
    return insertParsedMenu(supabase, venueId, categories);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error desconocido";
    await supabase.from("automation_runs").insert({ flow: "H_carta_ia", trigger: image ? "foto" : "texto", action: "transcribir carta", status: "error", error: msg, ref_id: venueId });
    return { error: `No se pudo leer la carta (${msg}). Prueba con una foto más nítida o pega el texto.` };
  }
}

// No exportada a propósito: en un archivo "use server" todo export es un endpoint público.
async function insertParsedMenu(
  supabase: Awaited<ReturnType<typeof requireStaff>>["supabase"],
  venueId: string,
  categories: { name: string; items: { name: string; price: number; description: string | null }[] }[],
): Promise<ActionState> {
  const { data: existing } = await supabase.from("menu_categories").select("id, name, position").eq("venue_id", venueId);
  let position = existing?.length ?? 0;
  let added = 0;
  for (const cat of categories.slice(0, 40)) {
    let catId = existing?.find((c) => c.name.toLowerCase() === cat.name.toLowerCase())?.id;
    if (!catId) {
      const { data } = await supabase.from("menu_categories").insert({ venue_id: venueId, name: cat.name.slice(0, 60), position: position++ }).select("id").single();
      catId = data?.id;
    }
    if (!catId) continue;
    const rows = cat.items.slice(0, 200).map((it, i) => ({
      venue_id: venueId,
      category_id: catId,
      name: it.name.slice(0, 120),
      description: it.description,
      price_pen: Math.min(Math.max(it.price, 0), 99_999),
      position: i,
    }));
    const { error } = await supabase.from("menu_items").insert(rows);
    if (!error) added += rows.length;
  }
  await supabase.from("automation_runs").insert({ flow: "H_carta", trigger: "importar texto", action: `importar ${added} platos`, status: added ? "ok" : "error", ref_id: venueId });
  refresh(venueId);
  return added ? { ok: true } : { error: "No se pudo importar la carta" };
}

// ───────── Reservas (desde el panel del equipo) ─────────
export async function setReservationStatus(id: string, status: string) {
  const { supabase } = await requireStaff();
  const parsed = z
    .object({ id: z.uuid(), status: z.enum(RESERVATION_STATUS.map((s) => s.value) as [string, ...string[]]) })
    .safeParse({ id, status });
  if (!parsed.success) return;
  await supabase.from("reservations").update({ status: parsed.data.status }).eq("id", parsed.data.id);
  refresh();
}

/**
 * Pasa los números de la carta de un mes a Métricas del cliente (datos verificables, fuente: carta digital).
 * Visitas → reproducciones/vistas, clics de reseña → clics, pedidos por WhatsApp + reservas → leads.
 */
export async function recordVenueMetrics(venueId: string, month: string): Promise<ActionState> {
  const { supabase } = await requireStaff();
  const period = monthStart(month);
  if (!z.uuid().safeParse(venueId).success || !period) return { error: "Datos no válidos" };
  const { data: venue } = await supabase.from("venues").select("id, name, client_id").eq("id", venueId).single();
  if (!venue?.client_id) return { error: "Vincula el local a un cliente para registrar sus métricas" };

  const [y, m] = period.split("-").map(Number);
  const from = new Date(`${period}T00:00:00-05:00`).toISOString();
  const to = new Date(`${m === 12 ? y + 1 : y}-${String(m === 12 ? 1 : m + 1).padStart(2, "0")}-01T00:00:00-05:00`).toISOString();
  const { counts } = await venueStats(supabase, venueId, from, to);

  await supabase.from("metrics").delete().eq("client_id", venue.client_id).eq("period", period).eq("source", "Carta digital");
  const { error } = await supabase.from("metrics").insert({
    client_id: venue.client_id,
    period,
    views: counts.view,
    clicks: counts.review_click + counts.maps + counts.instagram + counts.call,
    leads: counts.whatsapp_order + counts.reservation,
    source: "Carta digital",
    notes: `${venue.name}: ${counts.view} visitas, ${counts.whatsapp_order} pedidos por WhatsApp, ${counts.reservation} reservas, ${counts.review_click} clics a reseñas (registrado el ${limaDate()}).`,
  });
  if (error) return { error: "No se pudieron guardar las métricas" };
  revalidatePath("/dashboard/metricas");
  return { ok: true };
}
