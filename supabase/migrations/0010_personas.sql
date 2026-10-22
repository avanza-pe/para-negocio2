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
