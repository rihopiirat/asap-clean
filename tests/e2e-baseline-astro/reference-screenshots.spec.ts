import { test } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Comparison screenshots for the SIMPLIFIED LAUNCH VERSION of the Astro
// site — NOT comparable to the protected original baseline
// (tests/e2e-baseline/baseline-images/, untouched by this file), since the
// design was intentionally redone against the approved business cards.
// Exact screenshot matching is deferred for this milestone; this capture
// is for manual visual reference only. Run via
// `npm run test:e2e:baseline:astro`; never part of `npm run test:e2e:astro`
// (separate config/testDir, see playwright.baseline.astro.config.ts).
//
// Not reusing tests/e2e-baseline/stabilize.ts's waitForPageReady: it waits
// for `.hero-image-shell img`, which no longer exists — the launch version
// has no hero photo. Waits for the logo image and fonts instead.
const SCREENSHOTS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "screenshots");

const routes = [
  { path: "/", locale: "nl" },
  { path: "/en", locale: "en" },
];

for (const { path: routePath, locale } of routes) {
  test(`Astro comparison screenshot – ${routePath} (${locale})`, async ({ page }, testInfo) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(routePath);

    const logo = page.locator(".brand-logo");
    await logo.waitFor({ state: "visible" });
    await page.waitForFunction(
      (selector) => {
        const img = document.querySelector(selector) as HTMLImageElement | null;
        return !!img && img.complete && img.naturalWidth > 0;
      },
      ".brand-logo",
    );
    await page.evaluate(() => document.fonts.ready);

    const filePath = path.join(SCREENSHOTS_DIR, `${locale}-${testInfo.project.name}.png`);
    await page.screenshot({ path: filePath, fullPage: true });
  });
}
