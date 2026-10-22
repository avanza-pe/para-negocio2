import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

// CSP solo en producción (en desarrollo Next necesita eval/websockets). Sin form-action a propósito:
// el inicio de sesión con Google redirige a otro dominio desde un formulario.
// Mercado Pago: el SDK JS (Yape) se carga de sdk.mercadopago.com y habla con sus APIs.
// img-src https: permite fotos de platos alojadas fuera (Supabase Storage, Instagram, etc.).
const MP = "https://sdk.mercadopago.com https://*.mercadopago.com https://*.mercadolibre.com https://*.mlstatic.com";
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com ${MP}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com ${MP}`,
  `frame-src ${MP}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Fotos de platos (hasta 2 MB) suben por Server Action; el límite por defecto es 1 MB.
  experimental: { serverActions: { bodySizeLimit: "3mb" } },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    const headers = process.env.NODE_ENV === "production" ? [...securityHeaders, { key: "Content-Security-Policy", value: csp }] : securityHeaders;
    return [{ source: "/(.*)", headers }];
  },
};

export default nextConfig;
