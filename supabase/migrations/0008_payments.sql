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
