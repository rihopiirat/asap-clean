import type { Page } from "@playwright/test";

// Shared stabilization for reference screenshots, reused by both the
// original site's and the Astro site's baseline-capture specs. Explicit
// stabilization, not just network-idle: forces reduced motion, and waits
// for the hero image and fonts specifically.
export async function waitForPageReady(page: Page, routePath: string): Promise<void> {
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
}
