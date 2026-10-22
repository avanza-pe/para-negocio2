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
