import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Usuario + perfil. Redirige a /login sin sesión, o a /pendiente si aún no fue aprobado. */
export const requireStaff = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role === "pending") redirect("/pendiente");
  return { supabase, user, profile };
});
