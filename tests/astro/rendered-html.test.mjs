import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

// Reads the ALREADY-BUILT static HTML directly from dist-astro/ — no
// server, no worker, no browser. The "test:astro" npm script always runs
// `astro build` (default env — no ALLOW_INDEXING) immediately before this,
// so it can never pass against stale output, and always leaves dist-astro
// in the safe, preview/default (noindex) state afterward. Expected strings
// are hardcoded here (not imported from astro-src/content/locales.ts) so a
// real regression in the rendered output can't be masked by comparing the
// site's copy against itself.
//
// Simplified launch version: nl/en only, real contact details, no
// "Lore"/prototype-banner copy. Production indexing (ALLOW_INDEXING=true)
// has its own separate test: tests/astro/production/rendered-html.test.mjs
// / `npm run test:astro:production`.

const SITE_URL = "https://asapclean.nl";
const distDir = fileURLToPath(new URL("../../dist-astro", import.meta.url));

const routes = [
  { file: "index.html", locale: "nl", title: "A.S.A.P. Clean | Professionele schoonmaak", canonical: `${SITE_URL}/` },
  { file: "en/index.html", locale: "en", title: "A.S.A.P. Clean | Professional cleaning", canonical: `${SITE_URL}/en` },
];

const expectedAlternates = [
  { hreflang: "nl-NL", href: `${SITE_URL}/` },
  { hreflang: "en", href: `${SITE_URL}/en` },
];

for (const { file, locale, title, canonical } of routes) {
  test(`generated static HTML for ${file} (${locale}) — default (preview-safe) build`, async () => {
    const html = await readFile(path.join(distDir, file), "utf8");

    assert.match(html, new RegExp(`^<!DOCTYPE html><html lang="${locale}"`, "i"));

    assert.ok(html.includes(`<title>${title}</title>`), `expected <title>${title}</title>`);

    // Default build must stay noindex/nofollow on BOTH directives — this is
    // the safe default that protects local builds, CI, and any deployment
    // that doesn't explicitly opt into indexing.
    const robotsMatch = html.match(/<meta name="robots" content="([^"]*)">/);
    assert.ok(robotsMatch, 'expected a <meta name="robots"> tag');
    assert.match(robotsMatch[1], /noindex/i);
    assert.match(robotsMatch[1], /nofollow/i);

    const googlebotMatch = html.match(/<meta name="googlebot" content="([^"]*)">/);
    assert.ok(googlebotMatch, 'expected a <meta name="googlebot"> tag');
    assert.match(googlebotMatch[1], /noindex/i);
    assert.match(googlebotMatch[1], /nofollow/i);

    // Canonical and hreflang are present and absolute regardless of
    // indexing mode — they describe the intended production URL, not
    // whether this particular build is allowed to be indexed.
    assert.ok(
      html.includes(`<link rel="canonical" href="${canonical}">`),
      `expected canonical link ${canonical}`,
    );
    for (const alt of expectedAlternates) {
      assert.ok(
        html.includes(`<link rel="alternate" hreflang="${alt.hreflang}" href="${alt.href}">`),
        `expected hreflang alternate for ${alt.hreflang} -> ${alt.href}`,
      );
    }

    // No "it"/"ro" alternates should remain now that those locales are dropped.
    assert.doesNotMatch(html, /hreflang="it"/);
    assert.doesNotMatch(html, /hreflang="ro"/);

    // Real contact details, no personal name, no leftover prototype framing.
    assert.ok(html.includes("tel:+31630733768"), "expected the tel: call link");
    assert.ok(html.includes("https://wa.me/31630733768"), "expected the wa.me chat link");
    assert.ok(html.includes("06 30 73 37 68"), "expected the visible phone number");
    assert.doesNotMatch(html, /Lore/i, "no personal-name references should remain");
    assert.doesNotMatch(html, /prototype-bar/i, "the prototype banner should be gone");
  });
}

