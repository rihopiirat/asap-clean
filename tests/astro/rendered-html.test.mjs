import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

// Reads the ALREADY-BUILT static HTML directly from dist-astro/ — no
// server, no worker, no browser. The "test:astro" npm script always runs
// `astro build` (default env — no ALLOW_INDEXING) immediately before this,
// so it can never pass against stale output, and always leaves dist-astro
// in the safe, preview/default (noindex) state afterward. Expected strings
// are hardcoded here (not imported from astro-src/content/locales.ts) so a
// real regression in the rendered output can't be masked by comparing the
// site's copy against itself.
//
// Simplified launch version: nl/en only, real contact details, no
// "Lore"/prototype-banner copy. Production indexing (ALLOW_INDEXING=true)
// has its own separate test: tests/astro/production/rendered-html.test.mjs
// / `npm run test:astro:production`.

const SITE_URL = "https://asapclean.nl";
const distDir = fileURLToPath(new URL("../../dist-astro", import.meta.url));

const routes = [
  { file: "index.html", locale: "nl", title: "A.S.A.P. Clean | Professionele schoonmaak", canonical: `${SITE_URL}/` },
  { file: "en/index.html", locale: "en", title: "A.S.A.P. Clean | Professional cleaning", canonical: `${SITE_URL}/en` },
];

const expectedAlternates = [
  { hreflang: "nl-NL", href: `${SITE_URL}/` },
  { hreflang: "en", href: `${SITE_URL}/en` },
];

for (const { file, locale, title, canonical } of routes) {
  test(`generated static HTML for ${file} (${locale}) — default (preview-safe) build`, async () => {
    const html = await readFile(path.join(distDir, file), "utf8");

    assert.match(html, new RegExp(`^<!DOCTYPE html><html lang="${locale}"`, "i"));

    assert.ok(html.includes(`<title>${title}</title>`), `expected <title>${title}</title>`);

    // Default build must stay noindex/nofollow on BOTH directives — this is
    // the safe default that protects local builds, CI, and any deployment
    // that doesn't explicitly opt into indexing.
    const robotsMatch = html.match(/<meta name="robots" content="([^"]*)">/);
    assert.ok(robotsMatch, 'expected a <meta name="robots"> tag');
    assert.match(robotsMatch[1], /noindex/i);
    assert.match(robotsMatch[1], /nofollow/i);

    const googlebotMatch = html.match(/<meta name="googlebot" content="([^"]*)">/);
    assert.ok(googlebotMatch, 'expected a <meta name="googlebot"> tag');
    assert.match(googlebotMatch[1], /noindex/i);
    assert.match(googlebotMatch[1], /nofollow/i);

    // Canonical and hreflang are present and absolute regardless of
    // indexing mode — they describe the intended production URL, not
    // whether this particular build is allowed to be indexed.
    assert.ok(
      html.includes(`<link rel="canonical" href="${canonical}">`),
      `expected canonical link ${canonical}`,
    );
    for (const alt of expectedAlternates) {
      assert.ok(
        html.includes(`<link rel="alternate" hreflang="${alt.hreflang}" href="${alt.href}">`),
        `expected hreflang alternate for ${alt.hreflang} -> ${alt.href}`,
      );
    }

    // No "it"/"ro" alternates should remain now that those locales are dropped.
    assert.doesNotMatch(html, /hreflang="it"/);
    assert.doesNotMatch(html, /hreflang="ro"/);

    // Real contact details, no personal name, no leftover prototype framing.
    assert.ok(html.includes("tel:+31630733768"), "expected the tel: call link");
    assert.ok(html.includes("https://wa.me/31630733768"), "expected the wa.me chat link");
    assert.ok(html.includes("06 30 73 37 68"), "expected the visible phone number");
    assert.doesNotMatch(html, /Lore/i, "no personal-name references should remain");
    assert.doesNotMatch(html, /prototype-bar/i, "the prototype banner should be gone");
  });
}

test("robots.txt allows crawling by default (preview-safe), without advertising the sitemap", async () => {
  const body = await readFile(path.join(distDir, "robots.txt"), "utf8");
  assert.match(body, /User-agent:\s*\*/);
  // Crawling must stay ALLOWED even in preview/default mode: a crawler
  // that's blocked from fetching a page never sees its noindex meta tag,
  // which is the actual, authoritative de-indexing signal here.
  assert.match(body, /Allow:\s*\//);
  assert.doesNotMatch(body, /Disallow/i, "crawling should not be blocked outright — noindex meta tags handle de-indexing");
  assert.doesNotMatch(body, /Sitemap:/i, "the sitemap should not be advertised while the site is still marked noindex");
});

test("sitemap.xml lists exactly the Dutch and English production pages", async () => {
  const body = await readFile(path.join(distDir, "sitemap.xml"), "utf8");
  assert.match(body, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
  assert.ok(body.includes(`<loc>${SITE_URL}/</loc>`), "expected the nl page in the sitemap");
  assert.ok(body.includes(`<loc>${SITE_URL}/en</loc>`), "expected the en page in the sitemap");
  const urlCount = (body.match(/<url>/g) ?? []).length;
  assert.equal(urlCount, 2, "the sitemap should contain only the two nl/en production pages");
});
