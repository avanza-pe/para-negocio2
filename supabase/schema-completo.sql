-- AUMENTA: esquema completo (migraciones 0001 a 0010 en orden).
-- Supabase → SQL Editor → pega TODO esto → Run. Solo en un proyecto NUEVO (0001-0006 no son re-ejecutables).

-- ═════════ 0001_init.sql ═════════
-- CRM de la agencia (reemplaza la hoja "CRM Agencia" del informe).
-- Ejecutar en Supabase → SQL Editor, o con `supabase db push`.

create extension if not exists pgcrypto;

-- ───────── Perfiles y roles ─────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'pending' check (role in ('admin', 'member', 'pending')),
  created_at timestamptz not null default now()
);

-- El primer usuario registrado es admin; el resto queda 'pending' hasta que lo apruebes.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    case when exists (select 1 from public.profiles) then 'pending' else 'admin' end
  );
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

create function public.is_staff() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role in ('admin', 'member'))
$$;

create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin')
$$;

-- ───────── Prospectos (pipeline) ─────────
create table public.prospects (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  sector text,
  city text,
  web_social text,
  contact_name text,
  contact_email text,
  contact_phone text,
  channel text not null default 'manual',          -- web, whatsapp, instagram, referido, manual...
  stage text not null default 'nuevo' check (stage in (
    'nuevo','investigado','contactado','respondio','reunion_agendada',
    'propuesta_enviada','ganado','perdido','seguimiento_futuro')),
  last_interaction_at timestamptz,
  next_action text,
  next_action_at date,
  consent boolean not null default false,          -- base legal / consentimiento de contacto
  lost_reason text,
  notes text,
  message text,                                    -- mensaje enviado desde el formulario
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index prospects_email_unique on public.prospects (lower(contact_email)) where contact_email is not null;
create index prospects_stage_idx on public.prospects (stage);
create index prospects_next_action_idx on public.prospects (next_action_at);

-- ───────── Clientes ─────────
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid references public.prospects (id) on delete set null,
  name text not null,
  contact text,
  service text not null,
  price_pen numeric(10,2) not null default 0,
  start_date date,
  renewal_date date,
  payment_status text not null default 'pendiente' check (payment_status in ('pendiente','pagado','vencido')),
  folder_url text,
  owner text,
  created_at timestamptz not null default now()
);

-- ───────── Entregas ─────────
create table public.deliverables (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  piece text not null,
  format text,
  due_date date,
  status text not null default 'pendiente' check (status in ('pendiente','en_produccion','en_revision','aprobado','entregado')),
  link text,
  approved boolean not null default false,
  revisions_left int not null default 1 check (revisions_left >= 0),
  created_at timestamptz not null default now()
);
create index deliverables_client_idx on public.deliverables (client_id);

-- ───────── Métricas (solo datos verificables) ─────────
create table public.metrics (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  period date not null,                            -- primer día del mes
  posts int,
  reach int,
  views int,
  clicks int,
  leads int,
  source text,
  notes text,
  created_at timestamptz not null default now()
);
create index metrics_client_idx on public.metrics (client_id);

-- ───────── Automatizaciones (registro de ejecuciones) ─────────
create table public.automation_runs (
  id uuid primary key default gen_random_uuid(),
  flow text not null,                              -- 'A_lead_entrante', ...
  trigger text,
  action text,
  status text not null check (status in ('ok','error','duplicado')),
  error text,
  ref_id uuid,
  created_at timestamptz not null default now()
);

-- ───────── updated_at ─────────
create function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger prospects_touch before update on public.prospects
for each row execute function public.touch_updated_at();

-- ───────── RLS: todo cerrado salvo para el equipo ─────────
alter table public.profiles enable row level security;
alter table public.prospects enable row level security;
alter table public.clients enable row level security;
alter table public.deliverables enable row level security;
alter table public.metrics enable row level security;
alter table public.automation_runs enable row level security;

