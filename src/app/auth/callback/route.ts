import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Destino del inicio de sesión con Google (OAuth con PKCE).
// Si algo falla, vuelve al login con el motivo (texto corto y no sensible) para poder diagnosticarlo.
const motivo = (m: string) => `/login?error=google&motivo=${encodeURIComponent(m.slice(0, 140))}`;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  // Google o Supabase pueden volver con error (acceso denegado, app en modo prueba, etc.).
  const providerError = params.get("error_description") ?? params.get("error");
  if (providerError) redirect(motivo(providerError));

  const code = params.get("code");
  if (!code) redirect(motivo("Falta el código de autorización"));

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) redirect(motivo(error.message));
  redirect("/dashboard");
}
