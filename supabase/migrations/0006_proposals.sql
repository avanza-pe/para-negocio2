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
