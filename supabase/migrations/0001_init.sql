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
