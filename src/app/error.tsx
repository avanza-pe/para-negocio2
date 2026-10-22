"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center p-6 text-center">
      <div className="grid justify-items-center gap-4">
        <h1 className="text-2xl font-semibold">Algo salió mal</h1>
        <p className="max-w-sm text-muted-foreground">Ocurrió un error inesperado. Intenta de nuevo; si sigue pasando, escríbenos.</p>
        <Button className="rounded-full" onClick={reset}>
          Reintentar
        </Button>
      </div>
    </main>
  );
}
