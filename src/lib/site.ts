import { publicEnv } from "@/lib/env";

/** Nombre provisional (informe §8, 08:30). Cámbialo aquí y se actualiza en toda la web. */
export const SITE = {
  name: "Aumenta",
  tagline: "Haz que tu negocio avance con contenido y automatización con IA",
  description:
    "Agencia de marketing digital con IA en Perú: contenido para redes, carta digital para restaurantes y cafeterías, y automatización de pedidos, reservas y leads. Diagnóstico de 15 minutos sin costo.",
  url: publicEnv.NEXT_PUBLIC_SITE_URL,
  bookingUrl: publicEnv.NEXT_PUBLIC_BOOKING_URL,
  whatsapp: publicEnv.NEXT_PUBLIC_WHATSAPP_NUMBER,
  contactEmail: publicEnv.NEXT_PUBLIC_CONTACT_EMAIL,
  gaId: publicEnv.NEXT_PUBLIC_GA_ID,
  gscVerification: publicEnv.NEXT_PUBLIC_GSC_VERIFICATION,
  /** Yape/Plin directo de la agencia (cobro manual en /pagar). */
  yapeNumber: publicEnv.NEXT_PUBLIC_YAPE_NUMBER,
  yapeName: publicEnv.NEXT_PUBLIC_YAPE_NAME,
  /** Clave pública de Mercado Pago (habilita "Pagar con Yape" vía Mercado Pago). */
  mpPublicKey: publicEnv.NEXT_PUBLIC_MP_PUBLIC_KEY,
} as const;

export const whatsappLink = (text = "Hola, quiero agendar un diagnóstico de 15 minutos") =>
  SITE.whatsapp ? `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}` : null;

export { GASTRO_PACKAGES, PACKAGES } from "@/lib/offer";

export const SERVICES_LIST = [
  { title: "Contenido para redes", text: "Piezas gráficas, copies y calendario editorial alineados a tu marca." },
  { title: "Videos publicitarios", text: "Reels y videos cortos editados para captar atención en los primeros segundos." },
  { title: "Campañas creativas", text: "Ideas y creatividades para lanzamientos, promociones y fechas clave." },
  { title: "Automatización de leads", text: "Formulario, CRM y avisos para que ninguna consulta se pierda." },
  { title: "Landing pages", text: "Una página clara, rápida y pensada para convertir visitas en conversaciones." },
] as const;

export const FAQ = [
  { q: "¿Qué pasa en el diagnóstico de 15 minutos?", a: "Revisamos tu negocio, tu público y tu objetivo, y te decimos con honestidad si podemos ayudarte y con qué paquete. No tiene costo ni compromiso." },
  { q: "¿La IA publica por mí sin que lo vea nadie?", a: "No. La IA acelera la producción, pero una persona revisa cada entrega y nada se publica sin tu aprobación." },
  { q: "¿Los precios incluyen la inversión en anuncios?", a: "No. La inversión en Meta o TikTok se paga aparte y directamente por ti. Los planes cubren creatividad, producción y gestión." },
  { q: "¿Garantizan ventas?", a: "No prometemos ventas garantizadas. Medimos la métrica del objetivo que contratamos juntos y reportamos solo datos verificables." },
  { q: "¿Cómo se paga?", a: "Te enviamos un enlace de pago: puedes pagar con Yape o tarjeta a través de Mercado Pago, o por Yape/Plin directo y transferencia. El trabajo inicia al confirmarse el primer pago." },
  { q: "¿Trabajan con restaurantes y cafeterías?", a: "Sí. Tenemos una carta digital con pedidos por WhatsApp, reservas, QR para mesas y botón de reseñas en Google, sin comisiones por pedido. Mira la demo en /restaurantes." },
  { q: "¿Cuántas revisiones incluye?", a: "Cada plan detalla sus rondas de cambios; por ejemplo, Contenido Inicio incluye 1 ronda. Todo queda por escrito en la propuesta." },
] as const;

export const TOOLS = ["ChatGPT", "Canva", "CapCut", "Meta Business Suite", "Calendly"] as const;

export const PROCESS = ["Diagnóstico", "Propuesta", "Producción", "Aprobación", "Entrega y medición"] as const;
