import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Usuario + perfil. Redirige a /login sin sesión, o a /pendiente si aún no fue aprobado.
 * Rendimiento: la verificación del usuario (getUser, red) y la lectura del perfil corren en paralelo,
 * y `cache` evita repetirlo entre layout y página dentro de la misma petición.
 */
export const requireStaff = cache(async () => {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession(); // solo lee la cookie, sin red
  if (!session) redirect("/login");

  const [{ data: userData }, { data: profile }] = await Promise.all([
    supabase.auth.getUser(), // verificación real contra Supabase Auth
    supabase.from("profiles").select("full_name, role").eq("id", session.user.id).single(),
  ]);
  const user = userData.user;
  if (!user || user.id !== session.user.id) redirect("/login");
  if (!profile || profile.role === "pending") redirect("/pendiente");
  return { supabase, user, profile };
});
