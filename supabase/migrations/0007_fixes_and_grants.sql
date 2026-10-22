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
