import { test } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { routes } from "../e2e/fixtures/locales";
import { waitForPageReady } from "../e2e-baseline/stabilize";

// Comparison screenshots for the Astro migration — NOT the protected
// original baseline (tests/e2e-baseline/baseline-images/, untouched by
// this file). Same browser/viewport projects (playwright.shared.ts),
// same readiness conditions (tests/e2e-baseline/stabilize.ts), against the
// Astro static build instead. Run via `npm run test:e2e:baseline:astro`;
// never part of `npm run test:e2e:astro` (separate config/testDir, see
// playwright.baseline.astro.config.ts).
const SCREENSHOTS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "screenshots");

for (const { path: routePath, locale } of routes) {
  test(`Astro comparison screenshot – ${routePath} (${locale})`, async ({ page }, testInfo) => {
    await waitForPageReady(page, routePath);
    const filePath = path.join(SCREENSHOTS_DIR, `${locale}-${testInfo.project.name}.png`);
    await page.screenshot({ path: filePath, fullPage: true });
  });
}
