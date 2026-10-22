# Plantillas operativas

Todas son borradores editables. Nada se envía a un cliente sin revisión humana.

## 1. Ficha comercial (1 página)
- **Oferta en una frase:** Contenido y automatización con IA para pymes de Perú que quieren convertir más consultas en oportunidades.
- **Sectores a probar la primera semana (elige 2–3):** [POR CONFIRMAR]
- **Paquetes:** ver `src/lib/site.ts` (`PACKAGES`). Precios de prueba, a validar con clientes reales.
- **Siempre delimitar:** nº de entregables, duración, revisiones, materiales del cliente, tiempos de respuesta, publicación, reportes, exclusiones y forma de pago. La inversión en Meta/TikTok se cobra aparte.

## 2. Propuesta editable
```
Para: [Cliente] · Fecha: [dd/mm/aaaa] · Vigencia: 7 días

1. Diagnóstico (hechos confirmados de su web y redes; hipótesis marcadas como tal)
2. Objetivo del servicio: [métrica verificable]
3. Paquete: [nombre] — S/ [precio] [mensual / proyecto]
4. Incluye: [entregables] · Revisiones: [n] · Plazos: [días]
5. No incluye: [inversión publicitaria, fotografía, etc.]
6. Materiales que aporta el cliente: [logo, accesos con permisos mínimos, fotos]
7. Forma de pago: [transferencia / Yape / Plin] — inicio al confirmar el primer pago
8. Aprobación: nada se publica sin autorización escrita del cliente
```

## 3. Brief de cliente (formulario de onboarding)
Sector · público · oferta · tono · diferenciadores · ubicación · CTA · referencias visuales · restricciones · persona que aprueba · quién da accesos.

## 4. Checklist de onboarding (flujo C, manual en el día 1)
- [ ] Marcar *Ganado* en `/dashboard/prospectos`
- [ ] Crear cliente en `/dashboard/clientes` (con enlace de carpeta)
- [ ] Crear carpeta en Drive desde plantilla: `Brief/`, `Propuesta/`, `Entregas/`, `Aprobaciones/`, `Reportes/`
- [ ] Enviar brief y pedir accesos con **permisos mínimos** (nunca contraseñas personales)
- [ ] Confirmar primer pago manualmente
- [ ] Revisar a mano cualquier contrato o promesa antes de enviarlo

## 5. Mensaje inicial de prospección
> Hola, [nombre]. Vi [detalle real del negocio] y se me ocurrió una idea para mejorar cómo presentan [producto/servicio] en redes. Estoy ayudando a negocios a producir contenido y organizar su captación con herramientas de IA. ¿Te puedo compartir una propuesta breve adaptada a tu marca?

Reglas: personaliza con una observación real, sin envíos masivos idénticos, registra cada respuesta y respeta toda solicitud de no contacto. Meta: ~21–23 contactos por día hábil (≈450 al mes); ajustar la oferta tras 100–150 contactos.

## 6. Prompt maestro (producción con IA)
> Actúa como estratega de marketing para una pyme en Perú. Usa únicamente la información confirmada del brief. Si falta un dato, pregunta o márcalo como [POR CONFIRMAR]. Propón 12 contenidos distribuidos en 3 pilares; para cada uno entrega objetivo, formato, idea visual, hook, copy, CTA y métrica. No inventes precios, testimonios, resultados ni características del producto. Señala riesgos de afirmaciones y derechos de imagen.

No pegues contraseñas, datos sensibles ni información innecesaria en prompts. Si usas una API de IA, define un límite de gasto y registra los errores.

## 7. Control de calidad antes de entregar
Ortografía · marca · precios · enlaces · derechos de uso · veracidad de afirmaciones · aprobación del cliente registrada.

## 8. Reporte mensual
Solo métricas registradas en `/dashboard/metricas` y verificables. No uses alcance o reproducciones como sustituto de ventas: reporta la métrica del objetivo contratado.
