# Puesta en marcha: qué falta poner de tu lado

Marca cada casilla en orden. Todo es gratis salvo Mercado Pago (comisión por venta) y Vercel Pro (si cobras a clientes).

## 1. Base de datos (Supabase) — obligatorio
- [ ] Crea el proyecto en supabase.com (plan Free).
- [ ] **SQL Editor** → abre `supabase/schema-completo.sql` → pega todo → **Run**. (Solo en proyecto nuevo. Si ya corriste 0001–0006, corre solo `0007` a `0010` de `supabase/migrations/`.)
- [ ] **Storage**: si no existe el bucket `menu`, créalo (público).
- [ ] **Project Settings → API**: copia `URL`, `anon key` y `service_role key`.
- [ ] **Authentication → URL Configuration**: Site URL = tu dominio.
- [ ] Regístrate en `/registro` (la primera cuenta es admin).

## 2. Vercel — obligatorio
- [ ] Importa el repo. Variables mínimas: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`, `CRON_SECRET` (texto largo aleatorio), `NEXT_PUBLIC_WHATSAPP_NUMBER`.
- [ ] Cada vez que cambies variables: **Redeploy**.
- [ ] Plan: Hobby no permite uso comercial; para cobrar usa Pro.

## 3. Telegram (avisos gratis) — 2 minutos
1. En Telegram habla con **@BotFather** → `/newbot` → copia el token → `TELEGRAM_BOT_TOKEN`.
2. Escríbele cualquier mensaje a tu bot.
3. Abre `https://api.telegram.org/bot<TOKEN>/getUpdates` y copia `chat.id` → `TELEGRAM_CHAT_ID`.
4. Para avisar a un restaurante: que escriba a tu bot, saca su `chat.id` igual y pégalo en Locales → Datos.

## 4. IA gratis — elige una
- **Gemini**: aistudio.google.com → *Get API key* → `GEMINI_API_KEY`.
- **Groq**: console.groq.com → *API Keys* → `GROQ_API_KEY`.
- Verás cuál está activa en **Configuración**. Si falla el modelo, pon `AI_MODEL` con otro de su lista.

## 5. Correo (Brevo, gratis)
- [ ] brevo.com → SMTP & API → *API Keys* → `BREVO_API_KEY`.
- [ ] Verifica un remitente → `BREVO_SENDER_EMAIL`. Avisos a ti: `NOTIFY_EMAIL_TO`.

## 6. Agenda de diagnósticos (elige una)
- **Cal.com** (confirma que su plan gratis incluya webhooks): Settings → Developer → Webhooks → URL `https://TU-DOMINIO/api/webhooks/calcom`, eventos Booking created/rescheduled/cancelled, un secreto → `CALCOM_WEBHOOK_SECRET`.
- **Calendly** (webhooks de pago): URL `/api/webhooks/calendly` → `CALENDLY_WEBHOOK_SIGNING_KEY`.
- Sin webhook: registra reuniones a mano en Reuniones. Pon tu enlace en `NEXT_PUBLIC_BOOKING_URL`.

## 7. Cobros con Mercado Pago (Yape + tarjeta)
1. Cuenta de negocio de Mercado Pago Perú → *Tus integraciones* → crear aplicación.
2. Con credenciales de **prueba**: copia `Access Token` → `MP_ACCESS_TOKEN` y `Public Key` → `NEXT_PUBLIC_MP_PUBLIC_KEY`.
3. *Webhooks*: URL `https://TU-DOMINIO/api/webhooks/mercadopago`, evento **Pagos**, copia la clave secreta → `MP_WEBHOOK_SECRET`.
4. Crea un cobro de S/ 1 en Cobros y paga con las cuentas de prueba. Mira que pase a «Pagado».
5. Recién entonces cambia a credenciales de **producción** y haz una prueba real de S/ 1.
- Sin comisión: pon `NEXT_PUBLIC_YAPE_NUMBER` y `NEXT_PUBLIC_YAPE_NAME` (Yape/Plin directo, se confirma a mano).

## 8. Comprobar que todo quedó
- [ ] `/dashboard/configuracion`: los medios que activaste aparecen en verde.
- [ ] Envía el formulario de la web → aparece en Prospectos y te llega aviso.
- [ ] Crea un local, importa una carta, publícala, abre `/m/<enlace>` y haz un pedido de prueba.
- [ ] Llama al cron: `curl -H "Authorization: Bearer $CRON_SECRET" https://TU-DOMINIO/api/cron/digest`.
- [ ] Rota la `service_role` y las claves si las pegaste en un chat.
