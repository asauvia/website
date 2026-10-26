import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/schema";
import services from "@/data/services";
import { getAllProducts } from "@/lib/products";

// The blog is a separate app on its own host. Its pages are listed here from the blog's own sitemap.
// Override BLOG_SITEMAP_URL to point at a different copy (for example a local preview).
const BLOG_SITEMAP_URL = process.env.BLOG_SITEMAP_URL || "https://blog.asauvia.com/sitemap.xml";
const BLOG_HOME = "https://blog.asauvia.com";

// Only routes that actually resolve. /styleguide is excluded (noindex).
// lastModified is set only where the real date of the last change is known. Search engines ignore
// lastmod values they cannot trust, so pages without a known date carry no lastmod at all.
const STATIC_ROUTES: {
  path: string;
  priority: number;
  changeFrequency: "weekly" | "monthly" | "yearly";
  lastModified?: string;
}[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/services", priority: 0.9, changeFrequency: "monthly" },
  { path: "/products", priority: 0.8, changeFrequency: "monthly" },
  { path: "/how-we-work", priority: 0.7, changeFrequency: "monthly" },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" },
  { path: "/testimonials", priority: 0.8, changeFrequency: "monthly" },
  { path: "/security", priority: 0.6, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.8, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly", lastModified: "2026-10-19" },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
  { path: "/cookies", priority: 0.2, changeFrequency: "yearly", lastModified: "2026-10-19" },
];

type BlogEntry = { url: string; lastModified?: Date };

/** Reads every <url> entry from the blog's sitemap. Falls back to the blog home page if the blog cannot be reached. */
async function blogEntries(): Promise<BlogEntry[]> {
  try {
    const res = await fetch(BLOG_SITEMAP_URL, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    const entries = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].flatMap(([, block]) => {
      const loc = block.match(/<loc>\s*([^<]+?)\s*<\/loc>/)?.[1]?.replace(/&amp;/g, "&");
      const lastmod = block.match(/<lastmod>\s*([^<]+?)\s*<\/lastmod>/)?.[1];
      return loc ? [{ url: loc, ...(lastmod && { lastModified: new Date(lastmod) }) }] : [];
    });
    if (entries.length === 0) throw new Error("no entries");
    return entries;
  } catch (error) {
    console.warn(`Blog sitemap unavailable (${error instanceof Error ? error.message : error}); listing the blog home only.`);
    return [{ url: BLOG_HOME }];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blog = await blogEntries();

  return [
    ...STATIC_ROUTES.map((r) => ({
      url: r.path === "/" ? SITE_URL : `${SITE_URL}${r.path}`,
      ...(r.lastModified && { lastModified: new Date(`${r.lastModified}T00:00:00Z`) }),
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    })),
    ...services.map((s) => ({
      url: `${SITE_URL}/services/${s.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...getAllProducts().map((product) => ({
      url: `${SITE_URL}/products/${product.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...blog.map((entry) => ({
      url: entry.url,
      ...(entry.lastModified && { lastModified: entry.lastModified }),
      changeFrequency: "weekly" as const,
      priority: entry.url === BLOG_HOME ? 0.9 : 0.7,
    })),
  ];
}
