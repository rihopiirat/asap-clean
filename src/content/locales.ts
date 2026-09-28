// Shared, typed content — separate from presentation. Ported verbatim from
// app/site/CleaningPage.tsx's `copy` object during the Astro migration
// (Milestone 2). No wording changed.

export type Locale = "nl" | "en" | "it" | "ro";

export interface LocaleCopy {
  prototype: string;
  nav: [string, string, string, string, string];
  eyebrow: string;
  title: string;
  intro: string;
  cta: string;
  secondary: string;
  note: string;
  servicesTitle: string;
  servicesIntro: string;
  services: [string, string][];
  approachTitle: string;
  approach: string;
  steps: string[];
  areaTitle: string;
  area: string;
  reviewTitle: string;
  review: string;
  reviewBy: string;
  contactTitle: string;
  contact: string;
  contactButton: string;
  footer: string;
  imageAlt: string;
}

export const copy: Record<Locale, LocaleCopy> = {
  nl: {
    prototype: "Prototype — diensten, werkgebied en contactgegevens worden nog met Lore bevestigd.",
    nav: ["Diensten", "Werkwijze", "Werkgebied", "Ervaringen", "Contact"],
    eyebrow: "Persoonlijke schoonmaakservice",
    title: "Een schoon huis, met aandacht gedaan.",
    intro: "A.S.A.P. Clean helpt huishoudens, kleine bedrijven en vakantieverblijven in Beverwijk en omgeving met zorgvuldige, persoonlijke schoonmaak.",
    cta: "Vraag naar beschikbaarheid",
    secondary: "Bekijk de diensten",
    note: "Communicatie mogelijk in het Engels, Italiaans en Roemeens.",
    servicesTitle: "Schoonmaak die past bij uw ruimte",
    servicesIntro: "Een voorlopig overzicht. Lore kiest voor de definitieve publicatie welke diensten zij actief wil aanbieden.",
    services: [
      ["Periodieke huishoudelijke schoonmaak", "Wekelijks of tweewekelijks, met vaste afspraken en persoonlijke aandacht."],
      ["Kleine bedrijven", "Schoonmaak voor compacte kantoren, salons, praktijken en andere kleine werkruimtes."],
      ["Camping- en vakantieverblijven", "Zorgvuldige schoonmaak tussen gasten of volgens een terugkerende planning."],
      ["Eenmalige grondige schoonmaak", "Voor een frisse start na een verhuizing of wanneer een ruimte extra aandacht nodig heeft."],
    ],
    approachTitle: "Eén vertrouwd gezicht",
    approach: "A.S.A.P. Clean is een persoonlijke service. U maakt afspraken direct met Lore en weet wie er bij u komt schoonmaken. Duidelijk, zorgvuldig en zonder onnodige lagen.",
    steps: ["Bespreek de ruimte en uw wensen", "Ontvang een passende afspraak", "Maak vervolgafspraken als het goed past"],
    areaTitle: "Werkgebied",
    area: "De voorlopige regio is Beverwijk, Heemskerk, Velsen, Alkmaar en omgeving. De precieze plaatsen en reisafstand worden vóór publicatie bevestigd.",
    reviewTitle: "Ervaring van een klant",
    review: "Het appartement had na mijn verhuizing een behoorlijk grondige schoonmaak nodig en Lore heeft zeer goed werk geleverd. Ze werkt zorgvuldig en zelfstandig, heeft oog voor detail en liet het appartement merkbaar schoner en frisser achter. De communicatie verliep gemakkelijk en prettig. Zeker een aanrader.",
    reviewBy: "— Riho, particuliere klant",
    contactTitle: "Kennismaken met A.S.A.P. Clean?",
    contact: "De definitieve WhatsApp-, telefoon- en e-mailgegevens worden toegevoegd zodra Lore deze heeft goedgekeurd.",
    contactButton: "Contactgegevens volgen",
    footer: "A.S.A.P. Clean · Beverwijk en omgeving",
    imageAlt: "Lichte, verzorgde woonkamer als tijdelijke sfeerfoto",
  },
  en: {
    prototype: "Prototype — services, service area and contact details still need Lore’s confirmation.",
    nav: ["Services", "How it works", "Service area", "Review", "Contact"],
    eyebrow: "Personal cleaning service",
    title: "A clean home, cared for properly.",
    intro: "A.S.A.P. Clean helps households, small businesses and holiday accommodation around Beverwijk with careful, personal cleaning.",
    cta: "Ask about availability",
    secondary: "View services",
    note: "Communication in English, Italian and Romanian.",
    servicesTitle: "Cleaning that suits your space",
    servicesIntro: "A provisional overview. Lore will confirm which services she wants to actively offer before publication.",
    services: [
      ["Regular home cleaning", "Weekly or fortnightly cleaning with clear arrangements and personal attention."],
      ["Small businesses", "Cleaning for compact offices, salons, practices and other small workplaces."],
      ["Camping and holiday accommodation", "Careful changeover cleaning or work according to a recurring schedule."],
      ["One-off thorough cleaning", "A fresh start after moving or when a space needs some extra attention."],
    ],
    approachTitle: "One familiar face",
    approach: "A.S.A.P. Clean is a personal service. You arrange the work directly with Lore and know who will be cleaning your space. Clear, careful and uncomplicated.",
    steps: ["Discuss the space and your wishes", "Receive a suitable appointment", "Arrange recurring visits when it is a good fit"],
    areaTitle: "Service area",
    area: "The provisional area is Beverwijk, Heemskerk, Velsen, Alkmaar and surroundings. Exact locations and travel distance will be confirmed before publication.",
    reviewTitle: "A customer’s experience",
    review: "The apartment needed quite a thorough clean after I moved in, and Lore did a very good job. She works carefully and independently, pays attention to details, and left the apartment noticeably cleaner and fresher. Communication was easy and pleasant. Definitely recommended.",
    reviewBy: "— Riho, private customer",
    contactTitle: "Interested in A.S.A.P. Clean?",
    contact: "The final WhatsApp, telephone and email details will be added after Lore has approved them.",
    contactButton: "Contact details coming soon",
    footer: "A.S.A.P. Clean · Beverwijk and surrounding areas",
    imageAlt: "Bright, tidy living room used as a temporary mood image",
  },
  it: {
    prototype: "Prototipo — servizi, zona e contatti devono ancora essere confermati da Lore.",
    nav: ["Servizi", "Come funziona", "Zona", "Recensione", "Contatti"],
    eyebrow: "Servizio di pulizia personale",
    title: "Una casa pulita, curata con attenzione.",
    intro: "A.S.A.P. Clean aiuta famiglie, piccole attività e alloggi turistici nella zona di Beverwijk con un servizio accurato e personale.",
    cta: "Chiedi la disponibilità",
    secondary: "Scopri i servizi",
    note: "Comunicazione in inglese, italiano e rumeno.",
    servicesTitle: "Pulizie adatte ai tuoi spazi",
    servicesIntro: "Una panoramica provvisoria. Prima della pubblicazione Lore confermerà i servizi che desidera offrire.",
    services: [
      ["Pulizia regolare della casa", "Pulizia settimanale o ogni due settimane, con accordi chiari e attenzione personale."],
      ["Piccole attività", "Pulizia di piccoli uffici, saloni, studi e altri spazi di lavoro."],
      ["Campeggi e alloggi turistici", "Pulizia accurata tra un ospite e l’altro o secondo un programma ricorrente."],
      ["Pulizia approfondita occasionale", "Per un nuovo inizio dopo un trasloco o quando uno spazio richiede più attenzione."],
    ],
    approachTitle: "Un volto di fiducia",
    approach: "A.S.A.P. Clean è un servizio personale. Organizzi il lavoro direttamente con Lore e sai chi si occuperà dei tuoi spazi. Semplice, chiaro e accurato.",
    steps: ["Parliamo degli spazi e delle esigenze", "Concordiamo un appuntamento adatto", "Se tutto funziona bene, pianifichiamo visite regolari"],
    areaTitle: "Zona servita",
    area: "La zona provvisoria comprende Beverwijk, Heemskerk, Velsen, Alkmaar e dintorni. Le località e la distanza saranno confermate prima della pubblicazione.",
    reviewTitle: "L’esperienza di un cliente",
    review: "Dopo il mio trasloco l’appartamento aveva bisogno di una pulizia piuttosto approfondita e Lore ha fatto un ottimo lavoro. Lavora con cura e in autonomia, presta attenzione ai dettagli e ha lasciato l’appartamento visibilmente più pulito e fresco. La comunicazione è stata facile e piacevole. Assolutamente consigliata.",
    reviewBy: "— Riho, cliente privato",
    contactTitle: "Vuoi conoscere A.S.A.P. Clean?",
    contact: "I contatti WhatsApp, telefono ed e-mail saranno aggiunti dopo l’approvazione di Lore.",
    contactButton: "Contatti in arrivo",
    footer: "A.S.A.P. Clean · Beverwijk e dintorni",
    imageAlt: "Soggiorno luminoso e ordinato usato come immagine temporanea",
  },
  ro: {
    prototype: "Prototip — serviciile, zona și datele de contact urmează să fie confirmate de Lore.",
    nav: ["Servicii", "Cum funcționează", "Zona", "Recenzie", "Contact"],
    eyebrow: "Serviciu personal de curățenie",
    title: "O casă curată, îngrijită cu atenție.",
    intro: "A.S.A.P. Clean ajută familii, afaceri mici și unități de cazare din zona Beverwijk cu servicii de curățenie atente și personale.",
    cta: "Întreabă despre disponibilitate",
    secondary: "Vezi serviciile",
    note: "Comunicare în engleză, italiană și română.",
    servicesTitle: "Curățenie potrivită spațiului tău",
    servicesIntro: "O prezentare provizorie. Lore va confirma serviciile pe care dorește să le ofere înainte de publicare.",
    services: [
      ["Curățenie regulată la domiciliu", "Săptămânal sau la două săptămâni, cu înțelegeri clare și atenție personală."],
      ["Afaceri mici", "Curățenie pentru birouri mici, saloane, cabinete și alte spații de lucru."],
      ["Campinguri și unități de cazare", "Curățenie atentă între oaspeți sau conform unui program recurent."],
      ["Curățenie generală ocazională", "Un început proaspăt după mutare sau atunci când un spațiu necesită mai multă atenție."],
    ],
    approachTitle: "Aceeași persoană de încredere",
    approach: "A.S.A.P. Clean este un serviciu personal. Stabilești detaliile direct cu Lore și știi cine se va ocupa de curățenie. Clar, atent și fără complicații.",
    steps: ["Discutăm despre spațiu și preferințe", "Stabilim o programare potrivită", "Planificăm vizite regulate dacă colaborarea se potrivește"],
    areaTitle: "Zona deservită",
    area: "Zona provizorie include Beverwijk, Heemskerk, Velsen, Alkmaar și împrejurimile. Localitățile exacte și distanța vor fi confirmate înainte de publicare.",
    reviewTitle: "Experiența unui client",
    review: "După ce m-am mutat, apartamentul avea nevoie de o curățenie destul de temeinică, iar Lore a făcut o treabă foarte bună. Lucrează atent și independent, acordă atenție detaliilor și a lăsat apartamentul vizibil mai curat și mai proaspăt. Comunicarea a fost ușoară și plăcută. O recomand cu siguranță.",
    reviewBy: "— Riho, client privat",
    contactTitle: "Vrei să cunoști A.S.A.P. Clean?",
    contact: "Datele finale de WhatsApp, telefon și e-mail vor fi adăugate după aprobarea lui Lore.",
    contactButton: "Date de contact în curând",
    footer: "A.S.A.P. Clean · Beverwijk și împrejurimi",
    imageAlt: "Living luminos și ordonat folosit ca imagine temporară",
  },
};

export const languageLinks: ReadonlyArray<{ label: string; href: string }> = [
  { label: "NL", href: "/" },
  { label: "EN", href: "/en" },
  { label: "IT", href: "/it" },
  { label: "RO", href: "/ro" },
];

export const alternateLanguages: Record<string, string> = {
  "nl-NL": "/",
  en: "/en",
  it: "/it",
  ro: "/ro",
};
