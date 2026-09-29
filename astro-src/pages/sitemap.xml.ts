import type { APIRoute } from "astro";
import { siteUrl, localePaths } from "../content/locales";

// Always lists the canonical production URLs — the Dutch and English pages
// only (no old prototype locales, no non-production paths). Its own
// content doesn't need to vary between preview and production builds;
// what actually controls whether it's ever fetched is robots.txt and the
// per-page noindex meta tag.
export const GET: APIRoute = () => {
  const urls = Object.values(localePaths)
    .map((path) => `  <url><loc>${siteUrl}${path}</loc></url>`)
    .join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