create policy "perfil propio" on public.profiles for select to authenticated
  using (id = (select auth.uid()) or public.is_admin());
create policy "admin gestiona perfiles" on public.profiles for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "staff prospects" on public.prospects for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy "staff clients" on public.clients for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy "staff deliverables" on public.deliverables for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy "staff metrics" on public.metrics for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy "staff automation_runs" on public.automation_runs for select to authenticated
  using (public.is_staff());
-- Los leads públicos entran SOLO por el servidor con service role (no hay política para anon).

-- ═════════ 0002_meetings.sql ═════════
-- Flujo B · Reservas (reuniones de diagnóstico)
create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.prospects (id) on delete cascade,
  starts_at timestamptz not null,
  tz text not null default 'America/Lima',
  status text not null default 'programada' check (status in ('programada','realizada','cancelada','no_asistio')),
  source text not null default 'manual',          -- manual | calendly
  external_id text unique,                         -- id del evento en Calendly (evita duplicados)
  notes text,
  created_at timestamptz not null default now()
);
create index meetings_starts_idx on public.meetings (starts_at);
create index meetings_prospect_idx on public.meetings (prospect_id);

alter table public.meetings enable row level security;
create policy "staff meetings" on public.meetings for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- ═════════ 0003_onboarding.sql ═════════
-- Flujo C · Onboarding: checklist por cliente y brief
create table public.onboarding_tasks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  title text not null,
  position int not null default 0,
  done boolean not null default false,
  done_at timestamptz,
  created_at timestamptz not null default now()
);
create index onboarding_tasks_client_idx on public.onboarding_tasks (client_id, position);

create table public.client_briefs (
  client_id uuid primary key references public.clients (id) on delete cascade,
  sector text,
  audience text,
  offer text,
  tone text,
  differentiators text,
  location text,
  cta text,
  references_text text,
  restrictions text,
  approver text,
  access_notes text,                               -- qué accesos se pidieron (NUNCA contraseñas)
  updated_at timestamptz not null default now()
);

-- Un cliente por prospecto: evita convertir dos veces
create unique index clients_prospect_unique on public.clients (prospect_id) where prospect_id is not null;

alter table public.onboarding_tasks enable row level security;
alter table public.client_briefs enable row level security;
create policy "staff onboarding_tasks" on public.onboarding_tasks for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy "staff client_briefs" on public.client_briefs for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- ═════════ 0004_content_items.sql ═════════
-- Flujo D · Producción: calendario de contenido con aprobación humana
create table public.content_items (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  pillar text,
  format text,
  objective text,
  visual_idea text,
  hook text,
  copy text,
  cta text,
  metric text,
  scheduled_for date,
  status text not null default 'borrador' check (status in ('borrador','en_revision','aprobado','publicado','descartado')),
  ai_generated boolean not null default false,
  created_at timestamptz not null default now()
);
create index content_items_client_idx on public.content_items (client_id, scheduled_for);

alter table public.content_items enable row level security;
create policy "staff content_items" on public.content_items for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- ═════════ 0005_reports.sql ═════════
-- Flujo F · Reportes mensuales (solo con métricas registradas)
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  period date not null,                            -- primer día del mes
  body text not null,
  status text not null default 'borrador' check (status in ('borrador','aprobado','enviado')),
  created_at timestamptz not null default now(),
  unique (client_id, period)
);

alter table public.reports enable row level security;
create policy "staff reports" on public.reports for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- ═════════ 0006_proposals.sql ═════════
-- Propuestas comerciales (plantilla del informe §3 y docs/plantillas.md)
create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid references public.prospects (id) on delete set null,
  client_name text not null,
  title text not null,
  package text not null,
  price_pen numeric(10,2) not null default 0,
  price_unit text not null default 'al mes',       -- al mes | por proyecto | implementación
  validity_days int not null default 7 check (validity_days between 1 and 90),
  includes text not null,
  exclusions text not null,
  client_materials text,
  revisions int not null default 1 check (revisions >= 0),
  timeline text,
  payment_terms text not null,
  notes text,
  status text not null default 'borrador' check (status in ('borrador','enviada','aceptada','rechazada')),
  created_at timestamptz not null default now()
);
create index proposals_prospect_idx on public.proposals (prospect_id);

