import { test, expect } from "@playwright/test";
import { routes } from "./fixtures/locales";

// Checks the raw server-rendered HTML (before any JS runs), which
// language-switching.spec.ts's post-hydration <html lang> assertion does
// NOT cover. app/layout.tsx hard-codes <html lang="nl"> for every route;
// CleaningPage.tsx only corrects it client-side via a useEffect. So /en,
// /it and /ro all serve lang="nl" until hydration — a real, existing defect,
// not something introduced by this test suite.
//
// The three non-Dutch routes are marked test.fail() so this is tracked and
// visible in every report without turning the whole suite red. This file is
// specific to the original Next.js/vinext site (tests/e2e/ is no longer
// shared with the Astro suite, which has its own tests/e2e-astro/ — the
// simplified launch version's content diverged too far from this site's for
// literal spec reuse to still make sense; the Astro site fixes this defect
// natively, with no equivalent test.fail() needed there).
for (const { path, locale } of routes) {
  test(`raw server-rendered <html lang> matches locale for ${path}`, async ({ request, baseURL }, testInfo) => {
    test.skip(testInfo.project.name === "chromium-mobile", "Server response is viewport-independent; checked once per route");

    if (locale !== "nl") {
      test.fail(
        true,
        `Known existing defect: app/layout.tsx serves lang="nl" for ${path} until client-side hydration corrects it. See app/layout.tsx:35 and the useEffect in app/site/CleaningPage.tsx.`,
      );
    }

    const response = await request.get(new URL(path, baseURL).toString());
    const html = await response.text();
    const match = html.match(/<html[^>]*\blang="([^"]+)"/i);
    expect(match?.[1]).toBe(locale);
  });
}
