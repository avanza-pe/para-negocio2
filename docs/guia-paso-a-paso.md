# Guía paso a paso: dejar AVANZA funcionando

Sigue las fases en orden. Cada fase termina con una **prueba** para saber que quedó bien. Tiempo total: 2 a 3 horas.

> **Regla de oro:** las claves (API keys, tokens, `service_role`) van SOLO en Vercel o en `.env.local`. **Nunca las pegues en un chat, correo ni GitHub.** Si ya pegaste alguna, cámbiala (rótala) al terminar.

Costo: todo es gratis salvo (a) Mercado Pago, que cobra comisión solo cuando vendes, y (b) Vercel Pro, necesario si cobras a clientes con la plataforma.

---

## Fase 0. Antes de empezar (10 min)

Ten a mano: un correo de la agencia, el celular con Telegram, tu número de WhatsApp comercial (formato `51999999999`, sin `+` ni espacios) y tu número de Yape.

Cuentas que vas a crear (usa el mismo correo): GitHub (ya la tienes), Supabase, Vercel, Brevo, Google AI Studio, Mercado Pago. Opcional: Cal.com.

---

## Fase 1. Base de datos: Supabase (20 min)

1. Entra a supabase.com → **New project**. Nombre `avanza`, elige una contraseña fuerte (guárdala), región `South America (São Paulo)`, plan **Free**.
2. Espera 2 minutos a que cree el proyecto.
3. Menú izquierdo → **SQL Editor** → **New query**.
4. Abre en GitHub el archivo `supabase/schema-completo.sql`, copia **todo** y pégalo. Pulsa **Run**.
   - Debe decir *Success. No rows returned*. Si da error, copia el mensaje completo y mándamelo (sin claves).
5. Menú **Storage**. Debe existir un bucket llamado `menu`. Si no existe: **New bucket** → nombre `menu` → activa **Public bucket** → Create.
6. Menú **Project Settings → API**. Anota (sin compartir): `Project URL`, `anon public key`, `service_role key`.
7. Menú **Authentication → URL Configuration**: deja Site URL en `http://localhost:3000` por ahora (la cambias en la Fase 3).

**Prueba:** menú **Table Editor** muestra tablas como `prospects`, `clients`, `payments`, `venues`, `menu_items`.

---

## Fase 2. Probar en tu computadora (opcional, 15 min)

Solo si quieres ver todo antes de publicar.

1. Instala Node 22 y Git. En una terminal:
   ```bash
   git clone https://github.com/williebs64uwu-create/para-negocio.git
   cd para-negocio
   git checkout claude/dashboard-automation-restaurants-23agwa
   npm install
   cp .env.example .env.local
   ```
2. Edita `.env.local` y llena al menos: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_WHATSAPP_NUMBER`.
3. `npm run dev` → abre http://localhost:3000.

**Prueba:** `/restaurantes` y `/m/demo` cargan. En `/m/demo` armas un pedido y abre WhatsApp.

---

## Fase 3. Publicar: Vercel (20 min)

1. vercel.com → **Add New → Project** → importa el repo `para-negocio`. Si tu rama de trabajo es `claude/dashboard-automation-restaurants-23agwa`, en **Settings → Git → Production Branch** elige esa (o haz merge a `main` primero).
2. En **Environment Variables** agrega (Production, Preview y Development):

   | Variable | Valor |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL de Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public key |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_role key (solo servidor) |
   | `NEXT_PUBLIC_SITE_URL` | `https://TU-PROYECTO.vercel.app` |
   | `CRON_SECRET` | texto largo aleatorio (genera uno: 40+ caracteres) |
   | `NEXT_PUBLIC_WHATSAPP_NUMBER` | `51999999999` |
   | `NEXT_PUBLIC_CONTACT_EMAIL` | correo público de la agencia |

3. **Deploy**. Espera a que termine.
4. Vuelve a Supabase → **Authentication → URL Configuration**: Site URL = tu URL de Vercel; en **Redirect URLs** agrega `https://TU-PROYECTO.vercel.app/**`.
5. Entra a `https://TU-PROYECTO.vercel.app/registro` y crea tu cuenta. **La primera cuenta es administradora.**
6. En Supabase → **Authentication → Providers → Email**, desactiva *Allow new users to sign up* cuando tu equipo ya esté creado.

