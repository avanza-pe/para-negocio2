import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleButton } from "@/components/google-button";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = { title: "Crear cuenta", robots: { index: false } };

export default function SignupPage() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden p-4">
      <div className="bg-grid absolute inset-0 -z-10" aria-hidden />
      <div className="glow absolute left-1/2 top-0 -z-10 h-72 w-[36rem] -translate-x-1/2 opacity-60 blur-3xl" aria-hidden />
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader>
          <CardTitle>Crear cuenta</CardTitle>
          <CardDescription>La primera cuenta es administradora. Las demás esperan aprobación.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <GoogleButton />
          <SignupForm />
          <p className="text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="underline underline-offset-2">
              Ingresar
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
