import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Script from "next/script";
import { Manrope, Sora } from "next/font/google";

import { SITE_URL } from "@/lib/constants";
import { organizationSchema, websiteSchema } from "@/lib/seo";
import { MobileNav } from "@/components/mobile-nav";
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
    default: "En Yakın Yer | En Yakın Nöbetçi Eczane",
    template: "%s | En Yakın Yer",
  },
  creator: "En Yakın Yer",
  description:
    "Konumunu aç, en yakın nöbetçi eczaneyi saniyeler içinde bul ve yol tarifine başla.",
  formatDetection: {
    address: false,
    date: false,
    email: false,
    telephone: false,
  },
  manifest: "/manifest.webmanifest",
  applicationName: "En Yakın Yer",
  alternates: {
    canonical: "/",
    languages: {
      "tr-TR": "/",
    },
  },
  category: "health",
  keywords: [
    "nöbetçi eczane",
    "en yakın eczane",
    "nöbetçi eczane bul",
    "eczane yol tarifi",
    "acik eczane",
  ],
  openGraph: {
    title: "En Yakın Yer | En Yakın Nöbetçi Eczane",
    description:
      "Hızlı arama deneyimi ile nöbetçi eczaneyi hemen bul, tek tıkla ara ve yol tarifi al.",
    images: [
      {
        alt: "En Yakın Yer",
        height: 630,
        url: "/opengraph-image",
        width: 1200,
      },
    ],
    locale: "tr_TR",
    siteName: "En Yakın Yer",
    type: "website",
    url: metadataBase,
  },
  publisher: "En Yakın Yer",
  referrer: "origin-when-cross-origin",
  twitter: {
    card: "summary_large_image",
    title: "En Yakın Yer",
    description:
      "Konumunu kullan, en yakın nöbetçi eczaneye saniyeler içinde ulaş.",
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
  themeColor: "#059669",
  width: "device-width",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${manrope.variable} ${sora.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <div className="mx-auto min-h-[100dvh] w-full max-w-5xl px-4 pb-24 pt-3 sm:px-6 sm:pb-14 sm:pt-4">
          {/* ── Sticky Header ── */}
          <header className="sticky top-0 z-[1050] mb-4 flex items-center justify-between rounded-2xl border border-emerald-100/80 bg-white/90 px-4 py-3 shadow-[0_2px_20px_rgba(0,0,0,0.06)] backdrop-blur-xl sm:mb-5 sm:rounded-3xl sm:px-5 sm:py-3.5">
            <Link className="flex items-center gap-2 font-display text-xl font-bold tracking-tight text-emerald-700" href="/">
              {/* Pharmacy cross icon */}
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
              En Yakın Yer
            </Link>

            {/* Desktop nav */}
            <nav className="hidden items-center gap-1 sm:flex">
              <Link className="rounded-xl px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-emerald-50 hover:text-emerald-700" href="/">
                Hızlı Bul
              </Link>
              <Link className="rounded-xl px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-emerald-50 hover:text-emerald-700" href="/nobetci">
                Şehirler
              </Link>
              <Link className="rounded-xl px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-emerald-50 hover:text-emerald-700" href="/rehber">
                Rehber
              </Link>
            </nav>

            {/* Mobile hamburger - handled by client component */}
            <MobileNav />
          </header>

          {children}

          {/* ── Footer ── */}
          <footer className="mt-12 rounded-2xl border border-zinc-200/80 bg-white/70 p-5 backdrop-blur sm:rounded-3xl sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <Link className="flex items-center gap-2 font-display text-lg font-bold text-emerald-700" href="/">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-600 text-white">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                  En Yakın Yer
                </Link>
                <p className="mt-2 max-w-xs text-xs leading-5 text-zinc-500">
                  En yakın nöbetçi eczaneyi hızla bulmanız için tasarlandı. Veriler eczaneler.gen.tr kaynağından periyodik olarak güncellenir.
                </p>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
                <Link className="font-medium text-zinc-600 transition hover:text-emerald-700" href="/hakkimizda">
                  Hakkımızda
                </Link>
                <Link className="font-medium text-zinc-600 transition hover:text-emerald-700" href="/veri-kaynagi">
                  Veri Kaynağı
                </Link>
                <Link className="font-medium text-zinc-600 transition hover:text-emerald-700" href="/rehber">
                  Rehber
                </Link>
                <Link className="font-medium text-zinc-600 transition hover:text-emerald-700" href="/nobetci">
                  Şehirler
                </Link>
              </div>
            </div>
            <div className="mt-4 border-t border-zinc-200 pt-4 text-center text-[11px] text-zinc-400">
              Bu site tıbbi danışmanlık sunmaz. Acil durumlarda 112 arayınız.
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
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-9RTKR2L4MK"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-9RTKR2L4MK');
          `}
        </Script>
      </body>
    </html>
  );
}
