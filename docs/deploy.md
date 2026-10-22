# Guía de deploy: GitHub → Vercel

## 0. Antes de subir
- [ ] `npm run lint`, `npx tsc --noEmit` y `npm run build` sin errores.
- [ ] SQL 0001–0006 corridos en Supabase.
- [ ] `.env.local` **no** se sube (ya está en `.gitignore`).

## 1. GitHub
1. En GitHub: **New repository** → nombre `avanza` → **Private** → sin README ni .gitignore.
2. En la carpeta del proyecto:
   ```bash
   git remote add origin https://github.com/williebs64uwu-create/avanza.git
   git push -u origin main
   ```

## 2. Vercel
1. [vercel.com/new](https://vercel.com/new) → importa el repo `avanza` (framework: Next.js, todo por defecto).
2. **Environment Variables** (Production, Preview y Development):

| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de tu proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | clave anon |
| `SUPABASE_SERVICE_ROLE_KEY` | clave service_role (solo servidor) |
| `NEXT_PUBLIC_SITE_URL` | `https://TU-DOMINIO.vercel.app` (luego el dominio propio) |
| `NEXT_PUBLIC_BOOKING_URL` | enlace de Calendly |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | ej. `51999999999` |
| `NEXT_PUBLIC_CONTACT_EMAIL` | correo público |
| `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME`, `NOTIFY_EMAIL_TO` | correo con Brevo |
| `CRON_SECRET` | texto largo aleatorio (distinto del local) |
| `NEXT_PUBLIC_GA_ID` *(opcional)* | `G-XXXXXXX` |
| `ANTHROPIC_API_KEY`, `AI_DAILY_LIMIT` *(opcional)* | generación con IA |
| `CALENDLY_WEBHOOK_SIGNING_KEY` *(opcional)* | solo con plan Calendly con webhooks |

3. **Deploy**. Cambiar variables exige un nuevo deploy (Deployments → Redeploy).

### Opciones de "Configure Project" en Vercel
| Opción | Qué poner |
|---|---|
| Framework Preset | **Next.js** (se detecta solo) |
| Root Directory | `./` (déjalo así) |
| Build Command / Output / Install | por defecto (`next build`), no los cambies |
| Node.js Version (Settings → General) | 22.x o la más nueva disponible |
| Function Region (Settings → Functions) | la más cercana a la región de tu proyecto Supabase |
| Environment Variables | las de la tabla de arriba |
| Plan | **Hobby es solo uso no comercial**: para mostrar/vender a empresas usa Pro (verifica los términos vigentes) |

## 3. Después del primer deploy
1. **Supabase → Authentication → URL Configuration**: *Site URL* = tu URL de Vercel; *Redirect URLs*: `https://TU-DOMINIO/**` (y deja `http://localhost:3000/**`).
2. **Google Cloud → tu ID de cliente OAuth**: añade `https://TU-DOMINIO` en *Orígenes autorizados de JavaScript*. La URI de redirección de Supabase no cambia.
3. **Brevo**: si quieres remitente propio, verifícalo en *Remitentes, dominio, IP*.
4. **Calendly** (si tienes webhooks): apunta a `https://TU-DOMINIO/api/webhooks/calendly`.
5. **Cron diario**: ya está en `vercel.json` (08:00 Lima). Vercel lo envía con `Authorization: Bearer $CRON_SECRET`.

## 4. Pruebas en producción
- [ ] Abre la web, envía el formulario con datos de prueba → aparece en Prospectos y llega el aviso al correo.
- [ ] Mismo correo otra vez → queda como `duplicado`.
- [ ] Entra con Google a `/login` (la primera cuenta es admin).
- [ ] Prospecto → reunión → propuesta → *Ganado* → *Convertir en cliente* → checklist y brief.
- [ ] Llama al cron a mano: `curl -H "Authorization: Bearer $CRON_SECRET" https://TU-DOMINIO/api/cron/digest`.
- [ ] Revisa en el móvil: navbar, formulario y barra inferior del panel.
- [ ] Borra tus datos de prueba desde el panel.

## 5. Seguridad al terminar
- Rota la `service_role` de Supabase y la clave de Brevo si se compartieron por chat; actualiza `.env.local` y Vercel.
- Desactiva *Allow new users to sign up* en Supabase (Authentication → Providers → Email) cuando tu equipo ya esté creado.
- Considera un dominio propio en Vercel (Settings → Domains) cuando haya clientes validados.
