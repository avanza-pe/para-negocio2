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
