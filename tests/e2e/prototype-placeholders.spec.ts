import { test, expect } from "@playwright/test";
import { routes, localeCopy } from "./fixtures/locales";

// Documents the current placeholder/prototype state as-is; none of this is
// treated as something to "fix" in this milestone.
for (const { path, locale } of routes) {
  test(`prototype banner, robots meta, and contact placeholder – ${path} (${locale})`, async ({ page }) => {
    await page.goto(path);
    const copy = localeCopy[locale];

    await expect(page.locator(".prototype-bar")).toHaveText(copy.prototype);

    const robotsMeta = page.locator('meta[name="robots"]');
    await expect(robotsMeta).toHaveAttribute("content", /noindex/i);
    await expect(robotsMeta).toHaveAttribute("content", /nofollow/i);

    const contactCta = page.locator(".contact .button");
    await expect(contactCta).toHaveText(copy.contactButton);
    await expect(contactCta).toHaveAttribute("aria-disabled", "true");
    // Not a real mailto:/tel: link — a disabled <span>, not an <a>.
    await expect(contactCta).not.toHaveAttribute("href", /.+/);
    expect(await contactCta.evaluate((el) => el.tagName)).not.toBe("A");
  });

  // The hydrated-DOM check above confirms the tag survives hydration; this
  // confirms it's actually present in the raw server response too (a
  // non-JS client, or a crawler that doesn't execute JS, only ever sees
  // this).
  test(`raw server response includes a noindex,nofollow robots meta tag – ${path} (${locale})`, async ({ request, baseURL }, testInfo) => {
    test.skip(testInfo.project.name === "chromium-mobile", "Server response is viewport-independent; checked once per route");

    const response = await request.get(new URL(path, baseURL).toString());
    const html = await response.text();
    const match = html.match(/<meta[^>]*\bname="robots"[^>]*\bcontent="([^"]*)"[^>]*>/i);
    expect(match, "expected a <meta name=\"robots\"> tag in the raw response").not.toBeNull();
    expect(match?.[1]).toMatch(/noindex/i);
    expect(match?.[1]).toMatch(/nofollow/i);
  });
}
