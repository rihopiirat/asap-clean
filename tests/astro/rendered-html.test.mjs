import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

// Reads the ALREADY-BUILT static HTML directly from dist-astro/ — no
// server, no worker, no browser. The "test:astro" npm script always runs
// `astro build` immediately before this, so it can never pass against
// stale output. Expected strings are hardcoded here (not imported from
// src/content/locales.ts) so a real regression in the rendered output
// can't be masked by comparing the site's copy against itself.
//
// Simplified launch version: nl/en only, real contact details, no
// "Lore"/prototype-banner copy.

const distDir = fileURLToPath(new URL("../../dist-astro", import.meta.url));

const routes = [
  { file: "index.html", locale: "nl", title: "A.S.A.P. Clean | Professionele schoonmaak" },
  { file: "en/index.html", locale: "en", title: "A.S.A.P. Clean | Professional cleaning" },
];

const expectedAlternates = [
  { hreflang: "nl-NL", href: "/" },
  { hreflang: "en", href: "/en" },
];

for (const { file, locale, title } of routes) {
  test(`generated static HTML for ${file} (${locale})`, async () => {
    const html = await readFile(path.join(distDir, file), "utf8");

    assert.match(html, new RegExp(`^<!DOCTYPE html><html lang="${locale}"`, "i"));

    assert.ok(html.includes(`<title>${title}</title>`), `expected <title>${title}</title>`);

    const robotsMatch = html.match(/<meta name="robots" content="([^"]*)">/);
    assert.ok(robotsMatch, "expected a <meta name=\"robots\"> tag");
    assert.match(robotsMatch[1], /noindex/i);
    assert.match(robotsMatch[1], /nofollow/i);

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
