# Herramientas y APIs: qué es gratis y qué no (octubre 2026)

Todo lo de esta lista se puede correr con **costo fijo cero**. Lo único que cobra es Mercado Pago, y solo cuando vendes (comisión por venta aprobada).

| Necesidad | Herramienta | Costo | Dónde se configura |
|---|---|---|---|
| Base de datos, login, RLS | Supabase (plan Free: 500 MB, pausa tras 7 días sin uso) | Gratis | `NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY` |
| Web y cron | Vercel Hobby | Gratis, **solo uso no comercial** (ver nota) | Proyecto en Vercel, `CRON_SECRET` |
| Correo transaccional | Brevo | Gratis: ~300 correos/día | `BREVO_*`, `NOTIFY_EMAIL_TO` |
| Avisos instantáneos | Telegram Bot API | Gratis | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` |
| Agenda de diagnósticos | Cal.com (open source) | Plan gratis con webhooks — **verificar en su página de precios** antes de depender de ello | `CALCOM_WEBHOOK_SECRET` |
| Agenda alternativa | Calendly | Webhooks solo en planes de pago | `CALENDLY_WEBHOOK_SIGNING_KEY` |
| IA (producción, personas, carta desde foto) | Google Gemini API (AI Studio) | Plan gratis con límites por minuto/día | `GEMINI_API_KEY` |
| IA alternativa | Groq | Plan gratis con límites por modelo | `GROQ_API_KEY` |
| IA de pago (opcional) | Claude (Anthropic) | De pago | `ANTHROPIC_API_KEY` |
| Cobros | Mercado Pago (Perú): Yape vía Mercado Pago, tarjeta | Sin costo fijo; comisión por venta aprobada | `MP_ACCESS_TOKEN`, `NEXT_PUBLIC_MP_PUBLIC_KEY`, `MP_WEBHOOK_SECRET` |
| Cobros sin comisión | Yape / Plin directo, transferencia | Gratis (se confirman a mano) | `NEXT_PUBLIC_YAPE_NUMBER`, `NEXT_PUBLIC_YAPE_NAME` |
| Código QR | Librería `qrcode` (MIT) | Gratis | — |
| Analítica | Google Analytics 4 (con consentimiento) | Gratis | `NEXT_PUBLIC_GA_ID` |
| Búsqueda | Google Search Console + Bing Webmaster | Gratis | `NEXT_PUBLIC_GSC_VERIFICATION` |
| Fotos de platos | Supabase Storage (bucket `menu`) | Incluido en el plan Free (1 GB) | migración 0009 |

## Notas importantes

- **Vercel Hobby es solo uso no comercial.** Cobrar a clientes con la web o el panel es uso comercial. Para producción con clientes pagando, el plan Pro es lo correcto. Confirma en `vercel.com/docs/limits/fair-use-guidelines`.
- **Supabase desde el 30 de octubre de 2026**: las tablas nuevas de `public` necesitan `GRANT` explícito para la Data API. La migración `0007_fixes_and_grants.sql` ya los da; cualquier tabla nueva debe hacerlo también.
- **Mercado Pago**: las comisiones del link de pago y de Yape Empresa varían según fuentes; revísalas en la página oficial de tarifas antes de cotizar. Usa las credenciales de **producción** solo cuando hayas probado en sandbox.
- **Datos a la IA gratis**: en los planes gratuitos el proveedor puede usar lo que envías para entrenar. No envíes contraseñas, datos de contacto de clientes finales ni documentos de identidad. El código ya excluye los accesos del brief.
- **Gemini y Groq cambian límites seguido.** Los números exactos están en su consola (AI Studio → límites; console.groq.com/settings/limits). Si un modelo deja de estar disponible, cambia `AI_MODEL` sin tocar código.
- **Cal.com**: confirma en su página de precios que los webhooks están en tu plan antes de contar con la reserva automática. Si no, usa el enlace de reservas manual y registra la reunión en Reuniones.
- **Meta / WhatsApp Business API** no se usa: requiere verificación de negocio y cobra por conversación. Para empezar, el pedido y los avisos van por el WhatsApp normal del local (`wa.me`), que es gratis.

## Orden recomendado para activar (el día 1)

1. Supabase: correr migraciones 0001 a 0010 en orden.
2. Vercel: variables de `.env.example`, deploy.
3. Telegram: crear el bot con @BotFather (2 min) → `TELEGRAM_BOT_TOKEN` y `TELEGRAM_CHAT_ID`.
4. Gemini: crear la clave en AI Studio → `GEMINI_API_KEY`.
5. Mercado Pago: cuenta de negocio → credenciales → webhook a `/api/webhooks/mercadopago`.
6. Cal.com o Calendly → webhook a `/api/webhooks/calcom` o `/api/webhooks/calendly`.
