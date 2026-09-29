import type { APIRoute } from "astro";
import { siteUrl } from "../content/locales";

// Crawling is allowed in BOTH modes — that's what lets a crawler actually
// fetch a page and read its <meta name="robots">/<meta name="googlebot">
// content="noindex, nofollow"> tags (see astro-src/layouts/
// CleaningLayout.astro), which are the real, authoritative de-indexing
// signal. Disallowing crawling here would be counterproductive: a
// crawler that's blocked from fetching a page never sees the noindex meta
// tag at all, and a blocked URL can still end up indexed with no
// description via other discovery paths (an inbound link, etc.) — a known
// robots.txt/noindex interaction pitfall. Only the sitemap is
// mode-dependent: it's advertised in production (ALLOW_INDEXING=true, set
// only in Cloudflare Pages' PRODUCTION environment variables) and omitted
// otherwise, so there's no reason to invite extra crawl attention toward
// a build that's still marked noindex.
export const GET: APIRoute = () => {
  const allowIndexing = import.meta.env.ALLOW_INDEXING === "true";
  const body = allowIndexing
    ? `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`
    : `User-agent: *\nAllow: /\n`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
