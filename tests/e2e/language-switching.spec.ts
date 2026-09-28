import { test, expect } from "@playwright/test";
import { routes, languageLinks } from "./fixtures/locales";

for (const { path, locale } of routes) {
  test.describe(`language switching – ${path} (${locale})`, () => {
    test("returns 200 and shows the correct language switcher state", async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);

      const switcher = page.getByLabel("Language", { exact: true });
      for (const link of languageLinks) {
        const anchor = switcher.getByRole("link", { name: link.label });
        await expect(anchor).toHaveAttribute("href", link.href);
        if (link.href === path) {
          await expect(anchor).toHaveAttribute("aria-current", "page");
        } else {
          await expect(anchor).not.toHaveAttribute("aria-current", "page");
        }
      }
    });

    for (const target of languageLinks) {
      test(`clicking ${target.label} navigates and updates <html lang> after hydration`, async ({ page }) => {
        await page.goto(path);
        await page.getByLabel("Language", { exact: true }).getByRole("link", { name: target.label }).click();
        await expect(page).toHaveURL(new RegExp(`${target.href === "/" ? "/$" : `${target.href}$`}`));

        const expectedLocale = target.label.toLowerCase();
        await page.waitForFunction(
          (expected) => document.documentElement.lang === expected,
          expectedLocale,
        );

        const switcher = page.getByLabel("Language", { exact: true });
        await expect(switcher.getByRole("link", { name: target.label })).toHaveAttribute("aria-current", "page");
      });
    }
  });
}
