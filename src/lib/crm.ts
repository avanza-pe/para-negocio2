export const STAGES = [
  { value: "nuevo", label: "Nuevo" },
  { value: "investigado", label: "Investigado" },
  { value: "contactado", label: "Contactado" },
  { value: "respondio", label: "Respondió" },
  { value: "reunion_agendada", label: "Reunión agendada" },
  { value: "propuesta_enviada", label: "Propuesta enviada" },
  { value: "ganado", label: "Ganado" },
  { value: "perdido", label: "Perdido" },
  { value: "seguimiento_futuro", label: "Seguimiento futuro" },
] as const;

export const DELIVERABLE_STATUS = [
  { value: "pendiente", label: "Pendiente" },
  { value: "en_produccion", label: "En producción" },
  { value: "en_revision", label: "En revisión" },
  { value: "aprobado", label: "Aprobado" },
  { value: "entregado", label: "Entregado" },
] as const;

export const PAYMENT_STATUS = [
  { value: "pendiente", label: "Pendiente" },
  { value: "pagado", label: "Pagado" },
  { value: "vencido", label: "Vencido" },
] as const;

export const MEETING_STATUS = [
  { value: "programada", label: "Programada" },
  { value: "realizada", label: "Realizada" },
  { value: "cancelada", label: "Cancelada" },
  { value: "no_asistio", label: "No asistió" },
] as const;

/** Checklist de onboarding (flujo C). Nada se envía solo: cada punto lo marca una persona. */
export const ONBOARDING_CHECKLIST = [
  "Confirmar el primer pago (transferencia, Yape o Plin)",
  "Crear carpeta del cliente en Drive desde la plantilla",
  "Enviar el brief al cliente y completarlo aquí",
  "Pedir accesos con permisos mínimos (nunca contraseñas personales)",
  "Revisar a mano cualquier contrato o promesa antes de enviarlo",
  "Agendar la reunión de arranque",
  "Definir los 3 pilares de contenido",
  "Crear las primeras entregas en el panel",
] as const;

export const CONTENT_STATUS = [
  { value: "borrador", label: "Borrador" },
  { value: "en_revision", label: "En revisión" },
  { value: "aprobado", label: "Aprobado" },
  { value: "publicado", label: "Publicado" },
  { value: "descartado", label: "Descartado" },
] as const;

export const REPORT_STATUS = [
  { value: "borrador", label: "Borrador" },
  { value: "aprobado", label: "Aprobado" },
  { value: "enviado", label: "Enviado" },
] as const;

export const PROPOSAL_STATUS = [
  { value: "borrador", label: "Borrador" },
  { value: "enviada", label: "Enviada" },
  { value: "aceptada", label: "Aceptada" },
  { value: "rechazada", label: "Rechazada" },
] as const;

export type Proposal = {
  id: string;
  prospect_id: string | null;
  client_name: string;
  title: string;
  package: string;
  price_pen: number;
  price_unit: string;
  validity_days: number;
  includes: string;
  exclusions: string;
  client_materials: string | null;
  revisions: number;
  timeline: string | null;
  payment_terms: string;
  notes: string | null;
  status: string;
  created_at: string;
};

export const SERVICES = [
  "Contenido Inicio",
  "Contenido + Reels",
  "Campaña creativa puntual",
  "Automatización básica",
  "Landing comercial",
] as const;

export const label = (list: readonly { value: string; label: string }[], v: string) =>
  list.find((i) => i.value === v)?.label ?? v;

export type Prospect = {
  id: string;
  company: string;
  sector: string | null;
  city: string | null;
  web_social: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  channel: string;
  stage: string;
  next_action: string | null;
  next_action_at: string | null;
  consent: boolean;
  notes: string | null;
  message: string | null;
  created_at: string;
};

export type Meeting = {
  id: string;
  prospect_id: string;
  starts_at: string;
  status: string;
  source: string;
  notes: string | null;
  prospects?: { company: string; contact_name: string | null } | null;
};

export type OnboardingTask = { id: string; title: string; done: boolean; position: number };

export type ClientBrief = {
  client_id: string;
  sector: string | null;
  audience: string | null;
  offer: string | null;
  tone: string | null;
  differentiators: string | null;
  location: string | null;
  cta: string | null;
  references_text: string | null;
  restrictions: string | null;
  approver: string | null;
  access_notes: string | null;
};

export type ContentItem = {
  id: string;
  client_id: string;
  pillar: string | null;
  format: string | null;
  objective: string | null;
  visual_idea: string | null;
  hook: string | null;
  copy: string | null;
  cta: string | null;
  metric: string | null;
  scheduled_for: string | null;
  status: string;
  ai_generated: boolean;
};

export type Client = {
  id: string;
  name: string;
  contact: string | null;
  service: string;
  price_pen: number;
  start_date: string | null;
  renewal_date: string | null;
  payment_status: string;
  folder_url: string | null;
  owner: string | null;
};

export type Deliverable = {
  id: string;
  client_id: string;
  piece: string;
  format: string | null;
  due_date: string | null;
  status: string;
  link: string | null;
  revisions_left: number;
  clients?: { name: string } | null;
};

export type Metric = {
  id: string;
  client_id: string;
  period: string;
  posts: number | null;
  reach: number | null;
  views: number | null;
  clicks: number | null;
  leads: number | null;
  source: string | null;
  notes: string | null;
  clients?: { name: string } | null;
};

export type AutomationRun = {
  id: string;
  flow: string;
  trigger: string | null;
  action: string | null;
  status: string;
  error: string | null;
  created_at: string;
};
