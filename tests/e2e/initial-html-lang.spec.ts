import { test, expect } from "@playwright/test";
import { routes } from "./fixtures/locales";

// Checks the raw server-rendered HTML (before any JS runs), which
// language-switching.spec.ts's post-hydration <html lang> assertion does
// NOT cover.
//
// Shared between both site targets (see playwright.config.ts and
// playwright.astro.config.ts, which both point at this same tests/e2e/
// directory) — this is the one spec that must behave differently per
// target, via SITE_TARGET:
//
// - Original site (SITE_TARGET unset): app/layout.tsx hard-codes
//   <html lang="nl"> for every route; CleaningPage.tsx only corrects it
//   client-side via a useEffect. So /en, /it and /ro all serve lang="nl"
//   until hydration — a real, existing defect, not something introduced by
//   this test suite. The three non-Dutch routes are marked test.fail() so
//   this is tracked and visible without turning the whole suite red.
// - Astro site (SITE_TARGET=astro, set by playwright.astro.config.ts):
//   each page sets its own <html lang> server-side at build time — the
//   defect is genuinely fixed there, so all four routes assert normally
//   with no test.fail() markers at all.
const isAstroTarget = process.env.SITE_TARGET === "astro";

for (const { path, locale } of routes) {
  test(`raw server-rendered <html lang> matches locale for ${path}`, async ({ request, baseURL }, testInfo) => {
    test.skip(testInfo.project.name === "chromium-mobile", "Server response is viewport-independent; checked once per route");

    if (locale !== "nl" && !isAstroTarget) {
      test.fail(
        true,
        `Known existing defect (original site only): app/layout.tsx serves lang="nl" for ${path} until client-side hydration corrects it. See app/layout.tsx:35 and the useEffect in app/site/CleaningPage.tsx. Fixed on the Astro site.`,
      );
    }

    const response = await request.get(new URL(path, baseURL).toString());
    const html = await response.text();
    const match = html.match(/<html[^>]*\blang="([^"]+)"/i);
    expect(match?.[1]).toBe(locale);
  });
}
