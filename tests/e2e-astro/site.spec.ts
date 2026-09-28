import { test, expect } from "@playwright/test";

// Focused suite for the simplified launch version — covers what actually
// matters for shipping today (both languages load correctly, mobile
// layout, images/logo, contact links), not exhaustive structural coverage.
// Expanded coverage and exact screenshot matching are explicitly deferred.

const routes = [
  { path: "/", locale: "nl", title: "A.S.A.P. Clean | Professionele schoonmaak" },
  { path: "/en", locale: "en", title: "A.S.A.P. Clean | Professional cleaning" },
];

const TEL_HREF = "tel:+31630733768";
const WA_HREF = "https://wa.me/31630733768";
const PHONE_DISPLAY = "06 30 73 37 68";

for (const { path, locale, title } of routes) {
  test.describe(`${path} (${locale})`, () => {
    test("loads with 200, correct lang, correct title, noindex", async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page).toHaveTitle(title);
      expect(await page.getAttribute("html", "lang")).toBe(locale);

      const robots = page.locator('meta[name="robots"]');
      await expect(robots).toHaveAttribute("content", /noindex/i);
      await expect(robots).toHaveAttribute("content", /nofollow/i);
    });

    test("logo image loads successfully (not broken)", async ({ page }) => {
      await page.goto(path);
      const logo = page.locator(".brand-logo");
      await expect(logo).toBeVisible();
      const naturalWidth = await logo.evaluate((img: HTMLImageElement) => img.naturalWidth);
      expect(naturalWidth, "logo image should have actually loaded").toBeGreaterThan(0);
    });

    test("contact section: phone number, tel: call button, wa.me chat button", async ({ page }) => {
      await page.goto(path);
      await expect(page.locator(".phone-number")).toHaveText(PHONE_DISPLAY);

      const callButton = page.locator(".contact-actions a.primary");
      await expect(callButton).toHaveAttribute("href", TEL_HREF);

      const chatButton = page.locator(".contact-actions a.whatsapp");
      await expect(chatButton).toHaveAttribute("href", WA_HREF);
      // Labeled as chat, not call.
      const chatText = (await chatButton.textContent())?.toLowerCase() ?? "";
      expect(chatText).toContain("chat");
      expect(chatText).not.toContain("call");
      expect(chatText).not.toMatch(/\bbel\b/); // Dutch for "call"
    });

    test("no console errors, page errors, failed requests, or HTTP error responses", async ({ page, baseURL }) => {
      const consoleErrors: string[] = [];
      const pageErrors: string[] = [];
      const failedRequests: string[] = [];
      const errorResponses: string[] = [];
      const origin = new URL(baseURL ?? "http://localhost").origin;

      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      });
      page.on("pageerror", (err) => pageErrors.push(err.message));
      page.on("requestfailed", (req) => {
        failedRequests.push(`${req.method()} ${req.url()} — ${req.failure()?.errorText ?? "unknown error"}`);
      });
      page.on("response", (res) => {
        if (new URL(res.url()).origin === origin && res.status() >= 400) {
          errorResponses.push(`${res.status()} ${res.url()}`);
        }
      });

      await page.goto(path);
      await page.waitForLoadState("networkidle");

      expect(consoleErrors, "console.error calls").toEqual([]);
      expect(pageErrors, "uncaught page errors").toEqual([]);
      expect(failedRequests, "network-level request failures").toEqual([]);
      expect(errorResponses, "same-origin responses with an HTTP error status").toEqual([]);
    });
  });
}

test("language switch links work and update aria-current + lang", async ({ page }) => {
  await page.goto("/");
  const switcher = page.getByLabel("Language", { exact: true });
  await expect(switcher.getByRole("link", { name: "NL" })).toHaveAttribute("aria-current", "page");

  await switcher.getByRole("link", { name: "EN" }).click();
  await expect(page).toHaveURL(/\/en$/);
  await page.waitForFunction(() => document.documentElement.lang === "en");
  await expect(switcher.getByRole("link", { name: "EN" })).toHaveAttribute("aria-current", "page");

  await switcher.getByRole("link", { name: "NL" }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.waitForFunction(() => document.documentElement.lang === "nl");
});

for (const { path, locale } of routes) {
  test(`mobile: no horizontal overflow, branding/nav/contact usable – ${path} (${locale})`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium-mobile", "Mobile-only check");
    await page.goto(path);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, "page should not overflow horizontally on a mobile viewport").toBeLessThanOrEqual(1);

    await expect(page.locator(".brand-logo")).toBeVisible();
    await expect(page.locator(".language-switch")).toBeVisible();
    await expect(page.locator(".contact-actions a.primary")).toBeVisible();
    await expect(page.locator(".contact-actions a.whatsapp")).toBeVisible();
  });
}
