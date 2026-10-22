/**
 * Oferta comercial (paquetes). Sin dependencias de entorno: lo usan la web, el panel y las propuestas.
 * Precios de lanzamiento orientativos, a validar con clientes reales (ver docs/mercado-restaurantes.md).
 */
export type Package = {
  name: string;
  price: string;
  unit: "al mes" | "por proyecto" | "implementación";
  note?: string;
  items: readonly string[];
  featured?: boolean;
};

export const PACKAGES: readonly Package[] = [
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
];

/** Paquetes para restaurantes, cafeterías y pastelerías (página /restaurantes). */
export const GASTRO_PACKAGES: readonly Package[] = [
  {
    name: "Carta digital",
    price: "S/ 39",
    unit: "al mes",
    note: "+ S/ 190 de implementación",
    items: [
      "Carta web con tu marca y QR para mesas",
      "Pedidos ordenados por WhatsApp, sin comisiones",
      "Reservas con aviso al instante",
      "Botón de Yape y de reseñas en Google",
      "Cambias precios y «agotado» desde tu celular",
    ],
  },
  {
    name: "Restaurante Pro",
    price: "S/ 690–1,200",
    unit: "al mes",
    featured: true,
    items: [
      "Todo lo de Carta digital",
      "12 piezas + 4 reels de tus platos",
      "Calendario con fechas gastronómicas del Perú",
      "Reporte mensual con pedidos y reservas reales",
    ],
  },
  {
    name: "Google y reseñas",
    price: "S/ 250–450",
    unit: "por proyecto",
    items: ["Perfil de Google optimizado (horarios, fotos, carta)", "QR y tarjeta para pedir reseñas", "Plantillas para responder reseñas"],
  },
];

/** Servicios que se pueden contratar (cliente, propuesta). Coinciden con los nombres de los paquetes. */
export const SERVICES = [...PACKAGES, ...GASTRO_PACKAGES].map((p) => p.name);

export const findPackage = (name: string) => [...PACKAGES, ...GASTRO_PACKAGES].find((p) => p.name === name);

/** Servicios que se cobran todos los meses (facturación recurrente y cobros automáticos). */
export const isMonthly = (service: string) => findPackage(service)?.unit === "al mes";