alter table public.proposals enable row level security;
create policy "staff proposals" on public.proposals for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- ═════════ 0007_fixes_and_grants.sql ═════════
-- Correcciones detectadas en la revisión. Es idempotente: se puede correr más de una vez.

-- ───────── 1. Permisos explícitos (cambio de Supabase 2026) ─────────
-- Desde el 30-may-2026 (proyectos nuevos) y el 30-oct-2026 (todos), las tablas de `public`
-- ya no reciben GRANT automático para la Data API. Sin esto supabase-js responde 42501
-- "permission denied" aunque las políticas RLS estén bien. RLS sigue decidiendo QUÉ filas.
-- `anon` no recibe nada: la web pública escribe solo desde el servidor con service_role.
grant usage on schema public to authenticated, service_role;

grant select, update on table public.profiles to authenticated;
grant select, insert, update, delete on table
  public.prospects, public.clients, public.deliverables, public.metrics,
  public.meetings, public.onboarding_tasks, public.client_briefs,
  public.content_items, public.reports, public.proposals
to authenticated;
grant select, insert on table public.automation_runs to authenticated;

grant select, insert, update, delete on table
  public.profiles, public.prospects, public.clients, public.deliverables, public.metrics,
  public.automation_runs, public.meetings, public.onboarding_tasks, public.client_briefs,
  public.content_items, public.reports, public.proposals
to service_role;

grant execute on function public.is_staff(), public.is_admin() to authenticated, service_role;

-- ───────── 2. automation_runs: el panel no podía registrar ejecuciones ─────────
-- Solo existía la política SELECT, así que los flujos B (manual), C, D y F fallaban al
-- registrar su ejecución y el límite diario de IA (que cuenta estas filas) nunca se aplicaba.
drop policy if exists "staff registra automation_runs" on public.automation_runs;
create policy "staff registra automation_runs" on public.automation_runs for insert to authenticated
  with check (public.is_staff());
create index if not exists automation_runs_flow_created_idx on public.automation_runs (flow, created_at desc);

-- ───────── 3. Clientes: contacto separado (cobros y WhatsApp) y updated_at ─────────
alter table public.clients add column if not exists contact_email text;
alter table public.clients add column if not exists contact_phone text;
alter table public.clients add column if not exists sector text;
alter table public.clients add column if not exists updated_at timestamptz not null default now();
drop trigger if exists clients_touch on public.clients;
create trigger clients_touch before update on public.clients
for each row execute function public.touch_updated_at();

-- ───────── 4. Métricas: el periodo siempre es el primer día del mes ─────────
-- El formulario permitía cualquier fecha y el reporte buscaba solo el día 1 (no encontraba nada).
update public.metrics set period = date_trunc('month', period)::date
where period <> date_trunc('month', period)::date;
alter table public.metrics drop constraint if exists metrics_period_first_day;
alter table public.metrics add constraint metrics_period_first_day check (extract(day from period) = 1);

-- ───────── 5. Prospectos: correos en minúsculas (los webhooks buscan por igualdad exacta) ─────────
update public.prospects set contact_email = lower(trim(contact_email))
where contact_email is not null and contact_email <> lower(trim(contact_email));