test("robots.txt allows crawling by default (preview-safe), without advertising the sitemap", async () => {
  const body = await readFile(path.join(distDir, "robots.txt"), "utf8");
  assert.match(body, /User-agent:\s*\*/);
  // Crawling must stay ALLOWED even in preview/default mode: a crawler
  // that's blocked from fetching a page never sees its noindex meta tag,
  // which is the actual, authoritative de-indexing signal here.
  assert.match(body, /Allow:\s*\//);
  assert.doesNotMatch(body, /Disallow/i, "crawling should not be blocked outright — noindex meta tags handle de-indexing");
  assert.doesNotMatch(body, /Sitemap:/i, "the sitemap should not be advertised while the site is still marked noindex");
});

test("sitemap.xml lists exactly the Dutch and English production pages", async () => {
  const body = await readFile(path.join(distDir, "sitemap.xml"), "utf8");
  assert.match(body, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
  assert.ok(body.includes(`<loc>${SITE_URL}/</loc>`), "expected the nl page in the sitemap");
  assert.ok(body.includes(`<loc>${SITE_URL}/en</loc>`), "expected the en page in the sitemap");
  const urlCount = (body.match(/<url>/g) ?? []).length;
  assert.equal(urlCount, 2, "the sitemap should contain only the two nl/en production pages");
});

// --- Approved service/contact/testimonial copy (hardcoded on purpose: not
// imported from astro-src/content/locales.ts, so a regression there can't
// hide behind a self-comparison). Order is part of the approved design. ---
const content = {
  nl: {
    file: "index.html",
    servicesTitle: "Onze diensten",
    services: [
      ["Vakantiewoningen en chalets", "Schoonmaak van vakantiehuisjes en chalets op campings en vakantieparken na vertrek van de gasten. Van keuken, badkamer en toilet tot slaapkamers, stofzuigen en het reinigen van vloeren."],
      ["Airbnb en vakantieverhuur", "Schoonmaak van verhuurde woningen en appartementen tussen gasten door. De werkzaamheden en planning worden vooraf afgestemd op de accommodatie."],
      ["Woningen en appartementen", "Schoonmaak van uw woning of appartement, met duidelijke afspraken over de werkzaamheden en aandacht voor plekken die extra schoonmaak nodig hebben."],
      ["Kleine kantoren en werkruimtes", "Algemene schoonmaak van kleine kantoren, praktijkruimtes en andere werkplekken, afgestemd op de ruimte en het gebruik."],
      ["Winkels en salons", "Schoonmaak van winkels en salons, met afspraken over de te reinigen ruimtes en oppervlakken."],
      ["Schoonmaak bij verhuizing", "Schoonmaak vóór het intrekken of na het verhuizen. We stemmen vooraf af welke ruimtes en oppervlakken bereikbaar zijn en wat er moet gebeuren."],
    ],
    frequency: "Eenmalig, wekelijks, tweewekelijks of op andere vaste momenten: de frequentie en planning stemmen we samen af, afhankelijk van de beschikbaarheid.",
    preparation: "Zorg dat de te reinigen ruimtes en oppervlakken goed bereikbaar zijn. Het verplaatsen van zware meubels en het afvoeren van spullen zijn niet inbegrepen.",
    contact: "Schoonmaak aanvragen? Stuur via WhatsApp de plaats, het type woning of ruimte, de geschatte oppervlakte, de gewenste werkzaamheden en uw voorkeursdatum. Dan bespreken we wat mogelijk is.",
    removedContact: "Bel of app voor een offerte",
    review: "Het appartement had na mijn verhuizing een behoorlijk grondige schoonmaak nodig en A.S.A.P. Clean heeft zeer goed werk geleverd: zorgvuldig en zelfstandig, met oog voor detail. Het appartement was daarna merkbaar schoner en frisser. De communicatie verliep gemakkelijk en prettig. Zeker een aanrader.",
    reviewBy: "— Riho, particuliere klant",
    gendered: /\b(ze|zij|haar|hem|hij)\b/i,
  },
  en: {
    file: "en/index.html",
    servicesTitle: "Our services",
    services: [
      ["Holiday homes and chalets", "Cleaning holiday homes and chalets on campsites and holiday parks after guests leave. From kitchens, bathrooms and toilets to bedrooms, vacuuming and floor cleaning."],
      ["Airbnb and holiday rentals", "Cleaning rented homes and apartments between guests. The work and schedule are agreed beforehand to suit the property."],
      ["Homes and apartments", "Cleaning for your home or apartment, with clear arrangements about the work and attention to areas that need extra cleaning."],
      ["Small offices and workplaces", "General cleaning for small offices, practice premises and other workplaces, adapted to the space and how it is used."],
      ["Shops and salons", "Cleaning for shops and salons, with the rooms and surfaces to be cleaned agreed beforehand."],
      ["Move-in and move-out cleaning", "Cleaning before moving in or after moving out. We agree beforehand which rooms and surfaces are accessible and what needs doing."],
    ],
    frequency: "One-off, weekly, fortnightly or another regular arrangement: frequency and scheduling are agreed together, subject to availability.",
    preparation: "Please make sure the rooms and surfaces to be cleaned are accessible. Moving heavy furniture and removing belongings are not included.",
    contact: "Looking for cleaning? Send the location, property type, approximate size, required cleaning and preferred date via WhatsApp. We can then discuss what is possible.",
    removedContact: "Call or message us for a quote",
    review: "The apartment needed quite a thorough clean after I moved in, and A.S.A.P. Clean did a very good job, working carefully and independently, with attention to detail. The apartment was noticeably cleaner and fresher afterwards. Communication was easy and pleasant. Definitely recommended.",
    reviewBy: "— Riho, private customer",
    gendered: /\b(she|her|hers|he|him|his)\b/i,
  },
};

const between = (html, startMarker, endMarker) => {
  const start = html.indexOf(startMarker);
  assert.ok(start !== -1, `expected to find ${startMarker}`);
  const end = html.indexOf(endMarker, start);
  assert.ok(end !== -1, `expected to find ${endMarker} after ${startMarker}`);
  return html.slice(start, end);
};

for (const [locale, c] of Object.entries(content)) {
  test(`${locale}: six service cards in the approved order, with exact text`, async () => {
    const html = await readFile(path.join(distDir, c.file), "utf8");
    const servicesSection = between(html, '<section class="section services" id="services">', "</section>");

    assert.ok(servicesSection.includes(`<h2>${c.servicesTitle}</h2>`), "expected the section heading");

    const cards = [...servicesSection.matchAll(/<li class="service-card"><h3>([^<]*)<\/h3><p>([^<]*)<\/p><\/li>/g)].map((m) => [m[1], m[2]]);
    assert.deepEqual(cards, c.services);

    assert.ok(servicesSection.includes(`<p class="services-note">${c.frequency}</p>`), "expected the frequency note");
    assert.ok(servicesSection.includes(`<p class="services-prep">${c.preparation}</p>`), "expected the preparation note");
  });

  test(`${locale}: contact request replaces the old intro line; call/chat buttons and phone number unchanged`, async () => {
    const html = await readFile(path.join(distDir, c.file), "utf8");
    const contact = between(html, '<section class="contact" id="contact">', "</section>");

    assert.ok(contact.includes(`<p>${c.contact}</p>`), "expected the new contact-request paragraph");
    assert.ok(!html.includes(c.removedContact), "the old contact intro line should be gone");
    const phone = contact.match(/<p class="phone-number">(.*?)<\/p>/s);
    assert.ok(phone, "expected the phone number paragraph");
    assert.equal(phone[1].replace(/<svg[\s\S]*?<\/svg>/, "").replace(/<[^>]+>/g, "").trim(), "06 30 73 37 68");
    const icon = phone[1].match(/<svg[^>]*>/);
    assert.ok(icon, "expected an inline phone icon before the number");
    assert.ok(phone[1].indexOf("<svg") < phone[1].indexOf("06 30"), "icon comes before the number");
    assert.match(icon[0], /stroke="currentColor"/);
    assert.match(icon[0], /aria-hidden="true"/);
    assert.match(icon[0], /focusable="false"/);
    assert.ok(contact.includes('href="tel:+31630733768"'));
    assert.ok(contact.includes('href="https://wa.me/31630733768"'));
  });

  test(`${locale}: testimonial is the approved neutral wording, with no gendered references`, async () => {
    const html = await readFile(path.join(distDir, c.file), "utf8");
    const reviewSection = between(html, '<section class="section review" id="review">', "</section>");
    const quote = reviewSection.match(/<blockquote>([^<]*)<\/blockquote>/);
    assert.ok(quote, "expected a blockquote");
    assert.equal(quote[1], `\u201c${c.review}\u201d`);
    assert.doesNotMatch(quote[1], c.gendered);
    assert.ok(reviewSection.includes(`<p class="review-by">${c.reviewBy}</p>`), "attribution must be unchanged");
  });

  test(`${locale}: services/contact copy makes no unsupported promises or team claims`, async () => {
    const html = await readFile(path.join(distDir, c.file), "utf8");
    // Scoped to the services and contact copy only (not the whole page) —
    // these are the places where a stray promise would actually matter.
    const scoped =
      between(html, '<section class="section services" id="services">', "</section>") +
      between(html, '<section class="contact" id="contact">', "</section>");
    const forbidden = [
      [/\u20ac|\beuro\b/i, "prices"],
      [/\b(insur\w*|verzeker\w*)\b/i, "insurance"],
      [/\b(guarantee\w*|garantie\w*)\b/i, "guarantees"],
      [/\b(keys?|sleutel\w*)\b/i, "key management"],
      [/\b(laundry|linen|wasgoed|beddengoed|bedlinnen|wasserij)\b/i, "laundry/linen"],
      [/\b(restock\w*|bijvullen)\b/i, "restocking"],
      [/\b(guest support|gastenservice|gastenondersteuning)\b/i, "guest support"],
      [/\b(same[- ]day|dezelfde dag|departure day|dag van vertrek)\b/i, "same-day completion"],
      [/\b(disinfect\w*|desinfect\w*|sterile|steriel|clinical|klinisch)\b/i, "medical/clinical claims"],
      [/\b(team|employees?|staff|medewerkers?|personeel|collega\w*)\b/i, "team/employee wording"],
      [/\b(Lore|Loredana)\b/i, "private names"],
    ];
    for (const [pattern, label] of forbidden) {
      assert.doesNotMatch(scoped, pattern, `services/contact copy must not mention ${label}`);
    }
  });
}

test("no locale bleed: each page carries only its own language's service headings", async () => {
  const nlHtml = await readFile(path.join(distDir, content.nl.file), "utf8");
  const enHtml = await readFile(path.join(distDir, content.en.file), "utf8");
  for (const [title] of content.en.services) assert.ok(!nlHtml.includes(`<h3>${title}</h3>`), `NL page must not contain EN heading ${title}`);
  for (const [title] of content.nl.services) assert.ok(!enHtml.includes(`<h3>${title}</h3>`), `EN page must not contain NL heading ${title}`);
});
