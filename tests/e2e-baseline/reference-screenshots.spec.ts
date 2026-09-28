import { test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { routes } from "../e2e/fixtures/locales";

// Reference screenshots for manual review only — no pass/fail pixel
// comparison. Run explicitly via `npm run test:e2e:baseline`; never part of
// `npx playwright test` / `npm run test:e2e` (see playwright.baseline.config.ts).
//
// Refuses to overwrite an existing baseline image unless you explicitly
// authorise it:
//   ALLOW_BASELINE_OVERWRITE=1 npm run test:e2e:baseline
const BASELINE_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "baseline-images");
const ALLOW_OVERWRITE = process.env.ALLOW_BASELINE_OVERWRITE === "1";

fs.mkdirSync(BASELINE_DIR, { recursive: true });

function assertWritable(filePath: string) {
  if (fs.existsSync(filePath) && !ALLOW_OVERWRITE) {
    throw new Error(
      `Refusing to overwrite existing baseline image: ${filePath}\n` +
        `Re-run with ALLOW_BASELINE_OVERWRITE=1 to intentionally replace it.`,
    );
  }
}

for (const { path: routePath, locale } of routes) {
  test(`reference screenshot – ${routePath} (${locale})`, async ({ page }, testInfo) => {
    const filePath = path.join(BASELINE_DIR, `${locale}-${testInfo.project.name}.png`);
    assertWritable(filePath);

    // Explicit stabilization, not just network-idle: force reduced motion,
    // and wait for the hero image and fonts specifically.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(routePath);

    const heroImage = page.locator(".hero-image-shell img");
    await heroImage.waitFor({ state: "visible" });
    await page.waitForFunction(
      (selector) => {
        const img = document.querySelector(selector) as HTMLImageElement | null;
        return !!img && img.complete && img.naturalWidth > 0;
      },
      ".hero-image-shell img",
    );
    await page.evaluate(() => document.fonts.ready);

    await page.screenshot({ path: filePath, fullPage: true });
  });
}
