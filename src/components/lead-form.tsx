"use client";

import { useActionState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Field, SubmitButton, TextField } from "@/components/form-bits";
import { submitLead } from "@/lib/actions/leads";

export function LeadForm({ interest, defaultSector, submitLabel = "Solicitar propuesta" }: { interest?: string; defaultSector?: string; submitLabel?: string }) {
  const [state, formAction, pending] = useActionState(submitLead, {});

  return (
    <form action={formAction} className="grid gap-4" noValidate>
      {interest && <input type="hidden" name="interest" value={interest} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Tu nombre" name="contact_name" autoComplete="name" required state={state} />
        <TextField label="Tu negocio" name="company" autoComplete="organization" required state={state} />
        <TextField label="Correo" name="contact_email" type="email" autoComplete="email" required state={state} />
        <TextField label="WhatsApp (opcional)" name="contact_phone" type="tel" autoComplete="tel" state={state} />
      </div>
      <TextField label="Rubro (opcional)" name="sector" placeholder="Ej. restaurante, cafetería, tienda…" defaultValue={defaultSector} state={state} />
      <Field label="¿Qué quieres lograr? (opcional)" name="message" error={state.fieldErrors?.message}>
        <Textarea id="message" name="message" rows={3} maxLength={1000} />
      </Field>

      {/* Honeypot: invisible para personas, los bots lo llenan. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          No llenar
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-1.5">
        <label className="flex items-start gap-2 text-sm text-muted-foreground">
          <Checkbox name="consent" className="mt-0.5" />
          <span>
            Acepto que usen mis datos para responder esta consulta, según la{" "}
            <a href="/privacidad" className="underline underline-offset-2">
              política de privacidad
            </a>
            .
          </span>
        </label>
        {state.fieldErrors?.consent && (
          <p role="alert" className="text-xs text-destructive">
            {state.fieldErrors.consent[0]}
          </p>
        )}
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <SubmitButton pending={pending} className="h-10 w-full sm:w-auto">
        {submitLabel}
      </SubmitButton>
    </form>
  );
}
