import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { logout } from "@/lib/actions/auth";

export const metadata: Metadata = { title: "Cuenta pendiente", robots: { index: false } };

export default function PendingPage() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden p-4">
      <div className="bg-grid absolute inset-0 -z-10" aria-hidden />
      <div className="glow absolute left-1/2 top-0 -z-10 h-72 w-[36rem] -translate-x-1/2 opacity-60 blur-3xl" aria-hidden />
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader>
          <CardTitle>Cuenta pendiente de aprobación</CardTitle>
          <CardDescription>
            Un administrador debe activar tu acceso (cambiar tu rol a member en la tabla profiles).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={logout}>
            <Button type="submit" variant="outline" className="w-full">
              Cerrar sesión
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
