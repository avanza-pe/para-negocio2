"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Field, FormDialog, SelectField, TextField, type Option } from "@/components/form-bits";
import { createClientRecord, createDeliverable, createMetric, createProspect } from "@/lib/actions/crm";
import { SERVICES } from "@/lib/crm";

const CHANNELS: Option[] = [
  { value: "manual", label: "Manual" },
  { value: "instagram", label: "Instagram" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "referido", label: "Referido" },
  { value: "web", label: "Web" },
];

export function NewProspectDialog() {
  return (
    <FormDialog
      title="Nuevo prospecto"
      description="Define siempre una próxima acción."
      trigger="Nuevo prospecto"
      action={createProspect}
      successMessage="Prospecto guardado"
    >
      {(s) => (
        <>
          <TextField label="Empresa" name="company" required state={s} />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Sector" name="sector" state={s} />
            <TextField label="Ciudad" name="city" state={s} />
            <TextField label="Contacto" name="contact_name" state={s} />
            <TextField label="Correo" name="contact_email" type="email" state={s} />
            <TextField label="Teléfono" name="contact_phone" type="tel" state={s} />
            <SelectField label="Canal" name="channel" options={CHANNELS} defaultValue="manual" state={s} />
          </div>
          <TextField label="Web / redes" name="web_social" state={s} />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Próxima acción" name="next_action" state={s} />
            <TextField label="Fecha" name="next_action_at" type="date" state={s} />
          </div>
          <Field label="Notas" name="notes">
            <Textarea id="notes" name="notes" rows={2} />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox name="consent" /> Hay base legal / consentimiento para contactarlo
          </label>
        </>
      )}
    </FormDialog>
  );
}

export function NewClientDialog() {
  return (
    <FormDialog
      title="Nuevo cliente"
      trigger="Nuevo cliente"
      action={createClientRecord}
      successMessage="Cliente guardado"
    >
      {(s) => (
        <>
          <TextField label="Nombre" name="name" required state={s} />
          <TextField label="Contacto" name="contact" state={s} />
          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="Servicio"
              name="service"
              options={SERVICES.map((v) => ({ value: v, label: v }))}
              state={s}
            />
            <TextField label="Precio mensual (S/)" name="price_pen" type="number" min="0" step="1" defaultValue="0" state={s} />
            <TextField label="Inicio" name="start_date" type="date" state={s} />
            <TextField label="Renovación" name="renewal_date" type="date" state={s} />
          </div>
          <TextField label="Carpeta (Drive)" name="folder_url" type="url" state={s} />
          <TextField label="Responsable" name="owner" state={s} />
        </>
      )}
    </FormDialog>
  );
}

export function NewDeliverableDialog({ clients }: { clients: Option[] }) {
  return (
    <FormDialog
      title="Nueva entrega"
      trigger="Nueva entrega"
      action={createDeliverable}
      successMessage="Entrega guardada"
    >
      {(s) => (
        <>
          <SelectField label="Cliente" name="client_id" options={clients} state={s} />
          <TextField label="Pieza" name="piece" required state={s} />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Formato" name="format" placeholder="Post, Reel…" state={s} />
            <TextField label="Fecha límite" name="due_date" type="date" state={s} />
            <TextField label="Revisiones restantes" name="revisions_left" type="number" min="0" defaultValue="1" state={s} />
            <TextField label="Enlace" name="link" type="url" state={s} />
          </div>
        </>
      )}
    </FormDialog>
  );
}

export function NewMetricDialog({ clients }: { clients: Option[] }) {
  return (
    <FormDialog
      title="Registrar métricas"
      description="Solo datos verificables. Si no tienes el dato, déjalo vacío."
      trigger="Registrar métricas"
      action={createMetric}
      successMessage="Métricas guardadas"
    >
      {(s) => (
        <>
          <SelectField label="Cliente" name="client_id" options={clients} state={s} />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Periodo (mes)" name="period" type="date" required state={s} />
            <TextField label="Publicaciones" name="posts" type="number" min="0" state={s} />
            <TextField label="Alcance" name="reach" type="number" min="0" state={s} />
            <TextField label="Reproducciones" name="views" type="number" min="0" state={s} />
            <TextField label="Clics" name="clicks" type="number" min="0" state={s} />
            <TextField label="Leads / consultas" name="leads" type="number" min="0" state={s} />
          </div>
          <TextField label="Fuente de datos" name="source" placeholder="Meta Business Suite, GA4…" state={s} />
          <TextField label="Observaciones" name="notes" state={s} />
        </>
      )}
    </FormDialog>
  );
}
