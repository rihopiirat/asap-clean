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
// visible in every report without turning the whole suite red. Once the
// Astro migration renders the correct lang server-side per route, remove
// the test.fail() call below for that locale (it will start failing loudly
// as an *unexpected pass*, which is the signal to remove it).
for (const { path, locale } of routes) {
  test(`raw server-rendered <html lang> matches locale for ${path}`, async ({ request, baseURL }, testInfo) => {
    test.skip(testInfo.project.name === "chromium-mobile", "Server response is viewport-independent; checked once per route");

    if (locale !== "nl") {
      test.fail(
        true,
        `Known existing defect: app/layout.tsx serves lang="nl" for ${path} until client-side hydration corrects it. See app/layout.tsx:35 and the useEffect in app/site/CleaningPage.tsx. Scheduled to be fixed properly during the Astro migration.`,
      );
    }

    const response = await request.get(new URL(path, baseURL).toString());
    const html = await response.text();
    const match = html.match(/<html[^>]*\blang="([^"]+)"/i);
    expect(match?.[1]).toBe(locale);
  });
}
