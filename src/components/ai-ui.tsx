"use client";

import * as React from "react";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, SubmitButton } from "@/components/form-bits";
import { importMenuWithAI } from "@/lib/actions/venues";

/** Carta con IA: foto de la carta impresa (o texto desordenado) → categorías y platos. */
export function AiMenuDialog({ venueId, enabled }: { venueId: string; enabled: boolean }) {
  const [open, setOpen] = React.useState(false);
  const [state, action, pending] = React.useActionState(importMenuWithAI.bind(null, venueId), {});
  const handled = React.useRef(state);
  React.useEffect(() => {
    if (state !== handled.current && state.ok) {
      handled.current = state;
      setOpen(false);
      toast.success("Carta transcrita. Revisa precios y nombres antes de publicar.");
    }
  }, [state]);

  if (!enabled) {
    return (
      <Button variant="outline" size="sm" disabled title="Configura GEMINI_API_KEY o GROQ_API_KEY (gratis) para activarlo">
        <Sparkles /> Carta con IA
      </Button>
    );
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Sparkles /> Carta con IA
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Transcribir carta con IA</DialogTitle>
          <DialogDescription>Sube una foto nítida de la carta o pega el texto como venga. La IA solo transcribe: revisa todo antes de publicar.</DialogDescription>
        </DialogHeader>
        <form action={action} className="grid gap-3">
          <Field label="Foto de la carta (JPG/PNG/WebP, máx. 2.5 MB)" name="photo" error={state.fieldErrors?.photo}>
            <Input id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" />
          </Field>
          <Field label="…o texto de la carta" name="text">
            <Textarea id="text" name="text" rows={6} placeholder="Pega aquí el texto copiado del PDF o de WhatsApp" />
          </Field>
          <p className="text-xs text-muted-foreground">No subas fotos con datos personales. En los planes gratis el proveedor de IA puede usar el contenido para mejorar sus modelos.</p>
          {state.error && (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          )}
          <SubmitButton pending={pending} className="w-fit">
            <Sparkles /> {pending ? "Leyendo la carta…" : "Transcribir"}
          </SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
