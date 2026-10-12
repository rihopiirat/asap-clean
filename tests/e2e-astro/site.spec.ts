import { test, expect, type Page } from "@playwright/test";

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

    test("contact colours: pale pink block, navy copy, raspberry number with a phone icon", async ({ page }) => {
      await page.goto(path);
      const colours = await page.evaluate(() => {
        const c = (sel: string, prop = "color") => getComputedStyle(document.querySelector(sel)!).getPropertyValue(prop);
        return {
          background: c(".contact", "background-color"),
          heading: c(".contact-copy h2"),
          paragraph: c(".contact-copy p:not(.phone-number)"),
          number: c(".phone-number"),
          iconStroke: c(".phone-number svg", "stroke"),
          numberText: c(".phone-number span"),
        };
      });
      expect(colours.background).toBe("rgb(248, 228, 235)");
      expect(colours.heading).toBe("rgb(10, 22, 49)");
      expect(colours.paragraph).toBe("rgb(10, 22, 49)");
      expect(colours.number).toBe("rgb(176, 8, 73)");
      expect(colours.numberText).toBe("rgb(176, 8, 73)");
      expect(colours.iconStroke).toBe("rgb(176, 8, 73)");

      const icon = page.locator(".phone-number svg");
      await expect(icon).toBeVisible();
      await expect(icon).toHaveAttribute("aria-hidden", "true");
      await expect(icon).toHaveAttribute("focusable", "false");
      const [iconBox, textBox] = await Promise.all([icon.boundingBox(), page.locator(".phone-number span").boundingBox()]);
      expect(iconBox!.x + iconBox!.width, "icon sits immediately before the number").toBeLessThanOrEqual(textBox!.x);
      expect(textBox!.x - (iconBox!.x + iconBox!.width), "icon and number are not glued together or far apart").toBeLessThan(24);
    });

    test("contact buttons keep their colours and show a visible keyboard focus ring", async ({ page }) => {
      await page.goto(path);
      const call = page.locator(".contact-actions a.primary");
      const chat = page.locator(".contact-actions a.whatsapp");
      await expect(call).toHaveCSS("background-color", "rgb(209, 10, 86)");
      await expect(chat).toHaveCSS("background-color", "rgb(37, 211, 102)");
      await expect(chat).toHaveCSS("color", "rgb(10, 22, 49)");

      await call.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      await expect(call).toBeFocused();
      await expect(call).toHaveCSS("outline-style", "solid");
      await expect(call).toHaveCSS("outline-width", "3px");
      await expect(call).toHaveCSS("outline-color", "rgb(10, 22, 49)");
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

// --- Services section: six cards, responsive grid, nothing clipped ---
const serviceTitles: Record<string, string[]> = {
  nl: [
    "Vakantiewoningen en chalets",
    "Airbnb en vakantieverhuur",
    "Woningen en appartementen",
    "Kleine kantoren en werkruimtes",
    "Winkels en salons",
    "Schoonmaak bij verhuizing",
  ],
  en: [
    "Holiday homes and chalets",
    "Airbnb and holiday rentals",
    "Homes and apartments",
    "Small offices and workplaces",
    "Shops and salons",
    "Move-in and move-out cleaning",
  ],
};

// Enlarges text the way a user's "larger text" browser setting does: the root
// font size doubles, so every rem-based length scales with it. Device pixel
// ratio and the viewport are left alone. The helper then asserts that the text
// really did get bigger, so the tests below cannot pass on an unchanged page.
async function enlargeText(page: Page) {
  const fontSizes = () =>
    page.evaluate(() => ({
      root: parseFloat(getComputedStyle(document.documentElement).fontSize),
      body: parseFloat(getComputedStyle(document.body).fontSize),
      cardText: parseFloat(getComputedStyle(document.querySelector("#services .service-card p")!).fontSize),
      dpr: window.devicePixelRatio,
    }));
  const before = await fontSizes();
  await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
  const after = await fontSizes();
  expect(after.root).toBeCloseTo(before.root * 2, 1);
  expect(after.body).toBeCloseTo(before.body * 2, 1);
  expect(after.cardText).toBeCloseTo(before.cardText * 2, 1);
  expect(after.dpr, "text enlargement must not be simulated with devicePixelRatio").toBe(before.dpr);
}

for (const { path, locale } of routes) {
  test(`services: six cards in order, each with a visible heading and description – ${path} (${locale})`, async ({ page }) => {
    await page.goto(path);
    const cards = page.locator("#services .service-list > li.service-card");
    await expect(cards).toHaveCount(6);
    for (let i = 0; i < 6; i++) {
      await expect(cards.nth(i).locator("h3")).toHaveText(serviceTitles[locale][i]);
      await expect(cards.nth(i).locator("h3")).toBeVisible();
      const description = cards.nth(i).locator("p");
      await expect(description).toBeVisible();
      expect(((await description.textContent()) ?? "").trim().length).toBeGreaterThan(40);
    }
    await expect(page.locator("#services .services-note")).toBeVisible();
    await expect(page.locator("#services .services-prep")).toBeVisible();
  });

  test(`services: grid is 1 / 2 / 3 columns at 390 / 800 / 1280 px – ${path} (${locale})`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium-desktop", "Viewport is set explicitly below; run once");
    await page.goto(path);
    const columnCount = async () =>
      page.locator("#services .service-card").evaluateAll((els) => new Set(els.map((el) => Math.round(el.getBoundingClientRect().left))).size);

    await page.setViewportSize({ width: 390, height: 844 });
    expect(await columnCount()).toBe(1);
    await page.setViewportSize({ width: 800, height: 900 });
    expect(await columnCount()).toBe(2);
    await page.setViewportSize({ width: 1280, height: 900 });
    expect(await columnCount()).toBe(3);
  });

  test(`whole page: no horizontal overflow at 320 px with normal text – ${path} (${locale})`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium-desktop", "Viewport is set explicitly below; run once");
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test(`whole page: no horizontal overflow at 320 px with text enlarged to 200% – ${path} (${locale})`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium-desktop", "Viewport is set explicitly below; run once");
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(path);
    await enlargeText(page);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    const outside = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      return Array.from(document.querySelectorAll("body *"))
        .filter((el) => el.getBoundingClientRect().right > vw + 1 || el.getBoundingClientRect().left < -1)
        .map((el) => el.tagName.toLowerCase() + "." + el.className);
    });
    expect(outside, "no element extends past the viewport").toEqual([]);
  });

  test(`services: contained and nothing clipped at 320 px with text enlarged to 200% – ${path} (${locale})`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium-desktop", "Viewport is set explicitly below; run once");
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(path);
    await enlargeText(page);

    const outside = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      return Array.from(document.querySelectorAll("#services, #services *"))
        .filter((el) => el.getBoundingClientRect().right > vw + 1 || el.getBoundingClientRect().left < -1)
        .map((el) => el.tagName.toLowerCase() + "." + el.className);
    });
    expect(outside, "services section stays inside the viewport").toEqual([]);

    const clipped = await page.locator("#services .service-card").evaluateAll((cards) =>
      cards.flatMap((card) => {
        const cardRect = card.getBoundingClientRect();
        const cs = getComputedStyle(card);
        const problems: string[] = [];
        if (cs.overflow !== "visible") problems.push(`card overflow is ${cs.overflow}`);
        if (card.scrollHeight > card.clientHeight + 1 || card.scrollWidth > card.clientWidth + 1) problems.push("card content exceeds its box");
        for (const child of Array.from(card.children)) {
          const r = child.getBoundingClientRect();
          if (r.right > cardRect.right + 1 || r.bottom > cardRect.bottom + 1) problems.push(`${child.tagName} spills outside the card`);
          const clamp = getComputedStyle(child).getPropertyValue("-webkit-line-clamp");
          if (clamp && clamp !== "none") problems.push("line clamp applied");
        }
        return problems;
      }),
    );
    expect(clipped, "service card text must stay fully visible").toEqual([]);
  });
}
