"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireStaff } from "@/lib/auth";

/** Solo un admin puede cambiar roles, y nadie puede cambiar el suyo (evita quedarse sin admin). */
export async function setUserRole(id: string, role: string) {
  const { supabase, user, profile } = await requireStaff();
  if (profile.role !== "admin") return;
  const parsed = z.object({ id: z.uuid(), role: z.enum(["admin", "member", "pending"]) }).safeParse({ id, role });
  if (!parsed.success || parsed.data.id === user.id) return;
  await supabase.from("profiles").update({ role: parsed.data.role }).eq("id", parsed.data.id);
  revalidatePath("/dashboard", "layout");
}
