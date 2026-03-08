import type { Metadata } from "next";
import Link from "next/link";

import { QuickFinder } from "@/components/quick-finder";
import { getCities } from "@/lib/eczane-source";

export const revalidate = 3600;

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
  description:
    "Nöbetçi eczane bulma uygulaması. Konumunu aç, en yakın eczaneyi saniyeler içinde bul, ara ve yol tarifine başla.",
  openGraph: {
    description:
      "Konum tabanli hızlı nöbetçi eczane bulma deneyimi. Tek ekranda arama, telefon ve yol tarifi.",
    title: "En Yakın Yer | En Yakın Nöbetçi Eczane",
    url: "/",
  },
  title: "Nöbetçi Eczane Bul",
  twitter: {
    description:
      "Konumunu kullan, en yakın nöbetçi eczaneye saniyeler içinde ulaş.",
    title: "Nöbetçi Eczane Bul | En Yakın Yer",
  },
};

const FALLBACK_CITY_SLUGS = [
  "istanbul",
  "ankara",
  "izmir",
  "bursa",
  "antalya",
  "adana",
  "kocaeli",
  "konya",
  "mersin",
  "gaziantep",
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Konumumu Kullan butonuna dokunun. Sistem önce il ve ilçeyi çözer, sonra aktif nöbetçi listesinden en yakın eczaneyi siralar.",
      },
      name: "En yakın nöbetçi eczaneyi nasıl bulurum?",
    },
    {
      "@type": "Question",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Her kartta tek dokunusla arama ve yol tarifi aksiyonlari vardir. Harita tusu sizi dogrudan navigasyona goturur.",
      },
      name: "Yol tarifini nasil alirim?",
    },
    {
      "@type": "Question",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Nöbetçi verileri eczaneler.gen.tr kaynağından çekilir ve kısa aralıklarla yeniden okunur.",
      },
      name: "Veriler nereden geliyor?",
    },
  ],
};

