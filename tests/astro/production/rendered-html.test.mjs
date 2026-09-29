import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

// Asserts the PRODUCTION-indexable build (ALLOW_INDEXING=true). Separate
// from tests/astro/rendered-html.test.mjs (the default/preview-safe
// build), and NOT part of routine `npm run test:astro` or `npm test` — run
// explicitly via `npm run test:astro:production`, which builds with
// ALLOW_INDEXING=true immediately before this so it can't pass against a
// stale or wrongly-configured build. Leaves dist-astro in production mode
// afterward; re-run `npm run astro:build` (no env var) to return to the
// safe default before doing anything else with dist-astro locally.

const SITE_URL = "https://asapclean.nl";
const distDir = fileURLToPath(new URL("../../../dist-astro", import.meta.url));

const routes = [
  { file: "index.html", canonical: `${SITE_URL}/` },
  { file: "en/index.html", canonical: `${SITE_URL}/en` },
];

for (const { file, canonical } of routes) {
  test(`generated static HTML for ${file} — production (indexable) build`, async () => {
    const html = await readFile(path.join(distDir, file), "utf8");

    const robotsMatch = html.match(/<meta name="robots" content="([^"]*)">/);
    assert.ok(robotsMatch, 'expected a <meta name="robots"> tag');
    assert.match(robotsMatch[1], /index/i);
    assert.doesNotMatch(robotsMatch[1], /noindex/i);
    assert.match(robotsMatch[1], /follow/i);
    assert.doesNotMatch(robotsMatch[1], /nofollow/i);

    const googlebotMatch = html.match(/<meta name="googlebot" content="([^"]*)">/);
    assert.ok(googlebotMatch, 'expected a <meta name="googlebot"> tag');
    assert.match(googlebotMatch[1], /index/i);
    assert.doesNotMatch(googlebotMatch[1], /noindex/i);
    assert.match(googlebotMatch[1], /follow/i);
    assert.doesNotMatch(googlebotMatch[1], /nofollow/i);

    assert.ok(
      html.includes(`<link rel="canonical" href="${canonical}">`),
      `expected canonical link ${canonical}`,
    );
  });
}

test("robots.txt allows crawling and references the sitemap in production", async () => {
  const body = await readFile(path.join(distDir, "robots.txt"), "utf8");
  assert.match(body, /User-agent:\s*\*/);
  assert.match(body, /Allow:\s*\//);
  assert.doesNotMatch(body, /Disallow/);
  assert.ok(body.includes(`Sitemap: ${SITE_URL}/sitemap.xml`), "expected the sitemap to be referenced");
});
