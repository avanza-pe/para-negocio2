/**
 * Plantillas de buyer personas para restaurantes y cafeterías en Perú (punto de partida, no verdad).
 * Se ajustan con lo que el dueño confirme y con lo que digan los pedidos y reservas reales.
 * Fundamento en docs/personas.md.
 */
export const GASTRO_PERSONAS = [
  {
    name: "Oficinista del menú del día",
    profile: "25–45 años, trabaja cerca del local, almuerza fuera de lunes a viernes. Presupuesto S/ 15–25 por almuerzo.",
    goals: "Comer rico, rápido (menos de 45 min) y con variedad durante la semana.",
    pains: "Colas, no saber cuál es el menú antes de salir, demoras al pagar.",
    channels: "WhatsApp (estados y listas de difusión), Instagram Stories, Google Maps.",
    objections: "Precio frente al menú de al lado; tiempo de espera.",
    message: "Tu menú de hoy en WhatsApp a las 11:00: pide, paga con Yape y recoge sin cola.",
  },
  {
    name: "Familia de fin de semana",
    profile: "Padres de 30–50 años con hijos; salen sábados o domingos al mediodía.",
    goals: "Un plan de domingo seguro: porciones para compartir, opciones para niños, mesa sin esperar.",
    pains: "Esperar mesa con niños, sorpresas en la cuenta, que no haya estacionamiento.",
    channels: "Facebook, Google Maps (fotos y reseñas), TikTok, recomendación de amigos.",
    objections: "Ticket total alto; incertidumbre sobre porciones.",
    message: "Reserva tu mesa del domingo en un minuto y mira la carta con precios antes de venir.",
  },
  {
    name: "Estudiante o trabajador remoto",
    profile: "18–32 años, universitario o freelance, llega con laptop. Gasta S/ 10–25 por visita.",
    goals: "Buen café, wifi estable, enchufes y un ambiente tranquilo para quedarse.",
    pains: "Sentirse presionado a irse, precios altos por consumo pequeño.",
    channels: "Instagram, TikTok, Google Maps («café para estudiar cerca»).",
    objections: "«Es caro para quedarme varias horas».",
    message: "Combo estudio: café + sánguche con wifi y enchufes, de lunes a jueves.",
  },
  {
    name: "Pareja en cita o celebración",
    profile: "25–40 años; aniversarios, cumpleaños y fechas como San Valentín o Día de la Madre.",
    goals: "Un lugar con ambiente, buena foto y un detalle especial.",
    pains: "No conseguir mesa en fechas clave, que el lugar no sea como en las fotos.",
    channels: "Instagram, TikTok, reseñas de Google.",
    objections: "Incertidumbre sobre la calidad y el precio total.",
    message: "Reserva para tu celebración y avísanos: te esperamos con un postre con vela.",
  },
  {
    name: "Pide a domicilio por WhatsApp",
    profile: "25–45 años, en casa u oficina cercana; pide 2–4 veces al mes.",
    goals: "Pedir rápido y a precio de local, sin recargos de las apps.",
    pains: "Comisiones o recargos en apps de delivery, pedidos que llegan mal, demoras.",
    channels: "WhatsApp, Instagram, recomendación de vecinos.",
    objections: "Tiempo de entrega y zona de reparto.",
    message: "Pide directo por WhatsApp desde nuestra carta: mismo precio que en el local.",
  },
  {
    name: "Turista gastronómico",
    profile: "Visitante nacional o extranjero que planifica dónde comer comida peruana.",
    goals: "Probar platos auténticos con buena relación calidad-precio.",
    pains: "Cartas sin descripción ni fotos, no saber si aceptan tarjeta.",
    channels: "Google Maps, TripAdvisor, Instagram.",
    objections: "Desconfianza por precios para turistas.",
    message: "Carta clara con fotos, descripción de cada plato y precios en soles.",
  },
] as const;
