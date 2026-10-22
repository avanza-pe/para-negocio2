import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { logout } from "@/lib/actions/auth";

export const metadata: Metadata = { title: "Cuenta pendiente", robots: { index: false } };

export default function PendingPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
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
