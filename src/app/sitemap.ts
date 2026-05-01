import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mektuplas.com";

const publicRoutes = [
  "",
  "/hakkimizda",
  "/hizmetlerimiz",
  "/hediyeler",
  "/kampanyalar",
  "/yorumlar",
  "/iletisim",
  "/sss",
  "/sozlesmeler",
  "/mektup-yaz",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return publicRoutes.map((route, index) => ({
    url: `${SITE_URL}${route}`,
    lastModified: now,
    changeFrequency: index === 0 ? "daily" : "weekly",
    priority: index === 0 ? 1 : 0.7,
  }));
}
