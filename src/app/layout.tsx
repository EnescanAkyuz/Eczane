import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Manrope, Sora } from "next/font/google";

import { SITE_URL } from "@/lib/constants";
import { organizationSchema, websiteSchema } from "@/lib/seo";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

const metadataBase = new URL(SITE_URL);

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "NobetHizli | En Yakin Nobetci Eczane",
    template: "%s | NobetHizli",
  },
  creator: "NobetHizli",
  description:
    "Konumunu ac, en yakin nobetci eczaneyi saniyeler icinde bul ve yol tarifine basla.",
  formatDetection: {
    address: false,
    date: false,
    email: false,
    telephone: false,
  },
  manifest: "/manifest.webmanifest",
  applicationName: "NobetHizli",
  alternates: {
    canonical: "/",
    languages: {
      "tr-TR": "/",
    },
  },
  category: "health",
  keywords: [
    "nobetci eczane",
    "en yakin eczane",
    "nobetci eczane bul",
    "eczane yol tarifi",
    "acik eczane",
  ],
  openGraph: {
    title: "NobetHizli | En Yakin Nobetci Eczane",
    description:
      "Hizli arama deneyimi ile nobetci eczaneyi hemen bul, tek tikla ara ve yol tarifi al.",
    images: [
      {
        alt: "NobetHizli",
        height: 630,
        url: "/opengraph-image",
        width: 1200,
      },
    ],
    locale: "tr_TR",
    siteName: "NobetHizli",
    type: "website",
    url: metadataBase,
  },
  publisher: "NobetHizli",
  referrer: "origin-when-cross-origin",
  twitter: {
    card: "summary_large_image",
    title: "NobetHizli",
    description:
      "Konumunu kullan, en yakin nobetci eczaneye saniyeler icinde ulas.",
    images: ["/opengraph-image"],
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  robots: {
    follow: true,
    index: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  initialScale: 1,
  themeColor: "#0d7a62",
  width: "device-width",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${manrope.variable} ${sora.variable} font-sans antialiased`}>
        <div className="mx-auto min-h-screen w-full max-w-6xl px-4 pb-14 pt-4 sm:px-6">
          <header className="mb-5 flex items-center justify-between rounded-3xl border border-emerald-100 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
            <Link className="font-display text-xl font-semibold text-emerald-800" href="/">
              NobetHizli
            </Link>
            <nav className="flex items-center gap-3 text-sm text-zinc-700">
              <Link className="hover:text-emerald-700" href="/">
                Hizli Bul
              </Link>
              <Link className="hover:text-emerald-700" href="/nobetci">
                Sehirler
              </Link>
              <Link className="hover:text-emerald-700" href="/rehber">
                Rehber
              </Link>
            </nav>
          </header>

          {children}

          <footer className="mt-10 border-t border-zinc-200 py-6 text-xs text-zinc-500">
            <p>
              Nobetci verileri eczaneler.gen.tr kaynagindan cekilir ve periyodik
              olarak guncellenir.
            </p>
            <div className="mt-2 flex flex-wrap gap-3">
              <Link className="hover:text-emerald-700" href="/hakkimizda">
                Hakkimizda
              </Link>
              <Link className="hover:text-emerald-700" href="/veri-kaynagi">
                Veri Kaynagi
              </Link>
              <Link className="hover:text-emerald-700" href="/rehber">
                Rehber
              </Link>
            </div>
          </footer>
        </div>

        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
          type="application/ld+json"
        />
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
          type="application/ld+json"
        />
      </body>
    </html>
  );
}
