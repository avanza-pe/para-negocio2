# Plan de lanzamiento: restaurantes y cobros

## Estado

Implementado: Supabase (0001–0010), carta digital con pedidos por WhatsApp, reservas, QR, panel del dueño, cobros con Mercado Pago/Yape/Plin, personas, IA gratuita (Gemini/Groq), avisos por Telegram y correo, webhooks de Calendly y Cal.com, cron diario.

Pendiente antes de cobrar a clientes reales:

1. Probar un cobro real con Yape en **sandbox** de Mercado Pago, luego en producción con S/ 1.
2. Verificar en Cal.com que los webhooks estén en el plan gratis (ver `docs/apis-gratis.md`).
3. Configurar el bucket `menu` en Supabase Storage (la migración 0009 lo crea si la extensión está disponible; si no, créalo a mano, público).
4. Revisar con un profesional los textos de privacidad, condiciones y la propuesta.
5. Decidir plan de Vercel (Hobby no permite uso comercial).

## Día 1 para un restaurante

| Hora | Tarea |
|---|---|
| 09:00 | Llamada de 15 min: dolor (comisiones, pedidos por WhatsApp) |
| 10:00 | Recibir la carta (foto o PDF) → Locales → Importar con IA → revisar precios |
| 11:00 | Datos: WhatsApp de pedidos, Yape, horario, delivery → publicar |
| 12:00 | Imprimir QR para mesas (QR y enlaces → Imprimir) |
| 14:00 | Enviar al dueño su enlace privado del panel (confirmar reservas, agotados) |
| 16:00 | Cobro de implementación con enlace de pago |
| Día 2 | Revisar primeros pedidos y reservas; registrar métricas al cierre de mes |
