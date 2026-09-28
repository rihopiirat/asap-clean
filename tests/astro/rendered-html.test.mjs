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

const distDir = fileURLToPath(new URL("../../dist-astro", import.meta.url));

const expectedTitle = "A.S.A.P. Clean | Persoonlijke schoonmaak in Beverwijk";

const routes = [
  { file: "index.html", locale: "nl", prototype: "Prototype — diensten, werkgebied en contactgegevens worden nog met Lore bevestigd." },
  { file: "en/index.html", locale: "en", prototype: "Prototype — services, service area and contact details still need Lore’s confirmation." },
  { file: "it/index.html", locale: "it", prototype: "Prototipo — servizi, zona e contatti devono ancora essere confermati da Lore." },
  { file: "ro/index.html", locale: "ro", prototype: "Prototip — serviciile, zona și datele de contact urmează să fie confirmate de Lore." },
];

const expectedAlternates = [
  { hreflang: "nl-NL", href: "/" },
  { hreflang: "en", href: "/en" },
  { hreflang: "it", href: "/it" },
  { hreflang: "ro", href: "/ro" },
];

for (const { file, locale, prototype } of routes) {
  test(`generated static HTML for ${file} (${locale})`, async () => {
    const html = await readFile(path.join(distDir, file), "utf8");

    assert.match(html, new RegExp(`^<!DOCTYPE html><html lang="${locale}"`, "i"));

    assert.ok(
      html.includes(`<title>${expectedTitle}</title>`),
      `expected <title>${expectedTitle}</title>`,
    );

    const prototypeMatch = html.match(/<div class="prototype-bar">([^<]*)<\/div>/);
    assert.ok(prototypeMatch, "expected a .prototype-bar element");
    assert.equal(prototypeMatch[1], prototype);

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
  });
}
