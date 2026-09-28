import { test, expect } from "@playwright/test";
import { routes, languageLinks } from "./fixtures/locales";

// Scope: only what's actually visible/usable on mobile today. There is no
// mobile menu (see app/globals.css:65 — `.desktop-nav{display:none}` below
// 920px with nothing replacing it). That gap is intentionally NOT asserted
// here as "must remain absent" — this test just documents current behavior
// so it doesn't need to change the day a menu is added. Building an
// accessible mobile menu is tracked as backlog work for after the Astro
// migration (keyboard operation, an aria-expanded toggle, closing behavior,
// working section links).
for (const { path, locale } of routes) {
  test(`mobile: branding and language links are usable, no horizontal overflow – ${path} (${locale})`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium-mobile", "Mobile-only checks");

    await page.goto(path);

    testInfo.annotations.push({
      type: "known-gap",
      description: "No mobile menu exists; .desktop-nav is hidden with nothing replacing it below 920px. Backlog: accessible mobile menu post-Astro-migration.",
    });

    const brand = page.getByRole("link", { name: "A.S.A.P. Clean" });
    await expect(brand).toBeVisible();
    await expect(brand).toHaveAttribute("href", "#top");

    const switcher = page.getByLabel("Language", { exact: true });
    await expect(switcher).toBeVisible();
    for (const link of languageLinks) {
      const anchor = switcher.getByRole("link", { name: link.label });
      await expect(anchor).toBeVisible();
      await expect(anchor).toHaveAttribute("href", link.href);
    }

    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth - document.documentElement.clientWidth;
    });
    expect(overflow, "page should not overflow horizontally on a mobile viewport").toBeLessThanOrEqual(1);
  });

  test(`mobile: brand link scrolls back to top after scrolling down – ${path} (${locale})`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium-mobile", "Mobile-only check");

    await page.goto(path);
    await page.locator("#area").scrollIntoViewIfNeeded();
    await expect(page.locator("#area")).toBeInViewport();

    await page.getByRole("link", { name: "A.S.A.P. Clean" }).click();
    await expect(page).toHaveURL(/#top$/);
    await expect(page.locator("#top")).toBeInViewport();
  });
}
