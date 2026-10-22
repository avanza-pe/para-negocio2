"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { publicEnv } from "@/lib/env";
import type { ActionState } from "./types";

const credentials = z.object({
  email: z.string().trim().toLowerCase().email("Correo no válido"),
  password: z.string().min(8, "Mínimo 8 caracteres").max(72),
});

// Solo rutas internas, para evitar open-redirect.
const safeNext = (v: FormDataEntryValue | null) =>
  typeof v === "string" && v.startsWith("/dashboard") ? v : "/dashboard";

export async function login(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = credentials.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: "Correo o contraseña incorrectos" };
  redirect(safeNext(formData.get("next")));
}

export async function signup(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = credentials
    .extend({ full_name: z.string().trim().min(2, "Escribe tu nombre").max(80) })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.full_name },
      emailRedirectTo: `${publicEnv.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
    },
  });
  if (error) return { error: "No se pudo crear la cuenta. Intenta con otro correo." };
  if (data.session) redirect("/dashboard");
  return { ok: true };
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${publicEnv.NEXT_PUBLIC_SITE_URL}/auth/callback` },
  });
  if (error || !data.url) redirect("/login?error=google");
  redirect(data.url);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