**Prueba:** inicias sesión en `/login`, ves el panel. Envía el formulario de la home con datos de prueba: aparece en **Prospectos**.

**Importante sobre el plan:** Vercel Hobby no permite uso comercial. Cuando empieces a cobrar a clientes, pasa a Pro.

---

## Fase 4. Avisos gratis: Telegram (10 min)

1. En Telegram busca **@BotFather** → escribe `/newbot` → pon nombre y usuario (termina en `bot`). Te da un **token**.
2. Busca tu bot y escríbele `hola`.
3. En el navegador abre `https://api.telegram.org/bot<TU_TOKEN>/getUpdates`. Busca `"chat":{"id":123456789` y copia ese número.
4. En Vercel agrega `TELEGRAM_BOT_TOKEN` y `TELEGRAM_CHAT_ID`. **Redeploy** (Deployments → ⋯ → Redeploy).

**Prueba:** envía otro formulario de prueba desde la web (con otro correo). Te llega un mensaje a Telegram.

---

## Fase 5. Correo gratis: Brevo (10 min)

1. brevo.com → crea cuenta (plan Free, ~300 correos al día).
2. **SMTP & API → API Keys → Generate**. Copia la clave.
3. **Senders, Domains → Senders → Add a sender**: tu correo de la agencia; verifica con el enlace que te llega.
4. En Vercel agrega: `BREVO_API_KEY`, `BREVO_SENDER_EMAIL` (el verificado), `BREVO_SENDER_NAME` (`AVANZA`), `NOTIFY_EMAIL_TO` (donde quieres recibir avisos). Redeploy.

**Prueba:** otro formulario de prueba: te llega el correo.

---

## Fase 6. IA gratis: Gemini (5 min)

1. aistudio.google.com → **Get API key → Create API key**.
2. En Vercel agrega `GEMINI_API_KEY`. (Alternativa: Groq en console.groq.com → API Keys → `GROQ_API_KEY`.) Redeploy.
3. Opcional: `AI_DAILY_LIMIT=5` limita cuántas generaciones por día.

**Prueba:** en el panel entra a **Configuración**: la IA aparece en verde con el proveedor. Si el modelo no existe o falla, pon otro nombre de su lista en `AI_MODEL` y redeploy.

**Recuerda:** en los planes gratis el proveedor puede usar lo que envías. No mandes contraseñas ni datos personales de clientes.

---

## Fase 7. Agenda de diagnósticos (15 min)

**Opción A, gratis: Cal.com**
1. cal.com → crea cuenta → crea un evento «Diagnóstico de 15 min».
2. **Settings → Developer → Webhooks → New**. URL: `https://TU-DOMINIO/api/webhooks/calcom`. Eventos: *Booking created*, *rescheduled*, *cancelled*. Pon un **Secret** inventado.
3. En Vercel: `CALCOM_WEBHOOK_SECRET` (el mismo secret). `NEXT_PUBLIC_BOOKING_URL` = el enlace de tu evento. Redeploy.
4. **Antes de contar con esto**, confirma en la página de precios de Cal.com que los webhooks están en tu plan. Si no, usa la opción B o registra las reuniones a mano en **Reuniones**.

**Opción B: Calendly** (webhooks solo en planes de pago): URL `https://TU-DOMINIO/api/webhooks/calendly` y la clave de firma en `CALENDLY_WEBHOOK_SIGNING_KEY`.

**Prueba:** reserva un horario de prueba. Aparece en **Reuniones** y el prospecto pasa a *Reunión agendada*.

---

## Fase 8. Cobros: Yape, Plin y Mercado Pago (30 min)

### 8.1 Sin comisión: Yape/Plin directo
En Vercel: `NEXT_PUBLIC_YAPE_NUMBER` (solo dígitos) y `NEXT_PUBLIC_YAPE_NAME` (titular). Redeploy. Los pagos los confirmas tú a mano mirando la constancia (**Cobros → Marcar pagado**).

### 8.2 Con Mercado Pago (Yape + tarjeta)
1. Crea tu cuenta de Mercado Pago Perú (negocio). Entra a **Tus integraciones** (developers) → **Crear aplicación**.
2. Empieza con las credenciales de **PRUEBA**:
   - `Access Token` → `MP_ACCESS_TOKEN`
   - `Public Key` → `NEXT_PUBLIC_MP_PUBLIC_KEY`
