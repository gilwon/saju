import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://drsaju.com";

  const staticPages = [
    { path: "", priority: 1.0, changeFreq: "weekly" as const },
    { path: "/terms", priority: 0.3, changeFreq: "yearly" as const },
    { path: "/privacy-policy", priority: 0.3, changeFreq: "yearly" as const },
    { path: "/refund-policy", priority: 0.3, changeFreq: "yearly" as const },
  ];

  const entries = staticPages.map((page) => ({
    url: `${baseUrl}${page.path}`,
    lastModified: new Date(),
    changeFrequency: page.changeFreq,
    priority: page.priority,
  }));

  return entries;
}
