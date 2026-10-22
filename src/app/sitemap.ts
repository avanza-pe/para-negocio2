import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/admin";

// Se regenera cada hora para incluir las cartas publicadas de los locales (SEO para tus clientes).
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const base: MetadataRoute.Sitemap = [
    { url: SITE.url, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/restaurantes`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE.url}/privacidad`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE.url}/condiciones`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
  try {
    const { data } = await createAdminClient().from("venues").select("slug, updated_at").eq("published", true).limit(1000);
    return [...base, ...(data ?? []).map((v) => ({ url: `${SITE.url}/m/${v.slug}`, lastModified: new Date(v.updated_at), changeFrequency: "weekly" as const, priority: 0.6 }))];
  } catch {
    return base; // sin base de datos (build de CI, migración 0009 pendiente): solo las páginas fijas
  }
}
