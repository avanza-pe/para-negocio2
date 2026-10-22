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

/** Pasos extra cuando el cliente es un restaurante, cafetería o similar. */
export const GASTRO_ONBOARDING = [
  "Recibir la carta actual con precios (foto o PDF) y cargarla en Locales",
  "Confirmar WhatsApp de pedidos, horarios, delivery y número de Yape",
  "Pedir el enlace de reseñas de Google (Perfil de empresa → Pedir reseñas)",
  "Publicar la carta, imprimir el QR para mesas y probar un pedido de punta a punta",
  "Enviar al dueño su enlace privado del panel (reservas y «agotado»)",
] as const;

const GASTRO_RE = /(restaurant|caf[eé]|pasteler|panader|\bbar\b|jugu|poller|cevicher|chifa|pizzer|sangu|brasa|dark kitchen|comida)/i;
/** ¿Es un negocio gastronómico? (por rubro libre o por el servicio contratado) */
export const isGastro = (sector: string | null | undefined, service?: string | null) =>
  ["Carta digital", "Restaurante Pro", "Google y reseñas"].includes(service ?? "") ||
  GASTRO_RE.test(sector ?? "");

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

export { SERVICES } from "@/lib/offer";

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
  lost_reason: string | null;
  last_interaction_at: string | null;
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
  contact_email: string | null;
  contact_phone: string | null;
  sector: string | null;
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

/** Canales de origen de un prospecto. */
export const CHANNELS = [
  { value: "manual", label: "Manual" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "google_maps", label: "Google Maps" },
  { value: "visita", label: "Visita al local" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "referido", label: "Referido" },
  { value: "web", label: "Web" },
  { value: "calendly", label: "Calendly" },
  { value: "calcom", label: "Cal.com" },
] as const;

/** Rubros sugeridos (el foco comercial está en gastronomía). */
export const SECTORS = ["Restaurante", "Cafetería", "Pastelería", "Bar", "Juguería", "Dark kitchen", "Pollería", "Cevichería", "Clínica", "Tienda", "Otro"] as const;

// ───────── Cobros (flujo G) ─────────
export const PAY_STATUS = [
  { value: "pendiente", label: "Pendiente" },
  { value: "pagado", label: "Pagado" },
  { value: "rechazado", label: "Rechazado" },
  { value: "cancelado", label: "Cancelado" },
  { value: "reembolsado", label: "Reembolsado" },
] as const;

export const PAY_METHODS = [
  { value: "yape_mp", label: "Yape (Mercado Pago)" },
  { value: "mercadopago", label: "Mercado Pago" },
  { value: "yape", label: "Yape directo" },
  { value: "plin", label: "Plin" },
  { value: "transferencia", label: "Transferencia" },
  { value: "efectivo", label: "Efectivo" },
  { value: "otro", label: "Otro" },
] as const;

/** Métodos que se registran a mano (el resto los confirma Mercado Pago). */
export const MANUAL_PAY_METHODS = PAY_METHODS.filter((m) => !["yape_mp", "mercadopago"].includes(m.value));

export type Payment = {
  id: string;
  client_id: string | null;
  concept: string;
  amount_pen: number;
  period: string | null;
  due_date: string | null;
  status: string;
  method: string | null;
  payer_email: string | null;
  public_token: string;
  mp_payment_id: string | null;
  mp_status: string | null;
  mp_status_detail: string | null;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
  clients?: { name: string; contact_phone: string | null } | null;
};

// ───────── Restaurantes y cafeterías ─────────
export const VENUE_KINDS = [
  { value: "restaurante", label: "Restaurante" },
  { value: "cafeteria", label: "Cafetería" },
  { value: "pasteleria", label: "Pastelería" },
  { value: "bar", label: "Bar" },
  { value: "juguera", label: "Juguería" },
  { value: "dark_kitchen", label: "Dark kitchen" },
  { value: "otro", label: "Otro" },
] as const;

export const RESERVATION_STATUS = [
  { value: "pendiente", label: "Pendiente" },
  { value: "confirmada", label: "Confirmada" },
  { value: "cancelada", label: "Cancelada" },
  { value: "asistio", label: "Asistió" },
  { value: "no_asistio", label: "No asistió" },
] as const;

export const MENU_TAGS = ["Nuevo", "Recomendado", "Para compartir", "Vegano", "Vegetariano", "Sin gluten", "Picante", "Promo"] as const;

export type Venue = {
  id: string;
  client_id: string | null;
  slug: string;
  name: string;
  kind: string;
  tagline: string | null;
  whatsapp: string | null;
  address: string | null;
  district: string | null;
  city: string;
  maps_url: string | null;
  hours_text: string | null;
  instagram: string | null;
  tiktok: string | null;
  google_review_url: string | null;
  yape_number: string | null;
  yape_name: string | null;
  accepts_orders: boolean;
  accepts_reservations: boolean;
  delivery_note: string | null;
  accent_color: string;
  published: boolean;
  owner_token: string;
  notify_email: string | null;
  telegram_chat_id: string | null;
  created_at: string;
};

/** Lo que ve el público (nunca incluye owner_token, correos ni chat de Telegram). */
export type PublicVenue = Omit<Venue, "owner_token" | "notify_email" | "telegram_chat_id" | "client_id" | "published" | "created_at">;

export type MenuCategory = { id: string; venue_id: string; name: string; position: number };

export type MenuItem = {
  id: string;
  venue_id: string;
  category_id: string;
  name: string;
  description: string | null;
  price_pen: number;
  available: boolean;
  tags: string[];
  position: number;
  image_url: string | null;
};

export type Reservation = {
  id: string;
  venue_id: string;
  name: string;
  phone: string;
  party_size: number;
  reserved_for: string;
  notes: string | null;
  status: string;
  source: string;
  created_at: string;
};

export type Persona = {
  id: string;
  client_id: string;
  name: string;
  profile: string | null;
  goals: string | null;
  pains: string | null;
  channels: string | null;
  objections: string | null;
  message: string | null;
  ai_generated: boolean;
};
