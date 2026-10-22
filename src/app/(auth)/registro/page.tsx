import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = { title: "Crear cuenta", robots: { index: false } };

export default function SignupPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Crear cuenta</CardTitle>
          <CardDescription>La primera cuenta es administradora. Las demás esperan aprobación.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
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
