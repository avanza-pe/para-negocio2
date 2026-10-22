import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleButton } from "@/components/google-button";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Ingresar", robots: { index: false } };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, error } = await searchParams;
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden p-4">
      <div className="bg-grid absolute inset-0 -z-10" aria-hidden />
      <div className="glow absolute left-1/2 top-0 -z-10 h-72 w-[36rem] -translate-x-1/2 opacity-60 blur-3xl" aria-hidden />
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader>
          <CardTitle>Ingresar al panel</CardTitle>
          <CardDescription>Acceso solo para el equipo.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {error === "confirmacion" && (
            <p role="alert" className="text-sm text-destructive">
              El enlace de confirmación no es válido o venció. Intenta ingresar de nuevo.
            </p>
          )}
          {error === "google" && (
            <p role="alert" className="text-sm text-destructive">
              No se pudo ingresar con Google. Intenta de nuevo.
            </p>
          )}
          <GoogleButton />
          <LoginForm next={typeof next === "string" ? next : undefined} />
          <p className="text-center text-sm text-muted-foreground">
            ¿Sin cuenta?{" "}
            <Link href="/registro" className="underline underline-offset-2">
              Regístrate
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