export default async function HomePage() {
  const fetchedCities = await getCities().catch(() => []);
  const cities =
    fetchedCities.length > 0
      ? fetchedCities
      : FALLBACK_CITY_SLUGS.map((slug) => ({
          name: slug.charAt(0).toUpperCase() + slug.slice(1),
          slug,
          sourcePath: `/nobetci-${slug}`,
        }));

  return (
    <main className="space-y-6">
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-white via-emerald-50/50 to-teal-50/40 p-5 shadow-lg sm:rounded-3xl sm:p-8">
        {/* Decorative glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-teal-200/20 blur-3xl" />

        <div className="relative">
          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3.5 py-1.5 text-xs font-semibold text-emerald-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500 dot-pulse" />
            Canli nobet verisiyle calisir
          </div>

          <h1 className="mt-4 font-display text-3xl leading-[1.15] font-bold tracking-tight text-zinc-900 sm:text-4xl md:text-5xl">
            En yakın nöbetçi eczaneyi{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              saniyede bul.
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-zinc-600 sm:text-base">
            Konumunu aç, sana en yakın açık eczaneleri haritada gör, tek tıkla
            ara veya yol tarifini baslat. Hic kayit veya indirme yok.
          </p>

          {/* Trust indicators */}
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Konum verisi saklanmaz
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Anlik guncelleme
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Tamamen ucretsiz
            </span>
          </div>
        </div>

        <div className="relative mt-6">
          <QuickFinder cities={cities} />
        </div>
      </section>

      {/* ── City Quick Access ── */}
      <section className="rounded-2xl border border-zinc-200/80 bg-white/80 p-5 shadow-sm backdrop-blur sm:rounded-3xl sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-zinc-900 sm:text-2xl">
            Şehirden hızlı giriş
          </h2>
          <Link
            className="flex items-center gap-1 text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"
            href="/nobetci"
          >
            Tüm şehirler
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {cities.slice(0, 20).map((city) => (
            <Link
              key={city.slug}
              className="card-press flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50/80 px-3 py-2.5 text-sm font-semibold text-zinc-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
              href={`/nobetci/${city.slug}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-zinc-400">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {city.name}
            </Link>
          ))}
        </div>
      </section>

      {/* ── Why En Yakın Yer ── */}
      <section className="rounded-2xl border border-zinc-200/80 bg-white/80 p-5 shadow-sm backdrop-blur sm:rounded-3xl sm:p-6">
        <h2 className="font-display text-xl font-bold text-zinc-900 sm:text-2xl">
          Neden En Yakın Yer?
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <article className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-white to-emerald-50/40 p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <h3 className="font-display text-base font-bold text-zinc-900">Aninda sonuc</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">
              Konum + aktif nöbet bilgisi + mesafe hesabı tek istekte birleşir. Saniyeler içinde sonuç.
            </p>
          </article>
          <article className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-white to-sky-50/40 p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <path d="M3 9h18M9 21V9" />
              </svg>
            </div>
            <h3 className="font-display text-base font-bold text-zinc-900">Sade arayuz</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">
              Gereksiz menüler, reklamlar yok. İlk kart her zaman en yakın eczane.
            </p>
          </article>
          <article className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-white to-violet-50/40 p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3 className="font-display text-base font-bold text-zinc-900">Gizliligin korunur</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">
              Konum izni sadece arama icin kullanilir, veri saklanmaz, hesap acmaya gerek yok.
            </p>
          </article>
        </div>
      </section>

      {/* ── Popular Searches ── */}
      <section className="rounded-2xl border border-zinc-200/80 bg-white/80 p-5 shadow-sm backdrop-blur sm:rounded-3xl sm:p-6">
        <h2 className="font-display text-xl font-bold text-zinc-900 sm:text-2xl">
          Popüler nöbetçi eczane aramaları
        </h2>
        <p className="mt-1.5 text-sm text-zinc-600">
          Şehir sayfalarından ilçe seçerek aktif nöbetçi eczane listesine hizla gesin.
        </p>

        <ul className="mt-4 grid list-none grid-cols-1 gap-2 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {cities.slice(0, 18).map((city) => (
            <li key={`query-${city.slug}`}>
              <Link
                className="card-press flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50/80 px-3 py-2.5 text-sm font-semibold text-zinc-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                href={`/nobetci/${city.slug}`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-emerald-500">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                {city.name} nöbetçi eczane
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ── FAQ ── */}
      <section className="rounded-2xl border border-zinc-200/80 bg-white/80 p-5 shadow-sm backdrop-blur sm:rounded-3xl sm:p-6">
        <h2 className="font-display text-xl font-bold text-zinc-900 sm:text-2xl">
          Sik sorulan sorular
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-zinc-600">
          <article className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-4">
            <h3 className="font-semibold text-zinc-900">
              En yakın nöbetçi eczane nasil bulunur?
            </h3>
            <p className="mt-1.5">
              Konumunu kullanarak il ve ilce otomatik belirlenir. Ardindan aktif
              nöbet listesi mesafeye göre sıralanır ve en yakın eczane en üstte
              gosterilir.
            </p>
          </article>
          <article className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-4">
            <h3 className="font-semibold text-zinc-900">
              Yol tarifine tek dokunusla gidebilir miyim?
            </h3>
            <p className="mt-1.5">
              Evet. Her eczane kartinda yol tarifi dugmesi bulunur ve Google Maps
              ile dogrudan navigasyon baslatilir.
            </p>
          </article>
          <article className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-4">
            <h3 className="font-semibold text-zinc-900">
              Nöbetçi eczane verisi ne kadar guncel?
            </h3>
            <p className="mt-1.5">
              Veriler kaynak sistemden periyodik olarak cekilir ve sayfalarda son
              guncellenme zamani gorunur.
            </p>
          </article>
        </div>
      </section>

      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        type="application/ld+json"
      />
    </main>
  );
}
