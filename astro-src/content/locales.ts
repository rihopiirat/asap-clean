// Shared, typed content — separate from presentation. Simplified launch
// version: branding, phone number, service area and domain come from the
// approved A.S.A.P. Clean business cards; the service descriptions were
// approved by the owner (the card is a summary, not the maximum scope).
// Boundaries: one cleaner (no team/employee wording), no prices, insurance,
// credentials, guarantees or unconfirmed extras (key management, laundry,
// linen, restocking, guest support), ordinary premises cleaning only (no
// medical/specialist claims), no private names/address/schedules. The
// customer review names the business instead of the cleaner personally,
// per explicit approval.

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

export interface ServiceCopy {
  title: string;
  description: string;
}

export interface LocaleCopy {
  nav: [string, string, string, string];
  eyebrow: string;
  title: string;
  intro: string;
  cta: string;
  secondary: string;
  servicesTitle: string;
  services: ServiceCopy[];
  servicesFrequency: string;
  servicesPreparation: string;
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
      {
        title: "Vakantiewoningen en chalets",
        description: "Schoonmaak van vakantiehuisjes en chalets op campings en vakantieparken na vertrek van de gasten. Van keuken, badkamer en toilet tot slaapkamers, stofzuigen en het reinigen van vloeren.",
      },
      {
        title: "Airbnb en vakantieverhuur",
        description: "Schoonmaak van verhuurde woningen en appartementen tussen gasten door. De werkzaamheden en planning worden vooraf afgestemd op de accommodatie.",
      },
      {
        title: "Woningen en appartementen",
        description: "Schoonmaak van uw woning of appartement, met duidelijke afspraken over de werkzaamheden en aandacht voor plekken die extra schoonmaak nodig hebben.",
      },
      {
        title: "Kleine kantoren en werkruimtes",
        description: "Algemene schoonmaak van kleine kantoren, praktijkruimtes en andere werkplekken, afgestemd op de ruimte en het gebruik.",
      },
      {
        title: "Winkels en salons",
        description: "Schoonmaak van winkels en salons, met afspraken over de te reinigen ruimtes en oppervlakken.",
      },
      {
        title: "Schoonmaak bij verhuizing",
        description: "Schoonmaak vóór het intrekken of na het verhuizen. We stemmen vooraf af welke ruimtes en oppervlakken bereikbaar zijn en wat er moet gebeuren.",
      },
    ],
    servicesFrequency: "Eenmalig, wekelijks, tweewekelijks of op andere vaste momenten: de frequentie en planning stemmen we samen af, afhankelijk van de beschikbaarheid.",
    servicesPreparation: "Zorg dat de te reinigen ruimtes en oppervlakken goed bereikbaar zijn. Het verplaatsen van zware meubels en het afvoeren van spullen zijn niet inbegrepen.",
    areaTitle: "Werkgebied",
    area: "Actief in Beverwijk, Heemskerk, Haarlem, Zaandam e.o.",
    reviewTitle: "Ervaring van een klant",
    review: "Het appartement had na mijn verhuizing een behoorlijk grondige schoonmaak nodig en A.S.A.P. Clean heeft zeer goed werk geleverd: zorgvuldig en zelfstandig, met oog voor detail. Het appartement was daarna merkbaar schoner en frisser. De communicatie verliep gemakkelijk en prettig. Zeker een aanrader.",
    reviewBy: "— Riho, particuliere klant",
    contactTitle: "Neem contact op",
    contact: "Schoonmaak aanvragen? Stuur via WhatsApp de plaats, het type woning of ruimte, de geschatte oppervlakte, de gewenste werkzaamheden en uw voorkeursdatum. Dan bespreken we wat mogelijk is.",
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
      {
        title: "Holiday homes and chalets",
        description: "Cleaning holiday homes and chalets on campsites and holiday parks after guests leave. From kitchens, bathrooms and toilets to bedrooms, vacuuming and floor cleaning.",
      },
      {
        title: "Airbnb and holiday rentals",
        description: "Cleaning rented homes and apartments between guests. The work and schedule are agreed beforehand to suit the property.",
      },
      {
        title: "Homes and apartments",
        description: "Cleaning for your home or apartment, with clear arrangements about the work and attention to areas that need extra cleaning.",
      },
      {
        title: "Small offices and workplaces",
        description: "General cleaning for small offices, practice premises and other workplaces, adapted to the space and how it is used.",
      },
      {
        title: "Shops and salons",
        description: "Cleaning for shops and salons, with the rooms and surfaces to be cleaned agreed beforehand.",
      },
      {
        title: "Move-in and move-out cleaning",
        description: "Cleaning before moving in or after moving out. We agree beforehand which rooms and surfaces are accessible and what needs doing.",
      },
    ],
    servicesFrequency: "One-off, weekly, fortnightly or another regular arrangement: frequency and scheduling are agreed together, subject to availability.",
    servicesPreparation: "Please make sure the rooms and surfaces to be cleaned are accessible. Moving heavy furniture and removing belongings are not included.",
    areaTitle: "Service area",
    area: "Serving Beverwijk, Heemskerk, Haarlem, Zaandam & nearby.",
    reviewTitle: "A customer’s experience",
    review: "The apartment needed quite a thorough clean after I moved in, and A.S.A.P. Clean did a very good job, working carefully and independently, with attention to detail. The apartment was noticeably cleaner and fresher afterwards. Communication was easy and pleasant. Definitely recommended.",
    reviewBy: "— Riho, private customer",
    contactTitle: "Get in touch",
    contact: "Looking for cleaning? Send the location, property type, approximate size, required cleaning and preferred date via WhatsApp. We can then discuss what is possible.",
    callLabel: "Call",
    chatLabel: "Chat on WhatsApp",
    footer: "A.S.A.P. Clean · Beverwijk, Heemskerk, Haarlem, Zaandam & nearby",
  },
};

export const languageLinks: ReadonlyArray<{ label: string; href: string }> = [
  { label: "NL", href: "/" },
  { label: "EN", href: "/en" },
];

// Production domain — used for canonical links, hreflang alternates,
// robots.txt's sitemap reference, and sitemap.xml itself. Always the real
// production URL, regardless of which environment actually built the
// site: a canonical/hreflang link is supposed to point at the intended
// production address even from a preview deployment.
export const siteUrl = "https://asapclean.nl";

export const localePaths: Record<Locale, string> = {
  nl: "/",
  en: "/en",
};

export const alternateLanguages: Record<string, string> = {
  "nl-NL": `${siteUrl}/`,
  en: `${siteUrl}/en`,
};
