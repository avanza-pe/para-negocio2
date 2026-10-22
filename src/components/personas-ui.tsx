"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2, Pencil, Sparkles, UtensilsCrossed } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DeleteButton, Field, FormDialog, TextField } from "@/components/form-bits";
import { addGastroPersonas, deletePersona, savePersona, suggestPersonasAI } from "@/lib/actions/personas";
import type { ActionState } from "@/lib/actions/types";
import type { Persona } from "@/lib/crm";

const FIELDS: { name: keyof Persona; label: string; placeholder: string }[] = [
  { name: "profile", label: "Perfil", placeholder: "Edad, ocupación, zona, presupuesto" },
  { name: "goals", label: "Qué busca", placeholder: "Comer rápido y rico en su hora de almuerzo" },
  { name: "pains", label: "Qué le frena", placeholder: "Colas, no saber el menú antes" },
  { name: "channels", label: "Dónde está", placeholder: "WhatsApp, Instagram, Google Maps" },
  { name: "objections", label: "Objeciones", placeholder: "Precio frente a la competencia" },
  { name: "message", label: "Mensaje que le funciona", placeholder: "Tu menú de hoy en WhatsApp a las 11:00" },
];

export function PersonaDialog({ clientId, persona }: { clientId: string; persona?: Persona }) {
  return (
    <FormDialog
      title={persona ? `Editar ${persona.name}` : "Nueva buyer persona"}
      description="Describe a un tipo de cliente real del negocio. Se usa en el prompt de producción."
      trigger={persona ? `Editar ${persona.name}` : "Persona"}
      icon={persona ? <Pencil /> : undefined}
      compact={!persona}
      action={savePersona}
      successMessage="Persona guardada"
    >
      {(s: ActionState) => (
        <>
          <input type="hidden" name="client_id" value={clientId} />
          {persona && <input type="hidden" name="id" value={persona.id} />}
          <TextField label="Nombre descriptivo" name="name" required defaultValue={persona?.name} placeholder="Oficinista del menú del día" state={s} />
          {FIELDS.map((f) => (
            <Field key={f.name} label={f.label} name={f.name} error={s.fieldErrors?.[f.name]}>
              <Textarea id={f.name} name={f.name} rows={2} maxLength={500} placeholder={f.placeholder} defaultValue={(persona?.[f.name] as string | null) ?? ""} />
            </Field>
          ))}
        </>
      )}
    </FormDialog>
  );
}

function ActionButton({ action, icon, children, okMessage, disabled, title }: { action: () => Promise<ActionState>; icon: React.ReactNode; children: React.ReactNode; okMessage: string; disabled?: boolean; title?: string }) {
  const [pending, start] = React.useTransition();
  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending || disabled}
      title={title}
      onClick={() =>
        start(async () => {
          const res = await action();
          if (res.ok) toast.success(okMessage);
          else toast.error(res.error ?? "No se pudo");
        })
      }
    >
      {pending ? <Loader2 className="animate-spin" /> : icon} {children}
    </Button>
  );
}

export function PersonasToolbar({ clientId, aiEnabled, gastro }: { clientId: string; aiEnabled: boolean; gastro: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      <PersonaDialog clientId={clientId} />
      {gastro && (
        <ActionButton action={() => addGastroPersonas(clientId)} icon={<UtensilsCrossed />} okMessage="Plantillas agregadas: ajústalas con el dueño">
          Plantillas gastronomía
        </ActionButton>
      )}
      <ActionButton
        action={() => suggestPersonasAI(clientId)}
        icon={<Sparkles />}
        okMessage="Personas sugeridas: revísalas"
        disabled={!aiEnabled}
        title={aiEnabled ? undefined : "Configura una IA gratis (Gemini o Groq) para activarlo"}
      >
        Sugerir con IA
      </ActionButton>
    </div>
  );
}

export function PersonaCard({ persona, clientId }: { persona: Persona; clientId: string }) {
  return (
    <div className="grid gap-2 rounded-xl border p-3 text-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium">
          {persona.name} {persona.ai_generated && <Badge variant="outline">IA · revisar</Badge>}
        </p>
        <div className="flex">
          <PersonaDialog clientId={clientId} persona={persona} />
          <DeleteButton action={deletePersona.bind(null, persona.id, clientId)} label={`Eliminar ${persona.name}`} confirm={`¿Eliminar la persona «${persona.name}»?`} />
        </div>
      </div>
      <dl className="grid gap-1 text-xs">
        {FIELDS.filter((f) => persona[f.name]).map((f) => (
          <div key={f.name}>
            <dt className="inline font-medium">{f.label}: </dt>
            <dd className="inline text-muted-foreground">{persona[f.name] as string}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
