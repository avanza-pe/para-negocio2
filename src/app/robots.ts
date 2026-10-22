import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/dashboard", "/api", "/auth", "/login", "/registro", "/pendiente", "/gracias", "/panel", "/pagar", "/m/demo"] }],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
