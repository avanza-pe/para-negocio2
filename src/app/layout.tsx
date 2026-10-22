import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { ThemeProvider } from "@/components/theme";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SITE } from "@/lib/site";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const display = Bricolage_Grotesque({ variable: "--font-display", subsets: ["latin"] });
const serif = Instrument_Serif({ variable: "--font-serif-display", subsets: ["latin"], weight: "400", style: ["normal", "italic"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0d0d17" },
    { media: "(prefers-color-scheme: light)", color: "#faf9ff" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} | Marketing digital con IA en Perú`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "agencia de marketing digital Perú",
    "marketing con IA",
    "contenido para redes sociales",
    "videos publicitarios",
    "automatización de leads",
    "landing page",
    "agencia de marketing Lima",
    "marketing digital para pymes",
  ],
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  publisher: SITE.name,
  formatDetection: { email: false, address: false, telephone: false },
  alternates: { canonical: "/", languages: { "es-PE": "/" } },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  verification: SITE.gscVerification ? { google: SITE.gscVerification } : undefined,
  openGraph: {
    title: `${SITE.name} | Marketing digital con IA en Perú`,
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.name,
    type: "website",
    locale: "es_PE",
  },
  twitter: { card: "summary_large_image", title: `${SITE.name} | Marketing digital con IA en Perú`, description: SITE.description },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-PE" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} ${display.variable} ${serif.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {/* Marca "js" antes de hidratar: oculta los elementos animados sin parpadeo. Sin JS todo queda visible. */}
        <Script id="js-flag" strategy="beforeInteractive">
          {"document.documentElement.classList.add('js');setTimeout(function(){if(!window.__gsapReady)document.documentElement.classList.remove('js')},4000)"}
        </Script>
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
