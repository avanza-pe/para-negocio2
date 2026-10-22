import { publicEnv } from "@/lib/env";

/** Nombre provisional (informe §8, 08:30). Cámbialo aquí y se actualiza en toda la web. */
export const SITE = {
  name: "Impulso Digital IA",
  tagline: "Contenido y automatización para que tu negocio convierta más consultas en oportunidades",
  description:
    "Agencia de marketing digital en Perú: contenido para redes, videos, campañas creativas, automatización de leads y landing pages, acelerados con IA y supervisados por personas.",
  url: publicEnv.NEXT_PUBLIC_SITE_URL,
  bookingUrl: publicEnv.NEXT_PUBLIC_BOOKING_URL,
  whatsapp: publicEnv.NEXT_PUBLIC_WHATSAPP_NUMBER,
  contactEmail: "hola@tudominio.pe",
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

export const PROCESS = ["Diagnóstico", "Propuesta", "Producción", "Aprobación", "Entrega y medición"] as const;
