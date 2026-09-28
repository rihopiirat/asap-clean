import { test, expect } from "@playwright/test";
import { routes, localeCopy, navLinks } from "./fixtures/locales";

for (const { path, locale } of routes) {
  test(`desktop nav: clicking each link actually scrolls to its target section – ${path} (${locale})`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "chromium-mobile", "Desktop nav (.desktop-nav) is hidden below 920px; see mobile-layout.spec.ts");

    await page.goto(path);
    const nav = page.getByRole("navigation", { name: "Primary navigation" });

    for (const { anchor, navIndex } of navLinks) {
      const label = localeCopy[locale].nav[navIndex];
      await nav.getByRole("link", { name: label }).click();
      await expect(page).toHaveURL(new RegExp(`#${anchor}$`));
      await expect(page.locator(`#${anchor}`)).toBeInViewport();
    }
  });

  test(`hero: primary and secondary CTAs scroll to their target sections – ${path} (${locale})`, async ({ page }) => {
    await page.goto(path);
    const copy = localeCopy[locale];

    await page.locator(".hero-actions a.button.secondary", { hasText: copy.heroSecondaryCta }).click();
    await expect(page).toHaveURL(/#services$/);
    await expect(page.locator("#services")).toBeInViewport();

    await page.goto(path);
    await page.locator(".hero-actions a.button.primary", { hasText: copy.heroPrimaryCta }).click();
    await expect(page).toHaveURL(/#contact$/);
    await expect(page.locator("#contact")).toBeInViewport();
  });
}
