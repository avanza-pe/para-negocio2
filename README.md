# Impulso Digital IA — agencia de marketing con IA

Implementación del *Informe de Implementación en 1 Día* (agencia de marketing digital con IA, Perú).
Reemplaza Google Sheets + Make por una app propia: **landing + formulario → CRM → panel interno**.

| Capa | Tecnología |
|---|---|
| Web y panel | Next.js 16 (App Router, Server Actions) + TypeScript |
| UI | Tailwind CSS 4 + shadcn/ui (base-ui) + lucide + Recharts |
| Base de datos y auth | Supabase (Postgres + Auth + RLS) |
| Deploy | Vercel |
| Avisos por correo | Brevo API (opcional) |
| Validación | Zod en cada Server Action |

## Qué hace (mapeo con el informe)

- **§4 Sitio web** → `src/app/(site)`: inicio, servicios, proceso, portafolio (muestras declaradas), planes, contacto, `/gracias`, `/privacidad`, `/condiciones`.
- **§5 CRM** → tablas `prospects`, `clients`, `deliverables`, `metrics` y páginas del panel `/dashboard/*`. Pipeline: Nuevo → … → Ganado/Perdido → Seguimiento futuro, con próxima acción obligatoria.
- **§6 Flujo A (lead entrante)** → `src/lib/actions/leads.ts`: valida, detecta duplicados por correo, guarda en CRM, registra la ejecución en `automation_runs` y avisa por correo.
- **§6 Flujos B–F** → ver `/dashboard/automatizaciones` y `docs/`.
- **§11 Seguridad** → RLS en todas las tablas, service role solo en servidor, cabeceras HTTP, honeypot anti-bots, sin claves en el repo.

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # y rellena los valores
npm run dev
```

### 1. Supabase
1. Crea un proyecto en [supabase.com](https://supabase.com) (plan gratuito).
2. **SQL Editor** → pega y ejecuta `supabase/migrations/0001_init.sql`.
3. **Project Settings → API**: copia `URL`, `anon key` y `service_role key` a `.env.local`.
4. **Authentication → URL Configuration**: *Site URL* = tu URL de Vercel; en *Redirect URLs* añade `https://TU-DOMINIO/auth/confirm`.
5. **Authentication → Email templates → Confirm signup**: cambia el enlace a  
   `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`
6. Regístrate en `/registro`: **la primera cuenta es administradora**. Después, en *Authentication → Providers → Email*, desactiva *Allow new users to sign up* si no quieres más registros. Los siguientes usuarios entran como `pending` hasta que cambies su `role` a `member` en la tabla `profiles`.

### 2. Vercel
1. Sube el repo a GitHub e impórtalo en [vercel.com/new](https://vercel.com/new) (framework: Next.js, sin cambios).
2. En *Settings → Environment Variables* añade las mismas variables de `.env.example`.  
   `SUPABASE_SERVICE_ROLE_KEY` y `BREVO_API_KEY` **sin** prefijo `NEXT_PUBLIC_`.
3. Despliega. Dominio propio solo cuando haya clientes validados (informe §2).

### 3. Prueba de extremo a extremo (criterio de éxito §13)
1. Envía el formulario de la web con datos de prueba → aparece en `/dashboard/prospectos` y en `/dashboard/automatizaciones`.
2. Envíalo otra vez con el mismo correo → se registra como `duplicado`, sin fila nueva.
3. Cambia la etapa a *Ganado*, crea el cliente y una entrega.

## Estructura

```
src/app/(site)        web pública
src/app/(auth)        login, registro, pendiente
src/app/dashboard     panel interno (protegido)
src/lib/actions       Server Actions (todas validan con Zod)
src/lib/supabase      clientes: server, admin (service role), proxy de sesión
src/proxy.ts          refresco de sesión + protección de /dashboard
supabase/migrations   esquema + RLS
docs/                 plantillas y guías operativas del informe
```

## Prácticas aplicadas

- **Seguridad en profundidad**: el proxy redirige, pero cada página y acción vuelve a verificar con `requireStaff()` y RLS en la base.
- **Datos públicos solo por el servidor**: no hay política `anon`; los leads entran con service role desde una Server Action validada.
- **Validación en el borde**: cada formulario pasa por Zod antes de tocar la base.
- **Accesibilidad**: etiquetas, `aria-invalid`, mensajes `role="alert"`, foco visible (shadcn).
- **Redirecciones seguras**: `next` solo acepta rutas `/dashboard*`.
- **CI**: `.github/workflows/ci.yml` corre lint, tipos y build en cada PR.

## Pendiente / siguiente semana (informe §14)
- Flujo B: webhook de la agenda (Calendly) → tabla de reuniones.
- Flujos C–F: onboarding automático, producción con IA (con aprobación humana), seguimiento y reportes.
- Cambiar `SITE.contactEmail` y el nombre en `src/lib/site.ts`.
- Revisar con un profesional los textos de privacidad y condiciones.
