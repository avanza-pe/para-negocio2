"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Field, FormDialog, SelectField, TextField, type Option } from "@/components/form-bits";
import { createClientRecord, createDeliverable, createMetric, createProspect } from "@/lib/actions/crm";
import { createContentItem } from "@/lib/actions/content";
import { createMeeting } from "@/lib/actions/meetings";
import { generateReport } from "@/lib/actions/reports";
import { convertToClient } from "@/lib/actions/onboarding";
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

export function NewMeetingDialog({ prospects }: { prospects: Option[] }) {
  return (
    <FormDialog
      title="Nueva reunión"
      description="Hora de Lima. El prospecto pasa a Reunión agendada."
      trigger="Nueva reunión"
      action={createMeeting}
      successMessage="Reunión guardada"
    >
      {(s) => (
        <>
          <SelectField label="Prospecto" name="prospect_id" options={prospects} state={s} />
          <TextField label="Fecha y hora" name="starts_at" type="datetime-local" required state={s} />
          <TextField label="Notas" name="notes" state={s} />
        </>
      )}
    </FormDialog>
  );
}

export function ConvertToClientDialog({ prospectId, company }: { prospectId: string; company: string }) {
  return (
    <FormDialog
      title={`Convertir en cliente: ${company}`}
      description="Crea el cliente, su checklist de onboarding y un brief vacío. No envía nada al cliente."
      trigger="Convertir en cliente"
      action={convertToClient}
      successMessage="Cliente creado"
      compact
    >
      {(s) => (
        <>
          <input type="hidden" name="prospect_id" value={prospectId} />
          <SelectField label="Servicio" name="service" options={SERVICES.map((v) => ({ value: v, label: v }))} state={s} />
          <TextField label="Precio acordado (S/)" name="price_pen" type="number" min="0" step="1" defaultValue="0" state={s} />
        </>
      )}
    </FormDialog>
  );
}

export function NewContentDialog({ clients, defaultClient }: { clients: Option[]; defaultClient?: string }) {
  return (
    <FormDialog
      title="Nuevo contenido"
      description="Queda como borrador hasta que una persona lo apruebe."
      trigger="Nuevo contenido"
      action={createContentItem}
      successMessage="Contenido guardado"
    >
      {(s) => (
        <>
          <SelectField label="Cliente" name="client_id" options={clients} defaultValue={defaultClient} state={s} />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Pilar" name="pillar" state={s} />
            <TextField label="Formato" name="format" placeholder="Reel, post, story…" state={s} />
            <TextField label="Fecha programada" name="scheduled_for" type="date" state={s} />
            <TextField label="Métrica" name="metric" state={s} />
          </div>
          <TextField label="Objetivo" name="objective" state={s} />
          <TextField label="Hook" name="hook" state={s} />
          <Field label="Copy" name="copy">
            <Textarea id="copy" name="copy" rows={3} />
          </Field>
          <TextField label="CTA" name="cta" state={s} />
        </>
      )}
    </FormDialog>
  );
}

export function NewReportDialog({ clients }: { clients: Option[] }) {
  return (
    <FormDialog
      title="Generar borrador"
      description="Se arma con las métricas registradas del mes. Lo que falte queda como «sin dato»."
      trigger="Generar reporte"
      action={generateReport}
      successMessage="Borrador generado"
    >
      {(s) => (
        <>
          <SelectField label="Cliente" name="client_id" options={clients} state={s} />
          <TextField label="Mes" name="period" type="month" required state={s} />
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