-- ═════════ 0008_payments.sql ═════════
-- Flujo G · Cobros: links de pago con Mercado Pago (Yape, tarjetas) y registro manual (Yape/Plin directo, transferencia).
-- El monto SIEMPRE sale de esta tabla: el navegador nunca decide cuánto se cobra.
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients (id) on delete set null,
  concept text not null,
  amount_pen numeric(10,2) not null check (amount_pen > 0 and amount_pen <= 100000),
  period date,                                     -- mes del servicio (primer día) si es cobro recurrente
  due_date date,
  status text not null default 'pendiente' check (status in ('pendiente','pagado','rechazado','cancelado','reembolsado')),
  method text check (method in ('yape_mp','mercadopago','yape','plin','transferencia','efectivo','otro')),
  payer_email text,
  public_token text not null unique default replace(gen_random_uuid()::text, '-', ''), -- enlace /pagar/<token>
  mp_preference_id text,
  mp_payment_id text unique,
  mp_status text,
  mp_status_detail text,
  paid_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists payments_client_idx on public.payments (client_id, created_at desc);
create index if not exists payments_status_idx on public.payments (status, due_date);
-- Un solo cobro activo por cliente y mes (evita que el cron duplique cobros recurrentes)
create unique index if not exists payments_client_period_unique on public.payments (client_id, period)
  where period is not null and status in ('pendiente','pagado');

drop trigger if exists payments_touch on public.payments;
create trigger payments_touch before update on public.payments
for each row execute function public.touch_updated_at();

alter table public.payments enable row level security;
drop policy if exists "staff payments" on public.payments;
create policy "staff payments" on public.payments for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

grant select, insert, update, delete on table public.payments to authenticated, service_role;
-- La página pública /pagar/<token> lee y actualiza SOLO desde el servidor con service_role (sin política anon).

-- ═════════ 0009_venues.sql ═════════
-- Vertical restaurantes y cafeterías: carta digital con pedido por WhatsApp, reservas, QR,
-- reseñas en Google y panel del dueño (enlace privado). La web pública lee y escribe SOLO
-- desde el servidor con service_role; no hay políticas para anon.

create table if not exists public.venues (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients (id) on delete set null,
  slug text not null unique
    check (slug ~ '^[a-z0-9]([a-z0-9-]{0,46}[a-z0-9])?$' and slug not in ('demo', 'admin', 'api')),
  name text not null,
  kind text not null default 'restaurante'
    check (kind in ('restaurante','cafeteria','pasteleria','bar','juguera','dark_kitchen','otro')),
  tagline text,
  whatsapp text check (whatsapp ~ '^[0-9]{8,15}$'),  -- con código de país, solo números (51999999999)
  address text,
  district text,
  city text not null default 'Lima',
  maps_url text,
  hours_text text,                                   -- "Lun–Sáb 8:00–22:00 · Dom 9:00–18:00"
  instagram text,
  tiktok text,
  google_review_url text,                            -- enlace "escribir reseña" del perfil de Google
  yape_number text,
  yape_name text,
  accepts_orders boolean not null default true,      -- pedido armado → WhatsApp del local
  accepts_reservations boolean not null default true,
  delivery_note text,
  accent_color text not null default '#7c5cf2' check (accent_color ~ '^#[0-9a-fA-F]{6}$'),
  published boolean not null default false,
  -- Enlace privado del dueño (/panel/<token>): 256 bits aleatorios, se puede regenerar desde el panel.
  owner_token text not null unique
    default (replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')),
  notify_email text,                                 -- avisos de reservas al local
  telegram_chat_id text,                             -- avisos instantáneos (bot de Telegram, gratis)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists venues_client_idx on public.venues (client_id);

create table if not exists public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues (id) on delete cascade,
  name text not null,
  position int not null default 0,
  created_at timestamptz not null default now(),
  unique (id, venue_id)
);
create index if not exists menu_categories_venue_idx on public.menu_categories (venue_id, position);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues (id) on delete cascade,
  category_id uuid not null,
  name text not null,
  description text,
  price_pen numeric(10,2) not null default 0 check (price_pen >= 0 and price_pen < 100000),
  available boolean not null default true,           -- "Agotado" con un toque desde el panel del dueño
  tags text[] not null default '{}',                 -- vegano, picante, nuevo, para compartir…
  position int not null default 0,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- la categoría debe ser del mismo local
  foreign key (category_id, venue_id) references public.menu_categories (id, venue_id) on delete cascade
);
create index if not exists menu_items_venue_idx on public.menu_items (venue_id, category_id, position);

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues (id) on delete cascade,
  name text not null,
  phone text not null,
  party_size int not null check (party_size between 1 and 50),
  reserved_for timestamptz not null,
  notes text,
  status text not null default 'pendiente'
    check (status in ('pendiente','confirmada','cancelada','asistio','no_asistio')),
  source text not null default 'web',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists reservations_venue_idx on public.reservations (venue_id, reserved_for);

