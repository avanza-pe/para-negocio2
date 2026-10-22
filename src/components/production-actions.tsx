"use client";

import * as React from "react";
import { toast } from "sonner";
import { Check, Copy, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateCalendar } from "@/lib/actions/content";

export function GenerateButton({ clientId, enabled }: { clientId: string; enabled: boolean }) {
  const [pending, start] = React.useTransition();
  return (
    <Button
      disabled={pending || !enabled}
      title={enabled ? undefined : "Configura ANTHROPIC_API_KEY para activar la generación"}
      onClick={() =>
        start(async () => {
          const res = await generateCalendar(clientId);
          if (res.ok) toast.success("Borrador generado. Revísalo y apruébalo.");
          else toast.error(res.error ?? "No se pudo generar");
        })
      }
    >
      {pending ? <Loader2 className="animate-spin" /> : <Sparkles />} Generar con IA
    </Button>
  );
}

export function CopyPromptButton({ prompt }: { prompt: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <Button
      variant="outline"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(prompt);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          toast.error("No se pudo copiar");
        }
      }}
    >
      {copied ? <Check /> : <Copy />} {copied ? "Copiado" : "Copiar prompt"}
    </Button>
  );
}
