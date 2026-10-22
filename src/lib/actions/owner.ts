"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { RESERVATION_STATUS } from "@/lib/crm";
import { getVenueByOwnerToken } from "@/lib/venues";

// Panel del dueño (/panel/<token>): sin cuenta, el enlace privado ES la credencial. Cada acción
// resuelve el local desde el token y solo toca filas de ESE local (venue_id en el filtro).

export async function ownerSetReservation(token: string, id: string, status: string) {
  const found = await getVenueByOwnerToken(token);
  const parsed = z
    .object({ id: z.uuid(), status: z.enum(RESERVATION_STATUS.map((s) => s.value) as [string, ...string[]]) })
    .safeParse({ id, status });
  if (!found || !parsed.success) return;
  await found.db.from("reservations").update({ status: parsed.data.status }).eq("id", parsed.data.id).eq("venue_id", found.venue.id);
  revalidatePath(`/panel/${token}`);
}

export async function ownerToggleItem(token: string, id: string, available: boolean) {
  const found = await getVenueByOwnerToken(token);
  if (!found || !z.uuid().safeParse(id).success) return;
  await found.db.from("menu_items").update({ available: Boolean(available) }).eq("id", id).eq("venue_id", found.venue.id);
  revalidatePath(`/panel/${token}`);
  revalidatePath(`/m/${found.venue.slug}`);
}

export async function ownerSetPrice(token: string, id: string, price: number) {
  const found = await getVenueByOwnerToken(token);
  const parsed = z.object({ id: z.uuid(), price: z.number().min(0).max(99_999) }).safeParse({ id, price });
  if (!found || !parsed.success) return;
  await found.db.from("menu_items").update({ price_pen: parsed.data.price }).eq("id", parsed.data.id).eq("venue_id", found.venue.id);
  revalidatePath(`/panel/${token}`);
  revalidatePath(`/m/${found.venue.slug}`);
}
