import { test, expect } from "@playwright/test";
import { routes, localeCopy } from "./fixtures/locales";

for (const { path, locale } of routes) {
  test(`renders the main heading and a representative service heading – ${path} (${locale})`, async ({ page }) => {
    await page.goto(path);
    const copy = localeCopy[locale];

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(copy.title);
    await expect(page.getByRole("heading", { level: 3, name: copy.firstServiceHeading, exact: true })).toBeVisible();
  });
}
