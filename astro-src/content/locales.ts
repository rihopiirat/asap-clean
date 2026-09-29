// Shared, typed content — separate from presentation. Rewritten for the
// simplified launch version, sourced from the approved A.S.A.P. Clean
// business cards (assets-source/ASAP_Clean_*_print_ready_corrected_v5.pdf):
// services, service area, phone number and domain all come directly from
// that artwork. No prices, qualifications, opening hours, or contact
// details beyond what the cards state. "Lore" is not referenced anywhere;
// the one place the old copy named her personally (the customer review) is
// updated to name the business instead, per explicit approval.

export type Locale = "nl" | "en";

export interface BusinessInfo {
  name: string;
  phoneDisplay: string;
  telHref: string;
  waHref: string;
  domain: string;
}

// Locale-independent facts (not translated UI strings) — the phone number
// and links are the same regardless of which language page you're on.
export const business: BusinessInfo = {
  name: "A.S.A.P. Clean",
  phoneDisplay: "06 30 73 37 68",
  telHref: "tel:+31630733768",
  waHref: "https://wa.me/31630733768",
  domain: "asapclean.nl",
};

export interface LocaleCopy {
  nav: [string, string, string, string];
  eyebrow: string;
  title: string;
  intro: string;
  cta: string;
  secondary: string;
  servicesTitle: string;
  services: string[];
  areaTitle: string;
  area: string;
  reviewTitle: string;
  review: string;
  reviewBy: string;
  contactTitle: string;
  contact: string;
  callLabel: string;
  chatLabel: string;
  footer: string;
}

export const copy: Record<Locale, LocaleCopy> = {
  nl: {
    nav: ["Diensten", "Werkgebied", "Ervaringen", "Contact"],
    eyebrow: "Professionele schoonmaak",
    title: "Een schoon huis, met aandacht gedaan.",
    intro: "A.S.A.P. Clean verzorgt professionele schoonmaak voor woningen, appartementen, vakantieverblijven, kleine kantoren en winkels in Beverwijk, Heemskerk, Haarlem, Zaandam en omgeving.",
    cta: "Neem contact op",
    secondary: "Bekijk de diensten",
    servicesTitle: "Onze diensten",
    services: [
      "Woningen & appartementen",
      "Vakantieverblijven / Airbnb",
      "Kleine kantoren",
      "Winkels / salons",
      "Eenmalig of periodiek",
    ],
    areaTitle: "Werkgebied",
    area: "Actief in Beverwijk, Heemskerk, Haarlem, Zaandam e.o.",
    reviewTitle: "Ervaring van een klant",
    review: "Het appartement had na mijn verhuizing een behoorlijk grondige schoonmaak nodig en A.S.A.P. Clean heeft zeer goed werk geleverd. Ze werkt zorgvuldig en zelfstandig, heeft oog voor detail en liet het appartement merkbaar schoner en frisser achter. De communicatie verliep gemakkelijk en prettig. Zeker een aanrader.",
    reviewBy: "— Riho, particuliere klant",
    contactTitle: "Neem contact op",
    contact: "Bel of app voor een offerte of om een afspraak te maken.",
    callLabel: "Bel",
    chatLabel: "Chat via WhatsApp",
    footer: "A.S.A.P. Clean · Beverwijk, Heemskerk, Haarlem, Zaandam e.o.",
  },
  en: {
    nav: ["Services", "Service area", "Review", "Contact"],
    eyebrow: "Professional cleaning",
    title: "A clean home, cared for properly.",
    intro: "A.S.A.P. Clean provides professional cleaning for homes, apartments, holiday accommodation, small offices and shops in Beverwijk, Heemskerk, Haarlem, Zaandam and nearby.",
    cta: "Get in touch",
    secondary: "View services",
    servicesTitle: "Our services",
    services: [
      "Homes & apartments",
      "Holiday homes / Airbnb",
      "Small offices",
      "Shops / salons",
      "One-off or regular cleaning",
    ],
    areaTitle: "Service area",
    area: "Serving Beverwijk, Heemskerk, Haarlem, Zaandam & nearby.",
    reviewTitle: "A customer’s experience",
    review: "The apartment needed quite a thorough clean after I moved in, and A.S.A.P. Clean did a very good job. She works carefully and independently, pays attention to details, and left the apartment noticeably cleaner and fresher. Communication was easy and pleasant. Definitely recommended.",
    reviewBy: "— Riho, private customer",
    contactTitle: "Get in touch",
    contact: "Call or message us for a quote or to arrange a cleaning.",
    callLabel: "Call",
    chatLabel: "Chat on WhatsApp",
    footer: "A.S.A.P. Clean · Beverwijk, Heemskerk, Haarlem, Zaandam & nearby",
  },
};

export const languageLinks: ReadonlyArray<{ label: string; href: string }> = [
  { label: "NL", href: "/" },
  { label: "EN", href: "/en" },
];

export const alternateLanguages: Record<string, string> = {
  "nl-NL": "/",
  en: "/en",
};