3. En la aplicación → **Webhooks**: URL `https://TU-DOMINIO/api/webhooks/mercadopago`, evento **Pagos**. Copia la **clave secreta** → `MP_WEBHOOK_SECRET`.
4. Redeploy.

**Prueba (sandbox):** en el panel → **Cobros → Nuevo cobro** de S/ 1 → copia el enlace `/pagar/...` → pruébalo con las cuentas de prueba de Mercado Pago. El cobro debe pasar a **Pagado**.

**Paso a producción:** cambia a credenciales de producción, repite con un pago **real de S/ 1** y devuélvelo. Revisa las comisiones en la página oficial de tarifas antes de cotizar.

**Nota honesta:** el pago con Yape vía Mercado Pago está implementado según su documentación, pero aún no se ha probado con dinero real. Esa prueba es obligatoria antes de ofrecerlo a clientes.

---

## Fase 9. Crear tu primer restaurante (30 min)

1. Panel → **Locales y cartas → Nuevo local**. Nombre, tipo, WhatsApp de pedidos. El enlace se genera solo (`/m/nombre`).
2. Entra al local → pestaña **Datos**: horario, dirección, Instagram, Yape, nota de delivery, color de la marca, enlace de reseñas de Google (en tu Perfil de empresa de Google: *Pedir reseñas*). Marca **Carta publicada** y guarda.
3. Pestaña **Carta**: **Importar desde texto** (pega la carta, una línea por plato con el precio al final) o **Carta con IA** (sube foto de la carta). Revisa precios.
4. Pestaña **QR y enlaces**: prueba la carta pública, **Imprimir QR para mesas**, y copia el **enlace privado del dueño** para enviárselo por WhatsApp.
5. (Opcional) En **Datos**: correo del local y chat de Telegram del dueño para avisos de reservas. El dueño le escribe a tu bot y tú sacas su `chat.id` igual que en la Fase 4.

**Prueba:** abre `/m/<enlace>` en tu celular, arma un pedido y llega a WhatsApp. Haz una reserva y llega el aviso. En `/panel/<token>` confirma esa reserva.

---

## Fase 10. Automatización diaria y revisión final (15 min)

1. El cron ya está en `vercel.json` (08:00 Lima). Pruébalo a mano:
   ```bash
   curl -H "Authorization: Bearer TU_CRON_SECRET" https://TU-DOMINIO/api/cron/digest
   ```
   Debe responder `{"ok":true,...}` y te llega el resumen.
2. Panel → **Configuración**: todo lo que activaste debe estar en verde.
3. Móvil: revisa la home, `/restaurantes`, una carta y el panel.
4. Borra los datos de prueba (prospectos, cobros, local de prueba).
5. **Seguridad:** rota la `service_role` de Supabase y cualquier clave que hayas compartido; revisa que `.env.local` no esté en GitHub.

## Fase 11. Que te encuentren (después del deploy)

Sigue la sección 6 de `docs/deploy.md`: Google Search Console (envía `sitemap.xml`), Perfil de empresa de Google, Bing Webmaster y prueba al compartir en WhatsApp. Cada carta publicada entra sola al sitemap.

---

## Si algo falla

| Síntoma | Qué revisar |
|---|---|
| Página de cobros o locales dice que falta una migración | Correr `schema-completo.sql` (Fase 1) |
| No llegan avisos | Variables de Telegram o Brevo y que hiciste **Redeploy** |
| «La IA no está configurada» | `GEMINI_API_KEY` o `GROQ_API_KEY`; ver **Configuración** |
| La carta demo no deja pedir | Falta `NEXT_PUBLIC_WHATSAPP_NUMBER` |
| Webhook de Mercado Pago da 401 | `MP_WEBHOOK_SECRET` distinto al del panel de Mercado Pago |
| Webhook de Cal.com da 401 | Secret distinto al configurado |
| No puedes iniciar sesión | Redirect URLs de Supabase (Fase 3, paso 4) |

---

## Qué enviarme para terminarlo

Cuando hayas hecho las fases, mándame **solo esto** (nunca las claves):

1. Hasta qué fase llegaste.
2. Tu URL de Vercel.
3. Lo que dice la página **Configuración** (qué está en verde y qué no).
4. Cualquier mensaje de error **copiado tal cual** (sin claves).
5. El resultado de las pruebas de cada fase: ✅ o ❌.

Con eso reviso el fallo, ajusto el código y verifico el resto.
