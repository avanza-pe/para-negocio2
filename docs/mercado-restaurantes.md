# Mercado: restaurantes y cafeterías en Perú

Investigación para decidir la oferta. Las cifras vienen de notas de prensa y de INEI citado en prensa; verifícalas en el INEI antes de usarlas en una presentación formal.

## Tamaño y tendencia del sector

- **Actividad de restaurantes creció en 2026** según el INEI citado en prensa: enero +5.97% (comidas y bebidas), marzo +5.09%, mayo +5.05%, junio +5.07% interanual. Fuente: [Andina](https://andina.pe/agencia/noticia-actividad-del-sector-restaurantes-y-bebidas-peru-crecio-597-durante-enero-2026-1068142.aspx) y [Perú Retail](https://www.peru-retail.com/actividad-de-restaurantes-en-peru-crecio-un-5-05-en-mayo-de-2026-segun-el-inei/).
- **Starbucks** supera los 100 locales en Perú (dato de la empresa): las cafeterías formales crecen.
- No encontramos un conteo oficial y actualizado de restaurantes y cafeterías ni de su informalidad. Pendiente: consultar el Directorio de PRODUCE o el INEI (Censos Económicos).

## Canales de pago

- **Yape** es la billetera más usada. Según prensa, se acerca a 15 millones de usuarios, con 11 millones frecuentes (dato sin fecha precisa).
- **Mercado Pago** acepta Yape como medio dentro de su checkout en Perú (Checkout API con token y código de aprobación). Confirmamos que funciona con Checkout API; no encontramos documentación pública que confirme Yape dentro de Checkout Pro, por eso la página de pago ofrece ambas opciones.
- Costos reportados por terceros (verificar en tarifas oficiales): link de pago de Mercado Pago entre ~3.5% y ~4.5% + IGV según medio; Yape personal sin costo; Yape Empresa entre ~2.95% y ~3.3%.

## Canal de pedidos: apps de delivery vs. carta propia

- Gremios del sector reportaron en 2022 que PedidosYa y Rappi cobran entre 20% y 30% por venta; no encontramos cifras vigentes de 2025–2026 para Perú. **Este es el dolor principal a validar con el dueño.**
- La carta propia no reemplaza a las apps: sirve para que los clientes que ya te conocen pidan directo.

## Software que ya existe (competencia)

- **Mesa 24/7**: reservas en línea, foodtech limeña.
- **Restaurant.pe**: SaaS peruano con POS, carta QR y facturación; reporta más de 2,000 clientes (ficha de startup).
- **Fudo**: gestión de restaurantes (no encontramos precios para Perú).

Nuestra diferencia: no somos un POS. Somos carta + pedidos por WhatsApp + reservas + reseñas + contenido para redes, a una mensualidad baja y con la operación hecha por nosotros.

## Clientes: comportamiento

- Google: 92% de consumidores peruanos investiga online antes de ir a un negocio y 69% lee reseñas para decidir entre dos (estudio de 2019, citado por Perú Retail). Es antiguo; úsalo como señal, no como cifra.
- WhatsApp: 98.6% de quienes usan mensajería instantánea lo usan (Erestel 2025 de Osiptel), con mayor uso en Lima.
- Pagos digitales: el 86% de encuestados en una encuesta regional de 2022 usa el celular para comprar comida (Rapyd).

## Perfil de cliente ideal para empezar

Restaurantes y cafeterías de 1 local en Lima con delivery propio o por WhatsApp, carta en PDF o foto, y que ya reciben pedidos por WhatsApp de forma desordenada. Ver `docs/personas.md`.

## Hipótesis a validar con 10 visitas o llamadas

1. ¿Cuánto pagan hoy en comisiones por mes? (si > S/ 390, la mensualidad de Carta digital se paga sola)
2. ¿Cuántos pedidos llegan por WhatsApp a la semana y cuántos se pierden?
3. ¿Aceptarían pagar S/ 39 al mes + S/ 190 de implementación?
4. ¿Qué pieza de contenido les pide su público (platos, promos, reels)?
