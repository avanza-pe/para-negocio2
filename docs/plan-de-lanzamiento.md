# Plan de lanzamiento (informe §8, §13, §14)

## Día 1 — con este código
| Hora | Tarea | Hecho cuando |
|---|---|---|
| 08:30 | Nombre provisional y oferta de una frase → `src/lib/site.ts` | Se ve en la web |
| 09:00 | Paquetes y condiciones → `PACKAGES` + `docs/plantillas.md` | Ficha de 1 página |
| 10:00 | Crear proyecto Supabase, correr `0001_init.sql` | Tablas visibles |
| 10:30 | Vercel: importar repo, variables, desplegar | Web publicada con HTTPS |
| 12:00 | Agenda: crear enlace Calendly → `NEXT_PUBLIC_BOOKING_URL` y WhatsApp | Botones activos |
| 12:45 | Registrarte en `/registro` (serás admin), desactivar nuevos registros | Entras al panel |
| 15:00 | Probar flujo A (lead de prueba + duplicado) | Aparece en CRM y en Automatizaciones |
| 16:30 | Preparar plantillas de brief/propuesta/Drive | `docs/plantillas.md` |
| 17:15 | QA: móvil y escritorio, formularios, enlaces | Checklist abajo |
| 18:00 | Primer lote de prospectos cargado y primeros contactos | ≥ 20 prospectos con próxima acción |

## Checklist QA
- [ ] Responsive (móvil y escritorio)
- [ ] Formulario guarda datos, valida vacíos y maneja duplicados
- [ ] `/gracias` se muestra tras enviar
- [ ] Botón de agenda y de WhatsApp funcionan
- [ ] HTTPS activo; `/dashboard` redirige a login sin sesión
- [ ] Privacidad y condiciones revisadas
- [ ] Lighthouse (rendimiento y accesibilidad) sin alertas graves
- [ ] Analítica GA4 con consentimiento (pendiente: no incluida en esta versión)

## Días 2–7
2. Responder prospectos y corregir la web según preguntas reales.
3. Reuniones, propuestas y objeciones registradas.
4. Cerrar un piloto pagado o ajustar la oferta; sin trabajo gratis indefinido.
5. Documentar producción real y medir horas por entregable.
6. Automatizar onboarding y lo repetitivo (no las excepciones).
7. Revisar métricas, rentabilidad y sector con más interés; decidir el siguiente experimento.

**Prioridad:** vender y aprender primero, automatizar después. La IA acelera; la estrategia, la verificación y la responsabilidad final siguen siendo humanas.
