"use client";

import * as React from "react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Field, SubmitButton, TextField } from "@/components/form-bits";
import { saveBrief, setTaskDone } from "@/lib/actions/onboarding";
import type { ClientBrief, OnboardingTask } from "@/lib/crm";

export function TaskList({ tasks }: { tasks: OnboardingTask[] }) {
  const [pending, start] = React.useTransition();
  return (
    <ul className="grid gap-2">
      {tasks.map((t) => (
        <li key={t.id}>
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm hover:bg-muted/50">
            <Checkbox
              checked={t.done}
              disabled={pending}
              onCheckedChange={(v) => start(() => setTaskDone(t.id, v === true))}
              className="mt-0.5"
            />
            <span className={t.done ? "text-muted-foreground line-through" : undefined}>{t.title}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}

const FIELDS: { name: keyof ClientBrief; label: string; long?: boolean }[] = [
  { name: "sector", label: "Sector" },
  { name: "audience", label: "Público objetivo", long: true },
  { name: "offer", label: "Oferta principal", long: true },
  { name: "tone", label: "Tono de marca" },
  { name: "differentiators", label: "Diferenciadores", long: true },
  { name: "location", label: "Ubicación" },
  { name: "cta", label: "CTA principal" },
  { name: "references_text", label: "Referencias visuales (enlaces)", long: true },
  { name: "restrictions", label: "Restricciones (lo que NO se puede decir/mostrar)", long: true },
  { name: "approver", label: "Quién aprueba el contenido" },
  { name: "access_notes", label: "Accesos solicitados (nunca escribas contraseñas)", long: true },
];

export function BriefForm({ clientId, brief }: { clientId: string; brief: ClientBrief | null }) {
  const [state, action, pending] = React.useActionState(saveBrief, {});
  const handled = React.useRef(state);
  React.useEffect(() => {
    if (state !== handled.current && state.ok) {
      handled.current = state;
      toast.success("Brief guardado");
    }
  }, [state]);

  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="client_id" value={clientId} />
      {FIELDS.map((f) =>
        f.long ? (
          <Field key={f.name} label={f.label} name={f.name} error={state.fieldErrors?.[f.name]} className="sm:col-span-2">
            <Textarea id={f.name} name={f.name} rows={2} defaultValue={(brief?.[f.name] as string | null) ?? ""} />
          </Field>
        ) : (
          <TextField key={f.name} label={f.label} name={f.name} defaultValue={(brief?.[f.name] as string | null) ?? ""} state={state} />
        ),
      )}
      {state.error && (
        <p role="alert" className="text-sm text-destructive sm:col-span-2">
          {state.error}
        </p>
      )}
      <div className="sm:col-span-2">
        <SubmitButton pending={pending}>Guardar brief</SubmitButton>
      </div>
    </form>
  );
}
