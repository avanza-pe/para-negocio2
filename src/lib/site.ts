import { publicEnv } from "@/lib/env";

/** Nombre provisional (informe §8, 08:30). Cámbialo aquí y se actualiza en toda la web. */
export const SITE = {
  name: "AVANZA",
  tagline: "Haz que tu negocio avance con contenido y automatización con IA",
  description:
    "Agencia de marketing digital en Perú: contenido para redes, videos, campañas creativas, automatización de leads y landing pages, acelerados con IA y supervisados por personas.",
  url: publicEnv.NEXT_PUBLIC_SITE_URL,
  bookingUrl: publicEnv.NEXT_PUBLIC_BOOKING_URL,
  whatsapp: publicEnv.NEXT_PUBLIC_WHATSAPP_NUMBER,
  contactEmail: publicEnv.NEXT_PUBLIC_CONTACT_EMAIL,
} as const;

export const whatsappLink = (text = "Hola, quiero agendar un diagnóstico de 15 minutos") =>
  SITE.whatsapp ? `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}` : null;

export const PACKAGES = [
  {
    name: "Contenido Inicio",
    price: "S/ 350–650",
    unit: "al mes",
    items: ["8 piezas gráficas al mes", "Copies y calendario", "1 ronda de cambios"],
  },
  {
    name: "Contenido + Reels",
    price: "S/ 650–1,200",
    unit: "al mes",
    featured: true,
    items: ["12 piezas al mes", "4 videos cortos editados", "Copies y calendario"],
  },
  {
    name: "Campaña creativa",
    price: "S/ 250–600",
    unit: "por proyecto",
    items: ["3–5 creatividades", "Copies", "Propuesta de campaña"],
  },
  {
    name: "Automatización básica",
    price: "S/ 300–900",
    unit: "implementación",
    items: ["Formulario y registro de leads", "Avisos automáticos", "Pipeline sencillo"],
  },
  {
    name: "Landing comercial",
    price: "S/ 500–1,200",
    unit: "por proyecto",
    items: ["Página de servicio", "CTA a WhatsApp y formulario", "Analítica básica"],
  },
] as const;

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
  { q: "¿Cómo se paga?", a: "Por transferencia bancaria, Yape o Plin según lo acordado. El trabajo inicia al confirmarse el primer pago." },
  { q: "¿Cuántas revisiones incluye?", a: "Cada plan detalla sus rondas de cambios; por ejemplo, Contenido Inicio incluye 1 ronda. Todo queda por escrito en la propuesta." },
] as const;

export const TOOLS = ["ChatGPT", "Canva", "CapCut", "Meta Business Suite", "Calendly"] as const;

export const PROCESS = ["Diagnóstico", "Propuesta", "Producción", "Aprobación", "Entrega y medición"] as const;
