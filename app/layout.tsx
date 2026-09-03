import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "A.S.A.P. Clean | Persoonlijke schoonmaak in Beverwijk",
  description: "Persoonlijke schoonmaak voor huishoudens, kleine bedrijven en vakantieverblijven in Beverwijk en omgeving.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  alternates: {
    languages: {
      "nl-NL": "/",
      en: "/en",
      it: "/it",
      ro: "/ro",
    },
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
