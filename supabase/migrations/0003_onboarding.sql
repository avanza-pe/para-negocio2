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