-- Eventos de la carta (sin datos personales): base de las métricas verificables del local.
create table if not exists public.venue_events (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues (id) on delete cascade,
  kind text not null check (kind in ('view','whatsapp_order','reservation','review_click','call','maps','instagram')),
  created_at timestamptz not null default now()
);
create index if not exists venue_events_venue_idx on public.venue_events (venue_id, created_at desc);

-- updated_at
drop trigger if exists venues_touch on public.venues;
create trigger venues_touch before update on public.venues for each row execute function public.touch_updated_at();
drop trigger if exists menu_items_touch on public.menu_items;
create trigger menu_items_touch before update on public.menu_items for each row execute function public.touch_updated_at();
drop trigger if exists reservations_touch on public.reservations;
create trigger reservations_touch before update on public.reservations for each row execute function public.touch_updated_at();

-- RLS: solo el equipo desde el panel
alter table public.venues enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.reservations enable row level security;
alter table public.venue_events enable row level security;

drop policy if exists "staff venues" on public.venues;
create policy "staff venues" on public.venues for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
drop policy if exists "staff menu_categories" on public.menu_categories;
create policy "staff menu_categories" on public.menu_categories for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
drop policy if exists "staff menu_items" on public.menu_items;
create policy "staff menu_items" on public.menu_items for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
drop policy if exists "staff reservations" on public.reservations;
create policy "staff reservations" on public.reservations for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
drop policy if exists "staff venue_events" on public.venue_events;
create policy "staff venue_events" on public.venue_events for select to authenticated
  using (public.is_staff());

grant select, insert, update, delete on table
  public.venues, public.menu_categories, public.menu_items, public.reservations
to authenticated, service_role;
grant select on table public.venue_events to authenticated;
grant select, insert, delete on table public.venue_events to service_role;

-- Fotos de platos: bucket público de Supabase Storage (plan gratis: 1 GB). Las subidas las hace
-- el servidor con service_role, así que no hacen falta políticas de escritura en storage.objects.
do $$
begin
  if to_regclass('storage.buckets') is not null then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('menu', 'menu', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
    on conflict (id) do nothing;
  end if;
end $$;

-- ═════════ 0010_personas.sql ═════════
-- Buyer personas por cliente: a quién le habla la marca. Alimentan el prompt de producción (flujo D).
create table if not exists public.client_personas (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  name text not null,                               -- "Oficinista del menú del día"
  profile text,                                     -- edad, ocupación, zona, presupuesto
  goals text,                                       -- qué busca
  pains text,                                       -- qué le molesta o frena
  channels text,                                    -- dónde está (IG, TikTok, Google Maps, WhatsApp…)
  objections text,                                  -- por qué no compraría
  message text,                                     -- mensaje/ángulo que le funciona
  ai_generated boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists client_personas_client_idx on public.client_personas (client_id, created_at);

alter table public.client_personas enable row level security;
drop policy if exists "staff client_personas" on public.client_personas;
create policy "staff client_personas" on public.client_personas for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

grant select, insert, update, delete on table public.client_personas to authenticated, service_role;

