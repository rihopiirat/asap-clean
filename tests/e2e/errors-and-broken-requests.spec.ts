import { test, expect } from "@playwright/test";
import { routes, localeCopy } from "./fixtures/locales";

// No allowlist/suppression of any error category: every console error,
// uncaught page error, network-level failure, and same-origin HTTP error
// response is captured and must be empty for the test to pass.
for (const { path, locale } of routes) {
  test(`no console/page errors, failed requests, or HTTP error responses – ${path} (${locale})`, async ({ page, baseURL }) => {
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

    const navResponse = await page.goto(path);
    expect(navResponse?.status(), "document response status").toBeLessThan(400);
    await page.waitForLoadState("networkidle");

    expect(consoleErrors, "console.error calls").toEqual([]);
    expect(pageErrors, "uncaught page errors").toEqual([]);
    expect(failedRequests, "network-level request failures").toEqual([]);
    expect(errorResponses, "same-origin responses with an HTTP error status").toEqual([]);

    const heroImage = page.locator(".hero-image-shell img");
    await expect(heroImage).toHaveAttribute("alt", localeCopy[locale].imageAlt);
    const naturalWidth = await heroImage.evaluate((img: HTMLImageElement) => img.naturalWidth);
    expect(naturalWidth, "hero image should have loaded successfully").toBeGreaterThan(0);
  });
}
