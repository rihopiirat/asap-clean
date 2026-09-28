import assert from "node:assert/strict";
import test from "node:test";

// Expected visible copy, kept independent of app/site/CleaningPage.tsx (not
// imported from there) so a real regression in the rendered output can't be
// silently masked by comparing the app's copy against itself.
const expectedTitle = "A.S.A.P. Clean | Persoonlijke schoonmaak in Beverwijk";
const expectedPrototypeBannerText =
  "Prototype — diensten, werkgebied en contactgegevens worden nog met Lore bevestigd.";

test("built worker serves the real page for the root (Dutch) route", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );

  const html = await response.text();

  assert.ok(
    html.includes(`<title>${expectedTitle}</title>`),
    `expected <title>${expectedTitle}</title> in the raw HTML`,
  );

  // Checking for class="prototype-bar" alone would only prove the element
  // exists, not that it carries any real content — match its actual text.
  const prototypeBannerMatch = html.match(/<div class="prototype-bar">([^<]*)<\/div>/);
  assert.ok(prototypeBannerMatch, "expected a .prototype-bar element in the raw HTML");
  assert.equal(prototypeBannerMatch[1], expectedPrototypeBannerText);
});
