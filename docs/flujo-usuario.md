# Flujo de uso: de la primera consulta al cobro

## Para el prospecto (restaurante o cafetería)

1. Ve un anuncio, un post o recibe un enlace y entra a `/restaurantes`.
2. Prueba la **carta demo** (`/m/demo`): ve la carta, arma un pedido y llega a un WhatsApp de prueba. Reserva en la demo no guarda nada.
3. Deja sus datos en el formulario (`Quiero mi carta digital`) o agenda 15 minutos.
4. Recibe propuesta (plan Carta digital o Restaurante Pro) y acepta.
5. Paga con **Yape vía Mercado Pago**, tarjeta, o Yape/Plin directo (página `/pagar/<token>`).

## Para el equipo (panel `/dashboard`)

| Paso | Dónde | Qué hace |
|---|---|---|
| Lead entra | Prospectos (automático) | Aviso por Telegram y correo. Si es repetido, el prospecto se reactiva. |
| Reunión | Reuniones (automático con Cal.com/Calendly) | Crea el prospecto si no existe y la tarea de preparación. |
| Propuesta | Propuestas | Usa los paquetes de `src/lib/offer.ts`. |
| Ganado | Prospectos → Convertir en cliente | Crea cliente, checklist (con pasos de restaurante), brief y personas sugeridas. |
| Carta | Locales y cartas → Datos, Carta | Importa la carta (texto o foto con IA), revisa precios, publica. |
| QR | Locales → QR y enlaces | Imprime 4 tarjetas A4 para mesas y reseñas. |
| Dueño | `/panel/<token>` (enlace privado) | Confirma reservas, marca agotados, cambia precios desde el celular. |
| Cobro | Cobros → Nuevo cobro / Cobro del mes | Envía el enlace por WhatsApp. Mercado Pago confirma solo; Yape directo se marca a mano con constancia. |
| Renovación | Cron diario (automático) | Crea el cobro del mes 5 días antes del vencimiento y marca clientes vencidos. |
| Métricas | Locales → Estadísticas | Pasa visitas, pedidos y reservas a Métricas del cliente para el reporte. |

## Lo que nunca hace sola la automatización

- No envía mensajes a prospectos ni clientes: el equipo manda el enlace.
- No publica contenido ni cartas: la IA propone, una persona aprueba.
- No registra un pago manual sin revisar la constancia.
- No inventa métricas: solo cuenta eventos reales de la carta.

## Errores comunes y qué hacer

| Mensaje | Causa | Solución |
|---|---|---|
| «Ya existe un cobro activo de ese mes» | Ya se creó el cobro de renovación | Usa el existente |
| «Límite diario de uso de IA alcanzado» | `AI_DAILY_LIMIT` | Sube el límite o espera al día siguiente (hora Lima) |
| «Enlace en uso» al crear local | El `/m/<enlace>` ya existe | Elige otro |
| Pago con Yape rechazado | Código de aprobación vencido o saldo | Pedir un código nuevo en la app Yape |
| Carta no aparece en Google | No está publicada o falta sitemap | Publicar y reenviar `sitemap.xml` en Search Console |
