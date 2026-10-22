import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Ingresar", robots: { index: false } };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, error } = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
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
