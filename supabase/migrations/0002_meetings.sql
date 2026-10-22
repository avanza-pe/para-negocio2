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
