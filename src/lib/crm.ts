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
