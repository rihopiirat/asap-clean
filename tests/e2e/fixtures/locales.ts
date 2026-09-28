// Expected visitor-visible copy per locale, mirrored from the `copy` object
// in app/site/CleaningPage.tsx. Kept here (not imported from the app) so
// these specs stay framework-agnostic and keep working after the Astro
// migration, as long as the rendered copy doesn't change.

export type Locale = "nl" | "en" | "it" | "ro";

export const routes: ReadonlyArray<{ path: string; locale: Locale }> = [
  { path: "/", locale: "nl" },
  { path: "/en", locale: "en" },
  { path: "/it", locale: "it" },
  { path: "/ro", locale: "ro" },
];

export const languageLinks: ReadonlyArray<{ label: string; href: string }> = [
  { label: "NL", href: "/" },
  { label: "EN", href: "/en" },
  { label: "IT", href: "/it" },
  { label: "RO", href: "/ro" },
];

export const localeCopy: Record<
  Locale,
  {
    prototype: string;
    nav: [string, string, string, string, string];
    contact: string;
    contactButton: string;
    imageAlt: string;
    title: string;
    firstServiceHeading: string;
    heroPrimaryCta: string;
    heroSecondaryCta: string;
  }
> = {
  nl: {
    prototype: "Prototype — diensten, werkgebied en contactgegevens worden nog met Lore bevestigd.",
    nav: ["Diensten", "Werkwijze", "Werkgebied", "Ervaringen", "Contact"],
    contact: "De definitieve WhatsApp-, telefoon- en e-mailgegevens worden toegevoegd zodra Lore deze heeft goedgekeurd.",
    contactButton: "Contactgegevens volgen",
    imageAlt: "Lichte, verzorgde woonkamer als tijdelijke sfeerfoto",
    title: "Een schoon huis, met aandacht gedaan.",
    firstServiceHeading: "Periodieke huishoudelijke schoonmaak",
    heroPrimaryCta: "Vraag naar beschikbaarheid",
    heroSecondaryCta: "Bekijk de diensten",
  },
  en: {
    prototype: "Prototype — services, service area and contact details still need Lore’s confirmation.",
    nav: ["Services", "How it works", "Service area", "Review", "Contact"],
    contact: "The final WhatsApp, telephone and email details will be added after Lore has approved them.",
    contactButton: "Contact details coming soon",
    imageAlt: "Bright, tidy living room used as a temporary mood image",
    title: "A clean home, cared for properly.",
    firstServiceHeading: "Regular home cleaning",
    heroPrimaryCta: "Ask about availability",
    heroSecondaryCta: "View services",
  },
  it: {
    prototype: "Prototipo — servizi, zona e contatti devono ancora essere confermati da Lore.",
    nav: ["Servizi", "Come funziona", "Zona", "Recensione", "Contatti"],
    contact: "I contatti WhatsApp, telefono ed e-mail saranno aggiunti dopo l’approvazione di Lore.",
    contactButton: "Contatti in arrivo",
    imageAlt: "Soggiorno luminoso e ordinato usato come immagine temporanea",
    title: "Una casa pulita, curata con attenzione.",
    firstServiceHeading: "Pulizia regolare della casa",
    heroPrimaryCta: "Chiedi la disponibilità",
    heroSecondaryCta: "Scopri i servizi",
  },
  ro: {
    prototype: "Prototip — serviciile, zona și datele de contact urmează să fie confirmate de Lore.",
    nav: ["Servicii", "Cum funcționează", "Zona", "Recenzie", "Contact"],
    contact: "Datele finale de WhatsApp, telefon și e-mail vor fi adăugate după aprobarea lui Lore.",
    contactButton: "Date de contact în curând",
    imageAlt: "Living luminos și ordonat folosit ca imagine temporară",
    title: "O casă curată, îngrijită cu atenție.",
    firstServiceHeading: "Curățenie regulată la domiciliu",
    heroPrimaryCta: "Întreabă despre disponibilitate",
    heroSecondaryCta: "Vezi serviciile",
  },
};

// Only the first 4 of each locale's 5 `nav` labels appear as clickable links
// in the header (`.desktop-nav`); the 5th ("Contact") is a section heading
// label only, reached via the hero's own CTA link (`#contact`), not the nav bar.
export const navLinks = [
  { anchor: "services", navIndex: 0 },
  { anchor: "approach", navIndex: 1 },
  { anchor: "area", navIndex: 2 },
  { anchor: "review", navIndex: 3 },
] as const;
